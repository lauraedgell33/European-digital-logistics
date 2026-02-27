<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('reference_number')->unique()->nullable();

            // Route
            $table->string('route_origin_country', 2);
            $table->string('route_origin_city', 100);
            $table->string('route_destination_country', 2);
            $table->string('route_destination_city', 100);
            $table->json('additional_stops')->nullable();

            // Requirements
            $table->string('cargo_type', 100)->nullable();
            $table->string('vehicle_type', 50)->nullable();
            $table->decimal('estimated_weight', 10, 2)->nullable();
            $table->decimal('estimated_volume', 10, 2)->nullable();
            $table->string('frequency', 50);
            $table->integer('shipments_per_period')->nullable();

            // Dates
            $table->date('start_date');
            $table->date('end_date');
            $table->date('submission_deadline');

            // Budget
            $table->decimal('budget', 12, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->enum('budget_type', ['per_shipment', 'total', 'per_month'])->default('per_shipment');

            // Status
            $table->enum('status', ['draft', 'open', 'evaluation', 'awarded', 'closed', 'cancelled'])->default('draft');
            $table->integer('max_bidders')->nullable();
            $table->boolean('is_public')->default(true);
            $table->foreignId('network_id')->nullable()->constrained('partner_networks')->nullOnDelete();

            // Evaluation criteria
            $table->json('evaluation_criteria')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->json('required_documents')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('submission_deadline');
            $table->index('company_id');
        });

        Schema::create('tender_bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tender_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->decimal('proposed_price', 12, 2);
            $table->string('currency', 3)->default('EUR');
            $table->text('proposal');
            $table->json('documents')->nullable();
            $table->integer('transit_time_hours')->nullable();
            $table->text('additional_services')->nullable();
            $table->json('pricing_breakdown')->nullable();

            $table->enum('status', ['draft', 'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'])->default('draft');
            $table->decimal('score', 5, 2)->nullable();
            $table->text('evaluation_notes')->nullable();

            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tender_id', 'company_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tender_bids');
        Schema::dropIfExists('tenders');
    }
};
