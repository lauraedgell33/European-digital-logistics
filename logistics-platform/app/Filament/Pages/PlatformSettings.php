<?php

namespace App\Filament\Pages;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class PlatformSettings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    public static function canAccess(): bool
    {
        return auth()->user()?->role === 'admin';
    }
    protected static ?string $navigationGroup = 'Administration';
    protected static ?int $navigationSort = 11;
    protected static ?string $title = 'Platform Settings';
    protected static string $view = 'filament.pages.platform-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'app_name' => config('app.name'),
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
            'mail_mailer' => config('mail.default'),
            'mail_host' => config('mail.mailers.smtp.host'),
            'mail_from_address' => config('mail.from.address'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
            'session_driver' => config('session.driver'),
            'timezone' => config('app.timezone'),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Application Settings')
                    ->description('Core application configuration (read-only — change via .env)')
                    ->schema([
                        Forms\Components\TextInput::make('app_name')->label('App Name')->disabled(),
                        Forms\Components\TextInput::make('app_env')->label('Environment')->disabled(),
                        Forms\Components\Toggle::make('app_debug')->label('Debug Mode')->disabled(),
                        Forms\Components\TextInput::make('timezone')->label('Timezone')->disabled(),
                    ])->columns(2),

                Forms\Components\Section::make('Mail Configuration')
                    ->schema([
                        Forms\Components\TextInput::make('mail_mailer')->label('Mail Driver')->disabled(),
                        Forms\Components\TextInput::make('mail_host')->label('SMTP Host')->disabled(),
                        Forms\Components\TextInput::make('mail_from_address')->label('From Address')->disabled(),
                    ])->columns(3),

                Forms\Components\Section::make('Infrastructure')
                    ->schema([
                        Forms\Components\TextInput::make('cache_driver')->label('Cache Driver')->disabled(),
                        Forms\Components\TextInput::make('queue_driver')->label('Queue Driver')->disabled(),
                        Forms\Components\TextInput::make('session_driver')->label('Session Driver')->disabled(),
                    ])->columns(3),
            ])
            ->statePath('data');
    }

    public function clearCache(): void
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('view:clear');
        Artisan::call('route:clear');

        Notification::make()
            ->title('All caches cleared')
            ->success()
            ->send();
    }

    public function optimizePlatform(): void
    {
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');

        Notification::make()
            ->title('Platform optimized (configs, routes, views cached)')
            ->success()
            ->send();
    }
}
