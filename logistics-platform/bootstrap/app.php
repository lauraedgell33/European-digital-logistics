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
        ]);

        // Security headers on every response (web + api)
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // API-specific middleware stack
        $middleware->appendToGroup('api', [
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
            $context = [
                'url' => request()?->fullUrl(),
                'ip'  => request()?->ip(),
            ];

            if ($user = request()?->user()) {
                $context['user_id']    = $user->id;
                $context['user_email'] = $user->email;
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

                return response()->json([
                    'message' => $status === 500
                        ? 'An unexpected error occurred.'
                        : $e->getMessage(),
                ], $status);
            }
        });
    })->create();
