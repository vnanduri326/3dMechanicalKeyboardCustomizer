// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { Product, CustomizerSelection } from './types';
import { fetchProducts } from './services/api';
import { FilterPanel } from './components/FilterPanel';
import { ProductCard } from './components/ProductCard';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selection, setSelection] = useState<CustomizerSelection>({});

  useEffect(() => {
    const typeFilter = selectedType === 'all' ? undefined : selectedType;
    fetchProducts(typeFilter, selectedTags, searchTerm)
      .then(setProducts)
      .catch((err) => console.error('Error loading products:', err));
  }, [selectedType, selectedTags, searchTerm]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectProduct = (product: Product) => {
    setSelection((prev) => ({
      ...prev,
      [product.type === 'keyboard' ? 'case' : product.type]: product,
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <FilterPanel
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />

      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 font-mono">3D Keyboard Customizer</h1>
        {products.length === 0 && (
          <p className="text-slate-500 font-mono text-sm mb-4">
            No products loaded. Start the API with docker compose and load data via run_fetch.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={() => handleSelectProduct(p)}
            />
          ))}
        </div>
        {Object.keys(selection).length > 0 && (
          <p className="mt-6 text-sm text-slate-600 font-mono">
            Selected: {Object.keys(selection).join(', ')}
          </p>
        )}
      </main>
    </div>
  );
}