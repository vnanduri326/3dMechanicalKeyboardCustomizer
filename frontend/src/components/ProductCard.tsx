// frontend/src/components/ProductCard.tsx
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void; // Add this line
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect?.(product)}
      className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md cursor-pointer transition-all"
    >
      <h3 className="font-bold text-lg font-mono">{product.canonical_name}</h3>
      <p className="text-sm text-gray-500 font-mono capitalize">{product.brand} • {product.type}</p>
      
      <div className="mt-2 flex flex-wrap gap-1">
        {product.tags?.map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-slate-100 rounded text-slate-600 font-mono">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="font-bold text-emerald-600 font-mono">${product.min_price}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(product);
          }}
          className="px-3 py-1 text-xs bg-slate-900 text-white rounded font-mono hover:bg-slate-700"
        >
          Select
        </button>
      </div>
    </div>
  );
};