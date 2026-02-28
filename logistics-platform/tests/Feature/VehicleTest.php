<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\VehicleOffer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->carrier()->create();
        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
            'role' => 'admin',
        ]);
    }

    public function test_can_list_vehicle_offers(): void
    {
        VehicleOffer::factory()->count(3)->create();

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/vehicles');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'vehicle_type', 'current_city', 'status']],
            ]);
    }

    public function test_can_create_vehicle_offer(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/vehicles', [
                'vehicle_type' => 'tautliner',
                'vehicle_registration' => 'DE-ABC-123',
                'capacity_kg' => 24000,
                'capacity_m3' => 86,
                'pallet_spaces' => 33,
                'current_country' => 'DE',
                'current_city' => 'Munich',
                'available_from' => now()->format('Y-m-d'),
                'available_to' => now()->addDays(14)->format('Y-m-d'),
                'price_per_km' => 1.45,
                'currency' => 'EUR',
                'is_public' => true,
                'driver_name' => 'Hans Mueller',
                'driver_phone' => '+49171234567',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.vehicle_type', 'tautliner')
            ->assertJsonPath('data.current_city', 'Munich');
    }

    public function test_can_view_vehicle_offer(): void
    {
        $offer = VehicleOffer::factory()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/vehicles/{$offer->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $offer->id);
    }
}
