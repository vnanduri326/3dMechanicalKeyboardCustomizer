import React from 'react';
import type { Product } from '../types';

interface FilteredCatalogListProps {
  products: Product[];
  limit?: number;
}

export const FilteredCatalogList: React.FC<FilteredCatalogListProps> = ({ products, limit = 8 }) => (
  <section className="kc-filter-section kc-catalog-results" aria-labelledby="kc-filtered-catalog-title">
    <h3 id="kc-filtered-catalog-title">Filtered catalog</h3>
    {products.length === 0 ? (
      <p className="kc-catalog-empty">No products match these filters.</p>
    ) : (
      <ul>
        {products.slice(0, limit).map((product) => (
          <li key={product.id}>
            <span>{product.canonical_name}</span>
            {product.min_price != null && <span>${product.min_price}</span>}
            {product.source_url && (
              <a href={product.source_url} target="_blank" rel="noreferrer">
                View
              </a>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
);