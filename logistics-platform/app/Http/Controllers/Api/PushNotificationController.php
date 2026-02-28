<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PushNotificationController extends Controller
{
    /**
     * Subscribe a device for push notifications
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|url',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        DB::table('push_subscriptions')->updateOrInsert(
            [
                'user_id' => $request->user()->id,
                'endpoint' => $validated['endpoint'],
            ],
            [
                'p256dh_key' => $validated['keys']['p256dh'],
                'auth_token' => $validated['keys']['auth'],
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return response()->json(['message' => 'Push subscription registered'], 201);
    }

    /**
     * Unsubscribe a device from push notifications
     */
    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|url',
        ]);

        DB::table('push_subscriptions')
            ->where('user_id', $request->user()->id)
            ->where('endpoint', $validated['endpoint'])
            ->delete();

        return response()->json(['message' => 'Push subscription removed']);
    }

    /**
     * Send a test push notification to current user
     */
    public function sendTest(Request $request)
    {
        $subscriptions = DB::table('push_subscriptions')
            ->where('user_id', $request->user()->id)
            ->get();

        if ($subscriptions->isEmpty()) {
            return response()->json(['message' => 'No push subscriptions found'], 404);
        }

        // In production, use web-push library to send actual notifications
        // For now, return success with subscription count
        return response()->json([
            'message' => 'Test notification queued',
            'subscriptions_count' => $subscriptions->count(),
        ]);
    }
}
