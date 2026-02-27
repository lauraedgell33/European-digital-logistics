<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'subject' => fake()->randomElement([
                'Transport inquiry',
                'Price negotiation',
                'Route discussion',
                'Order follow-up',
                'Freight availability',
                'Vehicle capacity check',
                null,
            ]),
            'type' => fake()->randomElement(['direct', 'freight_inquiry', 'order_discussion']),
            'reference_type' => null,
            'reference_id' => null,
            'created_by' => User::factory(),
        ];
    }

    public function direct(): static
    {
        return $this->state(fn () => [
            'type' => 'direct',
            'subject' => null,
        ]);
    }

    public function freightInquiry(): static
    {
        return $this->state(fn () => [
            'type' => 'freight_inquiry',
            'reference_type' => 'App\\Models\\FreightOffer',
            'subject' => 'Freight availability inquiry',
        ]);
    }

    public function orderDiscussion(): static
    {
        return $this->state(fn () => [
            'type' => 'order_discussion',
            'reference_type' => 'App\\Models\\TransportOrder',
            'subject' => 'Order details discussion',
        ]);
    }

    public function tenderDiscussion(): static
    {
        return $this->state(fn () => [
            'type' => 'tender_discussion',
            'reference_type' => 'App\\Models\\Tender',
            'subject' => 'Tender submission question',
        ]);
    }
}
