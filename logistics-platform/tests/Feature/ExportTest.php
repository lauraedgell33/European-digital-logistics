<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\TransportOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportTest extends TestCase
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

    public function test_can_export_orders_pdf(): void
    {
        TransportOrder::factory()->count(3)->create([
            'shipper_id' => $this->company->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/export/orders/pdf');

        $response->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_can_export_orders_csv(): void
    {
        TransportOrder::factory()->count(3)->create([
            'shipper_id' => $this->company->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/export/orders/csv');

        $response->assertOk();
    }

    public function test_can_export_single_order_pdf(): void
    {
        $order = TransportOrder::factory()->create([
            'shipper_id' => $this->company->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/export/orders/{$order->id}/pdf");

        $response->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_can_export_analytics_pdf(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/export/analytics/pdf');

        $response->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_unauthenticated_cannot_export(): void
    {
        $response = $this->getJson('/api/v1/export/orders/pdf');

        $response->assertStatus(401);
    }
}
