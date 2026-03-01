<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhiteLabel;
use App\Models\ApiKey;
use App\Models\ApiUsageLog;
use App\Models\ErpIntegration;
use App\Models\EdiMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EnterpriseController extends Controller
{
    // ── White Label ──────────────────────────────

    public function getWhiteLabel(Request $request): JsonResponse
    {
        $config = WhiteLabel::where('company_id', $request->user()->company_id)->first();
        return response()->json(['data' => $config]);
    }

    public function saveWhiteLabel(Request $request): JsonResponse
    {
        $request->validate([
            'subdomain' => 'required|string|max:50|alpha_dash',
            'brand_name' => 'required|string|max:255',
            'brand_colors' => 'nullable|array',
            'logo_url' => 'nullable|url',
            'support_email' => 'nullable|email',
        ]);

        $config = WhiteLabel::updateOrCreate(
            ['company_id' => $request->user()->company_id],
            array_merge($request->all(), ['is_active' => true])
        );

        return response()->json(['message' => 'White-label config saved.', 'data' => $config]);
    }

    // ── API Keys ─────────────────────────────────

    public function listApiKeys(Request $request): JsonResponse
    {
        $keys = ApiKey::where('company_id', $request->user()->company_id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'name' => $k->name,
                'key_prefix' => $k->key_prefix . '...',
                'permissions' => $k->permissions,
                'requests_today' => $k->requests_today,
                'requests_total' => $k->requests_total,
                'last_used_at' => $k->last_used_at,
                'is_active' => $k->is_active,
                'created_at' => $k->created_at,
            ]);

        return response()->json(['data' => $keys]);
    }

    public function createApiKey(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
            'rate_limits' => 'nullable|array',
        ]);

        $keyData = ApiKey::generateKey();

        $apiKey = ApiKey::create([
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
            'name' => $request->input('name'),
            'key_hash' => $keyData['hash'],
            'key_prefix' => $keyData['prefix'],
            'permissions' => $request->input('permissions', ['read']),
            'rate_limits' => $request->input('rate_limits', ['requests_per_minute' => 60, 'requests_per_day' => 10000]),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'API key created. Save this key — it won\'t be shown again.',
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key' => $keyData['key'], // Only shown once
                'permissions' => $apiKey->permissions,
            ],
        ], 201);
    }

    public function revokeApiKey(ApiKey $apiKey): JsonResponse
    {
        $apiKey->update(['is_active' => false]);
        return response()->json(['message' => 'API key revoked.']);
    }

    public function apiUsageStats(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $totalRequests = ApiUsageLog::where('company_id', $companyId)->count();
        $todayRequests = ApiUsageLog::where('company_id', $companyId)->whereDate('created_at', today())->count();
        $avgResponseTime = ApiUsageLog::where('company_id', $companyId)
            ->where('created_at', '>=', now()->subDays(7))
            ->avg('response_time_ms');

        $byEndpoint = ApiUsageLog::where('company_id', $companyId)
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('endpoint, COUNT(*) as count, AVG(response_time_ms) as avg_time')
            ->groupBy('endpoint')
            ->orderByDesc('count')
            ->limit(20)
            ->get();

        return response()->json([
            'data' => [
                'total_requests' => $totalRequests,
                'today_requests' => $todayRequests,
                'avg_response_time_ms' => round($avgResponseTime ?? 0),
                'by_endpoint' => $byEndpoint,
            ],
        ]);
    }

    // ── ERP Integration ──────────────────────────

    public function listIntegrations(Request $request): JsonResponse
    {
        $integrations = ErpIntegration::where('company_id', $request->user()->company_id)
            ->withCount('ediMessages')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $integrations]);
    }

    public function createIntegration(Request $request): JsonResponse
    {
        $request->validate([
            'integration_type' => 'required|in:sap,oracle,microsoft_dynamics,custom_tms,wms,other',
            'name' => 'required|string|max:255',
            'connection_config' => 'nullable|array',
            'field_mappings' => 'nullable|array',
            'sync_direction' => 'nullable|in:inbound,outbound,bidirectional',
        ]);

        $integration = ErpIntegration::create(array_merge($request->all(), [
            'company_id' => $request->user()->company_id,
            'is_active' => false,
        ]));

        return response()->json(['message' => 'Integration created.', 'data' => $integration], 201);
    }

    public function toggleIntegration(ErpIntegration $integration): JsonResponse
    {
        $integration->update(['is_active' => !$integration->is_active]);
        $status = $integration->is_active ? 'activated' : 'deactivated';
        return response()->json(['message' => "Integration {$status}.", 'data' => $integration]);
    }

    public function syncIntegration(ErpIntegration $integration): JsonResponse
    {
        // Simulated sync
        $integration->update([
            'last_sync_at' => now(),
            'sync_success_count' => $integration->sync_success_count + rand(5, 50),
        ]);

        return response()->json(['message' => 'Sync completed.', 'data' => $integration->fresh()]);
    }

    // ── EDI ──────────────────────────────────────

    public function listEdiMessages(Request $request): JsonResponse
    {
        $messages = EdiMessage::where('company_id', $request->user()->company_id)
            ->with(['erpIntegration:id,name,provider', 'transportOrder:id,order_number'])
            ->when($request->input('direction'), fn($q, $d) => $q->where('direction', $d))
            ->when($request->input('type'), fn($q, $t) => $q->where('message_type', $t))
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($messages);
    }

    public function sendEdiMessage(Request $request): JsonResponse
    {
        $request->validate([
            'message_type' => 'required|in:IFTMIN,IFTSTA,INVOIC,DESADV,ORDERS',
            'format' => 'required|in:EDIFACT,XML,JSON,CSV',
            'content' => 'required|string',
            'transport_order_id' => 'nullable|exists:transport_orders,id',
        ]);

        $message = EdiMessage::create([
            'company_id' => $request->user()->company_id,
            'message_type' => $request->input('message_type'),
            'message_reference' => 'EDI-' . strtoupper(substr(md5(uniqid()), 0, 10)),
            'direction' => 'outbound',
            'format' => $request->input('format'),
            'raw_content' => $request->input('content'),
            'is_valid' => true,
            'status' => 'validated',
            'transport_order_id' => $request->input('transport_order_id'),
        ]);

        return response()->json(['message' => 'EDI message sent.', 'data' => $message], 201);
    }

    public function ediStats(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        return response()->json([
            'data' => [
                'total_messages' => EdiMessage::where('company_id', $companyId)->count(),
                'inbound' => EdiMessage::where('company_id', $companyId)->inbound()->count(),
                'outbound' => EdiMessage::where('company_id', $companyId)->outbound()->count(),
                'failed' => EdiMessage::where('company_id', $companyId)->where('status', 'failed')->count(),
                'by_type' => EdiMessage::where('company_id', $companyId)
                    ->selectRaw('message_type, COUNT(*) as count')
                    ->groupBy('message_type')
                    ->get(),
            ],
        ]);
    }
}
