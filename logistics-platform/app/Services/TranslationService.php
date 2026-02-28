<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TranslationService
{
    /**
     * Supported languages for auto-translate.
     */
    public const LANGUAGES = [
        'en' => 'English',
        'de' => 'Deutsch',
        'fr' => 'Français',
        'es' => 'Español',
        'it' => 'Italiano',
        'pl' => 'Polski',
        'ro' => 'Română',
        'nl' => 'Nederlands',
        'pt' => 'Português',
        'cs' => 'Čeština',
        'hu' => 'Magyar',
        'bg' => 'Български',
        'hr' => 'Hrvatski',
        'da' => 'Dansk',
        'et' => 'Eesti',
        'fi' => 'Suomi',
        'el' => 'Ελληνικά',
        'ga' => 'Gaeilge',
        'lv' => 'Latviešu',
        'lt' => 'Lietuvių',
        'mt' => 'Malti',
        'sk' => 'Slovenčina',
        'sl' => 'Slovenščina',
        'sv' => 'Svenska',
    ];

    /**
     * Translate text using LibreTranslate API (self-hosted) or fallback.
     */
    public function translate(string $text, string $targetLang, string $sourceLang = 'auto'): ?string
    {
        if (strlen($text) === 0) return '';
        if ($sourceLang === $targetLang) return $text;

        $cacheKey = 'translation:' . md5($text . $targetLang . $sourceLang);

        return Cache::remember($cacheKey, 86400 * 30, function () use ($text, $targetLang, $sourceLang) {
            // Try LibreTranslate (free, self-hostable)
            $apiUrl = config('services.libretranslate.url', 'https://libretranslate.com');
            $apiKey = config('services.libretranslate.key');

            try {
                $response = Http::timeout(10)->post($apiUrl . '/translate', [
                    'q' => $text,
                    'source' => $sourceLang === 'auto' ? 'auto' : $sourceLang,
                    'target' => $targetLang,
                    'api_key' => $apiKey,
                ]);

                if ($response->successful()) {
                    return $response->json('translatedText');
                }
            } catch (\Exception $e) {
                Log::warning("Translation failed: " . $e->getMessage());
            }

            // Fallback: return original text
            return $text;
        });
    }

    /**
     * Translate a freight/vehicle offer description to a target language.
     */
    public function translateOffer(array $offer, string $targetLang): array
    {
        $fieldsToTranslate = ['description', 'notes', 'special_requirements'];

        foreach ($fieldsToTranslate as $field) {
            if (!empty($offer[$field])) {
                $offer[$field . '_translated'] = $this->translate($offer[$field], $targetLang);
                $offer['translated_to'] = $targetLang;
            }
        }

        return $offer;
    }

    /**
     * Bulk translate multiple texts.
     */
    public function translateBulk(array $texts, string $targetLang, string $sourceLang = 'auto'): array
    {
        $results = [];
        foreach ($texts as $key => $text) {
            $results[$key] = $this->translate($text, $targetLang, $sourceLang);
        }
        return $results;
    }

    /**
     * Detect language of text.
     */
    public function detectLanguage(string $text): ?string
    {
        $apiUrl = config('services.libretranslate.url', 'https://libretranslate.com');
        $apiKey = config('services.libretranslate.key');

        try {
            $response = Http::timeout(5)->post($apiUrl . '/detect', [
                'q' => $text,
                'api_key' => $apiKey,
            ]);

            if ($response->successful()) {
                $detections = $response->json();
                if (!empty($detections) && $detections[0]['confidence'] > 50) {
                    return $detections[0]['language'];
                }
            }
        } catch (\Exception $e) {
            Log::warning("Language detection failed: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Get list of supported languages.
     */
    public function getSupportedLanguages(): array
    {
        return self::LANGUAGES;
    }
}
