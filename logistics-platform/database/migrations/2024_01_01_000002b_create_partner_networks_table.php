<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_networks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('access_code')->unique()->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('max_members')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('owner_company_id');
        });

        Schema::create('network_members', function (Blueprint $table) {
            $table->foreignId('network_id')->constrained('partner_networks')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['invited', 'active', 'suspended', 'removed'])->default('invited');
            $table->enum('role', ['admin', 'member'])->default('member');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->primary(['network_id', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_members');
        Schema::dropIfExists('partner_networks');
    }
};
