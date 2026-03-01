<?php

namespace App\Jobs;

use App\Services\AiMatchingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BatchAiMatchingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 300;

    public function __construct(
        private readonly int $hoursBack = 6,
        private readonly int $limitPerFreight = 5,
    ) {}

    public function handle(AiMatchingService $service): void
    {
        $results = $service->batchMatch($this->hoursBack, $this->limitPerFreight);
        Log::info('BatchAiMatchingJob completed', ['matched_freights' => count($results)]);
    }
}
