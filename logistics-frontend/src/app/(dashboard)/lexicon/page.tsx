'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { lexiconApi } from '@/lib/api';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TagIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import type { LexiconArticle } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  transport_modes: 'Transport Modes',
  vehicle_types: 'Vehicle Types',
  documents: 'Documents',
  regulations: 'Regulations',
  incoterms: 'Incoterms',
  packaging: 'Packaging',
  customs: 'Customs',
  insurance: 'Insurance',
  technology: 'Technology',
};

export default function LexiconPage() {
  const [articles, setArticles] = useState<LexiconArticle[]>([]);
  const [popular, setPopular] = useState<LexiconArticle[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<LexiconArticle | null>(null);
  const [articleDetail, setArticleDetail] = useState<LexiconArticle | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [category]);

  async function loadData() {
    try {
      const [articlesRes, popularRes, categoriesRes] = await Promise.all([
        lexiconApi.list(),
        lexiconApi.popular(),
        lexiconApi.categories(),
      ]);
      setArticles(articlesRes.data.data || []);
      setPopular(popularRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function loadArticles() {
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (search) params.search = search;
      const res = await lexiconApi.list(params);
      setArticles(res.data.data || []);
    } catch {
      // fallback
    }
  }

  async function viewArticle(article: LexiconArticle) {
    setSelectedArticle(article);
    try {
      const res = await lexiconApi.show(article.slug);
      setArticleDetail(res.data.data);
    } catch {
      setArticleDetail(article);
    }
  }

  function handleSearch() {
    loadArticles();
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
          ))}
        </div>
      </div>
    );
  }

  // Detail View
  if (selectedArticle && articleDetail) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Button variant="secondary" size="sm" onClick={() => { setSelectedArticle(null); setArticleDetail(null); }}>
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Lexicon
        </Button>

        <div>
          <div className="flex items-center gap-2 mb-2">
            {articleDetail.category && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'var(--ds-blue-200)', color: 'var(--ds-blue-900)' }}
              >
                {CATEGORY_LABELS[articleDetail.category] || articleDetail.category}
              </span>
            )}
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ds-gray-700)' }}>
              <EyeIcon className="h-3 w-3" /> {articleDetail.view_count || 0} views
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{articleDetail.title}</h1>
          {articleDetail.excerpt && (
            <p className="text-sm mt-2" style={{ color: 'var(--ds-gray-700)' }}>{articleDetail.excerpt}</p>
          )}
        </div>

        <Card>
          <div className="p-6">
            <div
              className="prose prose-sm max-w-none"
              style={{ color: 'var(--ds-gray-900)' }}
              dangerouslySetInnerHTML={{ __html: articleDetail.content_html || articleDetail.content || '' }}
            />
          </div>
        </Card>

        {articleDetail.tags && articleDetail.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
            {articleDetail.tags.map(tag => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--ds-gray-200)', color: 'var(--ds-gray-900)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {articleDetail.related_articles && articleDetail.related_articles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ds-gray-1000)' }}>Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {articleDetail.related_articles.map((ra: LexiconArticle) => (
                <Card key={ra.id}>
                  <div
                    className="p-3 cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => viewArticle(ra)}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--ds-gray-1000)' }}>{ra.title}</p>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--ds-gray-700)' }}>{ra.excerpt}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
          <BookOpenIcon className="inline h-7 w-7 mr-2" />
          Transport Lexicon
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
          Knowledge base for transport & logistics terminology
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} variant="secondary">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </Button>
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.category} value={c.category}>
              {CATEGORY_LABELS[c.category] || c.category} ({c.count})
            </option>
          ))}
        </Select>
      </div>

      {/* Popular Articles */}
      {!category && !search && popular.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--ds-gray-1000)' }}>Popular Articles</h2>
          <div className="flex gap-2 flex-wrap">
            {popular.slice(0, 5).map(article => (
              <Button
                key={article.id}
                variant="secondary"
                size="sm"
                onClick={() => viewArticle(article)}
              >
                {article.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map(article => (
          <Card key={article.id}>
            <div
              className="p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => viewArticle(article)}
            >
              <div className="flex items-center gap-2">
                {article.category && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--ds-blue-200)', color: 'var(--ds-blue-900)' }}
                  >
                    {CATEGORY_LABELS[article.category] || article.category}
                  </span>
                )}
                <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--ds-gray-700)' }}>
                  <EyeIcon className="h-3 w-3" /> {article.view_count || 0}
                </span>
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-xs line-clamp-3" style={{ color: 'var(--ds-gray-700)' }}>{article.excerpt}</p>
              )}
              {article.tags && article.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {article.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] px-1 py-0.5 rounded"
                      style={{ background: 'var(--ds-gray-200)', color: 'var(--ds-gray-700)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
          No articles found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
}
