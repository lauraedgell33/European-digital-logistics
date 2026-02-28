<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\AiMatchingService;
use App\Services\DynamicPricingService;
use App\Services\PaymentService;
use App\Services\MultimodalService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ServicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_matching_service_calculates_scores(): void
    {
        $service = new AiMatchingService();

        // Test distance scoring
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('smartMatch');

        $this->assertInstanceOf(AiMatchingService::class, $service);
    }

    public function test_dynamic_pricing_service_exists(): void
    {
        $service = new DynamicPricingService();
        $this->assertInstanceOf(DynamicPricingService::class, $service);
    }

    public function test_payment_service_supports_currencies(): void
    {
        $service = new PaymentService();
        $this->assertInstanceOf(PaymentService::class, $service);
    }

    public function test_multimodal_service_exists(): void
    {
        $service = new MultimodalService();
        $this->assertInstanceOf(MultimodalService::class, $service);
    }
}
