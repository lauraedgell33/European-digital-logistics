<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Transport barometer snapshots — aggregated market data captured periodically
        Schema::create('barometer_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('origin_country', 2)->index();
            $table->string('destination_country', 2)->index();
            $table->date('snapshot_date')->index();
            $table->enum('period', ['daily', 'weekly', 'monthly'])->default('daily');

            // Freight offers data
            $table->integer('freight_offers_count')->default(0);
            $table->integer('vehicle_offers_count')->default(0);
            $table->decimal('freight_to_vehicle_ratio', 8, 4)->default(0);

            // Pricing data
            $table->decimal('avg_price_per_km', 8, 4)->nullable();
            $table->decimal('min_price_per_km', 8, 4)->nullable();
            $table->decimal('max_price_per_km', 8, 4)->nullable();
            $table->decimal('median_price_per_km', 8, 4)->nullable();

            // Volume data
            $table->decimal('avg_weight_kg', 10, 2)->nullable();
            $table->decimal('total_weight_kg', 14, 2)->nullable();
            $table->integer('completed_orders_count')->default(0);

            // Vehicle type breakdown (JSON)
            $table->json('vehicle_type_breakdown')->nullable();
            $table->json('cargo_type_breakdown')->nullable();

            // Trends
            $table->decimal('price_change_pct', 6, 2)->nullable(); // vs previous period
            $table->decimal('demand_change_pct', 6, 2)->nullable();

            $table->timestamps();

            $table->unique(['origin_country', 'destination_country', 'snapshot_date', 'period'], 'barometer_unique_snapshot');
        });

        // Truck driving bans data
        Schema::create('driving_bans', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 2)->index();
            $table->string('country_name', 100);
            $table->string('region')->nullable(); // specific region/state if applicable
            $table->string('ban_type'); // weekend, holiday, night, summer, weight, emission_zone

            $table->string('title');
            $table->text('description');

            // When the ban applies
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->json('days_of_week')->nullable(); // [0=Sun, 1=Mon, ... 6=Sat]
            $table->date('start_date')->nullable(); // for seasonal bans
            $table->date('end_date')->nullable();
            $table->boolean('is_recurring')->default(true); // yearly recurring
            $table->json('specific_dates')->nullable(); // for holidays: ["2026-01-01", "2026-04-03", ...]

            // Vehicle restrictions
            $table->decimal('min_weight_tons', 5, 2)->default(7.5);
            $table->decimal('max_height_m', 4, 2)->nullable();
            $table->decimal('max_width_m', 4, 2)->nullable();
            $table->decimal('max_length_m', 5, 2)->nullable();

            // Exemptions
            $table->json('exemptions')->nullable(); // perishable_goods, livestock, urgent_medical, etc.

            // Penalty
            $table->decimal('fine_min', 8, 2)->nullable();
            $table->decimal('fine_max', 8, 2)->nullable();
            $table->string('fine_currency', 3)->default('EUR');

            // Roads affected
            $table->json('affected_roads')->nullable(); // motorways, national, all
            $table->json('affected_zones')->nullable(); // LEZ zones if applicable

            $table->string('source_url')->nullable();
            $table->date('last_verified')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        // Carbon footprint tracking per transport
        Schema::create('carbon_footprints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            // Emissions
            $table->decimal('co2_kg', 10, 2); // total CO2 in kg
            $table->decimal('co2_per_km', 6, 4)->nullable();
            $table->decimal('co2_per_ton_km', 6, 4)->nullable();

            // Inputs for calculation
            $table->decimal('distance_km', 8, 2);
            $table->decimal('weight_kg', 10, 2)->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('fuel_type')->default('diesel'); // diesel, lng, cng, electric, hybrid, hvo
            $table->string('emission_standard')->nullable(); // euro_3, euro_4, euro_5, euro_6
            $table->decimal('load_factor_pct', 5, 2)->nullable(); // 0-100

            // Comparison
            $table->decimal('industry_avg_co2_kg', 10, 2)->nullable();
            $table->decimal('savings_vs_avg_pct', 6, 2)->nullable();

            // Offsets
            $table->decimal('offset_purchased_kg', 10, 2)->default(0);
            $table->decimal('offset_cost', 8, 2)->default(0);
            $table->string('offset_currency', 3)->default('EUR');
            $table->boolean('is_carbon_neutral')->default(false);

            $table->timestamps();
        });

        // Transport lexicon articles
        Schema::create('lexicon_articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('excerpt');
            $table->longText('content'); // Markdown
            $table->string('category'); // general, legal, customs, hazardous, intermodal, technology, sustainability
            $table->json('tags')->nullable();
            $table->string('language', 5)->default('en');
            $table->json('translations')->nullable(); // { "de": "...", "fr": "..." }
            $table->integer('view_count')->default(0);
            $table->boolean('is_published')->default(true);
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['category', 'language']);
            $table->index('is_published');
        });

        // GPS sharing tokens for temporary tracking access
        Schema::create('tracking_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('share_token', 64)->unique();
            $table->string('recipient_email')->nullable();
            $table->string('recipient_name')->nullable();
            $table->timestamp('expires_at');
            $table->boolean('is_active')->default(true);
            $table->json('permissions')->nullable(); // { "show_eta": true, "show_temperature": false }
            $table->integer('view_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();

            $table->index(['share_token', 'is_active']);
        });

        // Freight price insights — historical price data per route
        Schema::create('price_insights', function (Blueprint $table) {
            $table->id();
            $table->string('origin_country', 2);
            $table->string('origin_city', 100)->nullable();
            $table->string('destination_country', 2);
            $table->string('destination_city', 100)->nullable();
            $table->string('vehicle_type')->nullable();
            $table->date('period_date'); // aggregation date
            $table->enum('period_type', ['daily', 'weekly', 'monthly'])->default('weekly');

            $table->integer('sample_count')->default(0);
            $table->decimal('avg_price', 10, 2)->nullable();
            $table->decimal('min_price', 10, 2)->nullable();
            $table->decimal('max_price', 10, 2)->nullable();
            $table->decimal('median_price', 10, 2)->nullable();
            $table->decimal('avg_price_per_km', 8, 4)->nullable();
            $table->decimal('avg_distance_km', 8, 2)->nullable();
            $table->string('currency', 3)->default('EUR');

            $table->timestamps();

            $table->unique(['origin_country', 'origin_city', 'destination_country', 'destination_city', 'vehicle_type', 'period_date', 'period_type'], 'price_insights_unique');
        });

        // Insurance quotes for transport orders
        Schema::create('insurance_quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();

            $table->string('provider_name');
            $table->decimal('cargo_value', 12, 2);
            $table->string('cargo_value_currency', 3)->default('EUR');
            $table->decimal('premium_amount', 10, 2);
            $table->string('premium_currency', 3)->default('EUR');
            $table->string('coverage_type'); // basic, all_risk, extended

            $table->json('coverage_details')->nullable();
            $table->json('exclusions')->nullable();

            $table->decimal('deductible', 10, 2)->default(0);
            $table->string('policy_number')->nullable();

            $table->enum('status', ['quoted', 'accepted', 'active', 'expired', 'claimed', 'cancelled'])->default('quoted');
            $table->timestamp('valid_until')->nullable();
            $table->timestamp('accepted_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        // Escrow payments
        Schema::create('escrow_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payer_company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('payee_company_id')->constrained('companies')->cascadeOnDelete();

            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('EUR');

            $table->enum('status', [
                'pending',      // awaiting deposit
                'funded',       // payer deposited
                'released',     // paid to payee
                'disputed',     // dispute opened
                'refunded',     // returned to payer
                'cancelled'
            ])->default('pending');

            $table->string('payment_reference')->unique()->nullable();
            $table->string('payment_method')->nullable(); // bank_transfer, card, wallet

            $table->text('release_conditions')->nullable();
            $table->timestamp('funded_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamp('disputed_at')->nullable();
            $table->text('dispute_reason')->nullable();
            $table->text('resolution_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        // Debt collection requests
        Schema::create('debt_collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creditor_company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('debtor_company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            $table->string('debtor_name');
            $table->string('debtor_email')->nullable();
            $table->string('debtor_phone')->nullable();
            $table->string('debtor_country', 2)->nullable();

            $table->string('invoice_number');
            $table->date('invoice_date');
            $table->date('due_date');
            $table->decimal('original_amount', 12, 2);
            $table->decimal('outstanding_amount', 12, 2);
            $table->string('currency', 3)->default('EUR');

            $table->integer('reminder_count')->default(0);
            $table->date('last_reminder_date')->nullable();

            $table->enum('status', [
                'submitted',
                'under_review',
                'in_progress',
                'payment_received',
                'partially_paid',
                'resolved',
                'failed',
                'cancelled'
            ])->default('submitted');

            $table->decimal('collected_amount', 12, 2)->default(0);
            $table->decimal('collection_fee', 10, 2)->default(0);

            $table->json('documents')->nullable(); // uploaded evidence
            $table->text('notes')->nullable();
            $table->text('resolution_notes')->nullable();

            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debt_collections');
        Schema::dropIfExists('escrow_payments');
        Schema::dropIfExists('insurance_quotes');
        Schema::dropIfExists('price_insights');
        Schema::dropIfExists('tracking_shares');
        Schema::dropIfExists('lexicon_articles');
        Schema::dropIfExists('carbon_footprints');
        Schema::dropIfExists('driving_bans');
        Schema::dropIfExists('barometer_snapshots');
    }
};
