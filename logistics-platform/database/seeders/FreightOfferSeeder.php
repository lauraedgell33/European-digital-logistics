<?php

namespace Database\Seeders;

use App\Models\FreightOffer;
use App\Models\Company;
use Illuminate\Database\Seeder;

class FreightOfferSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();
        $routes = [
            ['DE', 'Hamburg', '20457', 'FR', 'Paris', '75001', 'standard_truck', 'general', 'Automotive parts — palletized, 33 pallets'],
            ['FR', 'Lyon', '69001', 'IT', 'Milan', '20121', 'refrigerated', 'perishable', 'Fresh produce — temperature controlled 2-8°C'],
            ['PL', 'Warsaw', '02-001', 'DE', 'Munich', '80331', 'standard_truck', 'electronics', 'Electronics components — fragile handling required'],
            ['NL', 'Rotterdam', '3011', 'ES', 'Barcelona', '08001', 'container_40ft', 'general', '40ft container — mixed consumer goods'],
            ['DE', 'Berlin', '10115', 'PL', 'Gdansk', '80-001', 'mega_trailer', 'furniture', 'Furniture — volume goods, 100m³'],
            ['IT', 'Milan', '20121', 'DE', 'Frankfurt', '60311', 'standard_truck', 'textiles', 'Textiles — non-stackable'],
            ['ES', 'Madrid', '28001', 'FR', 'Marseille', '13001', 'tautliner', 'construction', 'Building materials — side loading required'],
            ['FR', 'Paris', '75001', 'NL', 'Amsterdam', '1012', 'standard_truck', 'pharma', 'Pharmaceutical supplies — GDP certified'],
            ['DE', 'Düsseldorf', '40210', 'IT', 'Rome', '00100', 'refrigerated', 'perishable', 'Dairy products — temperature controlled 0-4°C'],
            ['PL', 'Krakow', '30-001', 'FR', 'Lyon', '69001', 'standard_truck', 'machinery', 'Mechanical parts — heavy goods'],
            ['NL', 'Rotterdam', '3011', 'DE', 'Hamburg', '20457', 'tanker', 'hazardous', 'Chemical liquid ADR — Class 3'],
            ['IT', 'Turin', '10121', 'ES', 'Valencia', '46001', 'flatbed', 'steel', 'Steel coils — heavy, crane loading'],
        ];

        foreach ($routes as $i => $route) {
            $loadDate = now()->addDays(rand(1, 14));
            FreightOffer::create([
                'company_id' => $companies->random()->id,
                'user_id' => 1,
                'origin_country' => $route[0],
                'origin_city' => $route[1],
                'origin_postal_code' => $route[2],
                'destination_country' => $route[3],
                'destination_city' => $route[4],
                'destination_postal_code' => $route[5],
                'vehicle_type' => $route[6],
                'cargo_type' => $route[7],
                'cargo_description' => $route[8],
                'weight' => rand(5000, 24000),
                'volume' => rand(20, 90),
                'loading_meters' => round(rand(40, 136) / 10, 1),
                'loading_date' => $loadDate,
                'unloading_date' => $loadDate->copy()->addDays(rand(1, 3)),
                'price' => $i % 3 === 0 ? null : rand(800, 4500),
                'currency' => 'EUR',
                'is_hazardous' => $i === 10,
                'requires_temperature_control' => in_array($route[6], ['refrigerated']),
                'status' => ['active', 'active', 'active', 'matched', 'expired'][rand(0, 4)] ?? 'active',
            ]);
        }
    }
}
