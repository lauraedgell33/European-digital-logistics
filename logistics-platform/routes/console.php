<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

/*
|--------------------------------------------------------------------------
| Scheduled Jobs
|--------------------------------------------------------------------------
*/

// Send daily digest emails every weekday at 7:00 AM CET
Schedule::job(new \App\Jobs\SendDailyDigest)
    ->weekdays()
    ->timezone('Europe/Berlin')
    ->at('07:00')
    ->withoutOverlapping()
    ->onOneServer();

// Check tender deadlines every hour
Schedule::job(new \App\Jobs\ProcessTenderDeadlineReminders)
    ->hourly()
    ->withoutOverlapping()
    ->onOneServer();

// Clean up expired freight offers daily at midnight
Schedule::command('model:prune', ['--model' => [\App\Models\FreightOffer::class]])
    ->daily()
    ->at('00:00');

