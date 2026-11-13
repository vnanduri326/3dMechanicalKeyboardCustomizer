import React from 'react';
import { CatalogFilters } from '../types';

interface FilterPanelProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  canRecommend: boolean;
  onRecommend: (event: React.FormEvent<HTMLFormElement>) => void;
  recommendationsLoading: boolean;
  recommendationError: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  canRecommend,
  onRecommend,
  recommendationsLoading,
  recommendationError,
}) => {
  const setFilter = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="kc-filter-body">
      <div className="kc-filter-preview" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100" y2="100" />
          <line x1="100" y1="0" x2="0" y2="100" />
        </svg>
      </div>
      <label className="kc-search-field">
        <span className="kc-sr-only">Search products</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="7.2" />
          <path d="m16.2 16.2 5 5" />
        </svg>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => setFilter('search', event.target.value)}
          placeholder="Search products"
        />
      </label>

      <section className="kc-filter-section" aria-labelledby="kc-price-title">
        <h3 id="kc-price-title">Price</h3>
        <input
          className="kc-price-range"
          type="range"
          min={25}
          max={125}
          step={25}
          value={filters.maxPrice}
          onChange={(event) => setFilter('maxPrice', Number(event.target.value))}
          aria-label="Maximum product price"
          aria-valuetext={filters.maxPrice === 125 ? '$125 and up' : `Up to $${filters.maxPrice}`}
        />
        <div className="kc-price-scale" aria-hidden="true">
          {[25, 50, 75, 100, 125].map((price) => (
            <span key={price}>${price}{price === 125 ? '+' : ''}</span>
          ))}
        </div>
      </section>

      <fieldset className="kc-filter-section kc-category-filters">
        <legend>Category</legend>
        <label className="kc-filter-option">
          <input
            type="checkbox"
            checked={filters.keycaps}
            onChange={(event) => setFilter('keycaps', event.target.checked)}
          />
          <span>Keycaps</span>
        </label>
        {filters.keycaps && (
          <label className="kc-filter-option kc-filter-nested">
            <input
              type="checkbox"
              checked={filters.oemProfile}
              onChange={(event) => setFilter('oemProfile', event.target.checked)}
            />
            <span>OEM profile</span>
          </label>
        )}
        <label className="kc-filter-option">
          <input
            type="checkbox"
            checked={filters.switches}
            onChange={(event) => setFilter('switches', event.target.checked)}
          />
          <span>Switches</span>
        </label>
        <label className="kc-filter-option">
          <input
            type="checkbox"
            checked={filters.pcbPlates}
            onChange={(event) => setFilter('pcbPlates', event.target.checked)}
          />
          <span>PCB/Plates</span>
        </label>
        <label className="kc-filter-option">
          <input
            type="checkbox"
            checked={filters.cases}
            onChange={(event) => setFilter('cases', event.target.checked)}
          />
          <span>Cases</span>
        </label>
      </fieldset>

      <form className="kc-recommend-form" onSubmit={onRecommend}>
        <button type="submit" disabled={!canRecommend || recommendationsLoading}>
          {recommendationsLoading ? 'Finding parts...' : 'Find closest parts'}
        </button>
        {recommendationError && <p className="kc-recommend-error" role="alert">{recommendationError}</p>}
      </form>
    </div>
  );
};
