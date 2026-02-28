<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EnterpriseApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $company = Company::factory()->create();
        $this->user = User::factory()->create(['company_id' => $company->id]);
    }

    public function test_can_get_white_label_config(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/white-label');

        $response->assertStatus(200);
    }

    public function test_can_list_api_keys(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/api-keys');

        $response->assertStatus(200);
    }

    public function test_can_create_api_key(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/api-keys', [
                'name' => 'Test Key',
                'permissions' => ['read:freight', 'write:orders'],
            ]);

        $response->assertStatus(201);
    }

    public function test_can_list_erp_integrations(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/erp');

        $response->assertStatus(200);
    }

    public function test_can_list_edi_messages(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/edi');

        $response->assertStatus(200);
    }

    public function test_can_get_edi_stats(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/edi/stats');

        $response->assertStatus(200);
    }
}
