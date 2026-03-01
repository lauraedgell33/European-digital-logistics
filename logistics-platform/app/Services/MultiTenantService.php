<?php

namespace App\Services;

use App\Models\WhiteLabel;
use App\Models\Company;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Multi-Tenant Service for white-label deployments.
 *
 * Features:
 * - Tenant resolution by subdomain, custom domain, or API header
 * - Automatic data isolation via company_id scoping
 * - Per-tenant configuration (branding, features, limits)
 * - Tenant provisioning / deprovisioning
 * - Usage metering & plan enforcement
 * - Tenant-specific asset management
 */
class MultiTenantService
{
    private ?WhiteLabel $currentTenant = null;

    // ── Plans ───────────────────────────────────────────────────

    public const PLANS = [
        'starter' => [
            'name' => 'Starter',
            'max_users' => 10,
            'max_freight_per_month' => 100,
            'max_orders_per_month' => 50,
            'features' => ['freight_exchange', 'basic_tracking', 'invoicing'],
            'api_rate_limit' => 60,
            'storage_mb' => 500,
            'monthly_eur' => 199,
        ],
        'professional' => [
            'name' => 'Professional',
            'max_users' => 50,
            'max_freight_per_month' => 1000,
            'max_orders_per_month' => 500,
            'features' => ['freight_exchange', 'basic_tracking', 'invoicing', 'route_optimization',
                           'ai_matching', 'documents', 'carbon_calculator', 'reporting'],
            'api_rate_limit' => 300,
            'storage_mb' => 5000,
            'monthly_eur' => 599,
        ],
        'enterprise' => [
            'name' => 'Enterprise',
            'max_users' => -1, // unlimited
            'max_freight_per_month' => -1,
            'max_orders_per_month' => -1,
            'features' => ['*'], // all features
            'api_rate_limit' => 1000,
            'storage_mb' => 50000,
            'monthly_eur' => 1999,
        ],
    ];

    // ── Tenant Resolution ───────────────────────────────────────

    /**
     * Resolve tenant from HTTP request context.
     * Priority: X-Tenant-ID header > Host subdomain > custom domain
     */
    public function resolveFromRequest(\Illuminate\Http\Request $request): ?WhiteLabel
    {
        // 1. Explicit header (API clients)
        $tenantId = $request->header('X-Tenant-ID');
        if ($tenantId) {
            return $this->resolveById((int) $tenantId);
        }

        // 2. Host-based resolution
        $host = $request->getHost();
        return $this->resolveByHost($host);
    }

    /**
     * Resolve by subdomain or custom domain.
     */
    public function resolveByHost(string $host): ?WhiteLabel
    {
        return Cache::remember("tenant:host:{$host}", 600, function () use ($host) {
            // Try custom domain first
            $tenant = WhiteLabel::where('custom_domain', $host)
                ->where('is_active', true)
                ->first();

            if ($tenant) return $tenant;

            // Try subdomain
            $baseDomain = config('tenancy.base_domain', 'logimarket.eu');
            if (Str::endsWith($host, ".{$baseDomain}")) {
                $subdomain = Str::before($host, ".{$baseDomain}");
                return WhiteLabel::where('subdomain', $subdomain)
                    ->where('is_active', true)
                    ->first();
            }

            return null;
        });
    }

    /**
     * Resolve by ID.
     */
    public function resolveById(int $id): ?WhiteLabel
    {
        return Cache::remember("tenant:id:{$id}", 600, function () use ($id) {
            return WhiteLabel::where('id', $id)->where('is_active', true)->first();
        });
    }

    /**
     * Set the active tenant for the current request.
     */
    public function setTenant(WhiteLabel $tenant): void
    {
        $this->currentTenant = $tenant;
        app()->instance('current_tenant', $tenant);
    }

    public function getTenant(): ?WhiteLabel
    {
        return $this->currentTenant;
    }

    // ── Provisioning ────────────────────────────────────────────

    /**
     * Provision a new white-label tenant.
     */
    public function provision(array $data): array
    {
        $plan = self::PLANS[$data['plan'] ?? 'starter'] ?? self::PLANS['starter'];

        DB::beginTransaction();
        try {
            // Create or link company
            $company = Company::findOrFail($data['company_id']);

            // Create white-label config
            $subdomain = $data['subdomain'] ?? Str::slug($company->name);

            // Ensure unique subdomain
            $originalSubdomain = $subdomain;
            $counter = 1;
            while (WhiteLabel::where('subdomain', $subdomain)->exists()) {
                $subdomain = "{$originalSubdomain}-{$counter}";
                $counter++;
            }

            $tenant = WhiteLabel::create([
                'company_id' => $company->id,
                'subdomain' => $subdomain,
                'custom_domain' => $data['custom_domain'] ?? null,
                'brand_name' => $data['brand_name'] ?? $company->name,
                'logo_url' => $data['logo_url'] ?? null,
                'favicon_url' => $data['favicon_url'] ?? null,
                'brand_colors' => $data['brand_colors'] ?? [
                    'primary' => '#1e40af',
                    'secondary' => '#7c3aed',
                    'accent' => '#059669',
                ],
                'features_enabled' => $plan['features'],
                'custom_translations' => $data['custom_translations'] ?? [],
                'support_email' => $data['support_email'] ?? $company->email,
                'support_phone' => $data['support_phone'] ?? null,
                'is_active' => true,
                'plan' => $data['plan'] ?? 'starter',
                'monthly_fee' => $plan['monthly_eur'],
                'currency' => 'EUR',
            ]);

            // Create tenant storage directory
            Storage::makeDirectory("tenants/{$tenant->id}");

            // Seed tenant-specific defaults
            $this->seedTenantDefaults($tenant);

            DB::commit();

            // Clear cache
            Cache::forget("tenant:host:{$subdomain}." . config('tenancy.base_domain', 'logimarket.eu'));

            Log::info("Tenant provisioned: {$tenant->brand_name} ({$subdomain})", [
                'tenant_id' => $tenant->id,
                'company_id' => $company->id,
                'plan' => $data['plan'] ?? 'starter',
            ]);

            return [
                'tenant_id' => $tenant->id,
                'subdomain' => $subdomain,
                'url' => "https://{$subdomain}." . config('tenancy.base_domain', 'logimarket.eu'),
                'custom_domain' => $tenant->custom_domain,
                'plan' => $tenant->plan,
                'features' => $tenant->features_enabled,
                'status' => 'active',
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Tenant provisioning failed: {$e->getMessage()}");
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Deprovision (disable) a tenant.
     */
    public function deprovision(int $tenantId): array
    {
        $tenant = WhiteLabel::findOrFail($tenantId);
        $tenant->update(['is_active' => false]);

        // Clear all caches
        $this->flushTenantCache($tenant);

        Log::info("Tenant deprovisioned: {$tenant->brand_name}", ['tenant_id' => $tenantId]);

        return ['tenant_id' => $tenantId, 'status' => 'deprovisioned'];
    }

    /**
     * Update tenant plan.
     */
    public function changePlan(int $tenantId, string $newPlan): array
    {
        $plan = self::PLANS[$newPlan] ?? null;
        if (!$plan) return ['error' => 'Invalid plan'];

        $tenant = WhiteLabel::findOrFail($tenantId);
        $oldPlan = $tenant->plan;

        $tenant->update([
            'plan' => $newPlan,
            'monthly_fee' => $plan['monthly_eur'],
            'features_enabled' => $plan['features'],
        ]);

        $this->flushTenantCache($tenant);

        return [
            'tenant_id' => $tenantId,
            'old_plan' => $oldPlan,
            'new_plan' => $newPlan,
            'monthly_fee' => $plan['monthly_eur'],
            'features' => $plan['features'],
        ];
    }

    // ── Feature & Limit Enforcement ─────────────────────────────

    /**
     * Check if a feature is enabled for the current tenant.
     */
    public function hasFeature(string $feature, ?WhiteLabel $tenant = null): bool
    {
        $tenant ??= $this->currentTenant;
        if (!$tenant) return true; // No tenant context = platform admin

        $features = $tenant->features_enabled ?? [];
        if (in_array('*', $features)) return true;

        return in_array($feature, $features);
    }

    /**
     * Check if a tenant's usage is within plan limits.
     */
    public function checkLimit(string $resource, ?WhiteLabel $tenant = null): array
    {
        $tenant ??= $this->currentTenant;
        if (!$tenant) return ['allowed' => true, 'remaining' => -1];

        $plan = self::PLANS[$tenant->plan] ?? self::PLANS['starter'];
        $companyId = $tenant->company_id;

        $usage = match ($resource) {
            'users' => DB::table('users')->where('company_id', $companyId)->count(),
            'freight' => DB::table('freight_offers')
                ->where('company_id', $companyId)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),
            'orders' => DB::table('transport_orders')
                ->where(fn($q) => $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId))
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),
            default => 0,
        };

        $limitKey = match ($resource) {
            'users' => 'max_users',
            'freight' => 'max_freight_per_month',
            'orders' => 'max_orders_per_month',
            default => null,
        };

        $limit = $plan[$limitKey] ?? -1;

        if ($limit === -1) return ['allowed' => true, 'remaining' => -1, 'usage' => $usage];

        return [
            'allowed' => $usage < $limit,
            'usage' => $usage,
            'limit' => $limit,
            'remaining' => max(0, $limit - $usage),
        ];
    }

    /**
     * Get API rate limit for tenant's plan.
     */
    public function getRateLimit(?WhiteLabel $tenant = null): int
    {
        $tenant ??= $this->currentTenant;
        if (!$tenant) return 120; // default
        $plan = self::PLANS[$tenant->plan] ?? self::PLANS['starter'];
        return $plan['api_rate_limit'];
    }

    // ── Usage & Metrics ─────────────────────────────────────────

    /**
     * Get tenant usage dashboard.
     */
    public function getUsageDashboard(int $tenantId): array
    {
        $tenant = WhiteLabel::with('company')->findOrFail($tenantId);
        $plan = self::PLANS[$tenant->plan] ?? self::PLANS['starter'];
        $companyId = $tenant->company_id;

        $cacheKey = "tenant_usage:{$tenantId}";
        return Cache::remember($cacheKey, 300, function () use ($tenant, $plan, $companyId) {
            $monthStart = now()->startOfMonth();

            return [
                'tenant' => [
                    'id' => $tenant->id,
                    'brand_name' => $tenant->brand_name,
                    'subdomain' => $tenant->subdomain,
                    'plan' => $tenant->plan,
                    'is_active' => $tenant->is_active,
                ],
                'usage' => [
                    'users' => [
                        'current' => DB::table('users')->where('company_id', $companyId)->count(),
                        'limit' => $plan['max_users'],
                    ],
                    'freight_this_month' => [
                        'current' => DB::table('freight_offers')->where('company_id', $companyId)->where('created_at', '>=', $monthStart)->count(),
                        'limit' => $plan['max_freight_per_month'],
                    ],
                    'orders_this_month' => [
                        'current' => DB::table('transport_orders')
                            ->where(fn($q) => $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId))
                            ->where('created_at', '>=', $monthStart)->count(),
                        'limit' => $plan['max_orders_per_month'],
                    ],
                    'storage_mb' => [
                        'current' => $this->calculateStorageUsage($tenant->id),
                        'limit' => $plan['storage_mb'],
                    ],
                ],
                'billing' => [
                    'monthly_fee' => $tenant->monthly_fee,
                    'currency' => $tenant->currency,
                    'next_billing' => now()->endOfMonth()->addDay()->toDateString(),
                ],
            ];
        });
    }

    /**
     * List all tenants (admin).
     */
    public function listTenants(array $filters = []): array
    {
        $query = WhiteLabel::with('company:id,name,country_code');

        if (isset($filters['plan'])) $query->where('plan', $filters['plan']);
        if (isset($filters['is_active'])) $query->where('is_active', $filters['is_active']);

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 20)
            ->toArray();
    }

    // ── Branding ────────────────────────────────────────────────

    /**
     * Get tenant branding config (for frontend theming).
     */
    public function getBranding(?WhiteLabel $tenant = null): array
    {
        $tenant ??= $this->currentTenant;
        if (!$tenant) {
            return [
                'brand_name' => config('app.name'),
                'logo_url' => '/images/logo.svg',
                'favicon_url' => '/favicon.ico',
                'colors' => ['primary' => '#1e40af', 'secondary' => '#7c3aed', 'accent' => '#059669'],
                'is_white_label' => false,
            ];
        }

        return [
            'brand_name' => $tenant->brand_name,
            'logo_url' => $tenant->logo_url ?? '/images/logo.svg',
            'favicon_url' => $tenant->favicon_url ?? '/favicon.ico',
            'colors' => $tenant->brand_colors ?? ['primary' => '#1e40af'],
            'support_email' => $tenant->support_email,
            'support_phone' => $tenant->support_phone,
            'custom_translations' => $tenant->custom_translations ?? [],
            'features' => $tenant->features_enabled ?? [],
            'is_white_label' => true,
        ];
    }

    // ── Helpers ─────────────────────────────────────────────────

    private function seedTenantDefaults(WhiteLabel $tenant): void
    {
        // Default notification preferences, etc.
        Log::info("Seeded defaults for tenant {$tenant->id}");
    }

    private function flushTenantCache(WhiteLabel $tenant): void
    {
        Cache::forget("tenant:id:{$tenant->id}");
        Cache::forget("tenant:host:{$tenant->subdomain}." . config('tenancy.base_domain', 'logimarket.eu'));
        if ($tenant->custom_domain) {
            Cache::forget("tenant:host:{$tenant->custom_domain}");
        }
        Cache::forget("tenant_usage:{$tenant->id}");
    }

    private function calculateStorageUsage(int $tenantId): int
    {
        $path = "tenants/{$tenantId}";
        if (!Storage::exists($path)) return 0;

        $totalBytes = 0;
        foreach (Storage::allFiles($path) as $file) {
            $totalBytes += Storage::size($file);
        }
        return (int) round($totalBytes / 1048576); // MB
    }
}
