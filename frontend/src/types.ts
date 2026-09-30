export interface ColorVariant {
  colorName: string;
  colorHex: string;
  price: number;
  sku: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  productType: string;
  colorVariants: ColorVariant[];
}