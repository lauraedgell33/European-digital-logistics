<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── E-Signature Requests ────────────────────────────────────
        Schema::create('e_signature_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('signature_id')->nullable()->unique()->comment('Internal signature ID');
            $table->string('external_envelope_id')->nullable()->index()->comment('DocuSign / Adobe envelope ID');
            $table->string('provider')->default('internal')->comment('docusign, adobe_sign, internal');
            $table->string('document_type')->default('contract')->comment('contract, cmr, pod, insurance');
            $table->string('document_name');
            $table->string('document_path')->nullable();
            $table->string('status')->default('pending')->comment('pending, sent, partially_signed, completed, declined, voided');
            $table->json('signers')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index(['provider', 'status']);
        });

        // ── Cabotage Tracking ───────────────────────────────────────
        Schema::create('cabotage_tracking', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->string('host_country', 2);
            $table->unsignedTinyInteger('operations_count')->default(0);
            $table->string('status')->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['vehicle_id', 'host_country', 'status']);
        });

        // ── Driver Activity Log (for compliance checks) ────────────
        if (!Schema::hasTable('driver_activity_log')) {
            Schema::create('driver_activity_log', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('driver_id');
                $table->string('type')->comment('driving, rest, break, other');
                $table->timestamp('start');
                $table->timestamp('end');
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['driver_id', 'start']);
            });
        }

        // ── Tachograph Records ──────────────────────────────────────
        if (!Schema::hasTable('tachograph_records')) {
            Schema::create('tachograph_records', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('vehicle_id');
                $table->string('type')->default('digital')->comment('analogue, digital, smart_gen2');
                $table->date('last_calibration')->nullable();
                $table->date('driver_card_expiry')->nullable();
                $table->json('events')->nullable();
                $table->timestamps();

                $table->index('vehicle_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tachograph_records');
        Schema::dropIfExists('driver_activity_log');
        Schema::dropIfExists('cabotage_tracking');
        Schema::dropIfExists('e_signature_requests');
    }
};
