// Slot mapping and cart helpers shared by App, CartPanel, and BrowseModal
import type { CartLine, CartSlot } from './types';
import type { Product } from './types';
import type { CategoryKey } from './categories';

export function newLineId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ln-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function productToSlot(product: Product): CartSlot {
  if (product.type === 'keyboard') return 'case';
  if (product.type === 'pcb_plate') return 'pcbPlate';
  if (product.type === 'keycaps' || product.type === 'keycap') return 'keycap';
  return 'switch';
}

/** Maps carousel row key to cart slot (same as productToSlot for those types). */
export const CATEGORY_TO_SLOT: Record<CategoryKey, CartSlot> = {
  keycap: 'keycap',
  switch: 'switch',
  pcb: 'pcbPlate',
  case: 'case',
};

export function mergeCartLine(lines: CartLine[], product: Product): CartLine[] {
  const slot = productToSlot(product);
  const i = lines.findIndex((l) => l.product.id === product.id);
  if (i >= 0) {
    const next = [...lines];
    next[i] = { ...next[i], quantity: next[i].quantity + 1 };
    return next;
  }
  return [
    ...lines,
    {
      lineId: newLineId(),
      product,
      slot,
      quantity: 1,
    },
  ];
}

/** Replace all cart lines for `slot` with one line per selected product (qty 1 each). */
export function applySlotSelection(
  lines: CartLine[],
  slot: CartSlot,
  products: Product[],
  selectedIds: Set<string>
): CartLine[] {
  const rest = lines.filter((l) => l.slot !== slot);
  const chosen = products.filter((p) => selectedIds.has(p.id) && productToSlot(p) === slot);
  const added = chosen.map((p) => ({
    lineId: newLineId(),
    product: p,
    slot,
    quantity: 1 as const,
  }));
  return [...rest, ...added];
}

export function cartLineCount(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.quantity, 0);
}
