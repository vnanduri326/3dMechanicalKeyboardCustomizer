import { Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchProducts(
  type?: string,
  tags?: string[],
  search?: string
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (search) params.append('search', search);
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