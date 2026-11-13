// frontend/src/App.tsx
import React, { useEffect, useState } from 'react';
import './styles/customizer.css';
import {
  CatalogFilters,
  PartRecommendation,
  Product,
  PreferenceSelection,
  RecommendationPreferences,
} from './types';
import { fetchProducts, fetchRecommendations } from './services/api';
import { PLATE_CATEGORY, PREFERENCE_CATEGORIES, PreferenceCategoryKey} from './categories.ts';
import { FilterPanel } from './components/FilterPanel';
import {CartPanel} from './components/CartPanel.tsx';
import {LeftPanel, LeftMode} from './components/LeftPanel.tsx';
import {PreferenceCarouselRow} from './components/PreferenceCarouselRow';
import {CarouselRow} from './components/CarouselRow';
import {InfoPanel} from './components/InfoPanel.tsx';
import {InfoIcon} from './icons.tsx';

type ByCategory<T> = Record<PreferenceCategoryKey, T>;
const zeroes = (): ByCategory<number> => ({size: 0, switch: 0, keycap: 0});
const emptyPreferences = (): RecommendationPreferences => ({
  keycap: '',
  switch: '',
  plate: '',
  size: '',
});
const initialCatalogFilters: CatalogFilters = {
  search: '',
  maxPrice: 125,
  keycaps: true,
  oemProfile: false,
  switches: true,
  pcbPlates: true,
  cases: false,
};

export default function App() {
  const [centered, setCentered] = useState<ByCategory<number>>(zeroes);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [plateIndex, setPlateIndex] = useState(0);
  const [plateError, setPlateError] = useState('');
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>(initialCatalogFilters);
  const [selection, setSelection] = useState<PreferenceSelection>({});
  const [leftMode, setLeftMode] = useState<LeftMode>('filters');
  const [leftOpen, setLeftOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);
  const [preferences, setPreferences] = useState<RecommendationPreferences>(emptyPreferences);
  const [recommendations, setRecommendations] = useState<PartRecommendation[] | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchProducts('keycap', undefined, undefined, 100),
      fetchProducts('switch', undefined, undefined, 100),
      fetchProducts('pcb_plate', undefined, undefined, 100),
      fetchProducts('other', undefined, undefined, 100),
    ])
      .then((products) => setCatalogProducts(products.flat()))
      .catch((error: unknown) => {
        setPlateError(error instanceof Error ? error.message : 'Failed to load catalog products');
      });
  }, []);

  const filteredCatalog = catalogProducts.filter((product) => {
    const type = product.type.toLowerCase();
    const productText = [
      product.canonical_name,
      product.brand,
      product.product_type_raw,
      ...product.tags,
    ].join(' ').toLowerCase();
    const isKeycap = type === 'keycap' || type === 'keycaps';
    const isSwitch = type === 'switch';
    const isPlate = type === 'pcb_plate';
    const isCase = type === 'other' && /case/i.test(productText);

    if (
      !(isKeycap && catalogFilters.keycaps)
      && !(isSwitch && catalogFilters.switches)
      && !(isPlate && catalogFilters.pcbPlates)
      && !(isCase && catalogFilters.cases)
    ) {
      return false;
    }

    if (
      catalogFilters.oemProfile
      && isKeycap
      && !/oem\s*profile|\boem\b/i.test(productText)
    ) {
      return false;
    }
    if (catalogFilters.search.trim() && !productText.includes(catalogFilters.search.trim().toLowerCase())) {
      return false;
    }
    if (
      catalogFilters.maxPrice < 125
      && (product.min_price == null || product.min_price > catalogFilters.maxPrice)
    ) {
      return false;
    }
    return true;
  });
  const plates = filteredCatalog.filter((product) => product.type.toLowerCase() === 'pcb_plate');
  const catalogMatches = filteredCatalog.filter((product) => product.type.toLowerCase() !== 'pcb_plate');

  const setPreference = (category: PreferenceCategoryKey, value: string) => {
    const preferenceField = category === 'keycap' ? 'keycap' : category;
    setPreferences((current) => ({ ...current, [preferenceField]: value }));
    setSelection((current) => ({
      ...current,
      [category === 'size' ? 'keyboardSize' : category === 'keycap' ? 'keycapProfile' : 'switch']: value,
    }));
    setRecommendations(null);
    setRecommendationError('');
  };

  const handleRecommend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecommendationsLoading(true);
    setRecommendationError('');
    try {
      setRecommendations(await fetchRecommendations(preferences));
    } catch (error) {
      setRecommendationError(error instanceof Error ? error.message : 'Failed to recommend parts');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleCatalogFiltersChange = (filters: CatalogFilters) => {
    setCatalogFilters(filters);
    setRecommendations(null);
    setRecommendationError('');
  };

  const step = (category: PreferenceCategoryKey, direction: 1 | -1) => {
    const options = PREFERENCE_CATEGORIES.find((item) => item.key === category)!.options;
    const nextIndex = (centered[category] + direction + options.length) % options.length;
    setCentered((current) => ({ ...current, [category]: nextIndex }));
    setPreference(category, options[nextIndex]);
  };

  const selectPlate = (product: Product) => {
    const material = product.color_variants?.find((variant) => variant.plate_material)?.plate_material
      ?? product.canonical_name;
    setSelection((current) => ({ ...current, pcbPlate: product }));
    setPreferences((current) => ({ ...current, plate: material }));
    setRecommendations(null);
    setRecommendationError('');
  };

  const stepPlate = (direction: 1 | -1) => {
    if (plates.length) {
      const nextIndex = (plateIndex + direction + plates.length) % plates.length;
      setPlateIndex(nextIndex);
      selectPlate(plates[nextIndex]);
    }
  };

  const cartCount = Object.values(selection).filter(Boolean).length;

  // Light/dark preview toggle sets theme 
  const toggleTheme = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
  };

  return (
    <div className="kc-app">
      <LeftPanel mode ={leftMode} open={leftOpen} cartCount={cartCount} onMode={(m) => {setLeftMode(m); setLeftOpen(true);}} onClose={() => setLeftOpen(false)} filters={
        <FilterPanel
          filters={catalogFilters}
          onFiltersChange={handleCatalogFiltersChange}
          canRecommend={Object.values(preferences).some((value) => value.trim())}
          onRecommend={handleRecommend}
          recommendationsLoading={recommendationsLoading}
          recommendationError={recommendationError}
        />
      }
      cart={<CartPanel selection={selection} />}
      />
      <main className="kc-mid">
        {PREFERENCE_CATEGORIES.map((category) => (
          <PreferenceCarouselRow
            key={category.key}
            category={category}
            index={centered[category.key]}
            selected={preferences[category.key]}
            onStep={(direction) => step(category.key, direction)}
            onSelect={(value) => setPreference(category.key, value)}
            onChoose={(index) => setCentered((current) => ({ ...current, [category.key]: index }))}
          />
        ))}
        {catalogFilters.pcbPlates && (
          <CarouselRow
            category={PLATE_CATEGORY}
            products={plates}
            index={plateIndex}
            selectedId={selection.pcbPlate?.id}
            onStep={stepPlate}
            onSelect={selectPlate}
          />
        )}
        {plateError && <p className="kc-recommend-error" role="alert">{plateError}</p>}
        {recommendations !== null && (
          <div className="kc-recommend-status">
            {recommendations.length
              ? `Closest parts found: ${recommendations.length}`
              : 'No matching parts found for those preferences.'}
            <button onClick={() => setRecommendations(null)}>Clear recommendations</button>
          </div>
        )}
        <button className="kc-theme-btn" onClick={toggleTheme}>Light/Dark</button>
        {!infoOpen && (
          <button className="kc-info-open" onClick={() => setInfoOpen(true)} aria-label="Open info"><InfoIcon /></button>
        )}
      </main>
      {infoOpen && (
        <InfoPanel
          preferences={preferences}
          plateProduct={selection.pcbPlate}
          recommendations={recommendations ?? []}
          catalogProducts={catalogMatches}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </div>
  );
}