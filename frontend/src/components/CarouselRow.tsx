// adds middle-section row, with grid button, left/right arrows, and product images
import React from 'react';
import { Product } from '../types';
import { Category } from '../categories';
import { ArrowIcon } from '../icons';
import ModelViewer from './ModelViewer';

interface CarouselRowProps {
  category: Category;
  products: Product[];

  index: number;
  selectedId?: string;
  browseActive?: boolean;
  onStep: (dir: 1 | -1) => void;
  onSelect: (p: Product) => void;
  onBrowseOpen: () => void;
}

// product image, or X-ed box if no image;
const Img: React.FC<{ p?: Product; className: string }> = ({ p, className }) =>
  p?.image_url ? (
    <img className={`kc-ph ${className}`} src={p.image_url} alt={p.canonical_name} />
  ) : (
    <span className={`kc-ph ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <line x1="0" y1="0" x2="100" y2="100" /> <line x1="100" y1="0" x2="0" y2="100" />
      </svg>
    </span>
  );

export const CarouselRow: React.FC<CarouselRowProps> = ({
  category,
  products,
  index,
  selectedId,
  browseActive = false,
  onStep,
  onSelect,
  onBrowseOpen,
}) => {
  const n = products.length;
  const at = (i: number) => (n ? products[(i + n) % n] : undefined);
  const center = at(index);
  const showModel = category.key === 'case';
  return (
    <div className="kc-row">
      <button
        type="button"
        className={`kc-grid-btn ${browseActive ? 'kc-grid-btn--active' : ''}`}
        aria-label={`Browse all ${category.label}`}
        aria-expanded={browseActive}
        aria-pressed={browseActive}
        onClick={onBrowseOpen}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} />
        ))}
      </button>
      <button
        type="button"
        className="kc-arrow"
        onClick={() => onStep(-1)}
        disabled={n < 2}
        aria-label={`Previous ${category.label}`}
      >
        <ArrowIcon dir="left" />
      </button>
      <div className="kc-track" role="group" aria-label={`${category.label}: ${center?.canonical_name ?? 'none'}`}>
        {category.slides && <Img p={at(index - 1)} className="kc-side kc-side-l" />}
        <button
          type="button"
          className={`kc-main-btn ${category.slides ? 'kc-main' : 'kc-wide'} ${center && center.id === selectedId ? 'kc-picked' : ''}`}
          onClick={() => center && onSelect(center)}
          disabled={!center}
          aria-label={center ? `Select ${center.canonical_name}` : `No ${category.label}`}
        >
          {showModel ? <ModelViewer /> : <Img p={center} className="kc-fill" />}
        </button>
        {category.slides && <Img p={at(index + 1)} className="kc-side kc-side-r" />}
      </div>
      <button
        type="button"
        className="kc-arrow"
        onClick={() => onStep(1)}
        disabled={n < 2}
        aria-label={`Next ${category.label}`}
      >
        <ArrowIcon dir="right" />
      </button>
    </div>
  );
};
