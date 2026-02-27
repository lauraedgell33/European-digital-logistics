<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transport_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('freight_offer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vehicle_offer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('shipper_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('carrier_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            // Pickup details
            $table->string('pickup_country', 2);
            $table->string('pickup_city', 100);
            $table->text('pickup_address');
            $table->string('pickup_postal_code', 20);
            $table->string('pickup_contact_name', 100)->nullable();
            $table->string('pickup_contact_phone', 30)->nullable();
            $table->datetime('pickup_date');
            $table->time('pickup_time_from')->nullable();
            $table->time('pickup_time_to')->nullable();

            // Delivery details
            $table->string('delivery_country', 2);
            $table->string('delivery_city', 100);
            $table->text('delivery_address');
            $table->string('delivery_postal_code', 20);
            $table->string('delivery_contact_name', 100)->nullable();
            $table->string('delivery_contact_phone', 30)->nullable();
            $table->datetime('delivery_date');
            $table->time('delivery_time_from')->nullable();
            $table->time('delivery_time_to')->nullable();

            // Cargo details
            $table->string('cargo_type', 100);
            $table->text('cargo_description')->nullable();
            $table->decimal('weight', 10, 2);
            $table->decimal('volume', 10, 2)->nullable();
            $table->integer('pallet_count')->nullable();

            // Pricing
            $table->decimal('total_price', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->enum('payment_terms', ['prepaid', '30_days', '60_days', '90_days'])->default('30_days');
            $table->enum('payment_status', ['pending', 'invoiced', 'paid', 'overdue'])->default('pending');

            // Status
            $table->enum('status', [
                'draft', 'pending', 'accepted', 'rejected',
                'pickup_scheduled', 'picked_up', 'in_transit',
                'delivered', 'completed', 'cancelled', 'disputed'
            ])->default('draft');

            // Documents
            $table->json('documents')->nullable();
            $table->text('special_instructions')->nullable();

            // Timestamps
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('order_number');
            $table->index('status');
            $table->index('shipper_id');
            $table->index('carrier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transport_orders');
    }
};
