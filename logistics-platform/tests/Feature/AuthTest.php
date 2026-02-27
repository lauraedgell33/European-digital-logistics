<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ── Registration ──────────────────────────────────────

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Hans Müller',
            'email' => 'hans@logistics-eu.test',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'company_name' => 'Müller Transport GmbH',
            'company_type' => 'carrier',
            'vat_number' => 'DE999888777',
            'country_code' => 'DE',
            'address' => 'Industriestraße 10',
            'city' => 'Munich',
            'postal_code' => '80331',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ]);

        $this->assertDatabaseHas('users', ['email' => 'hans@logistics-eu.test']);
        $this->assertDatabaseHas('companies', [
            'name' => 'Müller Transport GmbH',
            'vat_number' => 'DE999888777',
        ]);
    }

    public function test_register_with_existing_email_fails(): void
    {
        User::factory()->create(['email' => 'duplicate@test.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Another User',
            'email' => 'duplicate@test.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'company_name' => 'Duplicate Corp',
            'company_type' => 'shipper',
            'vat_number' => 'DE111222333',
            'country_code' => 'DE',
            'address' => 'Some Street 1',
            'city' => 'Berlin',
            'postal_code' => '10115',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ── Login ─────────────────────────────────────────────

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'login@test.com',
            'password' => Hash::make('Password@123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@test.com',
            'password' => 'Password@123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ]);
    }

    public function test_login_with_invalid_credentials_fails(): void
    {
        User::factory()->create([
            'email' => 'fail@test.com',
            'password' => Hash::make('CorrectPassword'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'fail@test.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ── Logout ────────────────────────────────────────────

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/auth/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Logged out successfully.']);

        // Token should be revoked
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }

    // ── Profile ───────────────────────────────────────────

    public function test_user_can_get_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/auth/profile');

        $response->assertOk()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role', 'language', 'company'],
            ])
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/auth/profile', [
                'name' => 'Updated Name',
                'language' => 'de',
                'phone' => '+49 170 1234567',
            ]);

        $response->assertOk()
            ->assertJsonPath('user.name', 'Updated Name')
            ->assertJsonPath('user.language', 'de');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'language' => 'de',
        ]);
    }

    // ── Change Password ───────────────────────────────────

    public function test_user_can_change_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123'),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/auth/change-password', [
                'current_password' => 'OldPassword123',
                'password' => 'NewPassword456!',
                'password_confirmation' => 'NewPassword456!',
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Password changed successfully.']);

        // Verify new password works
        $this->assertTrue(Hash::check('NewPassword456!', $user->fresh()->password));
    }

    // ── Unauthenticated Access ────────────────────────────

    public function test_unauthenticated_user_cannot_access_profile(): void
    {
        $response = $this->getJson('/api/v1/auth/profile');

        $response->assertStatus(401);
    }
}
