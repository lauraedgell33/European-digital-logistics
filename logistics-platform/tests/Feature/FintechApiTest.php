<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FintechApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $company = Company::factory()->create();
        $this->user = User::factory()->create(['company_id' => $company->id]);
    }

    public function test_can_list_invoices(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/invoices');

        $response->assertStatus(200);
    }

    public function test_can_get_invoice_stats(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/invoices/stats');

        $response->assertStatus(200);
    }

    public function test_can_list_payments(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/payments/history');

        $response->assertStatus(200);
    }

    public function test_can_get_payment_summary(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/payments/summary');

        $response->assertStatus(200);
    }

    public function test_can_get_exchange_rates(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/payments/exchange-rates');

        $response->assertStatus(200);
    }

    public function test_can_get_vat_rates(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/vat/rates');

        $response->assertStatus(200);
    }
}
