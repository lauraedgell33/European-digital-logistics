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
use Filament\Support\Enums\MaxWidth;
use Filament\View\PanelsRenderHook;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\HtmlString;
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
                // Geist-matched color palette using HSL values from frontend
                'primary' => Color::hex('#0070f3'),   // Geist Blue 700
                'danger' => Color::hex('#e5484d'),     // Geist Red 700
                'gray' => Color::Zinc,
                'info' => Color::hex('#0070f3'),       // Geist Blue
                'success' => Color::hex('#45a557'),    // Geist Green 700
                'warning' => Color::hex('#f5a623'),    // Geist Amber 700
            ])
            ->font('Inter')
            ->brandName('LogiMarket')
            ->brandLogo(fn () => view('filament.brand-logo'))
            ->darkModeBrandLogo(fn () => view('filament.brand-logo-dark'))
            ->favicon(asset('favicon.ico'))
            ->darkMode(true)
            ->sidebarCollapsibleOnDesktop()
            ->sidebarFullyCollapsibleOnDesktop()
            ->breadcrumbs()
            ->maxContentWidth(MaxWidth::Full)
            ->spa()
            ->globalSearchKeyBindings(['command+k', 'ctrl+k'])
            ->globalSearchFieldKeyBindingSuffix()
            ->databaseNotifications()
            ->databaseNotificationsPolling('30s')
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn (): HtmlString => new HtmlString('
                    <link rel="preconnect" href="https://rsms.me/" crossorigin>
                    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
                    <link rel="stylesheet" href="' . asset('css/filament-geist-theme.css') . '?v=' . time() . '">
                    <link rel="stylesheet" href="' . asset('css/admin-animations.css') . '?v=' . time() . '">
                ')
            )
            ->renderHook(
                PanelsRenderHook::BODY_END,
                fn (): HtmlString => new HtmlString('
                    <script>
                        // Auto-detect and persist dark mode
                        if (localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                            document.documentElement.classList.add("dark");
                        }
                    </script>
                ')
            )
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
