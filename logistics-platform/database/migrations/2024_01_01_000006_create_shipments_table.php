<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_order_id')->constrained()->cascadeOnDelete();
            $table->string('tracking_code')->unique();
            $table->decimal('current_lat', 10, 8)->nullable();
            $table->decimal('current_lng', 11, 8)->nullable();
            $table->string('current_location_name')->nullable();
            $table->datetime('eta')->nullable();
            $table->enum('status', [
                'waiting_pickup', 'picked_up', 'in_transit',
                'at_customs', 'out_for_delivery', 'delivered',
                'delayed', 'exception'
            ])->default('waiting_pickup');
            $table->string('tracking_device_id', 100)->nullable();
            $table->decimal('speed_kmh', 6, 2)->nullable();
            $table->decimal('heading', 5, 2)->nullable();
            $table->decimal('temperature', 5, 2)->nullable();
            $table->integer('battery_level')->nullable();
            $table->timestamp('last_update')->nullable();
            $table->json('route_waypoints')->nullable();
            $table->integer('total_distance_km')->nullable();
            $table->integer('remaining_distance_km')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('tracking_code');
            $table->index('status');
            $table->index('transport_order_id');
        });

        Schema::create('shipment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();
            $table->string('event_type', 50);
            $table->text('description')->nullable();
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->string('location_name')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['shipment_id', 'occurred_at']);
        });

        Schema::create('tracking_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();
            $table->decimal('lat', 10, 8);
            $table->decimal('lng', 11, 8);
            $table->decimal('speed_kmh', 6, 2)->nullable();
            $table->decimal('heading', 5, 2)->nullable();
            $table->decimal('temperature', 5, 2)->nullable();
            $table->timestamp('recorded_at');

            $table->index(['shipment_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_positions');
        Schema::dropIfExists('shipment_events');
        Schema::dropIfExists('shipments');
    }
};
