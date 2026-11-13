import React from 'react';
import { Product } from '../types';
import { CATEGORIES, CategoryKey } from '../categories';
import { InfoIcon, CloseIcon } from '../icons';
 
interface InfoPanelProps {
  focused: Record<CategoryKey, Product | undefined>; // centered product per row
  onClose: () => void;
}
 
// Description text for a product (the API has no free-text description yet).
// Info text. The API has no description field, so it is built from brand, price and tags.
const describe = (p: Product) =>
  [p.brand, `$${p.min_price}`, ...(p.tags ?? [])].filter(Boolean).join(' · ');
 
export const InfoPanel: React.FC<InfoPanelProps> = ({ focused, onClose }) => (
  <aside className="kc-info">
    <div className="kc-panel-head">
      <div className="kc-section-title kc-px"><InfoIcon /><span>Info</span></div>
      <button className="kc-x" onClick={onClose} aria-label="Close info"><CloseIcon /></button>
    </div>
    <div className="kc-info-blocks">
      {CATEGORIES.map((c) => {
        const p = focused[c.key];
        return (
          <section className="kc-info-block" key={c.key}>
            <h3>{p ? p.canonical_name : c.label}</h3>
            <p>
              {p
                ? describe(p)
                : `This is a placeholder for information about the ${c.label.toLowerCase()} currently selected/in focus of the screen.`}
            </p>
          </section>
        );
      })}
    </div>
  </aside>
);
 