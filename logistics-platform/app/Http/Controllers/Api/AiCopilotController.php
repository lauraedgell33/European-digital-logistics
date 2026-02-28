<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\TransportOrder;
use App\Models\Shipment;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AiCopilotController extends Controller
{
    private PricingService $pricingService;

    /**
     * Country name → ISO code mapping for parsing natural language.
     */
    private const COUNTRY_MAP = [
        'germany' => 'DE', 'deutschland' => 'DE',
        'france' => 'FR', 'frankreich' => 'FR',
        'spain' => 'ES', 'spanien' => 'ES', 'españa' => 'ES',
        'italy' => 'IT', 'italien' => 'IT', 'italia' => 'IT',
        'netherlands' => 'NL', 'holland' => 'NL', 'niederlande' => 'NL',
        'belgium' => 'BE', 'belgien' => 'BE',
        'austria' => 'AT', 'österreich' => 'AT',
        'poland' => 'PL', 'polen' => 'PL',
        'czech republic' => 'CZ', 'czechia' => 'CZ', 'tschechien' => 'CZ',
        'romania' => 'RO', 'rumänien' => 'RO',
        'hungary' => 'HU', 'ungarn' => 'HU',
        'portugal' => 'PT',
        'sweden' => 'SE', 'schweden' => 'SE',
        'denmark' => 'DK', 'dänemark' => 'DK',
        'finland' => 'FI', 'finnland' => 'FI',
        'norway' => 'NO', 'norwegen' => 'NO',
        'switzerland' => 'CH', 'schweiz' => 'CH',
        'united kingdom' => 'GB', 'uk' => 'GB', 'england' => 'GB',
        'ireland' => 'IE', 'irland' => 'IE',
        'croatia' => 'HR', 'kroatien' => 'HR',
        'slovakia' => 'SK', 'slowakei' => 'SK',
        'slovenia' => 'SI', 'slowenien' => 'SI',
        'bulgaria' => 'BG', 'bulgarien' => 'BG',
        'greece' => 'GR', 'griechenland' => 'GR',
        'turkey' => 'TR', 'türkei' => 'TR',
        'luxembourg' => 'LU', 'luxemburg' => 'LU',
        'lithuania' => 'LT', 'litauen' => 'LT',
        'latvia' => 'LV', 'lettland' => 'LV',
        'estonia' => 'EE', 'estland' => 'EE',
    ];

    /**
     * Common European city → country code mapping.
     */
    private const CITY_MAP = [
        'berlin' => 'DE', 'munich' => 'DE', 'münchen' => 'DE', 'hamburg' => 'DE',
        'frankfurt' => 'DE', 'cologne' => 'DE', 'köln' => 'DE', 'düsseldorf' => 'DE',
        'stuttgart' => 'DE', 'dortmund' => 'DE', 'essen' => 'DE', 'leipzig' => 'DE',
        'dresden' => 'DE', 'hannover' => 'DE', 'nuremberg' => 'DE', 'nürnberg' => 'DE',
        'paris' => 'FR', 'lyon' => 'FR', 'marseille' => 'FR', 'toulouse' => 'FR',
        'nice' => 'FR', 'nantes' => 'FR', 'strasbourg' => 'FR', 'bordeaux' => 'FR',
        'lille' => 'FR',
        'madrid' => 'ES', 'barcelona' => 'ES', 'valencia' => 'ES', 'seville' => 'ES',
        'sevilla' => 'ES', 'bilbao' => 'ES', 'malaga' => 'ES', 'zaragoza' => 'ES',
        'rome' => 'IT', 'roma' => 'IT', 'milan' => 'IT', 'milano' => 'IT',
        'naples' => 'IT', 'napoli' => 'IT', 'turin' => 'IT', 'torino' => 'IT',
        'florence' => 'IT', 'firenze' => 'IT', 'venice' => 'IT', 'venezia' => 'IT',
        'genoa' => 'IT', 'genova' => 'IT', 'bologna' => 'IT',
        'amsterdam' => 'NL', 'rotterdam' => 'NL', 'the hague' => 'NL',
        'utrecht' => 'NL', 'eindhoven' => 'NL',
        'brussels' => 'BE', 'bruxelles' => 'BE', 'antwerp' => 'BE', 'antwerpen' => 'BE',
        'ghent' => 'BE', 'gent' => 'BE', 'bruges' => 'BE', 'liege' => 'BE',
        'vienna' => 'AT', 'wien' => 'AT', 'graz' => 'AT', 'salzburg' => 'AT',
        'innsbruck' => 'AT', 'linz' => 'AT',
        'warsaw' => 'PL', 'warszawa' => 'PL', 'krakow' => 'PL', 'kraków' => 'PL',
        'gdansk' => 'PL', 'gdańsk' => 'PL', 'wroclaw' => 'PL', 'wrocław' => 'PL',
        'poznan' => 'PL', 'poznań' => 'PL', 'lodz' => 'PL', 'łódź' => 'PL',
        'prague' => 'CZ', 'praha' => 'CZ', 'brno' => 'CZ',
        'bucharest' => 'RO', 'bucuresti' => 'RO', 'bucureşti' => 'RO',
        'cluj' => 'RO', 'timisoara' => 'RO', 'timișoara' => 'RO', 'iasi' => 'RO', 'iași' => 'RO',
        'budapest' => 'HU', 'debrecen' => 'HU',
        'lisbon' => 'PT', 'lisboa' => 'PT', 'porto' => 'PT',
        'stockholm' => 'SE', 'gothenburg' => 'SE', 'göteborg' => 'SE', 'malmö' => 'SE',
        'copenhagen' => 'DK', 'københavn' => 'DK',
        'helsinki' => 'FI',
        'oslo' => 'NO',
        'zurich' => 'CH', 'zürich' => 'CH', 'geneva' => 'CH', 'genève' => 'CH',
        'bern' => 'CH', 'basel' => 'CH',
        'london' => 'GB', 'manchester' => 'GB', 'birmingham' => 'GB', 'liverpool' => 'GB',
        'dublin' => 'IE',
        'zagreb' => 'HR',
        'bratislava' => 'SK',
        'ljubljana' => 'SI',
        'sofia' => 'BG',
        'athens' => 'GR',
        'istanbul' => 'TR', 'ankara' => 'TR', 'izmir' => 'TR',
        'luxembourg' => 'LU',
        'vilnius' => 'LT',
        'riga' => 'LV',
        'tallinn' => 'EE',
    ];

    /**
     * Route distance estimates (km) for common European corridors.
     */
    private const ROUTE_DISTANCES = [
        'DE-FR' => 900, 'DE-ES' => 1800, 'DE-IT' => 1100, 'DE-NL' => 500,
        'DE-BE' => 650, 'DE-AT' => 600, 'DE-PL' => 570, 'DE-CZ' => 350,
        'DE-RO' => 1600, 'DE-HU' => 850, 'DE-CH' => 750, 'DE-GB' => 1050,
        'DE-DK' => 450, 'DE-SE' => 900, 'DE-PT' => 2300,
        'FR-ES' => 1050, 'FR-IT' => 1100, 'FR-BE' => 300, 'FR-NL' => 500,
        'FR-GB' => 500, 'FR-CH' => 550, 'FR-DE' => 900, 'FR-PT' => 1700,
        'ES-PT' => 600, 'ES-FR' => 1050, 'ES-IT' => 1800,
        'IT-AT' => 750, 'IT-CH' => 850, 'IT-FR' => 1100, 'IT-DE' => 1100,
        'NL-BE' => 200, 'NL-DE' => 500, 'NL-FR' => 500, 'NL-GB' => 550,
        'PL-DE' => 570, 'PL-CZ' => 500, 'PL-SK' => 350, 'PL-LT' => 550,
        'AT-HU' => 250, 'AT-CZ' => 300, 'AT-SK' => 80, 'AT-IT' => 750,
        'RO-HU' => 680, 'RO-BG' => 350,
    ];

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Handle an incoming chat message.
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'context' => 'nullable|array',
        ]);

        $message = strtolower(trim($request->input('message')));
        $companyId = $request->user()->company_id;

        $intent = $this->detectIntent($message);
        $response = $this->processIntent($intent, $message, $companyId, $request->user());

        return response()->json([
            'data' => [
                'message' => $response['message'],
                'type' => $response['type'] ?? 'text',
                'data' => $response['data'] ?? null,
                'suggestions' => $response['suggestions'] ?? [],
                'actions' => $response['actions'] ?? [],
            ],
        ]);
    }

    /**
     * Return contextual suggestions for the current user.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $pendingOrders = TransportOrder::forCompany($companyId)->where('status', 'pending')->count();
        $activeShipments = Shipment::whereHas('transportOrder', fn ($q) => $q->forCompany($companyId))
            ->where('status', 'in_transit')
            ->count();
        $newFreight = FreightOffer::where('status', 'active')
            ->where('created_at', '>', now()->subHours(24))
            ->count();
        $availableVehicles = VehicleOffer::where('status', 'available')
            ->where('available_from', '<=', now())
            ->count();

        $suggestions = [];

        if ($pendingOrders > 0) {
            $suggestions[] = "You have {$pendingOrders} pending orders — want me to show them?";
        }
        if ($activeShipments > 0) {
            $suggestions[] = "Track your {$activeShipments} active shipments";
        }
        if ($newFreight > 5) {
            $suggestions[] = "{$newFreight} new freight offers posted today — search for loads?";
        }
        if ($availableVehicles > 10) {
            $suggestions[] = "{$availableVehicles} vehicles available right now";
        }

        $suggestions[] = 'Get a price estimate for a route';
        $suggestions[] = 'What features does LogiMarket offer?';

        return response()->json(['data' => $suggestions]);
    }

    // ─── Intent Detection ─────────────────────────────────

    private function detectIntent(string $message): string
    {
        $intents = [
            'freight_search' => [
                'freight', 'load', 'cargo', 'shipment available', 'find load',
                'search freight', 'available loads', 'transport from', 'cargo from',
                'freight from', 'loads from', 'shipments from',
            ],
            'vehicle_search' => [
                'vehicle', 'truck', 'available truck', 'find truck',
                'van', 'trailer', 'capacity', 'find vehicle', 'available vehicle',
            ],
            'order_status' => [
                'order', 'status', 'my orders', 'pending', 'where is',
                'track', 'delivery', 'shipment status', 'order status',
            ],
            'price_estimate' => [
                'price', 'cost', 'estimate', 'how much', 'rate',
                'pricing', 'quote', 'calculate', 'price from',
            ],
            'analytics' => [
                'analytics', 'statistics', 'performance', 'revenue',
                'report', 'data', 'metrics', 'how many',
            ],
            'route' => [
                'route', 'distance', 'directions', 'driving time',
                'route from', 'how far',
            ],
            'help' => [
                'help', 'how to', 'what is', 'explain', 'feature',
                'guide', 'tutorial', 'how do i', 'what can',
            ],
            'greeting' => [
                'hello', 'hi', 'hey', 'good morning', 'good afternoon',
                'buna', 'salut', 'hallo', 'guten tag', 'bonjour', 'hola',
            ],
        ];

        foreach ($intents as $intent => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($message, $keyword)) {
                    return $intent;
                }
            }
        }

        return 'general';
    }

    private function processIntent(string $intent, string $message, int $companyId, $user): array
    {
        return match ($intent) {
            'freight_search' => $this->handleFreightSearch($message, $companyId),
            'vehicle_search' => $this->handleVehicleSearch($message),
            'order_status' => $this->handleOrderStatus($companyId),
            'price_estimate' => $this->handlePriceEstimate($message),
            'analytics' => $this->handleAnalytics($companyId),
            'route' => $this->handleRoute($message),
            'help' => $this->handleHelp($message),
            'greeting' => $this->handleGreeting($user),
            default => $this->handleGeneral($message),
        };
    }

    // ─── Handler: Freight Search ──────────────────────────

    private function handleFreightSearch(string $message, int $companyId): array
    {
        $parsed = $this->parseLocations($message);
        $originCountry = $parsed['origin_country'];
        $originCity = $parsed['origin_city'];
        $destCountry = $parsed['destination_country'];
        $destCity = $parsed['destination_city'];

        $query = FreightOffer::active()->where('is_public', true);

        if ($originCountry) {
            $query->where('origin_country', $originCountry);
        }
        if ($originCity) {
            $query->where('origin_city', 'LIKE', "%{$originCity}%");
        }
        if ($destCountry) {
            $query->where('destination_country', $destCountry);
        }
        if ($destCity) {
            $query->where('destination_city', 'LIKE', "%{$destCity}%");
        }

        $total = $query->count();
        $results = $query->orderByDesc('created_at')
            ->take(5)
            ->get(['id', 'origin_country', 'origin_city', 'destination_country', 'destination_city',
                    'cargo_type', 'weight', 'loading_date', 'price', 'currency', 'vehicle_type']);

        if ($total === 0) {
            $allActive = FreightOffer::active()->count();
            $locationDesc = $this->buildLocationDescription($originCountry, $originCity, $destCountry, $destCity);

            return [
                'message' => "I couldn't find any active freight offers{$locationDesc}. There are currently {$allActive} active offers on the platform. Try broadening your search.",
                'type' => 'text',
                'suggestions' => [
                    'Show all available freight',
                    'Search freight from Germany',
                    'Search freight to France',
                ],
                'actions' => [
                    ['label' => 'Browse Freight Exchange', 'url' => '/freight', 'icon' => 'truck'],
                    ['label' => 'Post New Freight', 'url' => '/freight/new', 'icon' => 'plus'],
                ],
            ];
        }

        $locationDesc = $this->buildLocationDescription($originCountry, $originCity, $destCountry, $destCity);
        $formattedResults = $results->map(fn ($f) => [
            'id' => $f->id,
            'route' => "{$f->origin_city}, {$f->origin_country} → {$f->destination_city}, {$f->destination_country}",
            'cargo' => $f->cargo_type,
            'weight' => $f->weight ? number_format($f->weight, 0) . ' kg' : null,
            'loading_date' => $f->loading_date?->format('d M Y'),
            'price' => $f->price ? '€' . number_format($f->price, 0) : 'On request',
            'vehicle_type' => $f->vehicle_type,
        ])->toArray();

        $showingText = $total > 5 ? "Here are the 5 most recent of {$total} freight offers" : "Found {$total} freight offer(s)";

        return [
            'message' => "{$showingText}{$locationDesc}:",
            'type' => 'data',
            'data' => [
                'total' => $total,
                'items' => $formattedResults,
                'entity' => 'freight',
            ],
            'suggestions' => [
                'Show more details',
                'Get a price estimate for this route',
                'Search for available trucks',
            ],
            'actions' => [
                ['label' => 'View All Results', 'url' => '/freight' . ($originCountry ? "?origin_country={$originCountry}" : ''), 'icon' => 'list'],
                ['label' => 'Post New Freight', 'url' => '/freight/new', 'icon' => 'plus'],
            ],
        ];
    }

    // ─── Handler: Vehicle Search ──────────────────────────

    private function handleVehicleSearch(string $message): array
    {
        $parsed = $this->parseLocations($message);
        $country = $parsed['origin_country'];
        $city = $parsed['origin_city'];

        // Check for vehicle type mentions
        $vehicleType = null;
        $vehicleTypes = [
            'refrigerated' => 'refrigerated',
            'reefer' => 'refrigerated',
            'kühl' => 'refrigerated',
            'flatbed' => 'flatbed',
            'curtainsider' => 'curtainsider',
            'tautliner' => 'curtainsider',
            'container' => 'container',
            'tanker' => 'tanker',
            'mega' => 'mega_trailer',
            'van' => 'van',
            'box truck' => 'box_truck',
            'standard' => 'standard_truck',
        ];

        foreach ($vehicleTypes as $keyword => $type) {
            if (str_contains($message, $keyword)) {
                $vehicleType = $type;
                break;
            }
        }

        $query = VehicleOffer::where('status', 'available')
            ->where('is_public', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });

        if ($country) {
            $query->where('current_country', $country);
        }
        if ($city) {
            $query->where('current_city', 'LIKE', "%{$city}%");
        }
        if ($vehicleType) {
            $query->where('vehicle_type', $vehicleType);
        }

        $total = $query->count();
        $results = $query->orderByDesc('created_at')
            ->take(5)
            ->get(['id', 'vehicle_type', 'current_country', 'current_city',
                    'destination_country', 'destination_city', 'capacity_kg',
                    'available_from', 'available_to', 'price_per_km', 'currency']);

        if ($total === 0) {
            $allAvailable = VehicleOffer::where('status', 'available')->count();
            return [
                'message' => "No available vehicles found matching your criteria. There are {$allAvailable} vehicles available across all locations. Try adjusting your search.",
                'type' => 'text',
                'suggestions' => [
                    'Show all available vehicles',
                    'Find trucks in Germany',
                    'Find refrigerated trucks',
                ],
                'actions' => [
                    ['label' => 'Browse Vehicle Exchange', 'url' => '/vehicles', 'icon' => 'truck'],
                    ['label' => 'Post Available Vehicle', 'url' => '/vehicles/new', 'icon' => 'plus'],
                ],
            ];
        }

        $formattedResults = $results->map(fn ($v) => [
            'id' => $v->id,
            'type' => str_replace('_', ' ', $v->vehicle_type),
            'location' => "{$v->current_city}, {$v->current_country}",
            'destination' => $v->destination_city ? "{$v->destination_city}, {$v->destination_country}" : 'Flexible',
            'capacity' => $v->capacity_kg ? number_format($v->capacity_kg, 0) . ' kg' : null,
            'available' => $v->available_from?->format('d M') . ($v->available_to ? ' – ' . $v->available_to->format('d M') : '+'),
            'price' => $v->price_per_km ? '€' . number_format($v->price_per_km, 2) . '/km' : 'On request',
        ])->toArray();

        $showingText = $total > 5 ? "Showing 5 of {$total} available vehicles" : "Found {$total} available vehicle(s)";

        return [
            'message' => $showingText . ':',
            'type' => 'data',
            'data' => [
                'total' => $total,
                'items' => $formattedResults,
                'entity' => 'vehicles',
            ],
            'suggestions' => [
                'Search for freight to match',
                'Get a price estimate',
                'Find more vehicles',
            ],
            'actions' => [
                ['label' => 'View All Vehicles', 'url' => '/vehicles', 'icon' => 'list'],
            ],
        ];
    }

    // ─── Handler: Order Status ────────────────────────────

    private function handleOrderStatus(int $companyId): array
    {
        $statuses = TransportOrder::forCompany($companyId)
            ->selectRaw("status, COUNT(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $total = array_sum($statuses);

        $recentOrders = TransportOrder::forCompany($companyId)
            ->orderByDesc('created_at')
            ->take(5)
            ->get(['id', 'order_number', 'status', 'pickup_city', 'pickup_country',
                    'delivery_city', 'delivery_country', 'total_price', 'currency',
                    'pickup_date', 'delivery_date']);

        $statusSummary = [];
        $statusLabels = [
            'pending' => '🟡 Pending',
            'accepted' => '🟢 Accepted',
            'pickup_scheduled' => '📅 Pickup Scheduled',
            'picked_up' => '📦 Picked Up',
            'in_transit' => '🚛 In Transit',
            'delivered' => '✅ Delivered',
            'completed' => '🏁 Completed',
            'cancelled' => '❌ Cancelled',
            'rejected' => '⛔ Rejected',
        ];

        foreach ($statuses as $status => $count) {
            $label = $statusLabels[$status] ?? ucfirst(str_replace('_', ' ', $status));
            $statusSummary[] = "{$label}: {$count}";
        }

        $formattedOrders = $recentOrders->map(fn ($o) => [
            'id' => $o->id,
            'order_number' => $o->order_number,
            'status' => $o->status,
            'route' => "{$o->pickup_city}, {$o->pickup_country} → {$o->delivery_city}, {$o->delivery_country}",
            'price' => $o->total_price ? '€' . number_format($o->total_price, 0) : '-',
            'pickup_date' => $o->pickup_date?->format('d M Y'),
            'delivery_date' => $o->delivery_date?->format('d M Y'),
        ])->toArray();

        $message = "You have **{$total} total orders**.\n\n" . implode("\n", $statusSummary);

        if ($total === 0) {
            return [
                'message' => "You don't have any orders yet. Would you like to create one from available freight?",
                'type' => 'text',
                'suggestions' => [
                    'Search for freight',
                    'How do I create an order?',
                ],
                'actions' => [
                    ['label' => 'Browse Freight', 'url' => '/freight', 'icon' => 'search'],
                    ['label' => 'Create Order', 'url' => '/orders/new', 'icon' => 'plus'],
                ],
            ];
        }

        return [
            'message' => $message,
            'type' => 'data',
            'data' => [
                'summary' => $statuses,
                'total' => $total,
                'items' => $formattedOrders,
                'entity' => 'orders',
            ],
            'suggestions' => [
                'Show pending orders only',
                'Track active shipments',
                'View order analytics',
            ],
            'actions' => [
                ['label' => 'View All Orders', 'url' => '/orders', 'icon' => 'list'],
                ['label' => 'Track Shipments', 'url' => '/tracking', 'icon' => 'map'],
            ],
        ];
    }

    // ─── Handler: Price Estimate ──────────────────────────

    private function handlePriceEstimate(string $message): array
    {
        $parsed = $this->parseLocations($message);
        $originCountry = $parsed['origin_country'];
        $destCountry = $parsed['destination_country'];

        if (!$originCountry || !$destCountry) {
            return [
                'message' => "I can calculate a price estimate for you. Please specify the origin and destination. For example: *\"Price from Germany to France\"* or *\"How much from Berlin to Paris?\"*",
                'type' => 'text',
                'suggestions' => [
                    'Price from Germany to France',
                    'Cost from Netherlands to Italy',
                    'Estimate Berlin to Warsaw',
                    'How much from Spain to Germany?',
                ],
            ];
        }

        // Determine distance
        $routeKey = "{$originCountry}-{$destCountry}";
        $reverseKey = "{$destCountry}-{$originCountry}";
        $distanceKm = self::ROUTE_DISTANCES[$routeKey]
            ?? self::ROUTE_DISTANCES[$reverseKey]
            ?? 1000; // fallback

        // Parse weight if mentioned
        $weight = 10000; // default 10 tons
        if (preg_match('/(\d+)\s*(kg|kilogram|kilo)/i', $message, $m)) {
            $weight = (int) $m[1];
        } elseif (preg_match('/(\d+)\s*(t|ton|tons|tonnes)/i', $message, $m)) {
            $weight = (int) $m[1] * 1000;
        }

        // Parse vehicle type if mentioned
        $vehicleType = 'standard_truck';
        $vTypes = [
            'refrigerated' => 'refrigerated', 'reefer' => 'refrigerated',
            'flatbed' => 'flatbed', 'container' => 'container',
            'tanker' => 'tanker', 'van' => 'van', 'mega' => 'mega_trailer',
            'curtainsider' => 'curtainsider',
        ];
        foreach ($vTypes as $kw => $vt) {
            if (str_contains($message, $kw)) {
                $vehicleType = $vt;
                break;
            }
        }

        // Calculate price using PricingService
        $pricing = $this->pricingService->calculateSuggestedPrice($distanceKm, $weight, $vehicleType);

        // Also get market price if available
        $marketPrice = $this->pricingService->getMarketPrice($originCountry, $destCountry, $vehicleType, $distanceKm);

        $originLabel = $parsed['origin_city'] ?: $this->countryCodeToName($originCountry);
        $destLabel = $parsed['destination_city'] ?: $this->countryCodeToName($destCountry);

        $message = "**Price estimate: {$originLabel} → {$destLabel}**\n\n"
            . "📏 Distance: ~{$distanceKm} km\n"
            . "⚖️ Weight: " . number_format($weight / 1000, 1) . " t\n"
            . "🚛 Vehicle: " . str_replace('_', ' ', ucfirst($vehicleType)) . "\n\n"
            . "💰 **Suggested price: €" . number_format($pricing['suggested_price'], 0) . "**\n"
            . "📊 Range: €" . number_format($pricing['price_range']['low'], 0) . " – €" . number_format($pricing['price_range']['high'], 0) . "\n"
            . "📈 Rate: €" . number_format($pricing['price_per_km'], 2) . "/km";

        if (isset($marketPrice['market_average'])) {
            $message .= "\n\n🏪 Market average (last 3 months): €" . number_format($marketPrice['market_average'], 0)
                . " ({$marketPrice['sample_size']} orders)";
        }

        return [
            'message' => $message,
            'type' => 'data',
            'data' => [
                'pricing' => $pricing,
                'market' => $marketPrice,
                'route' => [
                    'origin' => $originLabel,
                    'destination' => $destLabel,
                    'distance_km' => $distanceKm,
                ],
                'entity' => 'pricing',
            ],
            'suggestions' => [
                "Search freight from {$originLabel}",
                "Find trucks in {$originLabel}",
                'Get another price estimate',
            ],
            'actions' => [
                ['label' => 'Search This Route', 'url' => "/freight?origin_country={$originCountry}&destination_country={$destCountry}", 'icon' => 'search'],
                ['label' => 'Post Freight Offer', 'url' => '/freight/new', 'icon' => 'plus'],
            ],
        ];
    }

    // ─── Handler: Analytics ───────────────────────────────

    private function handleAnalytics(int $companyId): array
    {
        // Orders overview
        $totalOrders = TransportOrder::forCompany($companyId)->count();
        $completedOrders = TransportOrder::forCompany($companyId)->where('status', 'completed')->count();
        $activeOrders = TransportOrder::forCompany($companyId)->active()->count();

        // Revenue (completed orders)
        $totalRevenue = TransportOrder::forCompany($companyId)
            ->where('status', 'completed')
            ->sum('total_price') ?? 0;
        $monthlyRevenue = TransportOrder::forCompany($companyId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->startOfMonth())
            ->sum('total_price') ?? 0;

        // Freight posted
        $freightPosted = FreightOffer::where('company_id', $companyId)->count();
        $activeFreight = FreightOffer::where('company_id', $companyId)->where('status', 'active')->count();

        // Vehicle utilization
        $vehiclesPosted = VehicleOffer::where('company_id', $companyId)->count();
        $vehiclesBooked = VehicleOffer::where('company_id', $companyId)
            ->where('status', 'booked')
            ->count();

        // Shipment tracking
        $activeShipments = Shipment::whereHas('transportOrder', fn ($q) => $q->forCompany($companyId))
            ->where('status', 'in_transit')
            ->count();

        // Recent monthly trend
        $monthlyOrders = TransportOrder::forCompany($companyId)
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $completionRate = $totalOrders > 0
            ? round(($completedOrders / $totalOrders) * 100, 1)
            : 0;

        $message = "**📊 Your Platform Analytics**\n\n"
            . "**Orders:**\n"
            . "• Total: {$totalOrders}  |  Active: {$activeOrders}  |  Completed: {$completedOrders}\n"
            . "• Completion rate: {$completionRate}%\n\n"
            . "**Revenue:**\n"
            . "• All-time: €" . number_format($totalRevenue, 0) . "\n"
            . "• This month: €" . number_format($monthlyRevenue, 0) . "\n\n"
            . "**Exchange Activity:**\n"
            . "• Freight posted: {$freightPosted} (active: {$activeFreight})\n"
            . "• Vehicles posted: {$vehiclesPosted} (booked: {$vehiclesBooked})\n"
            . "• Active shipments: {$activeShipments}";

        return [
            'message' => $message,
            'type' => 'data',
            'data' => [
                'orders' => [
                    'total' => $totalOrders,
                    'active' => $activeOrders,
                    'completed' => $completedOrders,
                    'completion_rate' => $completionRate,
                ],
                'revenue' => [
                    'total' => round($totalRevenue, 2),
                    'monthly' => round($monthlyRevenue, 2),
                ],
                'freight' => ['posted' => $freightPosted, 'active' => $activeFreight],
                'vehicles' => ['posted' => $vehiclesPosted, 'booked' => $vehiclesBooked],
                'shipments_active' => $activeShipments,
                'monthly_trend' => $monthlyOrders,
                'entity' => 'analytics',
            ],
            'suggestions' => [
                'Show my orders',
                'Track active shipments',
                'Get a price estimate',
            ],
            'actions' => [
                ['label' => 'Full Analytics', 'url' => '/analytics', 'icon' => 'chart'],
                ['label' => 'View Orders', 'url' => '/orders', 'icon' => 'list'],
            ],
        ];
    }

    // ─── Handler: Route ───────────────────────────────────

    private function handleRoute(string $message): array
    {
        $parsed = $this->parseLocations($message);
        $originCountry = $parsed['origin_country'];
        $destCountry = $parsed['destination_country'];

        if (!$originCountry || !$destCountry) {
            return [
                'message' => "I can help with route information. Please specify origin and destination, for example: *\"Route from Berlin to Paris\"*",
                'type' => 'text',
                'suggestions' => [
                    'Route from Germany to France',
                    'Distance Berlin to Warsaw',
                    'How far from Amsterdam to Milan?',
                ],
            ];
        }

        $routeKey = "{$originCountry}-{$destCountry}";
        $reverseKey = "{$destCountry}-{$originCountry}";
        $distanceKm = self::ROUTE_DISTANCES[$routeKey]
            ?? self::ROUTE_DISTANCES[$reverseKey]
            ?? 1000;

        $drivingHours = round($distanceKm / 70, 1); // avg 70 km/h
        $drivingDays = ceil($drivingHours / 9); // max 9h driving/day (EU regulations)
        $fuelCost = round($distanceKm * 0.35, 0); // ~0.35€/km fuel
        $tollEstimate = round($distanceKm * 0.18, 0); // ~0.18€/km tolls avg

        $originLabel = $parsed['origin_city'] ?: $this->countryCodeToName($originCountry);
        $destLabel = $parsed['destination_city'] ?: $this->countryCodeToName($destCountry);

        $message = "**🗺️ Route: {$originLabel} → {$destLabel}**\n\n"
            . "📏 Distance: ~{$distanceKm} km\n"
            . "⏱️ Driving time: ~{$drivingHours} hours\n"
            . "📅 Estimated transit: {$drivingDays} day(s) (EU driver regulations)\n\n"
            . "⛽ Est. fuel cost: ~€{$fuelCost}\n"
            . "🛣️ Est. tolls: ~€{$tollEstimate}\n"
            . "💰 Total running cost: ~€" . ($fuelCost + $tollEstimate);

        return [
            'message' => $message,
            'type' => 'data',
            'data' => [
                'origin' => $originLabel,
                'destination' => $destLabel,
                'distance_km' => $distanceKm,
                'driving_hours' => $drivingHours,
                'transit_days' => $drivingDays,
                'fuel_cost' => $fuelCost,
                'toll_estimate' => $tollEstimate,
                'entity' => 'route',
            ],
            'suggestions' => [
                "Price estimate for this route",
                "Find freight from {$originLabel}",
                "Find trucks near {$originLabel}",
            ],
            'actions' => [
                ['label' => 'Search Freight', 'url' => "/freight?origin_country={$originCountry}&destination_country={$destCountry}", 'icon' => 'search'],
                ['label' => 'Calculate Carbon', 'url' => '/carbon', 'icon' => 'leaf'],
            ],
        ];
    }

    // ─── Handler: Help / Features ─────────────────────────

    private function handleHelp(string $message): array
    {
        $features = [
            'freight' => [
                'title' => 'Freight Exchange',
                'desc' => 'Post and search freight offers across Europe. Filter by route, cargo type, vehicle requirements, and dates. Get matched with carriers automatically.',
            ],
            'vehicle' => [
                'title' => 'Vehicle Exchange',
                'desc' => 'Post available vehicles or find trucks for your freight. Includes vehicle type, capacity, current location, and availability dates.',
            ],
            'order' => [
                'title' => 'Transport Orders',
                'desc' => 'Create and manage transport orders with full lifecycle tracking: pending → accepted → picked up → in transit → delivered → completed.',
            ],
            'track' => [
                'title' => 'Live Tracking',
                'desc' => 'Real-time GPS tracking with ETA predictions, geofencing alerts, and shareable tracking links for your customers.',
            ],
            'price' => [
                'title' => 'Smart Pricing',
                'desc' => 'AI-powered price suggestions based on distance, weight, vehicle type, urgency, and market data. Dynamic pricing with market insights.',
            ],
            'tender' => [
                'title' => 'Tender Management',
                'desc' => 'Create transport tenders, receive bids from carriers, compare offers, and award contracts — all in one workflow.',
            ],
            'network' => [
                'title' => 'Partner Networks',
                'desc' => 'Create or join private networks of trusted partners for exclusive freight and vehicle sharing.',
            ],
            'ecmr' => [
                'title' => 'Digital eCMR',
                'desc' => 'Paperless consignment notes with digital signatures, blockchain verification, and full regulatory compliance.',
            ],
            'invoice' => [
                'title' => 'Invoicing & Payments',
                'desc' => 'Automated invoicing, SEPA/Stripe payments, escrow protection, and invoice factoring for faster cash flow.',
            ],
            'warehouse' => [
                'title' => 'Warehouse Exchange',
                'desc' => 'Find and book warehouse space across Europe. Post available storage capacity and manage bookings.',
            ],
            'carbon' => [
                'title' => 'Carbon Footprint',
                'desc' => 'Calculate CO2 emissions per shipment, track your fleet's environmental impact, and purchase carbon offsets.',
            ],
            'analytics' => [
                'title' => 'Analytics & Reporting',
                'desc' => 'Comprehensive dashboards with order statistics, revenue tracking, performance metrics, and market barometer data.',
            ],
        ];

        // Check if asking about a specific feature
        foreach ($features as $key => $feature) {
            if (str_contains($message, $key)) {
                return [
                    'message' => "**{$feature['title']}**\n\n{$feature['desc']}",
                    'type' => 'text',
                    'suggestions' => [
                        'What other features are available?',
                        'How do I create an order?',
                        'Search for freight',
                    ],
                    'actions' => [
                        ['label' => "Go to {$feature['title']}", 'url' => "/{$key}", 'icon' => 'arrow-right'],
                    ],
                ];
            }
        }

        // General features overview
        $featureList = collect($features)->map(fn ($f) => "• **{$f['title']}** — {$f['desc']}")->implode("\n");

        return [
            'message' => "**LogiMarket** is a comprehensive digital logistics platform for European transport.\n\nHere's what you can do:\n\n{$featureList}\n\nAsk me about any specific feature for more details!",
            'type' => 'text',
            'suggestions' => [
                'Search for freight',
                'Track my shipments',
                'Get a price estimate',
                'Show my orders',
            ],
        ];
    }

    // ─── Handler: Greeting ────────────────────────────────

    private function handleGreeting($user): array
    {
        $hour = now()->hour;
        $greeting = match (true) {
            $hour < 12 => 'Good morning',
            $hour < 17 => 'Good afternoon',
            default => 'Good evening',
        };

        $name = $user->name ?? 'there';

        // Get a quick summary
        $pendingOrders = TransportOrder::forCompany($user->company_id)->where('status', 'pending')->count();
        $activeShipments = Shipment::whereHas('transportOrder', fn ($q) => $q->forCompany($user->company_id))
            ->where('status', 'in_transit')
            ->count();

        $summary = '';
        if ($pendingOrders > 0 || $activeShipments > 0) {
            $summary = "\n\nQuick update:";
            if ($pendingOrders > 0) {
                $summary .= "\n• {$pendingOrders} order(s) awaiting your response";
            }
            if ($activeShipments > 0) {
                $summary .= "\n• {$activeShipments} shipment(s) currently in transit";
            }
        }

        return [
            'message' => "{$greeting}, {$name}! 👋 I'm your LogiMarket assistant. I can help you find freight, check orders, get price estimates, and more.{$summary}",
            'type' => 'text',
            'suggestions' => [
                'Show my orders',
                'Search for freight',
                'Get a price estimate',
                'What can you do?',
            ],
        ];
    }

    // ─── Handler: General (fallback) ──────────────────────

    private function handleGeneral(string $message): array
    {
        return [
            'message' => "I'm not sure I understand that. I can help you with:\n\n"
                . "🚛 **Freight** — Search loads, post freight offers\n"
                . "🚚 **Vehicles** — Find available trucks\n"
                . "📦 **Orders** — Check status, track deliveries\n"
                . "💰 **Pricing** — Get rate estimates for routes\n"
                . "📊 **Analytics** — View your performance data\n"
                . "❓ **Help** — Learn about platform features\n\n"
                . "Try asking something like *\"Find freight from Germany to France\"* or *\"How much from Berlin to Paris?\"*",
            'type' => 'text',
            'suggestions' => [
                'Search for freight',
                'Show my orders',
                'Get a price estimate',
                'What features are available?',
            ],
        ];
    }

    // ─── Helpers ──────────────────────────────────────────

    /**
     * Parse origin/destination locations from natural language.
     */
    private function parseLocations(string $message): array
    {
        $result = [
            'origin_country' => null,
            'origin_city' => null,
            'destination_country' => null,
            'destination_city' => null,
        ];

        // Try to extract "from X to Y" pattern
        if (preg_match('/(?:from|ab|de|von)\s+(.+?)(?:\s+(?:to|nach|à|a)\s+(.+?))?(?:\s*[\?\!\.,$]|$)/i', $message, $matches)) {
            $originText = trim($matches[1]);
            $result = array_merge($result, $this->resolveLocation($originText, 'origin'));

            if (isset($matches[2])) {
                $destText = trim($matches[2]);
                $result = array_merge($result, $this->resolveLocation($destText, 'destination'));
            }
        }
        // Try "to X" pattern if no "from" found
        elseif (preg_match('/(?:to|nach|à)\s+(.+?)(?:\s*[\?\!\.,$]|$)/i', $message, $matches)) {
            $destText = trim($matches[1]);
            $result = array_merge($result, $this->resolveLocation($destText, 'destination'));
        }
        // Try "in X" pattern
        elseif (preg_match('/(?:in|near|around|bei|im)\s+(.+?)(?:\s*[\?\!\.,$]|$)/i', $message, $matches)) {
            $text = trim($matches[1]);
            $result = array_merge($result, $this->resolveLocation($text, 'origin'));
        }

        // Fallback: scan for any country or city name in the full message
        if (!$result['origin_country'] && !$result['destination_country']) {
            $foundLocations = [];
            foreach (self::COUNTRY_MAP as $name => $code) {
                if (str_contains($message, $name)) {
                    $foundLocations[] = $code;
                }
            }
            foreach (self::CITY_MAP as $city => $code) {
                if (str_contains($message, $city)) {
                    if (!in_array($code, $foundLocations)) {
                        $foundLocations[] = $code;
                    }
                    if (!$result['origin_city']) {
                        $result['origin_city'] = ucfirst($city);
                    } elseif (!$result['destination_city']) {
                        $result['destination_city'] = ucfirst($city);
                    }
                }
            }

            if (count($foundLocations) >= 2) {
                $result['origin_country'] = $foundLocations[0];
                $result['destination_country'] = $foundLocations[1];
            } elseif (count($foundLocations) === 1) {
                $result['origin_country'] = $foundLocations[0];
            }
        }

        return $result;
    }

    /**
     * Resolve a text fragment to a country code and optional city.
     */
    private function resolveLocation(string $text, string $prefix): array
    {
        $text = strtolower(trim($text));
        $result = [];

        // Check city map first (more specific)
        foreach (self::CITY_MAP as $city => $code) {
            if (str_contains($text, $city)) {
                $result["{$prefix}_city"] = ucfirst($city);
                $result["{$prefix}_country"] = $code;
                return $result;
            }
        }

        // Check country map
        foreach (self::COUNTRY_MAP as $name => $code) {
            if (str_contains($text, $name)) {
                $result["{$prefix}_country"] = $code;
                return $result;
            }
        }

        // Check if it's a 2-letter country code
        $upper = strtoupper($text);
        if (strlen($upper) === 2 && in_array($upper, array_values(self::COUNTRY_MAP))) {
            $result["{$prefix}_country"] = $upper;
        }

        return $result;
    }

    /**
     * Build a human-readable location description for search results.
     */
    private function buildLocationDescription(?string $originCountry, ?string $originCity, ?string $destCountry, ?string $destCity): string
    {
        $parts = [];

        if ($originCity || $originCountry) {
            $origin = $originCity ?: $this->countryCodeToName($originCountry);
            $parts[] = "from {$origin}";
        }
        if ($destCity || $destCountry) {
            $dest = $destCity ?: $this->countryCodeToName($destCountry);
            $parts[] = "to {$dest}";
        }

        return $parts ? ' ' . implode(' ', $parts) : '';
    }

    /**
     * Convert a country code to a human-readable name.
     */
    private function countryCodeToName(?string $code): string
    {
        if (!$code) return 'Unknown';

        $names = array_flip(array_map('strtoupper', self::COUNTRY_MAP));
        // Get the longest / most common name
        $reversed = [];
        foreach (self::COUNTRY_MAP as $name => $isoCode) {
            if (strtoupper($isoCode) === strtoupper($code)) {
                $reversed[] = $name;
            }
        }

        // Pick the first (English) name
        return $reversed ? ucfirst($reversed[0]) : $code;
    }
}
