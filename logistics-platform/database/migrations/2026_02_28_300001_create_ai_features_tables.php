<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // AI matching results — ML-scored freight↔vehicle matches
        Schema::create('ai_match_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('freight_offer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vehicle_offer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('ai_score', 5, 2)->default(0);
            $table->decimal('distance_score', 5, 2)->default(0);
            $table->decimal('capacity_score', 5, 2)->default(0);
            $table->decimal('timing_score', 5, 2)->default(0);
            $table->decimal('reliability_score', 5, 2)->default(0);
            $table->decimal('price_score', 5, 2)->default(0);
            $table->decimal('carbon_score', 5, 2)->default(0);
            $table->string('model_version')->default('v1.0');
            $table->json('feature_weights')->nullable();
            $table->json('explanation')->nullable();
            $table->enum('status', ['suggested', 'accepted', 'rejected', 'expired'])->default('suggested');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->index(['freight_offer_id', 'ai_score']);
            $table->index(['vehicle_offer_id', 'ai_score']);
        });

        // AI predictions — market demand, pricing forecasts
        Schema::create('ai_predictions', function (Blueprint $table) {
            $table->id();
            $table->enum('prediction_type', ['demand', 'pricing', 'capacity', 'delay', 'route_risk']);
            $table->string('origin_country', 2)->nullable();
            $table->string('origin_city')->nullable();
            $table->string('destination_country', 2)->nullable();
            $table->string('destination_city')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->date('prediction_date');
            $table->date('target_date');
            $table->decimal('predicted_value', 12, 4);
            $table->decimal('confidence', 5, 2)->default(0);
            $table->decimal('lower_bound', 12, 4)->nullable();
            $table->decimal('upper_bound', 12, 4)->nullable();
            $table->decimal('actual_value', 12, 4)->nullable();
            $table->decimal('accuracy_pct', 5, 2)->nullable();
            $table->string('model_version')->default('v1.0');
            $table->json('features_used')->nullable();
            $table->json('historical_data')->nullable();
            $table->timestamps();
            $table->index(['prediction_type', 'target_date']);
            $table->index(['origin_country', 'destination_country']);
        });

        // Dynamic pricing — real-time price adjustments
        Schema::create('dynamic_prices', function (Blueprint $table) {
            $table->id();
            $table->string('origin_country', 2);
            $table->string('origin_city', 100)->nullable();
            $table->string('destination_country', 2);
            $table->string('destination_city', 100)->nullable();
            $table->string('vehicle_type')->nullable();
            $table->decimal('base_price_per_km', 8, 4);
            $table->decimal('dynamic_price_per_km', 8, 4);
            $table->decimal('surge_multiplier', 4, 2)->default(1.00);
            $table->decimal('demand_index', 5, 2)->default(1.00);
            $table->decimal('supply_index', 5, 2)->default(1.00);
            $table->decimal('fuel_surcharge_pct', 5, 2)->default(0);
            $table->decimal('seasonal_factor', 4, 2)->default(1.00);
            $table->decimal('weather_factor', 4, 2)->default(1.00);
            $table->json('price_components')->nullable();
            $table->timestamp('valid_from');
            $table->timestamp('valid_until');
            $table->string('currency', 3)->default('EUR');
            $table->timestamps();
            $table->index(['origin_country', 'destination_country', 'valid_from'], 'dp_origin_dest_valid_idx');
        });

        // Route optimizations — AI-optimized routes
        Schema::create('route_optimizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('optimization_type')->default('single'); // single, multi_stop, fleet
            $table->json('waypoints');
            $table->json('constraints')->nullable();
            $table->json('optimized_route')->nullable();
            $table->decimal('original_distance_km', 10, 2)->nullable();
            $table->decimal('optimized_distance_km', 10, 2)->nullable();
            $table->decimal('distance_saved_km', 10, 2)->nullable();
            $table->decimal('distance_saved_pct', 5, 2)->nullable();
            $table->decimal('original_duration_hours', 8, 2)->nullable();
            $table->decimal('optimized_duration_hours', 8, 2)->nullable();
            $table->decimal('time_saved_hours', 8, 2)->nullable();
            $table->decimal('estimated_co2_saved_kg', 10, 2)->nullable();
            $table->decimal('estimated_cost_saved_eur', 10, 2)->nullable();
            $table->json('alternative_routes')->nullable();
            $table->json('warnings')->nullable();
            $table->enum('status', ['pending', 'completed', 'applied', 'failed'])->default('pending');
            $table->timestamps();
        });

        // Document scans — OCR processed transport documents
        Schema::create('document_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('document_type'); // cmr, invoice, packing_list, customs, pod, bol
            $table->string('original_filename');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->integer('file_size_bytes')->nullable();
            $table->json('extracted_data')->nullable();
            $table->json('raw_ocr_text')->nullable();
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->json('validation_errors')->nullable();
            $table->boolean('is_validated')->default(false);
            $table->enum('status', ['uploaded', 'processing', 'completed', 'failed', 'validated'])->default('uploaded');
            $table->text('processing_notes')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_scans');
        Schema::dropIfExists('route_optimizations');
        Schema::dropIfExists('dynamic_prices');
        Schema::dropIfExists('ai_predictions');
        Schema::dropIfExists('ai_match_results');
    }
};
