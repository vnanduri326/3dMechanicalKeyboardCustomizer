// Full-category grid for multiselect; Apply syncs cart lines for that slot
import React, { useEffect, useState } from 'react';
import type { Product } from '../types';
import type { CartLine, CartSlot } from '../types';
import { productToSlot } from '../cartUtils';
import { CloseIcon } from '../icons.tsx';

interface BrowseModalProps {
  title: string;
  products: Product[];
  slot: CartSlot;
  cartLines: CartLine[];
  onClose: () => void;
  onApply: (selectedIds: Set<string>) => void;
}

function formatPrice(p: Product): string {
  const n = p.min_price;
  return n != null && !Number.isNaN(Number(n)) ? Number(n).toFixed(2) : '—';
}

export const BrowseModal: React.FC<BrowseModalProps> = ({
  title,
  products,
  slot,
  cartLines,
  onClose,
  onApply,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    new Set(cartLines.filter((l) => l.slot === slot).map((l) => l.product.id))
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = () => {
    onApply(selectedIds);
    onClose();
  };

  return (
    <div className="kc-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="kc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kc-browse-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kc-modal-head">
          <h2 id="kc-browse-title" className="kc-modal-title">
            {title}
          </h2>
          <button type="button" className="kc-x" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <p className="kc-modal-hint">Select one or more products, then Apply to update your cart.</p>
        <div className="kc-browse-grid">
          {products.length === 0 ? (
            <p className="kc-modal-empty">No products in this category with the current filters.</p>
          ) : (
            products.map((p) => {
              const checked = selectedIds.has(p.id);
              const slotOk = productToSlot(p) === slot;
              return (
                <label
                  key={p.id}
                  className={`kc-browse-card ${checked ? 'kc-browse-card--on' : ''} ${!slotOk ? 'kc-browse-card--disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="kc-browse-check"
                    checked={checked}
                    disabled={!slotOk}
                    onChange={() => toggle(p.id)}
                  />
                  <div className="kc-browse-card-inner">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="kc-browse-img" />
                    ) : (
                      <div className="kc-browse-img kc-browse-img--ph" aria-hidden />
                    )}
                    <span className="kc-browse-name">{p.canonical_name}</span>
                    <span className="kc-browse-price">${formatPrice(p)}</span>
                  </div>
                </label>
              );
            })
          )}
        </div>
        <div className="kc-modal-actions">
          <button type="button" className="kc-modal-btn kc-modal-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="kc-modal-btn kc-modal-btn--primary" onClick={handleApply}>
            Apply to cart
          </button>
        </div>
      </div>
    </div>
  );
};
