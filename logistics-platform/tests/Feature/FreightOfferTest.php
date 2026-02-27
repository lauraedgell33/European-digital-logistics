<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\FreightOffer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FreightOfferTest extends TestCase
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

    // ── List ──────────────────────────────────────────────

    public function test_user_can_list_freight_offers(): void
    {
        FreightOffer::factory()->count(5)->create([
            'is_public' => true,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/freight');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'origin_country', 'origin_city', 'destination_country', 'destination_city', 'status'],
                ],
            ]);
    }

    // ── Create ────────────────────────────────────────────

    public function test_user_can_create_freight_offer(): void
    {
        $loadingDate = now()->addDays(5)->format('Y-m-d');
        $unloadingDate = now()->addDays(7)->format('Y-m-d');

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
                'loading_date' => $loadingDate,
                'unloading_date' => $unloadingDate,
                'vehicle_type' => 'tautliner',
                'price' => 1800,
                'currency' => 'EUR',
                'price_type' => 'fixed',
                'is_public' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.origin_city', 'Hamburg')
            ->assertJsonPath('data.destination_city', 'Warsaw');

        $this->assertDatabaseHas('freight_offers', [
            'company_id' => $this->company->id,
            'origin_city' => 'Hamburg',
            'destination_city' => 'Warsaw',
        ]);
    }

    // ── View ──────────────────────────────────────────────

    public function test_user_can_view_freight_offer(): void
    {
        $offer = FreightOffer::factory()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/freight/{$offer->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $offer->id)
            ->assertJsonStructure([
                'data' => ['id', 'origin_country', 'origin_city', 'destination_country', 'destination_city', 'weight', 'price', 'status'],
            ]);
    }

    // ── Update ────────────────────────────────────────────

    public function test_user_can_update_freight_offer(): void
    {
        $offer = FreightOffer::factory()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/freight/{$offer->id}", [
                'price' => 2500.00,
                'notes' => 'Updated price',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.price', '2500.00');

        $this->assertDatabaseHas('freight_offers', [
            'id' => $offer->id,
            'notes' => 'Updated price',
        ]);
    }

    // ── Delete ────────────────────────────────────────────

    public function test_user_can_delete_freight_offer(): void
    {
        $offer = FreightOffer::factory()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/freight/{$offer->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Freight offer cancelled.']);

        $this->assertSoftDeleted('freight_offers', ['id' => $offer->id]);
    }

    // ── Search ────────────────────────────────────────────

    public function test_user_can_search_freight_offers(): void
    {
        FreightOffer::factory()->create([
            'origin_country' => 'DE',
            'destination_country' => 'FR',
            'status' => 'active',
            'is_public' => true,
        ]);
        FreightOffer::factory()->create([
            'origin_country' => 'PL',
            'destination_country' => 'ES',
            'status' => 'active',
            'is_public' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/freight/search', [
                'origin_country' => 'DE',
            ]);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'origin_country', 'destination_country'],
                ],
            ]);

        // At least the DE offer should be returned
        $origins = collect($response->json('data'))->pluck('origin_country');
        $this->assertTrue($origins->contains('DE'));
    }

    // ── Unauthenticated ───────────────────────────────────

    public function test_unauthenticated_user_cannot_create_freight_offer(): void
    {
        $response = $this->postJson('/api/v1/freight', [
            'origin_country' => 'DE',
            'origin_city' => 'Berlin',
        ]);

        $response->assertStatus(401);
    }
}
