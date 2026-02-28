<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function createCompanyAndUser(array $overrides = []): array
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(array_merge([
            'company_id' => $company->id,
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ], $overrides));

        return [$company, $user];
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        [$company, $user] = $this->createCompanyAndUser();

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        [$company, $user] = $this->createCompanyAndUser();

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'SecurePassword1!',
            'password_confirmation' => 'SecurePassword1!',
            'company_name' => 'Test Transport GmbH',
            'company_type' => 'carrier',
            'vat_number' => 'DE123456789',
            'country_code' => 'DE',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        [$company, $user] = $this->createCompanyAndUser();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/auth/profile');

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'test@example.com');
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/auth/profile');
        $response->assertStatus(401);
    }

    public function test_user_can_logout(): void
    {
        [$company, $user] = $this->createCompanyAndUser();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
    }
}
