// frontend/src/App.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './styles/customizer.css';
import { Product, CartLine } from './types';
import { fetchProducts } from './services/api';
import { CATEGORIES, CategoryKey } from './categories';
import { FilterPanel } from './components/FilterPanel';
import { CartPanel } from './components/CartPanel.tsx';
import { LeftPanel, LeftMode } from './components/LeftPanel.tsx';
import { CarouselRow } from './components/CarouselRow.tsx';
import { InfoPanel } from './components/InfoPanel.tsx';
import { BrowseModal } from './components/BrowseModal.tsx';
import { InfoIcon } from './icons.tsx';
import {
  CATEGORY_TO_SLOT,
  cartLineCount,
  mergeCartLine,
  applySlotSelection,
} from './cartUtils';

type ByCat<T> = Record<CategoryKey, T>;
const emptyLists = (): ByCat<Product[]> => ({ keycap: [], switch: [], pcb: [], case: [] });
const zeroes = (): ByCat<number> => ({ keycap: 0, switch: 0, pcb: 0, case: 0 });

function primaryProductForSlot(lines: CartLine[], slot: CartLine['slot']): Product | undefined {
  const rows = lines.filter((l) => l.slot === slot);
  return rows[0]?.product;
}

export default function App() {
  const [productsByCat, setProductsByCat] = useState<ByCat<Product[]>>(emptyLists);
  const [centered, setCentered] = useState<ByCat<number>>(zeroes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [leftMode, setLeftMode] = useState<LeftMode>('filters');
  const [leftOpen, setLeftOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);
  const [browseKey, setBrowseKey] = useState<CategoryKey | null>(null);

  useEffect(() => {
    Promise.all(CATEGORIES.map((c) => fetchProducts(c.type, selectedTags, searchTerm)))
      .then((lists) => {
        const next = emptyLists();
        CATEGORIES.forEach((c, i) => {
          next[c.key] = lists[i];
        });
        setProductsByCat(next);
        setCentered(zeroes());
      })
      .catch((err) => console.error('Error loading products:', err));
  }, [selectedTags, searchTerm]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectProduct = (product: Product) => {
    setCartLines((prev) => mergeCartLine(prev, product));
  };

  const handleRemoveLine = useCallback((lineId: string) => {
    setCartLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const handleBrowseApply = useCallback((categoryKey: CategoryKey, selectedIds: Set<string>) => {
    const slot = CATEGORY_TO_SLOT[categoryKey];
    const products = productsByCat[categoryKey];
    setCartLines((lines) => applySlotSelection(lines, slot, products, selectedIds));
  }, [productsByCat]);

  const step = (key: CategoryKey, dir: 1 | -1) => {
    const n = productsByCat[key].length;
    if (n) {
      setCentered((c) => ({ ...c, [key]: (c[key] + dir + n) % n }));
    }
  };

  const visible = CATEGORIES.filter((c) => selectedType === 'all' || c.type === selectedType);

  const focused = useMemo(
    () =>
      ({
        keycap: primaryProductForSlot(cartLines, 'keycap'),
        switch: primaryProductForSlot(cartLines, 'switch'),
        pcb: primaryProductForSlot(cartLines, 'pcbPlate'),
        case: primaryProductForSlot(cartLines, 'case'),
      }) as ByCat<Product | undefined>,
    [cartLines]
  );

  const selectionIdByCategory = useMemo(() => {
    return Object.fromEntries(
      CATEGORIES.map((c) => [c.key, primaryProductForSlot(cartLines, CATEGORY_TO_SLOT[c.key])?.id])
    ) as ByCat<string | undefined>;
  }, [cartLines]);

  const cartCount = cartLineCount(cartLines);

  const totalProductsLoaded = CATEGORIES.reduce((acc, c) => acc + productsByCat[c.key].length, 0);

  const toggleTheme = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
  };

  const browseCategory = browseKey ? CATEGORIES.find((c) => c.key === browseKey) : null;

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
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />
        }
        cart={<CartPanel lines={cartLines} onRemoveLine={handleRemoveLine} />}
      />
      <main className="kc-mid">
        {totalProductsLoaded === 0 && (
          <p className="kc-empty-msg">
            No products loaded. Start the API with docker compose and load data via{' '}
            <code>python -m scripts.run_fetch</code> from the backend folder.
          </p>
        )}
        {visible.map((c) => (
          <CarouselRow
            key={c.key}
            category={c}
            products={productsByCat[c.key]}
            index={centered[c.key]}
            selectedId={selectionIdByCategory[c.key]}
            browseActive={browseKey === c.key}
            onStep={(dir) => step(c.key, dir)}
            onSelect={handleSelectProduct}
            onBrowseOpen={() => setBrowseKey((prev) => (prev === c.key ? null : c.key))}
          />
        ))}
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
      {infoOpen && <InfoPanel focused={focused} onClose={() => setInfoOpen(false)} />}
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
