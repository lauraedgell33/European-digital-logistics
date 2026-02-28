<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        parent::boot();

        // Horizon notification email
        Horizon::routeMailNotificationsTo(env('HORIZON_NOTIFICATION_EMAIL', 'admin@logistics.eu'));

        // Night mode for dashboard
        // Horizon::night();
    }

    /**
     * Register the Horizon gate.
     * Determines who can access Horizon in non-local environments.
     */
    protected function gate(): void
    {
        Gate::define('viewHorizon', function ($user) {
            return $user->role === 'admin';
        });
    }
}
