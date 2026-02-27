<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('freight_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Origin
            $table->string('origin_country', 2);
            $table->string('origin_city', 100);
            $table->string('origin_postal_code', 20);
            $table->decimal('origin_lat', 10, 8)->nullable();
            $table->decimal('origin_lng', 11, 8)->nullable();
            $table->text('origin_address')->nullable();

            // Destination
            $table->string('destination_country', 2);
            $table->string('destination_city', 100);
            $table->string('destination_postal_code', 20);
            $table->decimal('destination_lat', 10, 8)->nullable();
            $table->decimal('destination_lng', 11, 8)->nullable();
            $table->text('destination_address')->nullable();

            // Cargo details
            $table->string('cargo_type', 100);
            $table->text('cargo_description')->nullable();
            $table->decimal('weight', 10, 2)->comment('Weight in KG');
            $table->decimal('volume', 10, 2)->nullable()->comment('Volume in m³');
            $table->decimal('length', 8, 2)->nullable()->comment('Length in meters');
            $table->decimal('width', 8, 2)->nullable()->comment('Width in meters');
            $table->decimal('height', 8, 2)->nullable()->comment('Height in meters');
            $table->integer('loading_meters')->nullable();
            $table->integer('pallet_count')->nullable();
            $table->boolean('is_hazardous')->default(false);
            $table->string('adr_class', 10)->nullable();
            $table->boolean('requires_temperature_control')->default(false);
            $table->decimal('min_temperature', 5, 2)->nullable();
            $table->decimal('max_temperature', 5, 2)->nullable();

            // Dates
            $table->date('loading_date');
            $table->time('loading_time_from')->nullable();
            $table->time('loading_time_to')->nullable();
            $table->date('unloading_date');
            $table->time('unloading_time_from')->nullable();
            $table->time('unloading_time_to')->nullable();

            // Vehicle requirements
            $table->string('vehicle_type', 50);
            $table->json('required_equipment')->nullable();

            // Pricing
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->enum('price_type', ['fixed', 'per_km', 'negotiable'])->default('fixed');

            // Status & visibility
            $table->enum('status', ['active', 'matched', 'in_transit', 'completed', 'cancelled', 'expired'])->default('active');
            $table->boolean('is_public')->default(true);
            $table->foreignId('network_id')->nullable()->constrained('partner_networks')->nullOnDelete();

            // Distance & route
            $table->integer('distance_km')->nullable();
            $table->integer('estimated_duration_hours')->nullable();

            $table->text('notes')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['origin_country', 'origin_city']);
            $table->index(['destination_country', 'destination_city']);
            $table->index('loading_date');
            $table->index('status');
            $table->index('vehicle_type');
            $table->index('is_public');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('freight_offers');
    }
};
