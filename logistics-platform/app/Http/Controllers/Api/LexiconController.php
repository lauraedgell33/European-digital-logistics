<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LexiconArticle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LexiconController extends Controller
{
    /**
     * List articles with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LexiconArticle::where('is_published', true);

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->language) {
            $query->where('language', $request->language);
        }

        if ($request->tag) {
            $query->whereJsonContains('tags', $request->tag);
        }

        if ($request->search) {
            $query->search($request->search);
        }

        $articles = $query->select('id', 'slug', 'title', 'excerpt', 'category', 'tags', 'language', 'view_count', 'published_at')
            ->orderBy('title')
            ->paginate($request->input('per_page', 20));

        return response()->json($articles);
    }

    /**
     * Get a single article by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $article = LexiconArticle::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $article->recordView();

        return response()->json([
            'data' => $article,
            'related' => LexiconArticle::where('category', $article->category)
                ->where('id', '!=', $article->id)
                ->where('is_published', true)
                ->limit(5)
                ->get(['id', 'slug', 'title', 'excerpt', 'category']),
        ]);
    }

    /**
     * Get all categories with article counts.
     */
    public function categories(): JsonResponse
    {
        $categories = LexiconArticle::where('is_published', true)
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * Popular articles.
     */
    public function popular(Request $request): JsonResponse
    {
        $articles = LexiconArticle::where('is_published', true)
            ->orderByDesc('view_count')
            ->limit($request->input('limit', 10))
            ->get(['id', 'slug', 'title', 'excerpt', 'category', 'view_count']);

        return response()->json(['data' => $articles]);
    }

    /**
     * Admin: Create article.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'slug' => 'required|string|unique:lexicon_articles,slug',
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'category' => 'required|string',
            'tags' => 'nullable|array',
            'language' => 'nullable|string|max:5',
            'translations' => 'nullable|array',
            'is_published' => 'boolean',
        ]);

        if ($data['is_published'] ?? false) {
            $data['published_at'] = now();
        }

        $article = LexiconArticle::create($data);

        return response()->json(['message' => 'Article created.', 'data' => $article], 201);
    }

    /**
     * Admin: Update article.
     */
    public function update(Request $request, LexiconArticle $article): JsonResponse
    {
        $data = $request->validate([
            'slug' => 'nullable|string|unique:lexicon_articles,slug,' . $article->id,
            'title' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'nullable|string',
            'category' => 'nullable|string',
            'tags' => 'nullable|array',
            'language' => 'nullable|string|max:5',
            'translations' => 'nullable|array',
            'is_published' => 'boolean',
        ]);

        if (isset($data['is_published']) && $data['is_published'] && !$article->is_published) {
            $data['published_at'] = now();
        }

        $article->update($data);

        return response()->json(['message' => 'Article updated.', 'data' => $article]);
    }

    /**
     * Admin: Delete article.
     */
    public function destroy(LexiconArticle $article): JsonResponse
    {
        $article->delete();
        return response()->json(['message' => 'Article deleted.']);
    }
}
