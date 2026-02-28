<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable implements FilamentUser, MustVerifyEmail
{
    use HasApiTokens, HasFactory, HasRoles, LogsActivity, Notifiable, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'role', 'is_active', 'language'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "User {$this->name} was {$eventName}")
            ->useLogName('users');
    }

    /**
     * Guard name for spatie/permission.
     */
    protected string $guard_name = 'sanctum';

    /**
     * The permanent admin email that cannot be deleted or deactivated.
     */
    public const ADMIN_EMAIL = 'admin@logistics.eu';

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'password',
        'role',
        'language',
        'phone',
        'avatar',
        'is_active',
        'preferences',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'preferences' => 'array',
        'last_login_at' => 'datetime',
    ];

    // ── Boot (protect permanent admin) ───────────────────
    protected static function booted(): void
    {
        // Prevent deleting the permanent admin
        static::deleting(function (User $user) {
            if ($user->email === self::ADMIN_EMAIL) {
                throw new \RuntimeException('The permanent admin account cannot be deleted.');
            }
        });

        // Prevent deactivating or changing the role of the permanent admin
        static::updating(function (User $user) {
            if ($user->email === self::ADMIN_EMAIL) {
                if ($user->isDirty('is_active') && !$user->is_active) {
                    throw new \RuntimeException('The permanent admin account cannot be deactivated.');
                }
                if ($user->isDirty('role') && $user->role !== 'admin') {
                    throw new \RuntimeException('The permanent admin role cannot be changed.');
                }
                if ($user->isDirty('email')) {
                    throw new \RuntimeException('The permanent admin email cannot be changed.');
                }
            }
        });
    }

    // ── Filament ──────────────────────────────────────────
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_active && in_array($this->role, ['admin', 'manager']);
    }

    // ── Relationships ─────────────────────────────────────
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function freightOffers(): HasMany
    {
        return $this->hasMany(FreightOffer::class);
    }

    public function vehicleOffers(): HasMany
    {
        return $this->hasMany(VehicleOffer::class);
    }

    public function createdOrders(): HasMany
    {
        return $this->hasMany(TransportOrder::class, 'created_by');
    }

    public function invoicesCreated(): HasMany
    {
        return $this->hasMany(\App\Models\Invoice::class, 'created_by');
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    // ── Helpers ───────────────────────────────────────────
    public function isPermanentAdmin(): bool
    {
        return $this->email === self::ADMIN_EMAIL;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    public function hasPermission(string $action): bool
    {
        // Use spatie/permission if permissions are assigned
        if ($this->permissions()->count() > 0 || $this->roles()->count() > 0) {
            return $this->hasPermissionTo($action);
        }

        // Fallback: legacy role-based check
        $permissions = [
            'admin' => ['*'],
            'manager' => ['view', 'create', 'edit', 'manage_users', 'manage_orders'],
            'operator' => ['view', 'create', 'edit'],
        ];

        $rolePermissions = $permissions[$this->role] ?? [];

        return in_array('*', $rolePermissions) || in_array($action, $rolePermissions);
    }
}
