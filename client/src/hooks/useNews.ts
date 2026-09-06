import { useState, useEffect, useCallback } from 'react';
import { Article, CategoryId } from '../types/news';

export function useNews(initialCategory: CategoryId = 'all') {
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [articles, setArticles] = useState<Article[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Fetch trending keywords
  useEffect(() => {
    fetch('/api/news/trending')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.trending) {
          setTrending(data.trending);
        }
      })
      .catch((err) => console.warn('Trending fetch error:', err));
  }, []);

  // Fetch news feed based on category or search
  const fetchNews = useCallback(async (cat: CategoryId, query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/news?category=${cat}&limit=35`;
      if (query.trim()) {
        url = `/api/news/search?q=${encodeURIComponent(query.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.articles) {
        setArticles(data.articles);
      } else {
        setArticles([]);
      }
    } catch (err: any) {
      console.error('Fetch news error:', err);
      setError('Unable to load articles.');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(category, searchQuery);
  }, [category, searchQuery, fetchNews]);

  const selectCategory = (newCat: CategoryId) => {
    setSearchQuery('');
    setCategory(newCat);
  };

  const search = (query: string) => {
    setSearchQuery(query);
  };

  const refresh = () => {
    fetchNews(category, searchQuery);
  };

  return {
    category,
    articles,
    trending,
    isLoading,
    searchQuery,
    error,
    selectCategory,
    search,
    refresh,
  };
}
