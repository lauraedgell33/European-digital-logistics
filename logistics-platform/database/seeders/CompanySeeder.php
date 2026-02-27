<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            [
                'name' => 'Trans Europa GmbH',
                'type' => 'carrier',
                'country_code' => 'DE',
                'city' => 'Hamburg',
                'address' => 'Speicherstadt 12',
                'postal_code' => '20457',
                'vat_number' => 'DE123456789',
                'email' => 'info@transeuropa.de',
                'verification_status' => 'verified',
                'is_active' => true,
            ],
            [
                'name' => 'LogisFrance SAS',
                'type' => 'shipper',
                'country_code' => 'FR',
                'city' => 'Lyon',
                'address' => '45 Rue de la Logistique',
                'postal_code' => '69001',
                'vat_number' => 'FR98765432100',
                'email' => 'contact@logisfrance.fr',
                'verification_status' => 'verified',
                'is_active' => true,
            ],
            [
                'name' => 'PL-Transport Sp. z o.o.',
                'type' => 'carrier',
                'country_code' => 'PL',
                'city' => 'Warsaw',
                'address' => 'ul. Transportowa 88',
                'postal_code' => '02-001',
                'vat_number' => 'PL5210001234',
                'email' => 'biuro@pltransport.pl',
                'verification_status' => 'verified',
                'is_active' => true,
            ],
            [
                'name' => 'NL Freight Solutions B.V.',
                'type' => 'forwarder',
                'country_code' => 'NL',
                'city' => 'Rotterdam',
                'address' => 'Havenstraat 23',
                'postal_code' => '3011 AA',
                'vat_number' => 'NL001234567B01',
                'email' => 'info@nlfreight.nl',
                'verification_status' => 'verified',
                'is_active' => true,
            ],
            [
                'name' => 'Italia Trasporti S.r.l.',
                'type' => 'carrier',
                'country_code' => 'IT',
                'city' => 'Milan',
                'address' => 'Via della Logistica 7',
                'postal_code' => '20121',
                'vat_number' => 'IT12345678901',
                'email' => 'info@italiatrasporti.it',
                'verification_status' => 'verified',
                'is_active' => true,
            ],
            [
                'name' => 'Iberia Cargo S.L.',
                'type' => 'carrier',
                'country_code' => 'ES',
                'city' => 'Barcelona',
                'address' => 'Calle del Puerto 15',
                'postal_code' => '08001',
                'vat_number' => 'ESB12345678',
                'email' => 'info@iberiacargo.es',
                'verification_status' => 'pending',
                'is_active' => true,
            ],
        ];

        foreach ($companies as $data) {
            Company::create($data);
        }
    }
}
