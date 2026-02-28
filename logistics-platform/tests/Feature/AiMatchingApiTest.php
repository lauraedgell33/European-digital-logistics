<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AiMatchingApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $company = Company::factory()->create();
        $this->user = User::factory()->create(['company_id' => $company->id]);
    }

    public function test_can_access_ai_matching_suggestions(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/ai-matching/suggestions');

        $response->assertStatus(200);
    }

    public function test_can_access_predictions(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/predictions/market');

        $response->assertStatus(200);
    }

    public function test_can_access_dynamic_pricing(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/dynamic-pricing/calculate', [
                'origin_country' => 'DE',
                'origin_city' => 'Berlin',
                'destination_country' => 'FR',
                'destination_city' => 'Paris',
                'weight' => 15000,
                'distance_km' => 1050,
            ]);

        $response->assertStatus(200);
    }

    public function test_can_access_route_optimization(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/route-optimization/optimize', [
                'waypoints' => [
                    ['lat' => 52.52, 'lng' => 13.405, 'name' => 'Berlin'],
                    ['lat' => 50.075, 'lng' => 14.437, 'name' => 'Prague'],
                    ['lat' => 48.208, 'lng' => 16.373, 'name' => 'Vienna'],
                ],
            ]);

        $response->assertStatus(200);
    }
}
