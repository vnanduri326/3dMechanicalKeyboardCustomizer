// frontend/src/App.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './styles/customizer.css';
import {
  CatalogFilters,
  CartLine,
  PartRecommendation,
  Product,
  PreferenceSelection,
  RecommendationPreferences,
} from './types';
import { fetchProducts, fetchRecommendations } from './services/api';
import {
  CATEGORY_TO_SLOT,
  applySlotSelection,
  cartLineCount,
  mergeCartLine,
} from './cartUtils';
import {
  PREFERENCE_CATEGORIES,
  PRODUCT_CATEGORIES,
  PreferenceCategoryKey,
  CategoryKey,
} from './categories.ts';
import { FilterPanel } from './components/FilterPanel';
import { CartPanel } from './components/CartPanel.tsx';
import { LeftPanel, LeftMode } from './components/LeftPanel.tsx';
import { PreferenceCarouselRow } from './components/PreferenceCarouselRow';
import { CarouselRow } from './components/CarouselRow';
import { BrowseModal } from './components/BrowseModal.tsx';
import { InfoPanel } from './components/InfoPanel.tsx';
import { InfoIcon } from './icons.tsx';

type ByPreferenceIndex = Record<PreferenceCategoryKey, number>;
type ByProductIndex = Record<CategoryKey, number>;

const preferenceZeroes = (): ByPreferenceIndex => ({ size: 0, switch: 0, keycap: 0 });
const productZeroes = (): ByProductIndex => ({ keycap: 0, switch: 0, pcb: 0, case: 0 });

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

function isCaseProduct(product: Product): boolean {
  if (product.type === 'keyboard') return true;
  const text = [product.canonical_name, product.brand, product.product_type_raw, ...product.tags]
    .join(' ')
    .toLowerCase();
  return product.type === 'other' && /case/i.test(text);
}

function partitionCatalog(catalog: Product[]): Record<CategoryKey, Product[]> {
  return {
    keycap: catalog.filter((p) => p.type === 'keycap' || p.type === 'keycaps'),
    switch: catalog.filter((p) => p.type === 'switch'),
    pcb: catalog.filter((p) => p.type === 'pcb_plate'),
    case: catalog.filter(isCaseProduct),
  };
}

function productRowEnabled(filters: CatalogFilters, key: CategoryKey): boolean {
  switch (key) {
    case 'keycap':
      return filters.keycaps;
    case 'switch':
      return filters.switches;
    case 'pcb':
      return filters.pcbPlates;
    case 'case':
      return filters.cases;
  }
}

function primaryInCart(lines: CartLine[], slot: CartLine['slot']): Product | undefined {
  return lines.find((l) => l.slot === slot)?.product;
}

export default function App() {
  const [prefCentered, setPrefCentered] = useState<ByPreferenceIndex>(preferenceZeroes);
  const [productCentered, setProductCentered] = useState<ByProductIndex>(productZeroes);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogError, setCatalogError] = useState('');
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>(initialCatalogFilters);
  const [selection, setSelection] = useState<PreferenceSelection>({});
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [browseKey, setBrowseKey] = useState<CategoryKey | null>(null);
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
      fetchProducts('keyboard', undefined, undefined, 100),
      fetchProducts('other', undefined, undefined, 100),
    ])
      .then((chunks) => setCatalogProducts(chunks.flat()))
      .catch((error: unknown) => {
        setCatalogError(error instanceof Error ? error.message : 'Failed to load catalog products');
      });
  }, []);

  const filteredCatalog = useMemo(() => {
    return catalogProducts.filter((product) => {
      const type = product.type.toLowerCase();
      const productText = [
        product.canonical_name,
        product.brand,
        product.product_type_raw,
        ...product.tags,
      ]
        .join(' ')
        .toLowerCase();
      const isKeycap = type === 'keycap' || type === 'keycaps';
      const isSwitch = type === 'switch';
      const isPlate = type === 'pcb_plate';
      const isCase = isCaseProduct(product);

      if (
        !(isKeycap && catalogFilters.keycaps) &&
        !(isSwitch && catalogFilters.switches) &&
        !(isPlate && catalogFilters.pcbPlates) &&
        !(isCase && catalogFilters.cases) &&
        !(type === 'keyboard' && catalogFilters.cases)
      ) {
        return false;
      }

      if (
        catalogFilters.oemProfile &&
        isKeycap &&
        !/oem\s*profile|\boem\b/i.test(productText)
      ) {
        return false;
      }
      if (catalogFilters.search.trim() && !productText.includes(catalogFilters.search.trim().toLowerCase())) {
        return false;
      }
      if (
        catalogFilters.maxPrice < 125 &&
        (product.min_price == null || product.min_price > catalogFilters.maxPrice)
      ) {
        return false;
      }
      return true;
    });
  }, [catalogProducts, catalogFilters]);

  const productsByCat = useMemo(() => partitionCatalog(filteredCatalog), [filteredCatalog]);
  const catalogMatches = useMemo(
    () => filteredCatalog.filter((p) => p.type.toLowerCase() !== 'pcb_plate'),
    [filteredCatalog]
  );

  const plateProduct = selection.pcbPlate ?? primaryInCart(cartLines, 'pcbPlate');

  const setPreference = useCallback((category: PreferenceCategoryKey, value: string) => {
    const preferenceField = category === 'keycap' ? 'keycap' : category;
    setPreferences((current) => ({ ...current, [preferenceField]: value }));
    setSelection((current) => ({
      ...current,
      [category === 'size' ? 'keyboardSize' : category === 'keycap' ? 'keycapProfile' : 'switch']: value,
    }));
    setRecommendations(null);
    setRecommendationError('');
  }, []);

  const syncPlateSelection = useCallback((product: Product, plateList: Product[]) => {
    const material =
      product.color_variants?.find((variant) => variant.plate_material)?.plate_material ??
      product.canonical_name;
    setSelection((current) => ({ ...current, pcbPlate: product }));
    setPreferences((current) => ({ ...current, plate: material }));
    setCartLines((lines) => applySlotSelection(lines, 'pcbPlate', plateList, new Set([product.id])));
    setRecommendations(null);
    setRecommendationError('');
  }, []);

  const handleSelectProduct = useCallback(
    (categoryKey: CategoryKey, product: Product) => {
      setCartLines((prev) => mergeCartLine(prev, product));
      if (categoryKey === 'pcb') {
        syncPlateSelection(product, productsByCat.pcb);
      }
    },
    [productsByCat.pcb, syncPlateSelection]
  );

  const handleRemoveLine = useCallback((lineId: string) => {
    setCartLines((prev) => {
      const line = prev.find((l) => l.lineId === lineId);
      const next = prev.filter((l) => l.lineId !== lineId);
      if (line?.slot === 'pcbPlate') {
        setSelection((s) => ({ ...s, pcbPlate: undefined }));
        setPreferences((p) => ({ ...p, plate: '' }));
      }
      return next;
    });
  }, []);

  const handleBrowseApply = useCallback(
    (categoryKey: CategoryKey, selectedIds: Set<string>) => {
      const slot = CATEGORY_TO_SLOT[categoryKey];
      const products = productsByCat[categoryKey];
      setCartLines((lines) => applySlotSelection(lines, slot, products, selectedIds));
      if (categoryKey === 'pcb') {
        const first = products.find((p) => selectedIds.has(p.id));
        if (first) syncPlateSelection(first, products);
      }
    },
    [productsByCat, syncPlateSelection]
  );

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
    setProductCentered(productZeroes());
    setRecommendations(null);
    setRecommendationError('');
  };

  const stepPreference = (category: PreferenceCategoryKey, direction: 1 | -1) => {
    const options = PREFERENCE_CATEGORIES.find((item) => item.key === category)!.options;
    const nextIndex = (prefCentered[category] + direction + options.length) % options.length;
    setPrefCentered((current) => ({ ...current, [category]: nextIndex }));
    setPreference(category, options[nextIndex]);
  };

  const stepProduct = (categoryKey: CategoryKey, direction: 1 | -1) => {
    const list = productsByCat[categoryKey];
    if (!list.length) return;
    const nextIndex = (productCentered[categoryKey] + direction + list.length) % list.length;
    setProductCentered((c) => ({ ...c, [categoryKey]: nextIndex }));
    if (categoryKey === 'pcb') {
      syncPlateSelection(list[nextIndex], list);
    }
  };

  const prefCartCount =
    (selection.keyboardSize ? 1 : 0) +
    (selection.keycapProfile ? 1 : 0) +
    (selection.switch ? 1 : 0);
  const cartCount = prefCartCount + cartLineCount(cartLines);

  const toggleTheme = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
  };

  const browseCategory = browseKey ? PRODUCT_CATEGORIES.find((c) => c.key === browseKey) : null;

  const selectedProductId = (key: CategoryKey): string | undefined => {
    const slot = CATEGORY_TO_SLOT[key];
    const fromCart = primaryInCart(cartLines, slot)?.id;
    if (key === 'pcb') return plateProduct?.id ?? fromCart;
    return fromCart;
  };

  return (
    <div className="kc-app">
      <LeftPanel
        mode={leftMode}
        open={leftOpen}
        cartCount={cartCount}
        onMode={(m) => {
          setLeftMode(m);
          setLeftOpen(true);
        }}
        onClose={() => setLeftOpen(false)}
        filters={
          <FilterPanel
            filters={catalogFilters}
            onFiltersChange={handleCatalogFiltersChange}
            canRecommend={Object.values(preferences).some((value) => value.trim())}
            onRecommend={handleRecommend}
            recommendationsLoading={recommendationsLoading}
            recommendationError={recommendationError}
          />
        }
        cart={<CartPanel selection={selection} lines={cartLines} onRemoveLine={handleRemoveLine} />}
      />
      <main className="kc-mid">
        <section className="kc-mid-section" aria-label="Build preferences">
          {PREFERENCE_CATEGORIES.map((category) => (
            <PreferenceCarouselRow
              key={category.key}
              category={category}
              index={prefCentered[category.key]}
              selected={preferences[category.key]}
              onStep={(direction) => stepPreference(category.key, direction)}
              onSelect={(value) => setPreference(category.key, value)}
              onChoose={(index) => setPrefCentered((current) => ({ ...current, [category.key]: index }))}
            />
          ))}
        </section>
        <section className="kc-mid-section" aria-label="Catalog products">
          {PRODUCT_CATEGORIES.filter((c) => productRowEnabled(catalogFilters, c.key)).map((category) => (
            <CarouselRow
              key={category.key}
              category={category}
              products={productsByCat[category.key]}
              index={productCentered[category.key]}
              selectedId={selectedProductId(category.key)}
              browseActive={browseKey === category.key}
              onStep={(dir) => stepProduct(category.key, dir)}
              onSelect={(p) => handleSelectProduct(category.key, p)}
              onBrowseOpen={() => setBrowseKey((prev) => (prev === category.key ? null : category.key))}
            />
          ))}
        </section>
        {catalogError && (
          <p className="kc-recommend-error" role="alert">
            {catalogError}
          </p>
        )}
        {recommendations !== null && (
          <div className="kc-recommend-status">
            {recommendations.length
              ? `Closest parts found: ${recommendations.length}`
              : 'No matching parts found for those preferences.'}
            <button type="button" onClick={() => setRecommendations(null)}>
              Clear recommendations
            </button>
          </div>
        )}
        <button type="button" className="kc-theme-btn" onClick={toggleTheme}>
          Light/Dark
        </button>
        {!infoOpen && (
          <button
            type="button"
            className="kc-info-open"
            onClick={() => setInfoOpen(true)}
            aria-label="Open info"
          >
            <InfoIcon />
          </button>
        )}
      </main>
      {infoOpen && (
        <InfoPanel
          preferences={preferences}
          plateProduct={plateProduct}
          recommendations={recommendations ?? []}
          catalogProducts={catalogMatches}
          onClose={() => setInfoOpen(false)}
        />
      )}
      {browseCategory && (
        <BrowseModal
          key={browseCategory.key}
          title={`Browse ${browseCategory.label}`}
          products={productsByCat[browseCategory.key]}
          slot={CATEGORY_TO_SLOT[browseCategory.key]}
          cartLines={cartLines}
          onClose={() => setBrowseKey(null)}
          onApply={(ids) => handleBrowseApply(browseCategory.key, ids)}
        />
      )}
    </div>
  );
}
