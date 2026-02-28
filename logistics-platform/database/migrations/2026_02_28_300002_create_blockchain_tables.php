<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // eCMR digital consignment notes
        Schema::create('ecmr_documents', function (Blueprint $table) {
            $table->id();
            $table->string('ecmr_number')->unique();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('sender_company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('carrier_company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('consignee_company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            // Sender
            $table->string('sender_name');
            $table->text('sender_address');
            $table->string('sender_country', 2);

            // Carrier
            $table->string('carrier_name')->nullable();
            $table->text('carrier_address')->nullable();
            $table->string('carrier_country', 2)->nullable();

            // Consignee
            $table->string('consignee_name')->nullable();
            $table->text('consignee_address')->nullable();
            $table->string('consignee_country', 2)->nullable();

            // Pickup / Delivery
            $table->text('place_of_taking_over');
            $table->date('date_of_taking_over')->nullable();
            $table->text('place_of_delivery');
            $table->date('date_of_delivery')->nullable();

            // Cargo
            $table->json('goods_description');
            $table->decimal('gross_weight_kg', 10, 2)->nullable();
            $table->integer('number_of_packages')->nullable();
            $table->string('packaging_method')->nullable();
            $table->text('special_instructions')->nullable();
            $table->boolean('is_hazardous')->default(false);
            $table->string('adr_class')->nullable();

            // Signatures (digital)
            $table->string('sender_signature_hash')->nullable();
            $table->timestamp('sender_signed_at')->nullable();
            $table->string('carrier_signature_hash')->nullable();
            $table->timestamp('carrier_signed_at')->nullable();
            $table->string('consignee_signature_hash')->nullable();
            $table->timestamp('consignee_signed_at')->nullable();

            // Blockchain
            $table->string('blockchain_tx_hash')->nullable();
            $table->string('blockchain_network')->nullable();
            $table->json('blockchain_metadata')->nullable();
            $table->string('ipfs_hash')->nullable();

            // Status
            $table->enum('status', ['draft', 'issued', 'in_transit', 'delivered', 'completed', 'disputed', 'cancelled'])->default('draft');
            $table->json('status_history')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['sender_company_id', 'status']);
            $table->index(['carrier_company_id', 'status']);
        });

        // Smart contracts for automated logistics agreements
        Schema::create('smart_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_hash')->unique();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('party_a_company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('party_b_company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->string('contract_type'); // payment_release, insurance_trigger, penalty, milestone
            $table->json('conditions');
            $table->json('actions');
            $table->decimal('value', 12, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->boolean('condition_met')->default(false);
            $table->boolean('action_executed')->default(false);
            $table->timestamp('triggered_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->json('execution_log')->nullable();
            $table->enum('status', ['pending', 'active', 'triggered', 'executed', 'cancelled', 'expired'])->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->index(['party_a_company_id', 'status']);
        });

        // Decentralized identity verification
        Schema::create('digital_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('did_identifier')->unique(); // Decentralized Identifier
            $table->string('verification_level'); // basic, enhanced, certified
            $table->json('credentials')->nullable();
            $table->json('attestations')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->string('verified_by')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('verification_documents')->nullable();
            $table->string('public_key_hash')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'is_verified']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digital_identities');
        Schema::dropIfExists('smart_contracts');
        Schema::dropIfExists('ecmr_documents');
    }
};
