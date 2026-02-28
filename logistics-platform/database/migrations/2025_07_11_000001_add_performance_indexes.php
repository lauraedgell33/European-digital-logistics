<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Transport Orders
        if (Schema::hasTable('transport_orders')) {
            Schema::table('transport_orders', function (Blueprint $table) {
                if (!$this->hasIndex('transport_orders', 'transport_orders_status_index')) {
                    $table->index('status');
                }
                if (!$this->hasIndex('transport_orders', 'transport_orders_shipper_id_index')) {
                    $table->index('shipper_id');
                }
                if (!$this->hasIndex('transport_orders', 'transport_orders_carrier_id_index')) {
                    $table->index('carrier_id');
                }
                if (!$this->hasIndex('transport_orders', 'transport_orders_created_at_index')) {
                    $table->index('created_at');
                }
            });
        }

        // Invoices
        if (Schema::hasTable('invoices')) {
            Schema::table('invoices', function (Blueprint $table) {
                if (!$this->hasIndex('invoices', 'invoices_status_index')) {
                    $table->index('status');
                }
                if (!$this->hasIndex('invoices', 'invoices_company_id_index')) {
                    $table->index('company_id');
                }
                if (!$this->hasIndex('invoices', 'invoices_due_date_index')) {
                    $table->index('due_date');
                }
            });
        }

        // Shipments
        if (Schema::hasTable('shipments')) {
            Schema::table('shipments', function (Blueprint $table) {
                if (!$this->hasIndex('shipments', 'shipments_status_index')) {
                    $table->index('status');
                }
            });
        }

        // Freight Offers
        if (Schema::hasTable('freight_offers')) {
            Schema::table('freight_offers', function (Blueprint $table) {
                if (!$this->hasIndex('freight_offers', 'freight_offers_status_index')) {
                    $table->index('status');
                }
                if (!$this->hasIndex('freight_offers', 'freight_offers_company_id_index')) {
                    $table->index('company_id');
                }
            });
        }

        // Companies
        if (Schema::hasTable('companies')) {
            Schema::table('companies', function (Blueprint $table) {
                if (!$this->hasIndex('companies', 'companies_verification_status_index')) {
                    $table->index('verification_status');
                }
                if (!$this->hasIndex('companies', 'companies_is_active_index')) {
                    $table->index('is_active');
                }
            });
        }

        // Tracking Positions
        if (Schema::hasTable('tracking_positions')) {
            Schema::table('tracking_positions', function (Blueprint $table) {
                if (!$this->hasIndex('tracking_positions', 'tracking_positions_shipment_id_index')) {
                    $table->index('shipment_id');
                }
                if (!$this->hasIndex('tracking_positions', 'tracking_positions_recorded_at_index')) {
                    $table->index('recorded_at');
                }
            });
        }

        // Activity log
        if (Schema::hasTable('activity_log')) {
            Schema::table('activity_log', function (Blueprint $table) {
                if (!$this->hasIndex('activity_log', 'activity_log_subject_type_subject_id_index')) {
                    $table->index(['subject_type', 'subject_id']);
                }
            });
        }
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        $indexes = Schema::getIndexes($table);
        foreach ($indexes as $index) {
            if ($index['name'] === $indexName) return true;
        }
        return false;
    }

    public function down(): void
    {
        // Indexes will be dropped with tables if needed
    }
};
