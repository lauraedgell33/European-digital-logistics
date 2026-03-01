<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * EU Mobility Package compliance service.
 *
 * Implements checks for:
 * - Regulation (EC) No 561/2006 (driving & rest times)
 * - Regulation (EU) 2020/1054 (amended driving/rest rules)
 * - Directive (EU) 2020/1057 (posting rules for transport)
 * - Regulation (EU) 2020/1055 (cabotage & establishment)
 * - Tachograph Regulation (EU) 165/2014
 */
class EuMobilityComplianceService
{
    // ── EC 561/2006 Limits ──────────────────────────────────────

    /** Max continuous driving before break (hours) */
    public const MAX_CONTINUOUS_DRIVING = 4.5;

    /** Min break duration after continuous driving (minutes) */
    public const MIN_BREAK_DURATION = 45;

    /** Max daily driving (hours) */
    public const MAX_DAILY_DRIVING = 9;

    /** Max daily driving when extended (max 2× per week, hours) */
    public const MAX_DAILY_DRIVING_EXTENDED = 10;

    /** Max weekly driving (hours) */
    public const MAX_WEEKLY_DRIVING = 56;

    /** Max biweekly driving (hours) */
    public const MAX_BIWEEKLY_DRIVING = 90;

    /** Min daily rest — regular (hours) */
    public const MIN_DAILY_REST_REGULAR = 11;

    /** Min daily rest — reduced (max 3× between weekly rests, hours) */
    public const MIN_DAILY_REST_REDUCED = 9;

    /** Min weekly rest — regular (hours) */
    public const MIN_WEEKLY_REST_REGULAR = 45;

    /** Min weekly rest — reduced (hours) */
    public const MIN_WEEKLY_REST_REDUCED = 24;

    /** Max consecutive days driving before weekly rest */
    public const MAX_CONSECUTIVE_DRIVING_DAYS = 6;

    // ── Cabotage Rules (EU 2020/1055) ───────────────────────────

    /** Max cabotage operations within time window */
    public const MAX_CABOTAGE_OPERATIONS = 3;

    /** Cabotage time window (days after completing international delivery) */
    public const CABOTAGE_WINDOW_DAYS = 7;

    /** Cooling-off period before next cabotage series (days) */
    public const CABOTAGE_COOLDOWN_DAYS = 4;

    // ── Minimum wage map (EUR/hr by country, 2025 rates) ────────

    private const MIN_WAGES = [
        'DE' => 12.82, 'FR' => 11.65, 'NL' => 13.27, 'BE' => 13.27,
        'AT' => 12.41, 'LU' => 14.86, 'IE' => 12.70, 'ES' => 8.45,
        'PT' => 5.56, 'IT' => 10.50, 'PL' => 5.27, 'CZ' => 5.25,
        'HU' => 4.05, 'SK' => 4.58, 'SI' => 6.63, 'HR' => 4.65,
        'RO' => 3.75, 'BG' => 2.85, 'GR' => 5.47, 'EE' => 4.74,
        'LT' => 5.65, 'LV' => 4.45, 'FI' => 12.50, 'SE' => 13.00,
        'DK' => 14.50, 'NO' => 16.80, 'CH' => 21.50,
    ];

    /**
     * Run full compliance check for a driver/vehicle.
     */
    public function runFullCheck(int $driverId, array $drivingLog): array
    {
        return [
            'driver_id' => $driverId,
            'checked_at' => now()->toIso8601String(),
            'driving_time' => $this->checkDrivingTime($drivingLog),
            'rest_periods' => $this->checkRestPeriods($drivingLog),
            'break_rules' => $this->checkBreakRules($drivingLog),
            'weekly_limits' => $this->checkWeeklyLimits($drivingLog),
            'overall_compliant' => $this->isFullyCompliant($drivingLog),
        ];
    }

    /**
     * Check daily driving time compliance.
     *
     * @param array $drivingLog Array of ['start'=> Carbon, 'end'=> Carbon, 'type'=> driving|rest|break|other]
     */
    public function checkDrivingTime(array $drivingLog): array
    {
        $dailyDriving = $this->calculateDailyDriving($drivingLog);
        $violations = [];
        $extendedDays = 0;

        foreach ($dailyDriving as $date => $hours) {
            if ($hours > self::MAX_DAILY_DRIVING_EXTENDED) {
                $violations[] = [
                    'date' => $date,
                    'type' => 'exceeded_max_daily_driving',
                    'severity' => 'serious',
                    'hours' => round($hours, 2),
                    'limit' => self::MAX_DAILY_DRIVING_EXTENDED,
                    'excess' => round($hours - self::MAX_DAILY_DRIVING_EXTENDED, 2),
                    'regulation' => 'EC 561/2006 Art. 6(1)',
                ];
            } elseif ($hours > self::MAX_DAILY_DRIVING) {
                $extendedDays++;
            }
        }

        // Max 2 extended driving days per week
        $weeklyExtended = $this->groupByWeek($dailyDriving, self::MAX_DAILY_DRIVING);
        foreach ($weeklyExtended as $week => $count) {
            if ($count > 2) {
                $violations[] = [
                    'week' => $week,
                    'type' => 'too_many_extended_days',
                    'severity' => 'minor',
                    'count' => $count,
                    'limit' => 2,
                    'regulation' => 'EC 561/2006 Art. 6(1)',
                ];
            }
        }

        return [
            'compliant' => empty($violations),
            'violations' => $violations,
            'daily_summary' => $dailyDriving,
        ];
    }

    /**
     * Check break rule compliance (45 min after 4.5 h).
     */
    public function checkBreakRules(array $drivingLog): array
    {
        $violations = [];
        $continuousDriving = 0;
        $lastBreakEnd = null;

        foreach ($drivingLog as $entry) {
            $start = Carbon::parse($entry['start']);
            $end = Carbon::parse($entry['end']);
            $duration = $start->floatDiffInHours($end);

            if ($entry['type'] === 'driving') {
                $continuousDriving += $duration;

                if ($continuousDriving > self::MAX_CONTINUOUS_DRIVING) {
                    $violations[] = [
                        'type' => 'exceeded_continuous_driving',
                        'severity' => 'serious',
                        'at' => $end->toIso8601String(),
                        'continuous_hours' => round($continuousDriving, 2),
                        'limit' => self::MAX_CONTINUOUS_DRIVING,
                        'regulation' => 'EC 561/2006 Art. 7',
                    ];
                }
            } elseif ($entry['type'] === 'break' || $entry['type'] === 'rest') {
                $breakMinutes = $duration * 60;

                // Split break: first 15 min + then 30 min is also valid
                if ($breakMinutes >= self::MIN_BREAK_DURATION) {
                    $continuousDriving = 0;
                }
                $lastBreakEnd = $end;
            }
        }

        return [
            'compliant' => empty($violations),
            'violations' => $violations,
        ];
    }

    /**
     * Check rest period compliance.
     */
    public function checkRestPeriods(array $drivingLog): array
    {
        $violations = [];
        $reducedDailyRests = 0;

        $dailyRestPeriods = $this->extractDailyRestPeriods($drivingLog);

        foreach ($dailyRestPeriods as $date => $restHours) {
            if ($restHours < self::MIN_DAILY_REST_REDUCED) {
                $violations[] = [
                    'date' => $date,
                    'type' => 'insufficient_daily_rest',
                    'severity' => 'very_serious',
                    'rest_hours' => round($restHours, 2),
                    'minimum' => self::MIN_DAILY_REST_REDUCED,
                    'regulation' => 'EC 561/2006 Art. 8(2)',
                ];
            } elseif ($restHours < self::MIN_DAILY_REST_REGULAR) {
                $reducedDailyRests++;
            }
        }

        // Max 3 reduced daily rests between two weekly rest periods
        if ($reducedDailyRests > 3) {
            $violations[] = [
                'type' => 'too_many_reduced_daily_rests',
                'severity' => 'minor',
                'count' => $reducedDailyRests,
                'limit' => 3,
                'regulation' => 'EC 561/2006 Art. 8(4)',
            ];
        }

        return [
            'compliant' => empty($violations),
            'violations' => $violations,
            'reduced_daily_rests' => $reducedDailyRests,
        ];
    }

    /**
     * Check weekly / biweekly driving limits.
     */
    public function checkWeeklyLimits(array $drivingLog): array
    {
        $violations = [];
        $dailyDriving = $this->calculateDailyDriving($drivingLog);

        // Group by ISO week
        $weeklyHours = [];
        foreach ($dailyDriving as $date => $hours) {
            $week = Carbon::parse($date)->format('o-W');
            $weeklyHours[$week] = ($weeklyHours[$week] ?? 0) + $hours;
        }

        foreach ($weeklyHours as $week => $hours) {
            if ($hours > self::MAX_WEEKLY_DRIVING) {
                $violations[] = [
                    'week' => $week,
                    'type' => 'exceeded_weekly_driving',
                    'severity' => 'very_serious',
                    'hours' => round($hours, 2),
                    'limit' => self::MAX_WEEKLY_DRIVING,
                    'regulation' => 'EC 561/2006 Art. 6(2)',
                ];
            }
        }

        // Biweekly check
        $weeks = array_keys($weeklyHours);
        sort($weeks);
        for ($i = 0; $i < count($weeks) - 1; $i++) {
            $biweekly = ($weeklyHours[$weeks[$i]] ?? 0) + ($weeklyHours[$weeks[$i + 1]] ?? 0);
            if ($biweekly > self::MAX_BIWEEKLY_DRIVING) {
                $violations[] = [
                    'weeks' => [$weeks[$i], $weeks[$i + 1]],
                    'type' => 'exceeded_biweekly_driving',
                    'severity' => 'very_serious',
                    'hours' => round($biweekly, 2),
                    'limit' => self::MAX_BIWEEKLY_DRIVING,
                    'regulation' => 'EC 561/2006 Art. 6(3)',
                ];
            }
        }

        return [
            'compliant' => empty($violations),
            'violations' => $violations,
            'weekly_summary' => $weeklyHours,
        ];
    }

    /**
     * Check cabotage compliance for a vehicle.
     */
    public function checkCabotage(int $vehicleId, string $hostCountry, array $deliveries): array
    {
        $violations = [];

        // deliveries = [['completed_at'=> datetime, 'type'=> 'international'|'cabotage', 'country'=> 'XX']]
        $cabotageOps = collect($deliveries)->filter(fn($d) => $d['type'] === 'cabotage' && $d['country'] === $hostCountry);

        if ($cabotageOps->count() > self::MAX_CABOTAGE_OPERATIONS) {
            $violations[] = [
                'type' => 'exceeded_cabotage_limit',
                'severity' => 'very_serious',
                'operations' => $cabotageOps->count(),
                'limit' => self::MAX_CABOTAGE_OPERATIONS,
                'country' => $hostCountry,
                'regulation' => 'Regulation (EC) 1072/2009 Art. 8 (amended by EU 2020/1055)',
            ];
        }

        // Check time window
        $internationalDelivery = collect($deliveries)
            ->where('type', 'international')
            ->sortByDesc('completed_at')
            ->first();

        if ($internationalDelivery && $cabotageOps->isNotEmpty()) {
            $windowEnd = Carbon::parse($internationalDelivery['completed_at'])->addDays(self::CABOTAGE_WINDOW_DAYS);
            $lastCabotage = $cabotageOps->sortByDesc('completed_at')->first();

            if (Carbon::parse($lastCabotage['completed_at'])->isAfter($windowEnd)) {
                $violations[] = [
                    'type' => 'cabotage_outside_window',
                    'severity' => 'very_serious',
                    'international_delivery' => $internationalDelivery['completed_at'],
                    'window_end' => $windowEnd->toIso8601String(),
                    'cabotage_at' => $lastCabotage['completed_at'],
                    'regulation' => 'Regulation (EC) 1072/2009 Art. 8(2)',
                ];
            }
        }

        // Check 4-day cooling off
        $previousSeries = $this->getPreviousCabotageSeries($vehicleId, $hostCountry);
        if ($previousSeries && $cabotageOps->isNotEmpty()) {
            $cooldownEnd = Carbon::parse($previousSeries['ended_at'])->addDays(self::CABOTAGE_COOLDOWN_DAYS);
            $firstNew = $cabotageOps->sortBy('completed_at')->first();

            if (Carbon::parse($firstNew['completed_at'])->isBefore($cooldownEnd)) {
                $violations[] = [
                    'type' => 'cabotage_cooldown_violation',
                    'severity' => 'very_serious',
                    'previous_ended' => $previousSeries['ended_at'],
                    'cooldown_end' => $cooldownEnd->toIso8601String(),
                    'new_started' => $firstNew['completed_at'],
                    'regulation' => 'EU 2020/1055',
                ];
            }
        }

        return [
            'vehicle_id' => $vehicleId,
            'host_country' => $hostCountry,
            'compliant' => empty($violations),
            'cabotage_count' => $cabotageOps->count(),
            'max_allowed' => self::MAX_CABOTAGE_OPERATIONS,
            'violations' => $violations,
        ];
    }

    /**
     * Validate Posted Workers Directive compliance.
     *
     * Directive (EU) 2020/1057 — specific rules for posting drivers in transport.
     */
    public function checkPostedWorkers(int $driverId, string $hostCountry, array $assignment): array
    {
        $violations = [];
        $warnings = [];

        $exempted = $this->isExemptFromPosting($assignment);

        if ($exempted) {
            return [
                'driver_id' => $driverId,
                'host_country' => $hostCountry,
                'posting_required' => false,
                'exemption_reason' => $exempted,
                'compliant' => true,
            ];
        }

        // Check if posting declaration was submitted
        if (empty($assignment['posting_declaration_id'])) {
            $violations[] = [
                'type' => 'missing_posting_declaration',
                'severity' => 'serious',
                'regulation' => 'EU 2020/1057 Art. 1(11)',
                'action' => 'Submit posting declaration via IMI system before operations begin',
            ];
        }

        // Check minimum wage compliance
        $minWage = self::MIN_WAGES[$hostCountry] ?? null;
        $driverWage = $assignment['hourly_wage'] ?? 0;

        if ($minWage && $driverWage < $minWage) {
            $violations[] = [
                'type' => 'below_minimum_wage',
                'severity' => 'very_serious',
                'driver_wage' => $driverWage,
                'minimum_wage' => $minWage,
                'country' => $hostCountry,
                'currency' => 'EUR',
                'regulation' => 'EU 2020/1057 Art. 1(6)',
            ];
        }

        // Required documents check
        $requiredDocs = ['posting_declaration', 'tachograph_records', 'employment_contract'];
        $providedDocs = $assignment['documents'] ?? [];

        foreach ($requiredDocs as $doc) {
            if (!in_array($doc, $providedDocs)) {
                $warnings[] = [
                    'type' => 'missing_document',
                    'document' => $doc,
                    'regulation' => 'EU 2020/1057 Art. 1(11)(b)',
                ];
            }
        }

        return [
            'driver_id' => $driverId,
            'host_country' => $hostCountry,
            'posting_required' => true,
            'compliant' => empty($violations),
            'violations' => $violations,
            'warnings' => $warnings,
            'minimum_wage' => $minWage,
            'driver_wage' => $driverWage,
        ];
    }

    /**
     * Validate tachograph data.
     */
    public function validateTachograph(array $tachographData): array
    {
        $violations = [];

        // Check for manipulation
        if (!empty($tachographData['events'])) {
            foreach ($tachographData['events'] as $event) {
                if (in_array($event['type'] ?? '', ['power_supply_interrupt', 'motion_data_error', 'security_breach'])) {
                    $violations[] = [
                        'type' => 'tachograph_anomaly',
                        'severity' => 'very_serious',
                        'event_type' => $event['type'],
                        'at' => $event['timestamp'] ?? null,
                        'regulation' => 'Regulation (EU) 165/2014 Art. 32',
                    ];
                }
            }
        }

        // Check calibration
        $lastCalibration = Carbon::parse($tachographData['last_calibration'] ?? now()->subYears(3));
        $maxCalibrationAge = now()->subYears(2);

        if ($lastCalibration->isBefore($maxCalibrationAge)) {
            $violations[] = [
                'type' => 'tachograph_calibration_overdue',
                'severity' => 'serious',
                'last_calibration' => $lastCalibration->toDateString(),
                'due_by' => $lastCalibration->addYears(2)->toDateString(),
                'regulation' => 'Regulation (EU) 165/2014 Art. 23',
            ];
        }

        // Driver card check
        if (!empty($tachographData['driver_card'])) {
            $cardExpiry = Carbon::parse($tachographData['driver_card']['expires_at'] ?? now());
            if ($cardExpiry->isPast()) {
                $violations[] = [
                    'type' => 'driver_card_expired',
                    'severity' => 'serious',
                    'expired_at' => $cardExpiry->toDateString(),
                    'regulation' => 'Regulation (EU) 165/2014 Art. 26',
                ];
            }
        }

        // Verify smart tachograph (gen 2 required for new vehicles after Jun 2019)
        $vehicleRegistrationDate = Carbon::parse($tachographData['vehicle_registration_date'] ?? '2018-01-01');
        $smartTachoCutoff = Carbon::parse('2019-06-15');

        if ($vehicleRegistrationDate->isAfter($smartTachoCutoff) && ($tachographData['tachograph_type'] ?? '') !== 'smart_gen2') {
            $violations[] = [
                'type' => 'smart_tachograph_required',
                'severity' => 'serious',
                'vehicle_registered' => $vehicleRegistrationDate->toDateString(),
                'required_type' => 'smart_gen2',
                'actual_type' => $tachographData['tachograph_type'] ?? 'unknown',
                'regulation' => 'Regulation (EU) 165/2014 Art. 8',
            ];
        }

        return [
            'compliant' => empty($violations),
            'violations' => $violations,
            'tachograph_type' => $tachographData['tachograph_type'] ?? 'unknown',
            'last_calibration' => $lastCalibration->toDateString(),
        ];
    }

    /**
     * Generate compliance report for a fleet.
     */
    public function generateFleetComplianceReport(int $companyId): array
    {
        $cacheKey = "compliance_report:{$companyId}";

        return Cache::remember($cacheKey, 900, function () use ($companyId) {
            $drivers = \DB::table('users')
                ->where('company_id', $companyId)
                ->where('role', 'driver')
                ->get();

            $vehicles = \DB::table('vehicles')
                ->where('company_id', $companyId)
                ->get();

            $issues = [];
            $summary = [
                'total_drivers' => $drivers->count(),
                'total_vehicles' => $vehicles->count(),
                'compliant_drivers' => 0,
                'compliant_vehicles' => 0,
                'serious_violations' => 0,
                'minor_violations' => 0,
            ];

            // Check each driver
            foreach ($drivers as $driver) {
                $drivingLog = $this->getDriverLog($driver->id);
                $check = $this->runFullCheck($driver->id, $drivingLog);

                $isCompliant = $check['overall_compliant'];
                if ($isCompliant) $summary['compliant_drivers']++;

                foreach (['driving_time', 'rest_periods', 'break_rules', 'weekly_limits'] as $cat) {
                    foreach ($check[$cat]['violations'] ?? [] as $v) {
                        $severity = $v['severity'] ?? 'minor';
                        if (in_array($severity, ['serious', 'very_serious'])) {
                            $summary['serious_violations']++;
                        } else {
                            $summary['minor_violations']++;
                        }
                        $issues[] = array_merge($v, ['driver_id' => $driver->id, 'driver_name' => $driver->name]);
                    }
                }
            }

            // Tachograph expiry for vehicles
            foreach ($vehicles as $vehicle) {
                $tachData = $this->getVehicleTachographData($vehicle->id);
                $tachCheck = $this->validateTachograph($tachData);
                if ($tachCheck['compliant']) $summary['compliant_vehicles']++;

                foreach ($tachCheck['violations'] as $v) {
                    $summary['serious_violations']++;
                    $issues[] = array_merge($v, ['vehicle_id' => $vehicle->id, 'vehicle_plate' => $vehicle->license_plate ?? '']);
                }
            }

            return [
                'company_id' => $companyId,
                'generated_at' => now()->toIso8601String(),
                'summary' => $summary,
                'issues' => $issues,
                'compliance_score' => $this->calculateComplianceScore($summary),
            ];
        });
    }

    /**
     * Get minimum wage for given country.
     */
    public function getMinimumWage(string $countryCode): ?float
    {
        return self::MIN_WAGES[strtoupper($countryCode)] ?? null;
    }

    /**
     * Get all EU minimum wages.
     */
    public function getAllMinimumWages(): array
    {
        return self::MIN_WAGES;
    }

    // ─── Helpers ────────────────────────────────────────────────

    private function calculateDailyDriving(array $drivingLog): array
    {
        $daily = [];
        foreach ($drivingLog as $entry) {
            if ($entry['type'] !== 'driving') continue;
            $date = Carbon::parse($entry['start'])->toDateString();
            $hours = Carbon::parse($entry['start'])->floatDiffInHours(Carbon::parse($entry['end']));
            $daily[$date] = ($daily[$date] ?? 0) + $hours;
        }
        return $daily;
    }

    private function groupByWeek(array $dailyDriving, float $threshold): array
    {
        $weeks = [];
        foreach ($dailyDriving as $date => $hours) {
            if ($hours > $threshold) {
                $week = Carbon::parse($date)->format('o-W');
                $weeks[$week] = ($weeks[$week] ?? 0) + 1;
            }
        }
        return $weeks;
    }

    private function extractDailyRestPeriods(array $drivingLog): array
    {
        $rests = [];
        foreach ($drivingLog as $entry) {
            if ($entry['type'] !== 'rest') continue;
            $date = Carbon::parse($entry['start'])->toDateString();
            $hours = Carbon::parse($entry['start'])->floatDiffInHours(Carbon::parse($entry['end']));
            $rests[$date] = ($rests[$date] ?? 0) + $hours;
        }
        return $rests;
    }

    private function isExemptFromPosting(array $assignment): ?string
    {
        // Bilateral operations are exempt
        if (($assignment['type'] ?? '') === 'bilateral') {
            return 'Bilateral transport operation — exempt per EU 2020/1057 Art. 1(3)';
        }

        // Transit operations are exempt
        if (($assignment['type'] ?? '') === 'transit') {
            return 'Transit without loading/unloading — exempt per EU 2020/1057 Art. 1(4)';
        }

        // Initial/final road leg of combined transport
        if (($assignment['type'] ?? '') === 'combined_transport_leg') {
            return 'Combined transport initial/final leg — exempt per EU 2020/1057 Art. 1(5)';
        }

        return null;
    }

    private function getPreviousCabotageSeries(int $vehicleId, string $country): ?array
    {
        $result = \DB::table('cabotage_tracking')
            ->where('vehicle_id', $vehicleId)
            ->where('host_country', $country)
            ->where('status', 'completed')
            ->orderByDesc('ended_at')
            ->first();

        return $result ? (array) $result : null;
    }

    private function getDriverLog(int $driverId): array
    {
        $entries = \DB::table('driver_activity_log')
            ->where('driver_id', $driverId)
            ->where('start', '>=', now()->subDays(28))
            ->orderBy('start')
            ->get();

        return $entries->map(fn($e) => [
            'start' => $e->start,
            'end' => $e->end,
            'type' => $e->type, // driving, rest, break, other
        ])->toArray();
    }

    private function getVehicleTachographData(int $vehicleId): array
    {
        $vehicle = \DB::table('vehicles')->find($vehicleId);
        $tach = \DB::table('tachograph_records')
            ->where('vehicle_id', $vehicleId)
            ->orderByDesc('created_at')
            ->first();

        return [
            'vehicle_registration_date' => $vehicle->registered_at ?? '2020-01-01',
            'tachograph_type' => $tach->type ?? 'digital',
            'last_calibration' => $tach->last_calibration ?? now()->subYears(1)->toDateString(),
            'driver_card' => [
                'expires_at' => $tach->driver_card_expiry ?? now()->addYear()->toDateString(),
            ],
            'events' => [],
        ];
    }

    private function isFullyCompliant(array $drivingLog): bool
    {
        $checks = [
            $this->checkDrivingTime($drivingLog),
            $this->checkBreakRules($drivingLog),
            $this->checkRestPeriods($drivingLog),
            $this->checkWeeklyLimits($drivingLog),
        ];

        return collect($checks)->every(fn($c) => $c['compliant']);
    }

    private function calculateComplianceScore(array $summary): float
    {
        $total = $summary['total_drivers'] + $summary['total_vehicles'];
        if ($total === 0) return 100.0;

        $compliant = $summary['compliant_drivers'] + $summary['compliant_vehicles'];
        $base = ($compliant / $total) * 100;

        // Deductions
        $deduction = ($summary['serious_violations'] * 5) + ($summary['minor_violations'] * 1);
        return max(0, round($base - $deduction, 1));
    }
}
