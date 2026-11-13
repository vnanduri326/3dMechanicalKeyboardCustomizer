import {
  PartRecommendation,
  Product,
  RecommendationOptions,
  RecommendationPreferences,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchProducts(
  type?: string,
  tags?: string[],
  search?: string,
  limit = 20
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (search) params.append('search', search);
  params.append('limit', String(limit));
  if (tags) {
    tags.forEach((tag) => params.append('tags', tag));
  }

  const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  return data.items || data;
}

export async function fetchRecommendationOptions(): Promise<RecommendationOptions> {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/options`);
  if (!response.ok) {
    throw new Error('Failed to load recommendation options');
  }
  return response.json();
}

export async function fetchRecommendations(
  preferences: RecommendationPreferences
): Promise<PartRecommendation[]> {
  const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw new Error(body?.detail || 'Failed to recommend parts');
  }

  const data = await response.json();
  return data.items;
}