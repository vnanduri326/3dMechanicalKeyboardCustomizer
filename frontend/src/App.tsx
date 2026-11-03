// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import './styles/customizer.css';
import { Product, CustomizerSelection } from './types';
import { fetchProducts } from './services/api';
import { CATEGORIES, CategoryKey} from './categories.ts';
import { FilterPanel } from './components/FilterPanel';
import {CartPanel} from './components/CartPanel.tsx';
import {LeftPanel, LeftMode} from './components/LeftPanel.tsx';
import {CarouselRow} from './components/CarouselRow.tsx';
import {InfoPanel} from './components/InfoPanel.tsx';
import {InfoIcon} from './icons.tsx';

// helpers for per-row data
type ByCat<T> = Record<CategoryKey, T>;
const emptyLists = (): ByCat<Product[]> => ({keycap: [], switch: [], pcb: [], case: []});
const zeroes = (): ByCat<number> => ({keycap: 0, switch: 0, pcb: 0, case: 0});

export default function App() {
  const [productsByCat, setProductsByCat] = useState<ByCat<Product[]>>(emptyLists);
  const [centered, setCentered] = useState<ByCat<number>>(zeroes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selection, setSelection] = useState<CustomizerSelection>({});
  const [leftMode, setLeftMode] = useState<LeftMode>('filters');
  const [leftOpen, setLeftOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);

  useEffect(() => {
    Promise.all(CATEGORIES.map((c)=> fetchProducts(c.type, selectedTags, searchTerm)))
    .then((lists) => {
      const next = emptyLists();
      CATEGORIES.forEach((c, i) => {next[c.key] = lists[i];});
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
    setSelection((prev) => ({
      ...prev,
      [product.type === 'keyboard' ? 'case' : product.type === 'pcb_plate' ? 'pcb' : product.type === 'keycaps' ? 'keycap' : product.type]: product,
    }));
  };

  // arrow buttons move the centered item in a row
  const step = (key: CategoryKey, dir: 1 | -1) => {
    const n = productsByCat[key].length;
    if (n){
      setCentered((c) => ({ ...c, [key]: (c[key] + dir + n) % n}));
    }
  };

  // rows shown now only shows that row; passes the centered product to info
  const visible = CATEGORIES.filter((c) => selectedType === 'all' || c.type === selectedType);
  const focused = Object.fromEntries(
    CATEGORIES.map((c) => [c.key, productsByCat[c.key][centered[c.key]]])
  ) as ByCat<Product | undefined>;

  // number of items in cart shown in cart's circle thing
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
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
      }
      cart={<CartPanel selection={selection} />}
      />
      <main className="kc-mid">
        {visible.map((c) => (
          <CarouselRow key={c.key} category={c} products={productsByCat[c.key]} index={centered[c.key]} selectedId={selection[c.selKey]?.id} onStep={(dir) => step(c.key, dir)} onSelect={handleSelectProduct} />
        ))}
        <button className="kc-theme-btn" onClick={toggleTheme}>Light/Dark</button>
        {!infoOpen && (
          <button className="kc-info-open" onClick={() => setInfoOpen(true)} aria-label="Open info"><InfoIcon /></button>
        )}
      </main>
      {infoOpen && <InfoPanel focused={focused} onClose={() => setInfoOpen(false)} />}
    </div>
  );
}