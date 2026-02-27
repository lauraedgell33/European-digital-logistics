<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Integration\ImportFreightRequest;
use App\Http\Requests\Integration\ExportOrdersRequest;
use App\Http\Requests\Integration\WebhookRequest;
use App\Http\Resources\FreightOfferResource;
use App\Http\Resources\TransportOrderResource;
use App\Models\TransportOrder;
use Illuminate\Http\JsonResponse;

class IntegrationController extends Controller
{
    /**
     * API endpoint for external TMS/ERP systems to push freight offers.
     */
    public function importFreight(ImportFreightRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $company = $request->user()->company;
        $created = [];
        $errors = [];

        foreach ($validated['offers'] as $index => $offerData) {
            try {
                $offer = $company->freightOffers()->create(array_merge($offerData, [
                    'user_id' => $request->user()->id,
                    'status' => 'active',
                    'currency' => 'EUR',
                ]));
                $created[] = ['index' => $index, 'id' => $offer->id];
            } catch (\Exception $e) {
                $errors[] = ['index' => $index, 'error' => $e->getMessage()];
            }
        }

        return response()->json([
            'message' => count($created) . ' offers imported.',
            'created' => $created,
            'errors' => $errors,
        ], count($errors) ? 207 : 201);
    }

    /**
     * Export transport orders for TMS/ERP integration.
     */
    public function exportOrders(ExportOrdersRequest $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $query = TransportOrder::where(function ($q) use ($companyId) {
            $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
        });

        if ($request->from_date) {
            $query->where('created_at', '>=', $request->from_date);
        }
        if ($request->to_date) {
            $query->where('created_at', '<=', $request->to_date);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->with(['shipper:id,name,vat_number', 'carrier:id,name,vat_number'])
            ->orderBy('created_at', 'desc')
            ->get();

        return TransportOrderResource::collection($orders)->response();
    }

    /**
     * Webhook endpoint for receiving notifications from external systems.
     */
    public function webhook(WebhookRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Log the webhook for processing
        \Illuminate\Support\Facades\Log::info('External webhook received', [
            'event' => $validated['event'],
            'data' => $validated['data'],
            'company_id' => $request->user()->company_id,
        ]);

        // Process webhook based on event type
        match ($validated['event']) {
            'order.status_update' => $this->handleOrderStatusWebhook($validated['data'], $request->user()),
            'tracking.position' => $this->handleTrackingWebhook($validated['data']),
            default => null,
        };

        return response()->json(['message' => 'Webhook processed.']);
    }

    private function handleOrderStatusWebhook(array $data, $user): void
    {
        if (isset($data['order_number']) && isset($data['status'])) {
            $order = \App\Models\TransportOrder::where('order_number', $data['order_number'])
                ->where(function ($q) use ($user) {
                    $q->where('shipper_id', $user->company_id)
                        ->orWhere('carrier_id', $user->company_id);
                })
                ->first();

            if ($order) {
                match ($data['status']) {
                    'picked_up' => $order->markPickedUp(),
                    'in_transit' => $order->markInTransit(),
                    'delivered' => $order->markDelivered(),
                    'completed' => $order->complete(),
                    default => null,
                };
            }
        }
    }

    private function handleTrackingWebhook(array $data): void
    {
        if (isset($data['tracking_code']) && isset($data['lat']) && isset($data['lng'])) {
            $shipment = \App\Models\Shipment::where('tracking_code', $data['tracking_code'])->first();
            if ($shipment) {
                $shipment->updatePosition($data['lat'], $data['lng'], $data);
            }
        }
    }
}
