<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'user_id' => User::factory(),
            'body' => fake()->paragraph(rand(1, 3)),
            'type' => 'text',
            'metadata' => null,
        ];
    }

    public function text(): static
    {
        return $this->state(fn () => ['type' => 'text']);
    }

    public function file(): static
    {
        return $this->state(fn () => [
            'type' => 'file',
            'body' => 'Shared a file',
            'metadata' => [
                'file_name' => fake()->word() . '.pdf',
                'file_size' => fake()->numberBetween(10000, 5000000),
                'mime_type' => 'application/pdf',
                'file_url' => '/storage/messages/' . fake()->uuid() . '.pdf',
            ],
        ]);
    }

    public function system(): static
    {
        return $this->state(fn () => [
            'type' => 'system',
            'body' => fake()->randomElement([
                'Conversation started',
                'Order status updated to in_transit',
                'New participant added to conversation',
            ]),
        ]);
    }

    public function short(): static
    {
        return $this->state(fn () => [
            'body' => fake()->sentence(),
        ]);
    }
}
