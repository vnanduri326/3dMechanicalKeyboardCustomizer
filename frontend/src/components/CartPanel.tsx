// cart contents shown in left panel when the cart is selected
import React from 'react';
import type { CartLine } from '../types';

function linePrice(line: CartLine): number {
  const n = line.product.min_price;
  const base = n != null && !Number.isNaN(Number(n)) ? Number(n) : 0;
  return base * line.quantity;
}

export const CartPanel: React.FC<{
  lines: CartLine[];
  onRemoveLine: (lineId: string) => void;
}> = ({ lines, onRemoveLine }) => {
  const subtotal = lines.reduce((sum, l) => sum + linePrice(l), 0);
  return (
    <>
      <div className="kc-cart-items">
        {lines.length === 0 ? (
          <p className="kc-cart-empty">No items yet. Pick products from the carousel or browse grid.</p>
        ) : (
          lines.map((l) => (
            <div className="kc-cart-item" key={l.lineId}>
              <span className="kc-ph kc-ph-thumb" />
              <span className="kc-cart-item-name">{l.product.canonical_name}</span>
              {l.quantity > 1 && <span className="kc-cart-qty">×{l.quantity}</span>}
              <span className="kc-price">${linePrice(l).toFixed(2)}</span>
              <button
                type="button"
                className="kc-cart-remove"
                onClick={() => onRemoveLine(l.lineId)}
                aria-label={`Remove ${l.product.canonical_name}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
      <div className="kc-totals">
        <div>
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div>
          <span>Taxes:</span>
          <span>$##.##</span>
        </div>
        <div>
          <span>Shipping:</span>
          <span>$##.##</span>
        </div>
        <div className="kc-total">
          <span>Total:</span>
          <span>$###.##</span>
        </div>
      </div>
    </>
  );
};
