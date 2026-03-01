<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class AuditController extends Controller
{
    /**
     * List audit log entries for the authenticated user's company.
     * GDPR Art. 30 — Records of processing activities.
     */
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $query = Activity::query()
            ->where(function ($q) use ($companyId, $request) {
                // Activities caused by company members
                $q->where('causer_type', 'App\\Models\\User')
                    ->whereIn('causer_id', function ($sub) use ($companyId) {
                        $sub->select('id')
                            ->from('users')
                            ->where('company_id', $companyId);
                    });
            })
            ->orderByDesc('created_at');

        // Filter by log name
        if ($request->has('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        $activities = $query->with('causer:id,name,email')->paginate(50);

        return response()->json($activities);
    }

    /**
     * Export audit logs as JSON for GDPR data portability (Art. 20).
     */
    public function export(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $activities = Activity::query()
            ->where('causer_type', 'App\\Models\\User')
            ->where('causer_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($a) => [
                'date' => $a->created_at->toISOString(),
                'action' => $a->description,
                'log' => $a->log_name,
                'properties' => $a->properties,
            ]);

        return response()->json([
            'user' => $request->user()->only(['id', 'name', 'email']),
            'exported_at' => now()->toISOString(),
            'activities' => $activities,
        ]);
    }

    /**
     * Get summary statistics of audit log activity.
     */
    public function summary(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $companyUserIds = \App\Models\User::where('company_id', $companyId)->pluck('id');

        $stats = Activity::query()
            ->where('causer_type', 'App\\Models\\User')
            ->whereIn('causer_id', $companyUserIds)
            ->selectRaw('log_name, event, COUNT(*) as count')
            ->groupBy('log_name', 'event')
            ->get();

        $recentActivity = Activity::query()
            ->where('causer_type', 'App\\Models\\User')
            ->whereIn('causer_id', $companyUserIds)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return response()->json([
            'breakdown' => $stats,
            'last_7_days' => $recentActivity,
            'total' => Activity::whereIn('causer_id', $companyUserIds)->count(),
        ]);
    }
}
