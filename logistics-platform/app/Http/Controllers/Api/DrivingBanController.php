<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DrivingBan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DrivingBanController extends Controller
{
    /**
     * List all driving bans, optionally filtered by country.
     */
    public function index(Request $request): JsonResponse
    {
        $query = DrivingBan::active();

        if ($request->country) {
            $query->forCountry(strtoupper($request->country));
        }

        if ($request->type) {
            $query->ofType($request->type);
        }

        $bans = $query->orderBy('country_code')->orderBy('ban_type')->get();

        return response()->json(['data' => $bans]);
    }

    /**
     * Get bans currently active right now.
     */
    public function active(Request $request): JsonResponse
    {
        $query = DrivingBan::currentlyActive();

        if ($request->country) {
            $query->forCountry(strtoupper($request->country));
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Check bans for a specific route on a given date.
     */
    public function checkRoute(Request $request): JsonResponse
    {
        $request->validate([
            'countries' => 'required|array|min:1', // array of country codes the route passes through
            'date' => 'required|date',
            'time' => 'nullable|date_format:H:i',
        ]);

        $dateTime = \Carbon\Carbon::parse($request->date . ' ' . ($request->time ?? '12:00'));
        $countries = array_map('strtoupper', $request->countries);

        $allBans = DrivingBan::active()
            ->whereIn('country_code', $countries)
            ->get();

        $activeBans = [];
        $warnings = [];

        foreach ($allBans as $ban) {
            if ($ban->isActiveAt($dateTime)) {
                $activeBans[] = $ban;
            }

            // Check if ban is active within ±24h (warning)
            for ($h = -24; $h <= 24; $h += 6) {
                $checkTime = $dateTime->copy()->addHours($h);
                if ($ban->isActiveAt($checkTime) && !$ban->isActiveAt($dateTime)) {
                    $warnings[] = [
                        'ban' => $ban,
                        'active_at' => $checkTime->toIso8601String(),
                        'hours_from_departure' => $h,
                    ];
                    break;
                }
            }
        }

        return response()->json([
            'data' => [
                'route_clear' => count($activeBans) === 0,
                'active_bans' => $activeBans,
                'upcoming_warnings' => $warnings,
                'checked_countries' => $countries,
                'checked_datetime' => $dateTime->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get all ban types for reference.
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'data' => [
                'weekend' => 'Weekend driving bans (typically Sunday)',
                'holiday' => 'Public holiday driving bans',
                'night' => 'Nighttime driving restrictions',
                'summer' => 'Summer seasonal restrictions',
                'weight' => 'Weight/dimension restrictions',
                'emission_zone' => 'Low Emission Zone (LEZ) restrictions',
            ],
        ]);
    }

    /**
     * Get all countries with ban counts.
     */
    public function countries(): JsonResponse
    {
        $countries = Cache::remember('driving_ban_countries', 3600, function () {
            return DrivingBan::active()
                ->select('country_code', 'country_name', \DB::raw('COUNT(*) as ban_count'))
                ->groupBy('country_code', 'country_name')
                ->orderBy('country_name')
                ->get();
        });

        return response()->json(['data' => $countries]);
    }

    /**
     * Get detailed bans for a specific country.
     */
    public function country(string $countryCode): JsonResponse
    {
        $cc = strtoupper($countryCode);
        $bans = DrivingBan::active()->forCountry($cc)->get();

        $grouped = $bans->groupBy('ban_type');

        return response()->json([
            'data' => [
                'country_code' => $cc,
                'country_name' => DrivingBan::getCountryList()[$cc] ?? $cc,
                'total_bans' => $bans->count(),
                'bans_by_type' => $grouped,
            ],
        ]);
    }
}
