<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\PartnerNetwork;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PartnerNetworkFactory extends Factory
{
    protected $model = PartnerNetwork::class;

    public function definition(): array
    {
        return [
            'owner_company_id' => Company::factory(),
            'name' => fake()->randomElement([
                'European Logistics Alliance',
                'Nordic Transport Network',
                'Mediterranean Freight Group',
                'Central Europe Carriers',
                'Atlantic Trade Network',
                'Alpine Logistics Partners',
                'Baltic Shipping Coalition',
            ]) . ' ' . fake()->numerify('##'),
            'description' => fake()->paragraph(2),
            'access_code' => strtoupper(Str::random(8)),
            'is_active' => true,
            'max_members' => fake()->randomElement([10, 25, 50, 100, null]),
            'settings' => [
                'allow_freight_sharing' => true,
                'allow_vehicle_sharing' => true,
                'allow_tender_visibility' => true,
                'require_approval' => false,
            ],
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['is_active' => true]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function withApproval(): static
    {
        return $this->state(fn () => [
            'settings' => [
                'allow_freight_sharing' => true,
                'allow_vehicle_sharing' => true,
                'allow_tender_visibility' => true,
                'require_approval' => true,
            ],
        ]);
    }

    public function small(): static
    {
        return $this->state(fn () => ['max_members' => 10]);
    }
}
