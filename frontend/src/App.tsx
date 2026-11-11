// frontend/src/App.tsx
import React, { useEffect, useState } from 'react';
import './styles/customizer.css';
import {
  KeyboardRecommendation,
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

export default function App() {
  const [centered, setCentered] = useState<ByCategory<number>>(zeroes);
  const [plates, setPlates] = useState<Product[]>([]);
  const [plateIndex, setPlateIndex] = useState(0);
  const [plateError, setPlateError] = useState('');
  const [selection, setSelection] = useState<PreferenceSelection>({});
  const [leftMode, setLeftMode] = useState<LeftMode>('filters');
  const [leftOpen, setLeftOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);
  const [preferences, setPreferences] = useState<RecommendationPreferences>(emptyPreferences);
  const [recommendations, setRecommendations] = useState<KeyboardRecommendation[] | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState('');

  useEffect(() => {
    fetchProducts('pcb_plate')
      .then(setPlates)
      .catch((error: unknown) => {
        setPlateError(error instanceof Error ? error.message : 'Failed to load PCB/plate products');
      });
  }, []);

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
      setRecommendationError(error instanceof Error ? error.message : 'Failed to recommend keyboards');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const step = (category: PreferenceCategoryKey, direction: 1 | -1) => {
    const count = PREFERENCE_CATEGORIES.find((item) => item.key === category)!.options.length;
    setCentered((current) => ({
      ...current,
      [category]: (current[category] + direction + count) % count,
    }));
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
      setPlateIndex((current) => (current + direction + plates.length) % plates.length);
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
          preferences={preferences}
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
        <CarouselRow
          category={PLATE_CATEGORY}
          products={plates}
          index={plateIndex}
          selectedId={selection.pcbPlate?.id}
          onStep={stepPlate}
          onSelect={selectPlate}
        />
        {plateError && <p className="kc-recommend-error" role="alert">{plateError}</p>}
        {recommendations !== null && (
          <div className="kc-recommend-status">
            {recommendations.length
              ? `Closest keyboard: ${recommendations[0].canonical_name} (${recommendations[0].score}% match)`
              : 'No keyboard listings available to recommend.'}
            <button onClick={() => setRecommendations(null)}>Clear match</button>
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
          recommendation={recommendations?.[0]}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </div>
  );
}