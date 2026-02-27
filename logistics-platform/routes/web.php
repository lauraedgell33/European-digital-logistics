<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel Logistics Platform' => app()->version()];
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
    ]);
});
