<?php

namespace Database\Seeders;

use App\Models\Tender;
use App\Models\TenderBid;
use App\Models\Company;
use Illuminate\Database\Seeder;

class TenderSeeder extends Seeder
{
    public function run(): void
    {
        $shippers = Company::where('type', '!=', 'carrier')->get();
        $carriers = Company::where('type', 'carrier')->get();

        $tenders = [
            [
                'title' => 'Q1 2025 — Germany ↔ France Regular FTL',
                'description' => 'Weekly full truckloads between Southern Germany and Northern France. Standard trucks, 24t capacity.',
                'route_origin_country' => 'DE',
                'route_origin_city' => 'Stuttgart',
                'route_destination_country' => 'FR',
                'route_destination_city' => 'Strasbourg',
                'estimated_volume' => 12,
                'estimated_weight' => 20000,
                'budget' => 3500,
                'frequency' => 'weekly',
                'status' => 'open',
            ],
            [
                'title' => 'Temperature Controlled — Italy ↔ Germany',
                'description' => 'Bi-weekly reefer loads for dairy products. GDP-compliant, temperature logging required.',
                'route_origin_country' => 'IT',
                'route_origin_city' => 'Milan',
                'route_destination_country' => 'DE',
                'route_destination_city' => 'Frankfurt',
                'estimated_volume' => 8,
                'estimated_weight' => 18000,
                'budget' => 4200,
                'frequency' => 'bi-weekly',
                'status' => 'open',
            ],
            [
                'title' => 'Automotive Parts — Poland → Benelux',
                'description' => 'Daily JIT deliveries for automotive assembly plant. Time-critical, standard trucks.',
                'route_origin_country' => 'PL',
                'route_origin_city' => 'Poznan',
                'route_destination_country' => 'BE',
                'route_destination_city' => 'Brussels',
                'estimated_volume' => 22,
                'estimated_weight' => 15000,
                'budget' => null,
                'frequency' => 'daily',
                'status' => 'open',
            ],
            [
                'title' => 'Hazardous Chemicals — NL → Spain',
                'description' => 'ADR Class 3 liquids in tankers. Monthly shipments, experienced ADR drivers only.',
                'route_origin_country' => 'NL',
                'route_origin_city' => 'Rotterdam',
                'route_destination_country' => 'ES',
                'route_destination_city' => 'Madrid',
                'estimated_volume' => 4,
                'estimated_weight' => 25000,
                'budget' => 5500,
                'frequency' => 'monthly',
                'status' => 'evaluation',
            ],
            [
                'title' => 'E-Commerce Last Mile — Berlin Metro',
                'description' => 'Daily parcel distribution within Berlin. Small vans, evening/weekend shifts.',
                'route_origin_country' => 'DE',
                'route_origin_city' => 'Berlin',
                'route_destination_country' => 'DE',
                'route_destination_city' => 'Berlin',
                'estimated_volume' => 30,
                'estimated_weight' => 3000,
                'budget' => 800,
                'frequency' => 'daily',
                'status' => 'awarded',
            ],
        ];

        foreach ($tenders as $tenderData) {
            $tender = Tender::create([
                'company_id' => $shippers->random()->id,
                'user_id' => 1,
                ...$tenderData,
                'currency' => 'EUR',
                'start_date' => now()->addMonths(1),
                'end_date' => now()->addMonths(13),
                'submission_deadline' => $tenderData['status'] === 'open'
                    ? now()->addDays(rand(3, 21))
                    : now()->subDays(5),
            ]);

            // Add bids for non-draft tenders — ensure unique company per tender
            $bidCarriers = $carriers->shuffle()->take(min(rand(2, 4), $carriers->count()));
            foreach ($bidCarriers as $idx => $carrier) {
                TenderBid::create([
                    'tender_id' => $tender->id,
                    'company_id' => $carrier->id,
                    'user_id' => 1,
                    'proposed_price' => ($tenderData['budget'] ?? 3000) * (0.8 + rand(0, 40) / 100),
                    'currency' => 'EUR',
                    'transit_time_hours' => rand(12, 72),
                    'proposal' => 'We can provide reliable service on this lane with GPS tracking.',
                    'status' => $tenderData['status'] === 'awarded' && $idx === 0 ? 'accepted' : 'submitted',
                ]);
            }
        }
    }
}
