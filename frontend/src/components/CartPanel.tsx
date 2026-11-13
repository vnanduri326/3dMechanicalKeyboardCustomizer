import React from 'react';
import type { CartLine, PreferenceSelection } from '../types';

const labels: Record<'keyboardSize' | 'switch' | 'keycapProfile', string> = {
  keyboardSize: 'Keyboard size',
  switch: 'Switch type',
  keycapProfile: 'Keycap profile',
};

function linePrice(line: CartLine): number {
  const n = line.product.min_price;
  const base = n != null && !Number.isNaN(Number(n)) ? Number(n) : 0;
  return base * line.quantity;
}

export const CartPanel: React.FC<{
  selection: PreferenceSelection;
  lines: CartLine[];
  onRemoveLine: (lineId: string) => void;
}> = ({ selection, lines, onRemoveLine }) => {
  const prefs = Object.entries(selection).filter(
    (entry): entry is ['keyboardSize' | 'switch' | 'keycapProfile', string] =>
      entry[0] !== 'pcbPlate' && Boolean(entry[1])
  );
  const subtotal = lines.reduce((sum, l) => sum + linePrice(l), 0);

  return (
    <>
      {prefs.length > 0 && (
        <>
          <h3 className="kc-cart-section">Preferences</h3>
          <div className="kc-cart-items">
            {prefs.map(([key, value]) => (
              <div className="kc-cart-item" key={key}>
                <span className="kc-ph kc-ph-thumb" />
                <span>
                  {labels[key]}: {value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      <h3 className="kc-cart-section">Products</h3>
      <div className="kc-cart-items">
        {lines.length === 0 ? (
          <p className="kc-cart-empty">No products yet. Use the carousels or browse grid.</p>
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
      {lines.length > 0 && (
        <div className="kc-totals">
          <div>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </>
  );
};
