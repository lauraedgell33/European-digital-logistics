<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use App\Models\TransportOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;
    private Company $carrierCompany;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['type' => 'shipper']);
        $this->carrierCompany = Company::factory()->create(['type' => 'carrier']);
        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
    }

    public function test_can_list_orders(): void
    {
        TransportOrder::factory()->count(3)->create([
            'shipper_id' => $this->company->id,
            'carrier_id' => $this->carrierCompany->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/orders');

        $response->assertStatus(200);
    }

    public function test_can_create_order(): void
    {
        $data = [
            'carrier_id' => $this->carrierCompany->id,
            'pickup_country' => 'DE',
            'pickup_city' => 'Hamburg',
            'pickup_address' => 'Hafenstr. 1',
            'pickup_postal_code' => '20095',
            'pickup_date' => now()->addDays(2)->toDateString(),
            'delivery_country' => 'NL',
            'delivery_city' => 'Rotterdam',
            'delivery_address' => 'Havenweg 10',
            'delivery_postal_code' => '3011 AA',
            'delivery_date' => now()->addDays(3)->toDateString(),
            'cargo_type' => 'general',
            'weight' => 18000,
            'total_price' => 2200,
            'currency' => 'EUR',
            'payment_terms' => 'net_30',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/orders', $data);

        $response->assertStatus(201);
    }

    public function test_can_view_order(): void
    {
        $order = TransportOrder::factory()->create([
            'shipper_id' => $this->company->id,
            'carrier_id' => $this->carrierCompany->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(200);
    }

    public function test_can_get_order_statistics(): void
    {
        TransportOrder::factory()->count(5)->create([
            'shipper_id' => $this->company->id,
            'carrier_id' => $this->carrierCompany->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/orders/stats/overview');

        $response->assertStatus(200);
    }

    public function test_carrier_can_accept_order(): void
    {
        $carrierUser = User::factory()->create([
            'company_id' => $this->carrierCompany->id,
        ]);

        $order = TransportOrder::factory()->create([
            'shipper_id' => $this->company->id,
            'carrier_id' => $this->carrierCompany->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($carrierUser, 'sanctum')
            ->postJson("/api/v1/orders/{$order->id}/accept");

        $response->assertStatus(200);
    }
}
