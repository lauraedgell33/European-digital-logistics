<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => Color::Blue,
                'danger' => Color::Red,
                'gray' => Color::Zinc,
                'info' => Color::Sky,
                'success' => Color::Green,
                'warning' => Color::Amber,
            ])
            ->brandName('LogiMarket Admin')
            ->favicon(asset('favicon.ico'))
            ->darkMode(true)
            ->sidebarCollapsibleOnDesktop()
            ->sidebarFullyCollapsibleOnDesktop()
            ->breadcrumbs()
            ->maxContentWidth('full')
            ->spa()
            ->globalSearchKeyBindings(['command+k', 'ctrl+k'])
            ->globalSearchFieldKeyBindingSuffix()
            ->databaseNotifications()
            ->databaseNotificationsPolling('30s')
            ->navigationGroups([
                NavigationGroup::make('Dashboard')
                    ->icon('heroicon-o-home')
                    ->collapsed(false),
                NavigationGroup::make('Operations')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->collapsed(false),
                NavigationGroup::make('Marketplace')
                    ->icon('heroicon-o-shopping-cart')
                    ->collapsed(false),
                NavigationGroup::make('Tracking & Logistics')
                    ->icon('heroicon-o-map')
                    ->collapsed(true),
                NavigationGroup::make('Finance')
                    ->icon('heroicon-o-banknotes')
                    ->collapsed(true),
                NavigationGroup::make('Documents')
                    ->icon('heroicon-o-document-text')
                    ->collapsed(true),
                NavigationGroup::make('AI & Analytics')
                    ->icon('heroicon-o-cpu-chip')
                    ->collapsed(true),
                NavigationGroup::make('Platform')
                    ->icon('heroicon-o-globe-alt')
                    ->collapsed(true),
                NavigationGroup::make('Administration')
                    ->icon('heroicon-o-shield-check')
                    ->collapsed(true),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                Widgets\AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
