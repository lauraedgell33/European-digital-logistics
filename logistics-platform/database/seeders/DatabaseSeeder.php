<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            CompanySeeder::class,
            UserSeeder::class,
            FreightOfferSeeder::class,
            VehicleOfferSeeder::class,
            TransportOrderSeeder::class,
            ShipmentSeeder::class,
            TenderSeeder::class,
            PartnerNetworkSeeder::class,
            DrivingBanSeeder::class,
            LexiconSeeder::class,
        ]);
    }
}
