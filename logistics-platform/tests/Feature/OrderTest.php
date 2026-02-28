<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\TransportOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $shipperCompany;
    private Company $carrierCompany;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shipperCompany = Company::factory()->shipper()->create();
        $this->carrierCompany = Company::factory()->carrier()->create();
        $this->user = User::factory()->create([
            'company_id' => $this->shipperCompany->id,
            'role' => 'admin',
        ]);
    }

    public function test_can_list_orders(): void
    {
        TransportOrder::factory()->count(3)->create([
            'shipper_id' => $this->shipperCompany->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/orders');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_order(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/orders', [
                'carrier_id' => $this->carrierCompany->id,
                'pickup_country' => 'DE',
                'pickup_city' => 'Berlin',
                'pickup_address' => 'Test Str. 1',
                'pickup_postal_code' => '10115',
                'pickup_contact_name' => 'John Doe',
                'pickup_contact_phone' => '+49123456789',
                'pickup_date' => now()->addDays(3)->format('Y-m-d'),
                'delivery_country' => 'FR',
                'delivery_city' => 'Paris',
                'delivery_address' => 'Rue Test 5',
                'delivery_postal_code' => '75001',
                'delivery_contact_name' => 'Jean Dupont',
                'delivery_contact_phone' => '+33123456789',
                'delivery_date' => now()->addDays(5)->format('Y-m-d'),
                'cargo_type' => 'general',
                'weight' => 15000,
                'total_price' => 2500.00,
                'currency' => 'EUR',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('transport_orders', [
            'shipper_id' => $this->shipperCompany->id,
            'pickup_city' => 'Berlin',
            'delivery_city' => 'Paris',
        ]);
    }

    public function test_can_view_own_order(): void
    {
        $order = TransportOrder::factory()->create([
            'shipper_id' => $this->shipperCompany->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $order->id);
    }

    public function test_cannot_view_other_company_order(): void
    {
        $otherCompany = Company::factory()->create();
        $otherUser = User::factory()->create(['company_id' => $otherCompany->id]);
        $order = TransportOrder::factory()->create([
            'shipper_id' => $otherCompany->id,
            'created_by' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(403);
    }

    public function test_order_list_only_shows_company_orders(): void
    {
        // Create orders for this company
        TransportOrder::factory()->count(2)->create([
            'shipper_id' => $this->shipperCompany->id,
            'created_by' => $this->user->id,
        ]);

        // Create orders for another company
        $otherCompany = Company::factory()->create();
        TransportOrder::factory()->count(3)->create([
            'shipper_id' => $otherCompany->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/orders');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_can_get_order_statistics(): void
    {
        TransportOrder::factory()->count(2)->create([
            'shipper_id' => $this->shipperCompany->id,
            'status' => 'pending',
        ]);
        TransportOrder::factory()->completed()->create([
            'shipper_id' => $this->shipperCompany->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/orders/stats/overview');

        $response->assertOk()
            ->assertJsonStructure([
                'total_orders',
                'pending',
                'active',
                'completed',
                'cancelled',
                'total_revenue',
            ]);
    }
}
