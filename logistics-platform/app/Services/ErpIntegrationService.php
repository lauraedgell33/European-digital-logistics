<?php

namespace App\Services;

use App\Models\ErpIntegration;
use App\Models\EdiMessage;
use App\Models\TransportOrder;
use App\Models\FreightOffer;
use App\Models\Company;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ErpIntegrationService
{
    // ── Supported ERP types ─────────────────────────────────────
    public const ERP_SAP = 'sap';
    public const ERP_ORACLE = 'oracle';
    public const ERP_DYNAMICS = 'microsoft_dynamics';
    public const ERP_CUSTOM_TMS = 'custom_tms';
    public const ERP_WMS = 'wms';

    /**
     * Sync data from/to an ERP integration.
     */
    public function sync(ErpIntegration $integration): array
    {
        if (!$integration->is_active) {
            return ['success' => false, 'error' => 'Integration is inactive'];
        }

        $startTime = microtime(true);
        $results = ['synced' => 0, 'errors' => [], 'direction' => $integration->sync_direction];

        try {
            match ($integration->sync_direction) {
                'inbound' => $results = $this->syncInbound($integration),
                'outbound' => $results = $this->syncOutbound($integration),
                'bidirectional' => $results = $this->syncBidirectional($integration),
                default => $results['errors'][] = 'Unknown sync direction',
            };
        } catch (\Exception $e) {
            Log::error("ERP sync failed for integration #{$integration->id}", [
                'error' => $e->getMessage(),
                'type' => $integration->integration_type,
            ]);
            $results['errors'][] = $e->getMessage();
        }

        // Update integration stats
        $integration->update([
            'last_sync_at' => now(),
            'sync_success_count' => $integration->sync_success_count + ($results['synced'] ?? 0),
            'sync_error_count' => $integration->sync_error_count + count($results['errors']),
            'last_sync_errors' => $results['errors'] ?: null,
        ]);

        $results['duration_ms'] = round((microtime(true) - $startTime) * 1000);

        return $results;
    }

    /**
     * Inbound sync: pull data from ERP → LogiMarket.
     */
    private function syncInbound(ErpIntegration $integration): array
    {
        $config = $integration->connection_config ?? [];
        $baseUrl = $config['api_url'] ?? null;
        $apiKey = $config['api_key'] ?? null;
        $results = ['synced' => 0, 'errors' => [], 'direction' => 'inbound'];

        if (!$baseUrl) {
            $results['errors'][] = 'No API URL configured';
            return $results;
        }

        $endpoint = match ($integration->integration_type) {
            self::ERP_SAP => $this->buildSapEndpoint($config, 'orders'),
            self::ERP_ORACLE => $this->buildOracleEndpoint($config, 'shipments'),
            self::ERP_DYNAMICS => ($config['api_url'] ?? '') . '/api/data/v9.2/msdyn_shipments',
            default => $baseUrl . '/api/orders',
        };

        try {
            $response = Http::timeout(30)
                ->withHeaders($this->buildAuthHeaders($integration))
                ->get($endpoint, [
                    'since' => $integration->last_sync_at?->toIso8601String() ?? now()->subDay()->toIso8601String(),
                    'limit' => $config['sync_batch_size'] ?? 100,
                ]);

            if ($response->failed()) {
                $results['errors'][] = "HTTP {$response->status()}: {$response->body()}";
                return $results;
            }

            $data = $response->json('data') ?? $response->json('d.results') ?? $response->json();
            $data = is_array($data) ? $data : [];

            foreach ($data as $item) {
                try {
                    $mapped = $this->mapInboundData($integration, $item);
                    $this->processInboundOrder($integration, $mapped);
                    $results['synced']++;

                    // Log as EDI message
                    $this->logEdiMessage($integration, 'ORDERS', 'inbound', $item);
                } catch (\Exception $e) {
                    $results['errors'][] = "Item sync error: {$e->getMessage()}";
                }
            }
        } catch (\Exception $e) {
            $results['errors'][] = "Connection error: {$e->getMessage()}";
        }

        return $results;
    }

    /**
     * Outbound sync: push LogiMarket data → ERP.
     */
    private function syncOutbound(ErpIntegration $integration): array
    {
        $config = $integration->connection_config ?? [];
        $results = ['synced' => 0, 'errors' => [], 'direction' => 'outbound'];

        // Get orders updated since last sync
        $orders = TransportOrder::where(function ($q) use ($integration) {
            $q->where('shipper_id', $integration->company_id)
                ->orWhere('carrier_id', $integration->company_id);
        })
            ->where('updated_at', '>=', $integration->last_sync_at ?? now()->subDay())
            ->with(['shipper:id,name,vat_number', 'carrier:id,name,vat_number', 'freightOffer'])
            ->limit($config['sync_batch_size'] ?? 100)
            ->get();

        foreach ($orders as $order) {
            try {
                $mapped = $this->mapOutboundData($integration, $order);
                $this->pushToErp($integration, $mapped, $order);
                $results['synced']++;

                $this->logEdiMessage($integration, 'DESADV', 'outbound', $mapped, $order->id);
            } catch (\Exception $e) {
                $results['errors'][] = "Order #{$order->order_number}: {$e->getMessage()}";
            }
        }

        return $results;
    }

    /**
     * Bidirectional sync.
     */
    private function syncBidirectional(ErpIntegration $integration): array
    {
        $inbound = $this->syncInbound($integration);
        $outbound = $this->syncOutbound($integration);

        return [
            'synced' => $inbound['synced'] + $outbound['synced'],
            'errors' => array_merge($inbound['errors'], $outbound['errors']),
            'direction' => 'bidirectional',
            'inbound_synced' => $inbound['synced'],
            'outbound_synced' => $outbound['synced'],
        ];
    }

    /**
     * Process an incoming webhook from an ERP system.
     */
    public function processWebhook(ErpIntegration $integration, string $event, array $payload): array
    {
        $result = ['processed' => false, 'action' => null];

        // Validate webhook signature if configured
        if ($integration->webhook_secret && !$this->validateWebhookSignature($integration, $payload)) {
            return ['processed' => false, 'error' => 'Invalid webhook signature'];
        }

        try {
            match ($event) {
                'order.created', 'shipment.created' => $result = $this->handleOrderCreatedWebhook($integration, $payload),
                'order.updated', 'shipment.updated' => $result = $this->handleOrderUpdatedWebhook($integration, $payload),
                'order.cancelled', 'shipment.cancelled' => $result = $this->handleOrderCancelledWebhook($integration, $payload),
                'invoice.created' => $result = $this->handleInvoiceWebhook($integration, $payload),
                'tracking.update' => $result = $this->handleTrackingWebhook($integration, $payload),
                'inventory.update' => $result = $this->handleInventoryWebhook($integration, $payload),
                default => $result = ['processed' => false, 'error' => "Unknown event: {$event}"],
            };

            $this->logEdiMessage($integration, strtoupper($event), 'inbound', $payload);
        } catch (\Exception $e) {
            Log::error("Webhook processing failed", [
                'integration_id' => $integration->id,
                'event' => $event,
                'error' => $e->getMessage(),
            ]);
            $result = ['processed' => false, 'error' => $e->getMessage()];
        }

        return $result;
    }

    /**
     * Send outbound webhook notification to an ERP system.
     */
    public function sendWebhook(ErpIntegration $integration, string $event, array $data): bool
    {
        if (!$integration->webhook_url || !$integration->is_active) {
            return false;
        }

        $payload = [
            'event' => $event,
            'timestamp' => now()->toIso8601String(),
            'data' => $data,
            'source' => 'logimarket',
        ];

        // Add HMAC signature
        if ($integration->webhook_secret) {
            $signature = hash_hmac('sha256', json_encode($payload), $integration->webhook_secret);
            $headers = ['X-LogiMarket-Signature' => $signature];
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders($headers ?? [])
                ->post($integration->webhook_url, $payload);

            $success = $response->successful();

            $this->logEdiMessage($integration, strtoupper($event), 'outbound', $payload, null, $success);

            if (!$success) {
                Log::warning("Outbound webhook failed", [
                    'integration_id' => $integration->id,
                    'event' => $event,
                    'status' => $response->status(),
                ]);
            }

            return $success;
        } catch (\Exception $e) {
            Log::error("Outbound webhook error", [
                'integration_id' => $integration->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Generate SAP IDoc-compatible export for an order.
     */
    public function generateSapIdoc(TransportOrder $order): array
    {
        return [
            'IDOC' => [
                'EDI_DC40' => [
                    'TABNAM' => 'EDI_DC40',
                    'MANDT' => '100',
                    'DOCNUM' => $order->order_number,
                    'IDOCTYP' => 'DELVRY07',
                    'MESTYP' => 'DESADV',
                    'SNDPOR' => 'LOGIMARKET',
                    'SNDPRT' => 'LS',
                    'SNDPRN' => 'LOGIMARKET',
                    'RCVPRT' => 'LS',
                    'CREDAT' => now()->format('Ymd'),
                    'CRETIM' => now()->format('His'),
                ],
                'E1EDL20' => [
                    'VBELN' => $order->order_number,
                    'VSTEL' => $order->pickup_country,
                    'VKORG' => 'LM01',
                    'LFDAT' => $order->delivery_date?->format('Ymd'),
                    'WAESSION' => $order->currency ?? 'EUR',
                    'NETWR' => $order->total_price,
                    'E1ADRM1' => [
                        'PARTNER_Q' => 'WE', // ship-to
                        'NAME1' => $order->delivery_contact_name,
                        'STRAS' => $order->delivery_address,
                        'ORT01' => $order->delivery_city,
                        'PSTLZ' => $order->delivery_postal_code,
                        'LAND1' => $order->delivery_country,
                    ],
                    'E1ADRM2' => [
                        'PARTNER_Q' => 'AG', // sold-to
                        'NAME1' => $order->pickup_contact_name,
                        'STRAS' => $order->pickup_address,
                        'ORT01' => $order->pickup_city,
                        'PSTLZ' => $order->pickup_postal_code,
                        'LAND1' => $order->pickup_country,
                    ],
                    'E1EDL24' => [
                        'MATNR' => $order->cargo_type,
                        'MAKTX' => $order->cargo_description,
                        'NTGEW' => $order->weight,
                        'BRGEW' => $order->weight,
                        'GEWEI' => 'KGM',
                        'VOLUM' => $order->volume,
                        'VRKME' => $order->pallet_count,
                    ],
                ],
            ],
        ];
    }

    /**
     * Generate Oracle TMS-compatible transport record.
     */
    public function generateOracleTmsRecord(TransportOrder $order): array
    {
        return [
            'ShipmentHeader' => [
                'ShipmentNumber' => $order->order_number,
                'ShipmentType' => 'OUTBOUND',
                'Status' => strtoupper($order->status?->value ?? $order->status ?? 'NEW'),
                'PlannedPickupDate' => $order->pickup_date?->toIso8601String(),
                'PlannedDeliveryDate' => $order->delivery_date?->toIso8601String(),
                'TotalWeight' => $order->weight,
                'WeightUOM' => 'KG',
                'TotalVolume' => $order->volume,
                'VolumeUOM' => 'CBM',
                'Currency' => $order->currency ?? 'EUR',
                'TotalCharges' => $order->total_price,
            ],
            'ShipFrom' => [
                'LocationName' => $order->pickup_contact_name,
                'Address1' => $order->pickup_address,
                'City' => $order->pickup_city,
                'PostalCode' => $order->pickup_postal_code,
                'Country' => $order->pickup_country,
                'ContactPhone' => $order->pickup_contact_phone,
            ],
            'ShipTo' => [
                'LocationName' => $order->delivery_contact_name,
                'Address1' => $order->delivery_address,
                'City' => $order->delivery_city,
                'PostalCode' => $order->delivery_postal_code,
                'Country' => $order->delivery_country,
                'ContactPhone' => $order->delivery_contact_phone,
            ],
            'LineItems' => [
                [
                    'ItemNumber' => 1,
                    'Description' => $order->cargo_description,
                    'CargoType' => $order->cargo_type,
                    'Weight' => $order->weight,
                    'Volume' => $order->volume,
                    'PalletCount' => $order->pallet_count,
                ],
            ],
            'SpecialInstructions' => $order->special_instructions,
        ];
    }

    /**
     * Test ERP connection.
     */
    public function testConnection(ErpIntegration $integration): array
    {
        $config = $integration->connection_config ?? [];
        $baseUrl = $config['api_url'] ?? null;

        if (!$baseUrl) {
            return ['connected' => false, 'error' => 'No API URL configured'];
        }

        $healthEndpoint = match ($integration->integration_type) {
            self::ERP_SAP => $baseUrl . '/sap/opu/odata4/sap/api_business_partner/srvd_a2x/sap/api_business_partner/0001/$metadata',
            self::ERP_ORACLE => $baseUrl . '/fscmRestApi/resources/latest',
            self::ERP_DYNAMICS => $baseUrl . '/api/data/v9.2/',
            default => $baseUrl . '/api/health',
        };

        try {
            $start = microtime(true);
            $response = Http::timeout(10)
                ->withHeaders($this->buildAuthHeaders($integration))
                ->get($healthEndpoint);

            return [
                'connected' => $response->successful(),
                'status_code' => $response->status(),
                'response_time_ms' => round((microtime(true) - $start) * 1000),
                'server' => $response->header('Server'),
            ];
        } catch (\Exception $e) {
            return [
                'connected' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get integration sync health metrics.
     */
    public function getSyncHealth(int $companyId): array
    {
        $integrations = ErpIntegration::where('company_id', $companyId)->get();

        return $integrations->map(function ($i) {
            $recentMessages = EdiMessage::where('erp_integration_id', $i->id)
                ->where('created_at', '>=', now()->subDay())
                ->selectRaw("status, COUNT(*) as count")
                ->groupBy('status')
                ->pluck('count', 'status');

            $totalRecent = $recentMessages->sum();
            $failedRecent = $recentMessages->get('failed', 0);

            return [
                'integration_id' => $i->id,
                'name' => $i->name,
                'type' => $i->integration_type,
                'is_active' => $i->is_active,
                'last_sync_at' => $i->last_sync_at?->toIso8601String(),
                'sync_success_count' => $i->sync_success_count,
                'sync_error_count' => $i->sync_error_count,
                'messages_24h' => $totalRecent,
                'failed_24h' => $failedRecent,
                'health_status' => match (true) {
                    !$i->is_active => 'disabled',
                    $i->last_sync_at === null => 'never_synced',
                    $i->last_sync_at->diffInHours(now()) > 24 => 'stale',
                    $failedRecent > $totalRecent * 0.2 => 'degraded',
                    default => 'healthy',
                },
            ];
        })->toArray();
    }

    // ─── Private helpers ────────────────────────────────────────

    private function buildAuthHeaders(ErpIntegration $integration): array
    {
        $config = $integration->connection_config ?? [];

        return match ($integration->integration_type) {
            self::ERP_SAP => [
                'Authorization' => 'Basic ' . base64_encode(($config['username'] ?? '') . ':' . ($config['password'] ?? '')),
                'X-CSRF-Token' => 'Fetch',
                'Accept' => 'application/json',
            ],
            self::ERP_ORACLE => [
                'Authorization' => 'Bearer ' . ($config['access_token'] ?? $config['api_key'] ?? ''),
                'Content-Type' => 'application/json',
                'REST-Framework-Version' => '4',
            ],
            self::ERP_DYNAMICS => [
                'Authorization' => 'Bearer ' . ($config['access_token'] ?? ''),
                'OData-MaxVersion' => '4.0',
                'OData-Version' => '4.0',
                'Accept' => 'application/json',
            ],
            default => [
                'Authorization' => 'Bearer ' . ($config['api_key'] ?? ''),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        };
    }

    private function buildSapEndpoint(array $config, string $entity): string
    {
        $base = $config['api_url'] ?? '';
        $client = $config['sap_client'] ?? '100';
        return "{$base}/sap/opu/odata4/sap/api_outbound_delivery_srv/srvd_a2x/sap/outbounddelivery/{$entity}?sap-client={$client}";
    }

    private function buildOracleEndpoint(array $config, string $entity): string
    {
        $base = $config['api_url'] ?? '';
        return "{$base}/fscmRestApi/resources/latest/{$entity}";
    }

    private function mapInboundData(ErpIntegration $integration, array $raw): array
    {
        $mappings = $integration->field_mappings ?? $this->getDefaultMappings($integration->integration_type);
        $mapped = [];

        foreach ($mappings as $logiField => $erpField) {
            $mapped[$logiField] = data_get($raw, $erpField);
        }

        return $mapped;
    }

    private function mapOutboundData(ErpIntegration $integration, TransportOrder $order): array
    {
        return match ($integration->integration_type) {
            self::ERP_SAP => $this->generateSapIdoc($order),
            self::ERP_ORACLE => $this->generateOracleTmsRecord($order),
            default => $order->toArray(),
        };
    }

    private function processInboundOrder(ErpIntegration $integration, array $data): void
    {
        // Check for existing order by external reference
        $existingOrder = TransportOrder::where('order_number', $data['order_number'] ?? null)->first();

        if ($existingOrder) {
            // Update existing
            $existingOrder->update(array_filter($data));
        } else {
            // Create freight offer from inbound data
            $integration->company->freightOffers()->create([
                'user_id' => $integration->company->users()->first()?->id,
                'origin_country' => $data['pickup_country'] ?? null,
                'origin_city' => $data['pickup_city'] ?? null,
                'destination_country' => $data['delivery_country'] ?? null,
                'destination_city' => $data['delivery_city'] ?? null,
                'loading_date' => $data['pickup_date'] ?? null,
                'unloading_date' => $data['delivery_date'] ?? null,
                'weight' => $data['weight'] ?? null,
                'volume' => $data['volume'] ?? null,
                'pallet_count' => $data['pallet_count'] ?? null,
                'cargo_type' => $data['cargo_type'] ?? null,
                'cargo_description' => $data['cargo_description'] ?? null,
                'price' => $data['total_price'] ?? null,
                'currency' => $data['currency'] ?? 'EUR',
                'status' => 'active',
                'source' => 'erp_import',
            ]);
        }
    }

    private function pushToErp(ErpIntegration $integration, array $mapped, TransportOrder $order): void
    {
        $config = $integration->connection_config ?? [];
        $endpoint = match ($integration->integration_type) {
            self::ERP_SAP => $this->buildSapEndpoint($config, 'deliveries'),
            self::ERP_ORACLE => $this->buildOracleEndpoint($config, 'shipments'),
            default => ($config['api_url'] ?? '') . '/api/orders',
        };

        $response = Http::timeout(30)
            ->withHeaders($this->buildAuthHeaders($integration))
            ->post($endpoint, $mapped);

        if ($response->failed()) {
            throw new \RuntimeException("ERP push failed: HTTP {$response->status()}");
        }
    }

    private function getDefaultMappings(string $type): array
    {
        return match ($type) {
            self::ERP_SAP => [
                'order_number' => 'IDOC.E1EDL20.VBELN',
                'pickup_country' => 'IDOC.E1EDL20.E1ADRM2.LAND1',
                'pickup_city' => 'IDOC.E1EDL20.E1ADRM2.ORT01',
                'pickup_address' => 'IDOC.E1EDL20.E1ADRM2.STRAS',
                'delivery_country' => 'IDOC.E1EDL20.E1ADRM1.LAND1',
                'delivery_city' => 'IDOC.E1EDL20.E1ADRM1.ORT01',
                'delivery_address' => 'IDOC.E1EDL20.E1ADRM1.STRAS',
                'weight' => 'IDOC.E1EDL20.E1EDL24.NTGEW',
                'volume' => 'IDOC.E1EDL20.E1EDL24.VOLUM',
                'cargo_description' => 'IDOC.E1EDL20.E1EDL24.MAKTX',
            ],
            self::ERP_ORACLE => [
                'order_number' => 'ShipmentHeader.ShipmentNumber',
                'pickup_country' => 'ShipFrom.Country',
                'pickup_city' => 'ShipFrom.City',
                'pickup_address' => 'ShipFrom.Address1',
                'delivery_country' => 'ShipTo.Country',
                'delivery_city' => 'ShipTo.City',
                'delivery_address' => 'ShipTo.Address1',
                'weight' => 'ShipmentHeader.TotalWeight',
                'volume' => 'ShipmentHeader.TotalVolume',
                'total_price' => 'ShipmentHeader.TotalCharges',
                'cargo_description' => 'LineItems.0.Description',
            ],
            default => [
                'order_number' => 'id',
                'pickup_country' => 'origin.country',
                'pickup_city' => 'origin.city',
                'delivery_country' => 'destination.country',
                'delivery_city' => 'destination.city',
                'weight' => 'weight',
                'total_price' => 'price',
            ],
        };
    }

    private function handleOrderCreatedWebhook(ErpIntegration $integration, array $payload): array
    {
        $mapped = $this->mapInboundData($integration, $payload);
        $this->processInboundOrder($integration, $mapped);
        return ['processed' => true, 'action' => 'order_created'];
    }

    private function handleOrderUpdatedWebhook(ErpIntegration $integration, array $payload): array
    {
        $orderNumber = data_get($payload, 'order_number') ?? data_get($payload, 'ShipmentHeader.ShipmentNumber');
        $order = TransportOrder::where('order_number', $orderNumber)->first();
        if ($order) {
            $mapped = $this->mapInboundData($integration, $payload);
            $order->update(array_filter($mapped));
        }
        return ['processed' => true, 'action' => 'order_updated'];
    }

    private function handleOrderCancelledWebhook(ErpIntegration $integration, array $payload): array
    {
        $orderNumber = data_get($payload, 'order_number') ?? data_get($payload, 'ShipmentHeader.ShipmentNumber');
        $order = TransportOrder::where('order_number', $orderNumber)->first();
        if ($order && method_exists($order, 'cancel')) {
            $order->cancel('Cancelled via ERP webhook');
        }
        return ['processed' => true, 'action' => 'order_cancelled'];
    }

    private function handleInvoiceWebhook(ErpIntegration $integration, array $payload): array
    {
        Log::info("Invoice webhook from ERP #{$integration->id}", $payload);
        return ['processed' => true, 'action' => 'invoice_logged'];
    }

    private function handleTrackingWebhook(ErpIntegration $integration, array $payload): array
    {
        $trackingCode = data_get($payload, 'tracking_code');
        $lat = data_get($payload, 'lat') ?? data_get($payload, 'latitude');
        $lng = data_get($payload, 'lng') ?? data_get($payload, 'longitude');

        if ($trackingCode && $lat && $lng) {
            $shipment = \App\Models\Shipment::where('tracking_code', $trackingCode)->first();
            if ($shipment) {
                $shipment->updatePosition((float) $lat, (float) $lng, $payload);
            }
        }

        return ['processed' => true, 'action' => 'tracking_updated'];
    }

    private function handleInventoryWebhook(ErpIntegration $integration, array $payload): array
    {
        Log::info("Inventory webhook from ERP #{$integration->id}", $payload);
        return ['processed' => true, 'action' => 'inventory_logged'];
    }

    private function validateWebhookSignature(ErpIntegration $integration, array $payload): bool
    {
        $receivedSignature = request()->header('X-ERP-Signature') ?? request()->header('X-Webhook-Signature');
        if (!$receivedSignature) return false;

        $expected = hash_hmac('sha256', json_encode($payload), $integration->webhook_secret);
        return hash_equals($expected, $receivedSignature);
    }

    private function logEdiMessage(
        ErpIntegration $integration,
        string $type,
        string $direction,
        array $content,
        ?int $orderId = null,
        bool $success = true
    ): void {
        EdiMessage::create([
            'company_id' => $integration->company_id,
            'erp_integration_id' => $integration->id,
            'message_type' => $type,
            'message_reference' => 'EDI-' . strtoupper(substr(md5(uniqid()), 0, 10)),
            'direction' => $direction,
            'format' => 'JSON',
            'raw_content' => json_encode($content),
            'is_valid' => $success,
            'status' => $success ? 'processed' : 'failed',
            'transport_order_id' => $orderId,
        ]);
    }
}
