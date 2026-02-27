<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Tender;
use App\Models\TenderBid;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenderTest extends TestCase
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

    public function test_user_can_list_tenders(): void
    {
        Tender::factory()->open()->count(3)->create(['is_public' => true]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/tenders');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'status', 'submission_deadline'],
                ],
            ]);
    }

    // ── Create ────────────────────────────────────────────

    public function test_user_can_create_tender(): void
    {
        $startDate = now()->addDays(15)->format('Y-m-d');
        $endDate = now()->addMonths(6)->format('Y-m-d');
        $deadline = now()->addDays(10)->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/tenders', [
                'title' => 'Weekly DE-FR Transport Tender',
                'description' => 'Regular weekly shipments from Germany to France.',
                'route_origin_country' => 'DE',
                'route_origin_city' => 'Frankfurt',
                'route_destination_country' => 'FR',
                'route_destination_city' => 'Lyon',
                'cargo_type' => 'palletized',
                'vehicle_type' => 'tautliner',
                'estimated_weight' => 20000,
                'frequency' => 'weekly',
                'shipments_per_period' => 4,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'submission_deadline' => $deadline,
                'budget' => 50000,
                'currency' => 'EUR',
                'budget_type' => 'total',
                'status' => 'open',
                'is_public' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Weekly DE-FR Transport Tender')
            ->assertJsonPath('data.status', 'open');

        $this->assertDatabaseHas('tenders', [
            'company_id' => $this->company->id,
            'title' => 'Weekly DE-FR Transport Tender',
        ]);
    }

    // ── View ──────────────────────────────────────────────

    public function test_user_can_view_tender(): void
    {
        $tender = Tender::factory()->open()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'is_public' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/tenders/{$tender->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $tender->id)
            ->assertJsonStructure([
                'data' => ['id', 'title', 'description', 'status', 'submission_deadline', 'budget'],
            ]);
    }

    // ── Submit Bid ────────────────────────────────────────

    public function test_user_can_submit_bid(): void
    {
        // Tender owned by another company
        $tenderOwner = Company::factory()->create();
        $tender = Tender::factory()->open()->create([
            'company_id' => $tenderOwner->id,
            'is_public' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/tenders/{$tender->id}/bids", [
                'proposed_price' => 42000.00,
                'currency' => 'EUR',
                'proposal' => 'We can deliver with our fleet of 20 trucks, GPS tracking included.',
                'transit_time_hours' => 18,
                'additional_services' => 'Temperature monitoring, real-time tracking',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'proposed_price', 'status'],
                'message',
            ]);

        $this->assertDatabaseHas('tender_bids', [
            'tender_id' => $tender->id,
            'company_id' => $this->company->id,
            'status' => 'submitted',
        ]);
    }

    // ── Award Tender ──────────────────────────────────────

    public function test_user_can_award_tender(): void
    {
        // Tender owned by this user's company
        $tender = Tender::factory()->open()->create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
        ]);

        // A bid from another company
        $bidderCompany = Company::factory()->create();
        $bidder = User::factory()->create(['company_id' => $bidderCompany->id]);
        $bid = TenderBid::factory()->submitted()->create([
            'tender_id' => $tender->id,
            'company_id' => $bidderCompany->id,
            'user_id' => $bidder->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/tenders/{$tender->id}/bids/{$bid->id}/award");

        $response->assertOk()
            ->assertJsonPath('data.status', 'awarded');

        $this->assertDatabaseHas('tenders', [
            'id' => $tender->id,
            'status' => 'awarded',
        ]);
        $this->assertDatabaseHas('tender_bids', [
            'id' => $bid->id,
            'status' => 'accepted',
        ]);
    }

    // ── Cannot Bid on Closed Tender ───────────────────────

    public function test_cannot_bid_on_closed_tender(): void
    {
        $tenderOwner = Company::factory()->create();
        $tender = Tender::factory()->closed()->create([
            'company_id' => $tenderOwner->id,
            'is_public' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/tenders/{$tender->id}/bids", [
                'proposed_price' => 30000.00,
                'proposal' => 'This should fail because the tender is closed.',
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'You cannot bid on this tender.']);
    }
}
