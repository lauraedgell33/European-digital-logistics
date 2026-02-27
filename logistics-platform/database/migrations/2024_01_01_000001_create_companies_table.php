<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('vat_number', 50)->unique();
            $table->string('registration_number', 100)->nullable();
            $table->enum('type', ['shipper', 'carrier', 'forwarder']);
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->string('country_code', 2);
            $table->text('address');
            $table->string('city', 100);
            $table->string('postal_code', 20);
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('logo')->nullable();
            $table->json('documents')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('country_code');
            $table->index('type');
            $table->index('verification_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
