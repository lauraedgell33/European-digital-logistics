<?php

namespace Database\Seeders;

use App\Models\VehicleOffer;
use App\Models\Company;
use Illuminate\Database\Seeder;

class VehicleOfferSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::where('type', 'carrier')->get();
        $vehicles = [
            ['standard_truck', 'DE', 'Hamburg', 24000, 13.6, true, false],
            ['mega_trailer', 'DE', 'Munich', 24000, 13.6, true, false],
            ['refrigerated', 'FR', 'Lyon', 22000, 13.6, true, true],
            ['standard_truck', 'PL', 'Warsaw', 24000, 13.6, false, false],
            ['tautliner', 'NL', 'Rotterdam', 24000, 13.6, true, false],
            ['flatbed', 'IT', 'Milan', 26000, 13.6, false, false],
            ['tanker', 'DE', 'Duisburg', 30000, null, true, false],
            ['refrigerated', 'ES', 'Barcelona', 22000, 13.6, false, true],
            ['container_carrier', 'NL', 'Rotterdam', 28000, null, true, false],
            ['standard_truck', 'PL', 'Gdansk', 24000, 13.6, true, false],
        ];

        foreach ($vehicles as $v) {
            VehicleOffer::create([
                'company_id' => $companies->random()->id,
                'user_id' => 1,
                'vehicle_type' => $v[0],
                'current_country' => $v[1],
                'current_city' => $v[2],
                'capacity_kg' => $v[3],
                'loading_meters' => $v[4],
                'has_adr' => $v[5],
                'has_temperature_control' => $v[6],
                'available_from' => now()->addDays(rand(0, 3)),
                'available_to' => now()->addDays(rand(5, 14)),
                'destination_country' => array_slice(['DE', 'FR', 'PL', 'NL', 'IT', 'ES'], 0, 1)[0],
                'status' => ['available', 'available', 'available', 'in_transit', 'booked'][rand(0, 4)],
            ]);
        }
    }
}
