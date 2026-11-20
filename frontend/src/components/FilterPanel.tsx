import React from 'react';
import { FILTER_SUBCATEGORIES, type CatalogSubfilterKey } from '../catalogSubfilters';
import { CatalogFilters, Product } from '../types';
import { FilteredCatalogList } from './FilteredCatalogList';

const SUBFILTER_FIELDS: Record<
  CatalogSubfilterKey,
  { parent: keyof CatalogFilters; selected: keyof CatalogFilters }
> = {
  keycaps: { parent: 'keycaps', selected: 'keycapProfiles' },
  switches: { parent: 'switches', selected: 'switchTypes' },
  pcbPlates: { parent: 'pcbPlates', selected: 'plateMaterials' },
  cases: { parent: 'cases', selected: 'caseSizes' },
};

function toggleSubfilter(
  filters: CatalogFilters,
  selectedKey: 'keycapProfiles' | 'switchTypes' | 'plateMaterials' | 'caseSizes',
  option: string,
  checked: boolean,
): string[] {
  const current = filters[selectedKey];
  return checked ? [...current, option] : current.filter((value) => value !== option);
}

interface FilterPanelProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  catalogProducts: Product[];
  recommendationsLoading: boolean;
  recommendationError: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  catalogProducts,
  recommendationsLoading,
  recommendationError,
}) => {
  const setFilter = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="kc-filter-body">
      <div className="kc-filter-preview">
        <img src="/3D%20logo.png" alt="3D Mechanical Keyboard Customizer" />
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
        {(Object.keys(FILTER_SUBCATEGORIES) as CatalogSubfilterKey[]).map((groupKey) => {
          const { parent, selected } = SUBFILTER_FIELDS[groupKey];
          const parentOn = Boolean(filters[parent]);
          const label =
            groupKey === 'keycaps'
              ? 'Keycaps'
              : groupKey === 'switches'
                ? 'Switches'
                : groupKey === 'pcbPlates'
                  ? 'PCB/Plates'
                  : 'Cases';
          const selectedKey = selected as 'keycapProfiles' | 'switchTypes' | 'plateMaterials' | 'caseSizes';
          const selectedValues = filters[selectedKey];

          return (
            <React.Fragment key={groupKey}>
              <label className="kc-filter-option">
                <input
                  type="checkbox"
                  checked={parentOn}
                  onChange={(event) => setFilter(parent, event.target.checked)}
                />
                <span>{label}</span>
              </label>
              {parentOn && (
                <div className="kc-filter-subgroup" role="group" aria-label={`${label} subcategories`}>
                  {FILTER_SUBCATEGORIES[groupKey].map((option) => (
                    <label key={option} className="kc-filter-option kc-filter-nested">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={(event) => {
                          onFiltersChange({
                            ...filters,
                            [selectedKey]: toggleSubfilter(filters, selectedKey, option, event.target.checked),
                          });
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </fieldset>

      {recommendationsLoading && <p className="kc-recommend-loading" role="status">Finding closest parts...</p>}
      {recommendationError && <p className="kc-recommend-error" role="alert">{recommendationError}</p>}
      <FilteredCatalogList products={catalogProducts} />
    </div>
  );
};
