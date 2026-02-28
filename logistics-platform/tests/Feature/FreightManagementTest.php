<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class FreightManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create();
        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
    }

    public function test_can_list_freight_offers(): void
    {
        FreightOffer::factory()->count(5)->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/freight');

        $response->assertStatus(200);
    }

    public function test_can_create_freight_offer(): void
    {
        $data = [
            'origin_country' => 'DE',
            'origin_city' => 'Berlin',
            'origin_postal_code' => '10115',
            'destination_country' => 'FR',
            'destination_city' => 'Paris',
            'destination_postal_code' => '75001',
            'cargo_type' => 'general',
            'weight' => 15000,
            'loading_date' => now()->addDays(2)->toDateString(),
            'unloading_date' => now()->addDays(3)->toDateString(),
            'vehicle_type' => 'curtain_side',
            'currency' => 'EUR',
            'price_type' => 'fixed',
            'price' => 1500,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/freight', $data);

        $response->assertStatus(201);
    }

    public function test_can_search_freight_offers(): void
    {
        FreightOffer::factory()->count(3)->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'origin_country' => 'DE',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/freight/search', [
                'origin_country' => 'DE',
            ]);

        $response->assertStatus(200);
    }

    public function test_can_view_single_freight_offer(): void
    {
        $offer = FreightOffer::factory()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/freight/{$offer->id}");

        $response->assertStatus(200);
    }

    public function test_can_delete_own_freight_offer(): void
    {
        $offer = FreightOffer::factory()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/v1/freight/{$offer->id}");

        $response->assertStatus(200);
    }

    public function test_can_list_vehicle_offers(): void
    {
        VehicleOffer::factory()->count(3)->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/vehicles');

        $response->assertStatus(200);
    }

    public function test_can_create_vehicle_offer(): void
    {
        $data = [
            'vehicle_type' => 'curtain_side',
            'capacity_kg' => 24000,
            'current_country' => 'DE',
            'current_city' => 'Munich',
            'available_from' => now()->addDay()->toDateString(),
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/vehicles', $data);

        $response->assertStatus(201);
    }
}
