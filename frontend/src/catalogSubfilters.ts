import { PREFERENCE_CATEGORIES } from './categories';

const optionList = (key: 'keycap' | 'switch' | 'plate' | 'size') =>
  PREFERENCE_CATEGORIES.find((item) => item.key === key)!.options;

export const FILTER_SUBCATEGORIES = {
  keycaps: optionList('keycap'),
  switches: optionList('switch'),
  pcbPlates: optionList('plate'),
  cases: optionList('size'),
} as const;

export type CatalogSubfilterKey = keyof typeof FILTER_SUBCATEGORIES;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function productMatchesSubfilter(productText: string, option: string, kind: CatalogSubfilterKey): boolean {
  const text = productText.toLowerCase();
  const lower = option.toLowerCase();

  if (kind === 'keycaps') {
    const profile = lower.replace(/\s+profile$/, '').trim();
    return new RegExp(`${escapeRegex(profile)}\\s*profile|\\b${escapeRegex(profile)}\\b`, 'i').test(productText);
  }

  if (kind === 'switches') {
    if (lower.includes('he') && lower.includes('magnetic')) {
      return /\bhe\b|hall\s*effect|magnetic/.test(text);
    }
    const stem = lower.replace(/\s+switches?$/, '').trim();
    return new RegExp(`\\b${escapeRegex(stem)}\\b`, 'i').test(productText);
  }

  if (kind === 'pcbPlates') {
    if (lower === 'fr4') return /\bfr-?4\b/i.test(productText);
    return new RegExp(`\\b${escapeRegex(lower)}\\b`, 'i').test(productText);
  }

  if (lower === 'tenkeyless') return /tenkeyless|\btkl\b|87[\s-]*key/i.test(productText);
  if (lower === 'full-size') return /full[\s-]*size|104[\s-]*key/i.test(productText);
  if (lower === 'low profile') return /low\s*profile/i.test(productText);
  if (lower.includes('%')) return text.includes(lower) || text.includes(lower.replace('%', ''));
  return new RegExp(escapeRegex(lower), 'i').test(productText);
}

export function productMatchesAnySubfilter(
  productText: string,
  selected: string[],
  kind: CatalogSubfilterKey,
): boolean {
  if (selected.length === 0) return true;
  return selected.some((option) => productMatchesSubfilter(productText, option, kind));
}