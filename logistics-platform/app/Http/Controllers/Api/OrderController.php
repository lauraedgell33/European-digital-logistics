<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreTransportOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Requests\Order\CancelOrderRequest;
use App\Http\Resources\TransportOrderResource;
use App\Models\TransportOrder;
use App\Models\Shipment;
use App\Events\OrderStatusChanged;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $orders = TransportOrder::forCompany($companyId)
            ->with(['shipper:id,name', 'carrier:id,name', 'shipment:id,transport_order_id,tracking_code,status'])
            ->orderBy('created_at', 'desc')
            ->paginate(min((int) $request->input('per_page', 20), 100));

        return TransportOrderResource::collection($orders)->response();
    }

    public function store(StoreTransportOrderRequest $request): JsonResponse
    {
        $order = TransportOrder::create(array_merge($request->validated(), [
            'shipper_id' => $request->user()->company_id,
            'created_by' => $request->user()->id,
            'status' => 'pending',
        ]));

        return (new TransportOrderResource($order->load(['shipper', 'carrier'])))
            ->additional(['message' => 'Transport order created.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(TransportOrder $order): JsonResponse
    {
        $this->authorize('view', $order);

        return (new TransportOrderResource($order->load([
            'shipper', 'carrier', 'createdBy:id,name',
            'freightOffer', 'vehicleOffer', 'shipment.events',
        ])))->response();
    }

    public function accept(Request $request, TransportOrder $order): JsonResponse
    {
        $this->authorize('accept', $order);

        $previousStatus = $order->status;

        if (!$order->accept()) {
            return response()->json(['message' => 'Order cannot be accepted in current status.'], 422);
        }

        Shipment::create([
            'transport_order_id' => $order->id,
            'status' => 'waiting_pickup',
        ]);

        OrderStatusChanged::dispatch($order->fresh(), $previousStatus, $order->status);

        return (new TransportOrderResource($order->fresh()->load('shipment')))
            ->additional(['message' => 'Order accepted.'])
            ->response();
    }

    public function reject(Request $request, TransportOrder $order): JsonResponse
    {
        $this->authorize('reject', $order);

        $previousStatus = $order->status;

        if (!$order->reject()) {
            return response()->json(['message' => 'Order cannot be rejected in current status.'], 422);
        }

        OrderStatusChanged::dispatch($order->fresh(), $previousStatus, 'rejected');

        return response()->json(['message' => 'Order rejected.']);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, TransportOrder $order): JsonResponse
    {
        $previousStatus = $order->status;

        $success = match ($request->status) {
            'picked_up' => $order->markPickedUp(),
            'in_transit' => $order->markInTransit(),
            'delivered' => $order->markDelivered(),
            'completed' => $order->complete(),
            'cancelled' => $order->cancel($request->reason),
            default => false,
        };

        if (!$success) {
            return response()->json(['message' => 'Invalid status transition.'], 422);
        }

        if ($order->shipment) {
            $shipmentStatus = match ($request->status) {
                'picked_up' => 'picked_up',
                'in_transit' => 'in_transit',
                'delivered' => 'delivered',
                default => $order->shipment->status,
            };
            $order->shipment->update(['status' => $shipmentStatus]);
        }

        OrderStatusChanged::dispatch($order->fresh(), $previousStatus, $request->status);

        return (new TransportOrderResource($order->fresh()->load('shipment')))
            ->additional(['message' => "Order status updated to {$request->status}."])
            ->response();
    }

    public function cancel(CancelOrderRequest $request, TransportOrder $order): JsonResponse
    {
        $previousStatus = $order->status;

        if (!$order->cancel($request->reason)) {
            return response()->json(['message' => 'Order cannot be cancelled.'], 422);
        }

        OrderStatusChanged::dispatch($order->fresh(), $previousStatus, 'cancelled');

        return response()->json(['message' => 'Order cancelled.']);
    }

    /**
     * Get order statistics for the dashboard.
     */
    public function statistics(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $stats = [
            'total_orders' => TransportOrder::forCompany($companyId)->count(),
            'pending' => TransportOrder::forCompany($companyId)->withStatus('pending')->count(),
            'active' => TransportOrder::forCompany($companyId)->active()->count(),
            'completed' => TransportOrder::forCompany($companyId)->withStatus('completed')->count(),
            'cancelled' => TransportOrder::forCompany($companyId)->withStatus('cancelled')->count(),
            'total_revenue' => TransportOrder::where('shipper_id', $companyId)
                ->whereIn('status', ['completed', 'delivered'])
                ->sum('total_price'),
        ];

        return response()->json($stats);
    }

    /**
     * List documents attached to an order.
     */
    public function documents(TransportOrder $order): JsonResponse
    {
        $this->authorize('view', $order);

        $docs = [];
        foreach (['cmr', 'pod', 'invoices', 'documents'] as $collection) {
            foreach ($order->getMedia($collection) as $media) {
                $docs[] = [
                    'id' => $media->id,
                    'collection' => $collection,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                    'created_at' => $media->created_at->toIso8601String(),
                ];
            }
        }

        return response()->json(['data' => $docs]);
    }

    /**
     * Upload a document to an order.
     */
    public function uploadDocument(Request $request, TransportOrder $order): JsonResponse
    {
        $this->authorize('update', $order);

        $request->validate([
            'file' => 'required|file|max:10240', // 10 MB
            'collection' => 'required|string|in:cmr,pod,invoices,documents',
        ]);

        $media = $order
            ->addMediaFromRequest('file')
            ->toMediaCollection($request->input('collection'));

        return response()->json([
            'data' => [
                'id' => $media->id,
                'collection' => $request->input('collection'),
                'name' => $media->name,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'url' => $media->getUrl(),
                'created_at' => $media->created_at->toIso8601String(),
            ],
            'message' => 'Document uploaded successfully.',
        ], 201);
    }

    /**
     * Delete a document from an order.
     */
    public function deleteDocument(TransportOrder $order, int $mediaId): JsonResponse
    {
        $this->authorize('update', $order);

        $media = $order->media()->findOrFail($mediaId);
        $media->delete();

        return response()->json(['message' => 'Document deleted.']);
    }
}
