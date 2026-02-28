<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TwoFactorController extends Controller
{
    /**
     * Enable 2FA for authenticated user — generates a shared secret
     * and returns QR-code provisioning data.
     *
     * Requires pragmarx/google2fa-laravel:
     *   composer require pragmarx/google2fa-laravel
     *
     * The user table needs:
     *   two_factor_secret  (string, nullable)
     *   two_factor_enabled (boolean, default false)
     */
    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json([
                'message' => 'Two-factor authentication is already enabled.',
            ], 422);
        }

        $google2fa = app('pragmarx.google2fa');

        $secret = $google2fa->generateSecretKey();

        // Store the secret but don't enable 2FA yet — user must verify first
        $user->update(['two_factor_secret' => $secret]);

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return response()->json([
            'message' => 'Scan the QR code with your authenticator app, then verify with a code.',
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
        ]);
    }

    /**
     * Verify a TOTP code to confirm 2FA setup (or authenticate with 2FA).
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'digits:6'],
        ]);

        $user = $request->user();

        if (!$user->two_factor_secret) {
            return response()->json([
                'message' => 'Two-factor authentication has not been initialized. Call enable first.',
            ], 422);
        }

        $google2fa = app('pragmarx.google2fa');

        $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);

        if (!$valid) {
            throw ValidationException::withMessages([
                'code' => ['The provided two-factor code is invalid.'],
            ]);
        }

        if (!$user->two_factor_enabled) {
            $user->update(['two_factor_enabled' => true]);
        }

        return response()->json([
            'message' => 'Two-factor authentication verified successfully.',
            'two_factor_enabled' => true,
        ]);
    }

    /**
     * Disable 2FA for authenticated user (requires password confirmation).
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        $user->update([
            'two_factor_secret' => null,
            'two_factor_enabled' => false,
        ]);

        return response()->json([
            'message' => 'Two-factor authentication has been disabled.',
            'two_factor_enabled' => false,
        ]);
    }
}
