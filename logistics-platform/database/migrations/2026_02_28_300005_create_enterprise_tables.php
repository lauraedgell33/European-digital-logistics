<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // White-label configurations
        Schema::create('white_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('subdomain')->unique();
            $table->string('custom_domain')->nullable()->unique();
            $table->string('brand_name');
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->json('brand_colors')->nullable(); // {primary, secondary, accent}
            $table->json('features_enabled')->nullable();
            $table->json('custom_translations')->nullable();
            $table->string('support_email')->nullable();
            $table->string('support_phone')->nullable();
            $table->text('terms_of_service')->nullable();
            $table->text('privacy_policy')->nullable();
            $table->boolean('is_active')->default(true);
            $table->enum('plan', ['starter', 'professional', 'enterprise'])->default('starter');
            $table->decimal('monthly_fee', 10, 2)->default(0);
            $table->string('currency', 3)->default('EUR');
            $table->timestamps();
        });

        // API keys for marketplace
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('key_hash')->unique();
            $table->string('key_prefix', 8); // First 8 chars for identification
            $table->json('permissions')->nullable();
            $table->json('rate_limits')->nullable(); // {requests_per_minute, requests_per_day}
            $table->json('allowed_ips')->nullable();
            $table->json('allowed_origins')->nullable();
            $table->integer('requests_today')->default(0);
            $table->integer('requests_total')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['key_prefix', 'is_active']);
        });

        // API usage logs
        Schema::create('api_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_key_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('endpoint');
            $table->string('method', 10);
            $table->integer('response_code');
            $table->integer('response_time_ms');
            $table->integer('request_size_bytes')->nullable();
            $table->integer('response_size_bytes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            $table->index(['api_key_id', 'created_at']);
            $table->index(['company_id', 'created_at']);
        });

        // ERP/TMS integrations
        Schema::create('erp_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('integration_type'); // sap, oracle, microsoft_dynamics, custom_tms
            $table->string('name');
            $table->json('connection_config')->nullable();
            $table->json('field_mappings')->nullable();
            $table->json('sync_settings')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamp('last_sync_at')->nullable();
            $table->integer('sync_success_count')->default(0);
            $table->integer('sync_error_count')->default(0);
            $table->json('last_sync_errors')->nullable();
            $table->enum('sync_direction', ['inbound', 'outbound', 'bidirectional'])->default('bidirectional');
            $table->string('webhook_url')->nullable();
            $table->string('webhook_secret')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'integration_type']);
        });

        // EDI messages
        Schema::create('edi_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('erp_integration_id')->nullable()->constrained()->nullOnDelete();
            $table->string('message_type'); // IFTMIN, IFTSTA, INVOIC, DESADV, ORDERS
            $table->string('message_reference')->unique();
            $table->enum('direction', ['inbound', 'outbound']);
            $table->string('format'); // EDIFACT, XML, JSON, CSV
            $table->longText('raw_content');
            $table->json('parsed_content')->nullable();
            $table->json('validation_results')->nullable();
            $table->boolean('is_valid')->default(false);
            $table->enum('status', ['received', 'validated', 'processed', 'failed', 'acknowledged'])->default('received');
            $table->text('error_message')->nullable();
            $table->foreignId('transport_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('invoice_id')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'message_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edi_messages');
        Schema::dropIfExists('erp_integrations');
        Schema::dropIfExists('api_usage_logs');
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('white_labels');
    }
};
