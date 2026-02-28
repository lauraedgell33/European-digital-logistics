<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Multi-modal transport bookings
        Schema::create('multimodal_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('booking_reference')->unique();
            $table->enum('transport_mode', ['rail', 'sea', 'air', 'barge']);
            $table->string('carrier_name')->nullable();
            $table->string('service_type')->nullable(); // FCL, LCL, FTL, groupage, express, standard, charter

            // Route
            $table->string('origin_terminal');
            $table->string('origin_country', 2);
            $table->string('origin_city')->nullable();
            $table->string('destination_terminal');
            $table->string('destination_country', 2);
            $table->string('destination_city')->nullable();

            // Schedule
            $table->datetime('departure_date');
            $table->datetime('estimated_arrival');
            $table->datetime('actual_departure')->nullable();
            $table->datetime('actual_arrival')->nullable();
            $table->integer('transit_time_hours')->nullable();

            // Cargo
            $table->string('cargo_type')->nullable();
            $table->decimal('weight_kg', 10, 2)->nullable();
            $table->decimal('volume_m3', 8, 2)->nullable();
            $table->integer('container_count')->nullable();
            $table->string('container_type')->nullable(); // 20ft, 40ft, 40ft_hc, reefer
            $table->string('wagon_type')->nullable();
            $table->boolean('is_hazardous')->default(false);
            $table->boolean('requires_temperature_control')->default(false);

            // Pricing
            $table->decimal('price', 12, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->json('price_breakdown')->nullable();

            // Status
            $table->enum('status', ['quoted', 'booked', 'confirmed', 'loading', 'in_transit', 'arrived', 'delivered', 'cancelled'])->default('quoted');
            $table->json('tracking_data')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['company_id', 'transport_mode', 'status']);
        });

        // Intermodal transport plans — combining road + rail + sea + air
        Schema::create('intermodal_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('plan_reference')->unique();

            // Origin/Destination
            $table->string('origin_address');
            $table->string('origin_country', 2);
            $table->string('origin_city');
            $table->decimal('origin_lat', 10, 8)->nullable();
            $table->decimal('origin_lng', 11, 8)->nullable();
            $table->string('destination_address');
            $table->string('destination_country', 2);
            $table->string('destination_city');
            $table->decimal('destination_lat', 10, 8)->nullable();
            $table->decimal('destination_lng', 11, 8)->nullable();

            // Plan details
            $table->json('legs'); // Array of {mode, origin, destination, carrier, departure, arrival, cost}
            $table->integer('total_legs')->default(1);
            $table->decimal('total_distance_km', 10, 2)->nullable();
            $table->decimal('total_duration_hours', 8, 2)->nullable();
            $table->decimal('total_cost', 12, 2)->nullable();
            $table->decimal('total_co2_kg', 10, 2)->nullable();
            $table->string('currency', 3)->default('EUR');

            // Cargo
            $table->decimal('weight_kg', 10, 2)->nullable();
            $table->decimal('volume_m3', 8, 2)->nullable();
            $table->string('cargo_type')->nullable();

            // Comparison
            $table->decimal('road_only_cost', 12, 2)->nullable();
            $table->decimal('road_only_co2_kg', 10, 2)->nullable();
            $table->decimal('cost_savings_pct', 5, 2)->nullable();
            $table->decimal('co2_savings_pct', 5, 2)->nullable();

            $table->json('alternative_plans')->nullable();
            $table->enum('status', ['draft', 'optimizing', 'ready', 'booked', 'in_progress', 'completed', 'cancelled'])->default('draft');
            $table->enum('optimization_priority', ['cost', 'speed', 'co2', 'balanced'])->default('balanced');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intermodal_plans');
        Schema::dropIfExists('multimodal_bookings');
    }
};
