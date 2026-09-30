import { useState } from 'react';
import { mockProducts } from './mockData';
import { ProductCard } from './components/ProductCard';
import { FilterPanel } from './components/FilterPanel';

function App() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filtered = selectedType
    ? mockProducts.filter((p) => p.productType === selectedType)
    : mockProducts;

  return (
    <div className="flex">
      <FilterPanel onSelectType={setSelectedType} />
      <div className="grid grid-cols-3 gap-4 p-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default App;