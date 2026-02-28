<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Invoices
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('customer_name');
            $table->text('customer_address')->nullable();
            $table->string('customer_vat_number')->nullable();
            $table->string('customer_country', 2)->nullable();
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('EUR');
            $table->json('line_items');
            $table->text('notes')->nullable();
            $table->text('payment_terms')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('bank_iban')->nullable();
            $table->string('bank_bic')->nullable();
            $table->enum('status', ['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded'])->default('draft');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['company_id', 'status']);
            $table->index(['customer_company_id', 'status']);
        });

        // Invoice factoring — early payment service
        Schema::create('invoice_factoring', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->decimal('invoice_amount', 12, 2);
            $table->decimal('advance_rate_pct', 5, 2)->default(85.00);
            $table->decimal('advance_amount', 12, 2);
            $table->decimal('fee_pct', 5, 2)->default(2.50);
            $table->decimal('fee_amount', 12, 2);
            $table->decimal('net_amount', 12, 2);
            $table->string('currency', 3)->default('EUR');
            $table->enum('status', ['requested', 'under_review', 'approved', 'funded', 'collected', 'defaulted', 'cancelled'])->default('requested');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('funded_at')->nullable();
            $table->timestamp('collected_at')->nullable();
            $table->integer('days_to_maturity')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'status']);
        });

        // Payment transactions (Stripe/SEPA)
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('escrow_payment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('transaction_reference')->unique();
            $table->string('payment_provider'); // stripe, sepa, bank_transfer, paypal
            $table->string('provider_transaction_id')->nullable();
            $table->string('payment_method_type')->nullable(); // card, sepa_debit, bank_transfer
            $table->decimal('amount', 12, 2);
            $table->decimal('fee_amount', 10, 2)->default(0);
            $table->decimal('net_amount', 12, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('source_currency', 3)->nullable();
            $table->decimal('exchange_rate', 10, 6)->nullable();
            $table->enum('type', ['payment', 'refund', 'payout', 'transfer', 'chargeback']);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->json('metadata')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'status']);
            $table->index('provider_transaction_id');
        });

        // VAT records for EU cross-border compliance
        Schema::create('vat_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('origin_country', 2);
            $table->string('destination_country', 2);
            $table->decimal('taxable_amount', 12, 2);
            $table->decimal('vat_rate', 5, 2);
            $table->decimal('vat_amount', 12, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('vat_number_seller')->nullable();
            $table->string('vat_number_buyer')->nullable();
            $table->boolean('is_reverse_charge')->default(false);
            $table->boolean('is_intra_community')->default(false);
            $table->string('vat_scheme')->default('standard'); // standard, margin, reverse_charge, exempt
            $table->date('tax_period');
            $table->enum('status', ['draft', 'filed', 'paid', 'adjusted'])->default('draft');
            $table->json('supporting_documents')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'tax_period']);
            $table->index(['origin_country', 'destination_country']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vat_records');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('invoice_factoring');
        Schema::dropIfExists('invoices');
    }
};
