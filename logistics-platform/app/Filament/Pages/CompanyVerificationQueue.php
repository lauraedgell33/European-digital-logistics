<?php

namespace App\Filament\Pages;

use App\Models\Company;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class CompanyVerificationQueue extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-shield-check';
    protected static ?string $navigationGroup = 'Platform';
    protected static ?int $navigationSort = 8;
    protected static ?string $title = 'Verification Queue';
    protected static string $view = 'filament.pages.company-verification-queue';

    public function getViewData(): array
    {
        return [
            'pendingCompanies' => Company::where('verification_status', 'pending')->with('users')->latest()->get(),
            'recentlyVerified' => Company::where('verification_status', 'verified')->latest('verified_at')->limit(5)->get(),
            'recentlyRejected' => Company::where('verification_status', 'rejected')->latest('updated_at')->limit(5)->get(),
            'stats' => [
                'pending' => Company::where('verification_status', 'pending')->count(),
                'verified' => Company::where('verification_status', 'verified')->count(),
                'rejected' => Company::where('verification_status', 'rejected')->count(),
            ],
        ];
    }

    public function approve(int $companyId): void
    {
        $company = Company::where('id', $companyId)->where('verification_status', 'pending')->firstOrFail();
        $company->update(['verification_status' => 'verified', 'verified_at' => now()]);
        Notification::make()->title('Company "' . $company->name . '" Verified')->success()->send();
    }

    public function reject(int $companyId): void
    {
        $company = Company::where('id', $companyId)->where('verification_status', 'pending')->firstOrFail();
        $company->update(['verification_status' => 'rejected']);
        Notification::make()->title('Company "' . $company->name . '" Rejected')->danger()->send();
    }
}
