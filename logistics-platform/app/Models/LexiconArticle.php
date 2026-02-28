<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LexiconArticle extends Model
{
    protected $fillable = [
        'slug', 'title', 'excerpt', 'content', 'category', 'tags',
        'language', 'translations', 'view_count', 'is_published', 'author_id',
    ];

    protected $casts = [
        'tags' => 'array',
        'translations' => 'array',
        'is_published' => 'boolean',
    ];

    public function author() { return $this->belongsTo(User::class, 'author_id'); }

    public function scopePublished($q) { return $q->where('is_published', true); }
    public function scopeInCategory($q, $cat) { return $q->where('category', $cat); }
    public function scopeInLanguage($q, $lang) { return $q->where('language', $lang); }
    public function scopeSearch($q, $term)
    {
        return $q->where(function ($q2) use ($term) {
            $q2->where('title', 'like', "%{$term}%")
               ->orWhere('excerpt', 'like', "%{$term}%")
               ->orWhere('content', 'like', "%{$term}%");
        });
    }

    public function incrementViews(): void
    {
        $this->increment('view_count');
    }

    public static function getCategories(): array
    {
        return [
            'general' => 'General Logistics',
            'legal' => 'Legal & Regulatory',
            'customs' => 'Customs & Trade',
            'hazardous' => 'Hazardous Goods (ADR)',
            'intermodal' => 'Intermodal Transport',
            'technology' => 'Technology & Digital',
            'sustainability' => 'Sustainability & Green',
            'insurance' => 'Insurance & Risk',
            'finance' => 'Finance & Payments',
        ];
    }
}
