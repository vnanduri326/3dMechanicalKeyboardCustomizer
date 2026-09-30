import { Product } from '../types';

export function ProductCard({ product }: { product: Product }) {
  const basePrice = product.colorVariants[0]?.price ?? 0;

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-500">{product.brand}</p>
      <p className="mt-2 font-medium">${basePrice.toFixed(2)}</p>
      <div className="flex gap-1 mt-2">
        {product.colorVariants.map((v) => (
          <div
            key={v.sku}
            className="w-5 h-5 rounded-full border"
            style={{ backgroundColor: v.colorHex }}
            title={v.colorName}
          />
        ))}
      </div>
    </div>
  );
}