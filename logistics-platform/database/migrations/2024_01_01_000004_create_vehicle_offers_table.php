<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Vehicle details
            $table->string('vehicle_type', 50);
            $table->string('vehicle_registration', 20)->nullable();
            $table->decimal('capacity_kg', 10, 2);
            $table->decimal('capacity_m3', 10, 2)->nullable();
            $table->decimal('loading_meters', 5, 2)->nullable();
            $table->integer('pallet_spaces')->nullable();
            $table->json('equipment')->nullable();
            $table->boolean('has_adr')->default(false);
            $table->boolean('has_temperature_control')->default(false);
            $table->decimal('min_temperature', 5, 2)->nullable();
            $table->decimal('max_temperature', 5, 2)->nullable();

            // Current location
            $table->string('current_country', 2);
            $table->string('current_city', 100);
            $table->string('current_postal_code', 20)->nullable();
            $table->decimal('current_lat', 10, 8)->nullable();
            $table->decimal('current_lng', 11, 8)->nullable();

            // Destination / availability
            $table->string('destination_country', 2)->nullable();
            $table->string('destination_city', 100)->nullable();
            $table->date('available_from');
            $table->date('available_to')->nullable();

            // Pricing
            $table->decimal('price_per_km', 10, 2)->nullable();
            $table->decimal('flat_price', 10, 2)->nullable();
            $table->string('currency', 3)->default('EUR');

            // Status
            $table->enum('status', ['available', 'booked', 'in_transit', 'unavailable'])->default('available');
            $table->boolean('is_public')->default(true);
            $table->foreignId('network_id')->nullable()->constrained('partner_networks')->nullOnDelete();

            // Driver
            $table->string('driver_name', 100)->nullable();
            $table->string('driver_phone', 30)->nullable();

            $table->text('notes')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['current_country', 'current_city']);
            $table->index('available_from');
            $table->index('vehicle_type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_offers');
    }
};
