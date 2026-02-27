<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Fields that may contain intentional HTML (rich-text content).
     */
    protected array $except = [
        'description',
        'content',
        'notes',
        'terms_conditions',
        'special_instructions',
    ];

    /**
     * Sanitize string inputs: strip tags, trim, normalize unicode.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        $request->merge($this->sanitize($input));

        return $next($request);
    }

    /**
     * Recursively sanitize the input array.
     */
    protected function sanitize(array $data, string $prefix = ''): array
    {
        foreach ($data as $key => $value) {
            $fullKey = $prefix ? "{$prefix}.{$key}" : $key;

            if (is_array($value)) {
                $data[$key] = $this->sanitize($value, $fullKey);
            } elseif (is_string($value)) {
                $data[$key] = $this->sanitizeString($value, $key);
            }
        }

        return $data;
    }

    /**
     * Clean a single string value.
     */
    protected function sanitizeString(string $value, string $key): string
    {
        // Always trim whitespace
        $value = trim($value);

        // Normalize unicode (NFC — canonical decomposition then composition)
        if (function_exists('normalizer_normalize')) {
            $normalized = \Normalizer::normalize($value, \Normalizer::FORM_C);
            if ($normalized !== false) {
                $value = $normalized;
            }
        }

        // Strip HTML tags unless the field is explicitly allowed
        if (! in_array($key, $this->except, true)) {
            $value = strip_tags($value);
        }

        return $value;
    }
}
