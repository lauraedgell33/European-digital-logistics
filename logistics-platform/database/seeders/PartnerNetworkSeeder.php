<?php

namespace Database\Seeders;

use App\Models\PartnerNetwork;
use App\Models\Company;
use Illuminate\Database\Seeder;

class PartnerNetworkSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();

        $networks = [
            [
                'name' => 'Central Europe FTL Alliance',
                'description' => 'Trusted network of full truckload carriers operating across Germany, Poland, Czech Republic, Austria, and the Benelux region.',
            ],
            [
                'name' => 'Mediterranean Reefer Network',
                'description' => 'Temperature-controlled transport specialists connecting Italy, Spain, France, and Southern Europe.',
            ],
            [
                'name' => 'EU Open Freight Exchange',
                'description' => 'Open network for shippers and carriers to find partners and exchange freight across all EU member states.',
            ],
        ];

        foreach ($networks as $i => $data) {
            $owner = $companies[$i % $companies->count()];

            $network = PartnerNetwork::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'owner_company_id' => $owner->id,
                'is_active' => true,
            ]);

            // Add members
            $members = $companies->where('id', '!=', $owner->id)->random(min(3, $companies->count() - 1));
            foreach ($members as $member) {
                $network->members()->attach($member->id, [
                    'status' => 'active',
                    'joined_at' => now()->subDays(rand(1, 90)),
                ]);
            }
        }
    }
}
