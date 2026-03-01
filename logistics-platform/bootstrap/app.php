<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Token-based API auth — no stateful/CSRF needed

        $middleware->alias([
            'gdpr.audit' => \App\Http\Middleware\GdprAuditLog::class,
            'rate.limit' => \App\Http\Middleware\RateLimitMiddleware::class,
            'cache.response' => \App\Http\Middleware\CacheResponse::class,
            'tenant.resolve' => \App\Http\Middleware\ResolveTenant::class,
            'tenant.feature' => \App\Http\Middleware\CheckTenantFeature::class,
            'tenant.limit' => \App\Http\Middleware\EnforceTenantLimit::class,
        ]);

        // Security headers on every response (web + api)
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // API-specific middleware stack
        $middleware->appendToGroup('api', [
            \App\Http\Middleware\TrackPerformance::class,
            \App\Http\Middleware\SanitizeInput::class,
            \App\Http\Middleware\RateLimitMiddleware::class,
            \App\Http\Middleware\GdprAuditLog::class,
        ]);

        // Web-specific middleware stack
        $middleware->appendToGroup('web', [
            \App\Http\Middleware\SanitizeInput::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Don't report common client/routing exceptions
        $exceptions->dontReport([
            \Illuminate\Validation\ValidationException::class,
            \Illuminate\Auth\AuthenticationException::class,
            \Illuminate\Database\Eloquent\ModelNotFoundException::class,
            \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        ]);

        // Enrich every reported exception with contextual information
        $exceptions->context(function (\Throwable $e) {
            $context = [];

            if (app()->runningInConsole()) {
                return $context;
            }

            try {
                $req = request();
                $context['url'] = $req->fullUrl();
                $context['ip']  = $req->ip();

                if ($user = $req->user()) {
                    $context['user_id']    = $user->id;
                    $context['user_email'] = $user->email;
                }
            } catch (\Throwable) {
                // request not available
            }

            return $context;
        });

        // Report to Sentry when configured
        $exceptions->reportable(function (\Throwable $e) {
            if (app()->bound('sentry') && app()->environment('production')) {
                app('sentry')->captureException($e);
            }
        });

        // Custom JSON responses for API requests
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Resource not found.',
                ], 404);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Endpoint not found.',
                ], 404);
            }
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                $msg = $status === 500
                    ? (config('app.debug') ? $e->getMessage() : 'An unexpected error occurred.')
                    : $e->getMessage();

                $response = ['message' => $msg];

                if (config('app.debug') && $status === 500) {
                    $response['exception'] = get_class($e);
                    $response['file'] = $e->getFile() . ':' . $e->getLine();
                    $response['trace'] = array_slice(
                        array_map(fn($t) => ($t['file'] ?? '') . ':' . ($t['line'] ?? '') . ' ' . ($t['class'] ?? '') . ($t['type'] ?? '') . ($t['function'] ?? ''), $e->getTrace()),
                        0, 10
                    );
                }

                return response()->json($response, $status);
            }
        });
    })->create();
