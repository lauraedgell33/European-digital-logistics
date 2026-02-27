<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'admin']);
    }

    /**
     * Helper to create a database notification for a user.
     */
    private function createNotification(User $user, bool $read = false): DatabaseNotification
    {
        return DatabaseNotification::create([
            'id' => Str::uuid()->toString(),
            'type' => 'App\\Notifications\\OrderStatusNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => [
                'title' => 'Order Status Update',
                'message' => 'Order TO-2026-000001 has been accepted.',
                'order_id' => 1,
            ],
            'read_at' => $read ? now() : null,
        ]);
    }

    // ── List ──────────────────────────────────────────────

    public function test_user_can_list_notifications(): void
    {
        $this->createNotification($this->user);
        $this->createNotification($this->user);
        $this->createNotification($this->user, read: true);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/notifications');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'unread_count',
            ])
            ->assertJsonPath('unread_count', 2);
    }

    // ── Mark Single as Read ───────────────────────────────

    public function test_user_can_mark_notification_read(): void
    {
        $notification = $this->createNotification($this->user);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertOk()
            ->assertJson(['message' => 'Notification marked as read']);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    // ── Mark All as Read ──────────────────────────────────

    public function test_user_can_mark_all_read(): void
    {
        $this->createNotification($this->user);
        $this->createNotification($this->user);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/notifications/read-all');

        $response->assertOk()
            ->assertJson(['message' => 'All notifications marked as read']);

        $this->assertEquals(0, $this->user->unreadNotifications()->count());
    }

    // ── Delete ────────────────────────────────────────────

    public function test_user_can_delete_notification(): void
    {
        $notification = $this->createNotification($this->user);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Notification deleted']);

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }
}
