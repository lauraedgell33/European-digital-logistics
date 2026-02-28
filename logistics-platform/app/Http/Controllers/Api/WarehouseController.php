<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\WarehouseBooking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WarehouseController extends Controller
{
    /**
     * List warehouses with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Warehouse::with(['company:id,name,country_code,rating'])
            ->active();

        // Visibility: public + own company + network
        $companyId = $request->user()->company_id;
        $query->where(function ($q) use ($companyId) {
            $q->where('is_public', true)
              ->orWhere('company_id', $companyId);
        });

        // Filters
        if ($request->country) $query->inCountry($request->country);
        if ($request->city) $query->inCity($request->city);
        if ($request->storage_type) $query->withStorageType($request->storage_type);
        if ($request->boolean('temperature_control')) $query->withTemperatureControl();
        if ($request->boolean('hazardous')) $query->withHazardous();
        if ($request->min_area) $query->minArea($request->min_area);
        if ($request->min_pallets) $query->minPalletSpaces($request->min_pallets);
        if ($request->boolean('has_loading_dock')) $query->where('has_loading_dock', true);
        if ($request->boolean('has_rail_access')) $query->where('has_rail_access', true);
        if ($request->boolean('has_customs_warehouse')) $query->where('has_customs_warehouse', true);
        if ($request->boolean('has_cross_docking')) $query->where('has_cross_docking', true);

        // Sort
        $sortField = $request->input('sort', 'created_at');
        $sortDir = $request->input('direction', 'desc');
        $allowedSorts = ['created_at', 'price_per_m2_month', 'available_area_m2', 'available_pallet_spaces', 'city'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return response()->json($query->paginate($request->input('per_page', 20)));
    }

    /**
     * Create a warehouse listing.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country_code' => 'required|string|size:2',
            'city' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'address' => 'required|string',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'description' => 'nullable|string',
            'total_area_m2' => 'nullable|numeric|min:0',
            'available_area_m2' => 'nullable|numeric|min:0',
            'ceiling_height_m' => 'nullable|numeric|min:0',
            'storage_types' => 'nullable|array',
            'equipment' => 'nullable|array',
            'certifications' => 'nullable|array',
            'has_loading_dock' => 'boolean',
            'has_rail_access' => 'boolean',
            'has_temperature_control' => 'boolean',
            'min_temperature' => 'nullable|numeric',
            'max_temperature' => 'nullable|numeric',
            'has_hazardous_storage' => 'boolean',
            'adr_classes' => 'nullable|string',
            'has_customs_warehouse' => 'boolean',
            'is_bonded' => 'boolean',
            'has_cross_docking' => 'boolean',
            'has_pick_pack' => 'boolean',
            'has_security_24h' => 'boolean',
            'has_cctv' => 'boolean',
            'has_fire_protection' => 'boolean',
            'pallet_spaces' => 'nullable|integer|min:0',
            'available_pallet_spaces' => 'nullable|integer|min:0',
            'loading_docks_count' => 'nullable|integer|min:0',
            'price_per_m2_month' => 'nullable|numeric|min:0',
            'price_per_pallet_month' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'price_type' => 'nullable|in:fixed,negotiable,on_request',
            'available_from' => 'nullable|date',
            'available_to' => 'nullable|date|after:available_from',
            'min_rental_months' => 'nullable|integer|min:1',
            'is_public' => 'boolean',
            'network_id' => 'nullable|exists:partner_networks,id',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'contact_email' => 'nullable|email',
            'notes' => 'nullable|string',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $validated['user_id'] = $request->user()->id;

        $warehouse = Warehouse::create($validated);

        return response()->json([
            'message' => 'Warehouse created successfully.',
            'data' => $warehouse->load('company:id,name'),
        ], 201);
    }

    /**
     * Show warehouse detail.
     */
    public function show(Warehouse $warehouse): JsonResponse
    {
        return response()->json([
            'data' => $warehouse->load([
                'company:id,name,country_code,rating,total_reviews',
                'activeBookings' => fn($q) => $q->select('id', 'warehouse_id', 'start_date', 'end_date', 'status'),
            ]),
        ]);
    }

    /**
     * Update warehouse.
     */
    public function update(Request $request, Warehouse $warehouse): JsonResponse
    {
        if ($warehouse->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'available_area_m2' => 'nullable|numeric|min:0',
            'available_pallet_spaces' => 'nullable|integer|min:0',
            'price_per_m2_month' => 'nullable|numeric|min:0',
            'price_per_pallet_month' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,fully_booked,maintenance',
            'is_public' => 'boolean',
            'available_from' => 'nullable|date',
            'available_to' => 'nullable|date',
            'notes' => 'nullable|string',
            'contact_name' => 'nullable|string',
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'storage_types' => 'nullable|array',
            'equipment' => 'nullable|array',
            'certifications' => 'nullable|array',
        ]);

        $warehouse->update($validated);

        return response()->json(['message' => 'Warehouse updated.', 'data' => $warehouse->fresh()]);
    }

    /**
     * Delete warehouse.
     */
    public function destroy(Request $request, Warehouse $warehouse): JsonResponse
    {
        if ($warehouse->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $warehouse->delete();
        return response()->json(['message' => 'Warehouse deleted.']);
    }

    /**
     * Search warehouses with advanced filters + geo radius.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'country' => 'nullable|string|size:2',
            'city' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'radius_km' => 'nullable|numeric|min:1|max:500',
            'storage_types' => 'nullable|array',
            'min_area' => 'nullable|numeric|min:0',
            'min_pallets' => 'nullable|integer|min:0',
        ]);

        $query = Warehouse::with('company:id,name,country_code,rating')
            ->active()
            ->where('is_public', true);

        if ($request->country) $query->inCountry($request->country);
        if ($request->city) $query->inCity($request->city);

        if ($request->storage_types) {
            foreach ($request->storage_types as $type) {
                $query->withStorageType($type);
            }
        }

        if ($request->min_area) $query->minArea($request->min_area);
        if ($request->min_pallets) $query->minPalletSpaces($request->min_pallets);

        // Geo-radius search
        if ($request->lat && $request->lng && $request->radius_km) {
            $lat = $request->lat;
            $lng = $request->lng;
            $radius = $request->radius_km;

            $query->selectRaw("*, (6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) AS distance_km", [$lat, $lng, $lat])
                  ->having('distance_km', '<=', $radius)
                  ->orderBy('distance_km');
        }

        return response()->json($query->paginate(20));
    }

    /**
     * My company's warehouses.
     */
    public function myWarehouses(Request $request): JsonResponse
    {
        $warehouses = Warehouse::where('company_id', $request->user()->company_id)
            ->withCount('activeBookings')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($warehouses);
    }

    /**
     * Book warehouse space.
     */
    public function book(Request $request, Warehouse $warehouse): JsonResponse
    {
        $validated = $request->validate([
            'booked_area_m2' => 'nullable|numeric|min:0',
            'booked_pallet_spaces' => 'nullable|integer|min:0',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after:start_date',
            'agreed_price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'price_period' => 'nullable|in:monthly,weekly,daily',
            'special_requirements' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($warehouse->company_id === $request->user()->company_id) {
            return response()->json(['message' => 'Cannot book your own warehouse.'], 422);
        }

        $validated['warehouse_id'] = $warehouse->id;
        $validated['tenant_company_id'] = $request->user()->company_id;
        $validated['created_by'] = $request->user()->id;

        $booking = WarehouseBooking::create($validated);

        return response()->json([
            'message' => 'Booking request submitted.',
            'data' => $booking->load('warehouse:id,name,city,country_code'),
        ], 201);
    }

    /**
     * My company's bookings (as tenant).
     */
    public function myBookings(Request $request): JsonResponse
    {
        $bookings = WarehouseBooking::with('warehouse:id,name,city,country_code,company_id', 'warehouse.company:id,name')
            ->where('tenant_company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($bookings);
    }

    /**
     * Booking requests for my warehouses (as owner).
     */
    public function bookingRequests(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $bookings = WarehouseBooking::with(['warehouse:id,name', 'tenant:id,name,country_code,rating'])
            ->whereHas('warehouse', fn($q) => $q->where('company_id', $companyId))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($bookings);
    }

    /**
     * Confirm or reject a booking.
     */
    public function updateBookingStatus(Request $request, WarehouseBooking $booking): JsonResponse
    {
        $warehouse = $booking->warehouse;
        if ($warehouse->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate(['status' => 'required|in:confirmed,cancelled']);

        if ($request->status === 'confirmed') {
            $booking->confirm();
        } else {
            $booking->cancel($request->input('reason'));
        }

        return response()->json([
            'message' => 'Booking ' . $request->status . '.',
            'data' => $booking->fresh(),
        ]);
    }
}
