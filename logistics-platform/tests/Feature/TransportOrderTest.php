<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\TransportOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransportOrderTest extends TestCase
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

    // ── List ──────────────────────────────────────────────

    public function test_user_can_list_orders(): void
    {
        TransportOrder::factory()->count(3)->create([
            'shipper_id' => $this->shipperCompany->id,
            'created_by' => $this->user->id,
        ]);

        // Another company's orders — should not appear
        TransportOrder::factory()->count(2)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/orders');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'order_number', 'status', 'pickup_city', 'delivery_city'],
                ],
            ]);
    }

    // ── Create ────────────────────────────────────────────

    public function test_user_can_create_order(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/orders', [
                'carrier_id' => $this->carrierCompany->id,
                'pickup_country' => 'DE',
                'pickup_city' => 'Berlin',
                'pickup_address' => 'Alexanderplatz 1',
                'pickup_postal_code' => '10178',
                'pickup_contact_name' => 'Max Weber',
                'pickup_contact_phone' => '+49 30 1234567',
                'pickup_date' => now()->addDays(3)->format('Y-m-d'),
                'delivery_country' => 'FR',
                'delivery_city' => 'Paris',
                'delivery_address' => '1 Rue de Rivoli',
                'delivery_postal_code' => '75001',
                'delivery_contact_name' => 'Jean Dupont',
                'delivery_contact_phone' => '+33 1 23456789',
                'delivery_date' => now()->addDays(6)->format('Y-m-d'),
                'cargo_type' => 'palletized',
                'weight' => 12000,
                'total_price' => 3200.00,
                'currency' => 'EUR',
                'payment_terms' => '30_days',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.pickup_city', 'Berlin')
            ->assertJsonPath('data.delivery_city', 'Paris');

        $this->assertDatabaseHas('transport_orders', [
            'shipper_id' => $this->shipperCompany->id,
            'pickup_city' => 'Berlin',
            'delivery_city' => 'Paris',
            'status' => 'pending',
        ]);
    }

    // ── View ──────────────────────────────────────────────

    public function test_user_can_view_order(): void
    {
        $order = TransportOrder::factory()->create([
            'shipper_id' => $this->shipperCompany->id,
            'carrier_id' => $this->carrierCompany->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $order->id)
            ->assertJsonStructure([
                'data' => ['id', 'order_number', 'status', 'pickup_city', 'delivery_city', 'total_price'],
            ]);
    }

    // ── Update Status ─────────────────────────────────────

    public function test_user_can_update_order_status(): void
    {
        // Create an accepted order so it can transition to picked_up
        $order = TransportOrder::factory()->accepted()->create([
            'shipper_id' => $this->shipperCompany->id,
            'carrier_id' => $this->carrierCompany->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/orders/{$order->id}/status", [
                'status' => 'picked_up',
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('transport_orders', [
            'id' => $order->id,
            'status' => 'picked_up',
        ]);
    }

    // ── Authorization ─────────────────────────────────────

    public function test_user_cannot_update_others_order(): void
    {
        // Order belongs to a completely different company pair
        $otherShipper = Company::factory()->shipper()->create();
        $otherCarrier = Company::factory()->carrier()->create();

        $order = TransportOrder::factory()->accepted()->create([
            'shipper_id' => $otherShipper->id,
            'carrier_id' => $otherCarrier->id,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/orders/{$order->id}/status", [
                'status' => 'picked_up',
            ]);

        $response->assertStatus(403);
    }
}
