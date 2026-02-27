<?php

namespace Database\Seeders;

use App\Models\TransportOrder;
use App\Models\Company;
use Illuminate\Database\Seeder;

class TransportOrderSeeder extends Seeder
{
    public function run(): void
    {
        $shippers = Company::where('type', '!=', 'carrier')->get();
        $carriers = Company::where('type', 'carrier')->get();

        $orders = [
            ['DE', 'Hamburg', '20457', 'FR', 'Paris', '75001', 'general', 'completed', 3200],
            ['FR', 'Lyon', '69001', 'IT', 'Milan', '20121', 'perishable', 'in_transit', 2800],
            ['PL', 'Warsaw', '02-001', 'DE', 'Munich', '80331', 'electronics', 'delivered', 1900],
            ['NL', 'Rotterdam', '3011', 'ES', 'Barcelona', '08001', 'general', 'accepted', 4100],
            ['DE', 'Berlin', '10115', 'PL', 'Gdansk', '80-001', 'furniture', 'pending', 1200],
            ['IT', 'Milan', '20121', 'DE', 'Frankfurt', '60311', 'textiles', 'in_transit', 2500],
            ['ES', 'Madrid', '28001', 'FR', 'Marseille', '13001', 'construction', 'completed', 1800],
            ['FR', 'Paris', '75001', 'NL', 'Amsterdam', '1012', 'general', 'pickup_scheduled', 1500],
        ];

        foreach ($orders as $i => $o) {
            $loadDate = now()->subDays(rand(0, 10));
            TransportOrder::create([
                'order_number' => 'ORD-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'shipper_id' => $shippers->random()->id,
                'carrier_id' => $carriers->random()->id,
                'created_by' => 1,
                'pickup_country' => $o[0],
                'pickup_city' => $o[1],
                'pickup_postal_code' => $o[2],
                'pickup_address' => $o[1] . ' Logistics Center, ' . $o[2],
                'delivery_country' => $o[3],
                'delivery_city' => $o[4],
                'delivery_postal_code' => $o[5],
                'delivery_address' => $o[4] . ' Distribution Hub, ' . $o[5],
                'cargo_type' => $o[6],
                'weight' => rand(8000, 24000),
                'pickup_date' => $loadDate,
                'delivery_date' => $loadDate->copy()->addDays(rand(1, 3)),
                'total_price' => $o[8],
                'currency' => 'EUR',
                'status' => $o[7],
                'cargo_description' => 'Transport order cargo — standard goods',
            ]);
        }
    }
}
