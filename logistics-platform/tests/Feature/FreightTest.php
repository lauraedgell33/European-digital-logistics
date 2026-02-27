<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\FreightOffer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FreightTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();
        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
            'role' => 'admin',
        ]);
    }

    public function test_can_list_freight_offers(): void
    {
        FreightOffer::factory()->count(5)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/freight');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'origin_city', 'destination_city', 'status']],
            ]);
    }

    public function test_can_create_freight_offer(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/freight', [
                'origin_country' => 'DE',
                'origin_city' => 'Hamburg',
                'origin_postal_code' => '20095',
                'destination_country' => 'PL',
                'destination_city' => 'Warsaw',
                'destination_postal_code' => '00-001',
                'cargo_type' => 'palletized',
                'weight' => 18000,
                'volume' => 65,
                'loading_date' => now()->addDays(5)->format('Y-m-d'),
                'vehicle_type' => 'tautliner',
                'price' => 1800,
                'currency' => 'EUR',
                'price_type' => 'fixed',
                'is_public' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.origin_city', 'Hamburg')
            ->assertJsonPath('data.destination_city', 'Warsaw');
    }

    public function test_can_view_freight_offer(): void
    {
        $offer = FreightOffer::factory()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/freight/{$offer->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $offer->id);
    }

    public function test_can_list_my_freight_offers(): void
    {
        FreightOffer::factory()->count(3)->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        // Other company's offers
        FreightOffer::factory()->count(2)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/freight/my/offers');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
