<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BlockchainApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $company = Company::factory()->create();
        $this->user = User::factory()->create(['company_id' => $company->id]);
    }

    public function test_can_list_ecmr_documents(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/ecmr');

        $response->assertStatus(200);
    }

    public function test_can_create_ecmr_document(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/ecmr', [
                'transport_order_id' => null,
                'sender_name' => 'Sender GmbH',
                'sender_address' => 'Berlin, Germany',
                'carrier_name' => 'Carrier SpA',
                'carrier_address' => 'Milan, Italy',
                'consignee_name' => 'Receiver SARL',
                'consignee_address' => 'Lyon, France',
                'goods_description' => 'Industrial parts',
                'weight' => 12000,
                'packages_count' => 24,
                'pickup_date' => now()->addDays(2)->toDateString(),
                'delivery_date' => now()->addDays(4)->toDateString(),
                'pickup_location' => 'Berlin, Germany',
                'delivery_location' => 'Lyon, France',
            ]);

        $response->assertStatus(201);
    }

    public function test_can_list_smart_contracts(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/smart-contracts');

        $response->assertStatus(200);
    }

    public function test_can_verify_digital_identity(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/digital-identity/verify');

        $response->assertStatus(200);
    }
}
