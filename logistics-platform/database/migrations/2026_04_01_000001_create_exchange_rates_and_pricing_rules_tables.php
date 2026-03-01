<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_rate_history', function (Blueprint $table) {
            $table->id();
            $table->string('from_currency', 3)->index();
            $table->string('to_currency', 3)->index();
            $table->date('date')->index();
            $table->decimal('rate', 16, 6);
            $table->timestamp('updated_at')->nullable();

            $table->unique(['from_currency', 'to_currency', 'date'], 'exchange_rate_unique');
        });

        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('rule_type');          // base_rate, surcharge, discount, seasonal, volume
            $table->string('origin_country', 3)->nullable();
            $table->string('destination_country', 3)->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('cargo_type')->nullable();
            $table->decimal('value', 12, 4);       // rate or multiplier
            $table->string('value_type');            // per_km, flat, percentage, multiplier
            $table->json('conditions')->nullable();  // JSON conditions for rule matching
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'priority']);
            $table->index(['origin_country', 'destination_country']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
        Schema::dropIfExists('exchange_rate_history');
    }
};
