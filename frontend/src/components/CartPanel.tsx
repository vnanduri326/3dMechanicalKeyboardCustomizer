

import React from 'react';
import { Product } from '../types';

interface CartPanelProps {
    items: Product[];
    onRemove: (productId: string) => void;
}

const formatPrice = (price: number) => (
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
);

export const CartPanel: React.FC<CartPanelProps> = ({ items, onRemove }) => {
    const subtotal = items.reduce((sum, item) => sum + (item.min_price ?? 0), 0);
    const hasUnpricedItems = items.some((item) => item.min_price == null);

    return (
        <div className="kc-cart-content">
            <div className="kc-cart-items" aria-label="Cart items">
                {items.length === 0 ? (
                    <p className="kc-cart-empty">Your cart is empty.</p>
                ) : items.map((item) => (
                    <div className="kc-cart-item" key={item.id}>
                        {item.image_url ? (
                            <img className="kc-cart-thumb" src={item.image_url} alt="" />
                        ) : (
                            <span className="kc-ph kc-cart-thumb" aria-hidden="true">
                                <svg viewBox="0 0 100 70" preserveAspectRatio="none">
                                    <line x1="0" y1="0" x2="100" y2="70" />
                                    <line x1="100" y1="0" x2="0" y2="70" />
                                </svg>
                            </span>
                        )}
                        <div className="kc-cart-item-details">
                            <span className="kc-cart-item-name">{item.canonical_name}</span>
                            <span className="kc-cart-item-price">
                                {item.min_price == null ? 'Price unavailable' : formatPrice(item.min_price)}
                            </span>
                        </div>
                        <button
                            className="kc-cart-remove"
                            type="button"
                            aria-label={`Remove ${item.canonical_name} from cart`}
                            onClick={() => onRemove(item.id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <div className="kc-totals">
                <div><span>Subtotal:</span><span>{formatPrice(subtotal)}{hasUnpricedItems ? '+' : ''}</span></div>
                <div><span>Taxes:</span><span>At checkout</span></div>
                <div><span>Shipping:</span><span>By seller</span></div>
                <div className="kc-total"><span>Estimated total:</span><span>{formatPrice(subtotal)}{hasUnpricedItems ? '+' : ''}</span></div>
                <p className="kc-cart-note">Taxes and shipping are determined by each seller.</p>
            </div>
        </div>
    );
};