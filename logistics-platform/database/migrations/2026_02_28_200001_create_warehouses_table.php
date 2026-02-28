<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Location
            $table->string('country_code', 2)->index();
            $table->string('city', 100)->index();
            $table->string('postal_code', 20)->nullable();
            $table->text('address');
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();

            // Warehouse details
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('total_area_m2', 10, 2)->nullable();
            $table->decimal('available_area_m2', 10, 2)->nullable();
            $table->decimal('ceiling_height_m', 5, 2)->nullable();

            // Types (JSON array of types)
            $table->json('storage_types')->nullable(); // covered, open, pallet, hazardous, refrigerated, silo, high_bay, block, customs, tank_farm
            $table->json('equipment')->nullable();     // forklift, loading_dock, ramp, crane, etc.
            $table->json('certifications')->nullable(); // ISO, HACCP, GDP, AEO, etc.

            // Capabilities
            $table->boolean('has_loading_dock')->default(false);
            $table->boolean('has_rail_access')->default(false);
            $table->boolean('has_temperature_control')->default(false);
            $table->decimal('min_temperature', 5, 2)->nullable();
            $table->decimal('max_temperature', 5, 2)->nullable();
            $table->boolean('has_hazardous_storage')->default(false);
            $table->string('adr_classes')->nullable(); // comma-separated ADR classes
            $table->boolean('has_customs_warehouse')->default(false);
            $table->boolean('is_bonded')->default(false);
            $table->boolean('has_cross_docking')->default(false);
            $table->boolean('has_pick_pack')->default(false);
            $table->boolean('has_security_24h')->default(false);
            $table->boolean('has_cctv')->default(false);
            $table->boolean('has_fire_protection')->default(false);

            // Capacity
            $table->integer('pallet_spaces')->nullable();
            $table->integer('available_pallet_spaces')->nullable();
            $table->integer('loading_docks_count')->nullable();

            // Pricing
            $table->decimal('price_per_m2_month', 8, 2)->nullable();
            $table->decimal('price_per_pallet_month', 8, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->enum('price_type', ['fixed', 'negotiable', 'on_request'])->default('negotiable');

            // Availability
            $table->date('available_from')->nullable();
            $table->date('available_to')->nullable();
            $table->integer('min_rental_months')->nullable();

            // Status
            $table->enum('status', ['active', 'inactive', 'fully_booked', 'maintenance'])->default('active');
            $table->boolean('is_public')->default(true);
            $table->foreignId('network_id')->nullable()->constrained('partner_networks')->nullOnDelete();

            // Media & contact
            $table->json('photos')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->string('contact_email')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_public']);
            $table->index(['country_code', 'city']);
        });

        Schema::create('warehouse_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            $table->decimal('booked_area_m2', 10, 2)->nullable();
            $table->integer('booked_pallet_spaces')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('agreed_price', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->enum('price_period', ['monthly', 'weekly', 'daily'])->default('monthly');

            $table->enum('status', ['pending', 'confirmed', 'active', 'completed', 'cancelled'])->default('pending');
            $table->text('special_requirements')->nullable();
            $table->text('notes')->nullable();

            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_bookings');
        Schema::dropIfExists('warehouses');
    }
};
