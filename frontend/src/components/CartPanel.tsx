// cart contents shown in left panel when the cart is selected
// shipping/taxes/total are placeholders for now but subtotal is computed

import React from 'react';
import {CustomizerSelection} from '../types';
import {CATEGORIES} from '../categories';
import {CloseIcon} from '../icons';

interface CartPanelProps{
    selection: CustomizerSelection;
    onRemove: (key: keyof CustomizerSelection) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({selection, onRemove}) =>{
    const items = CATEGORIES.map((c) => ({key: c.selKey, product: selection[c.selKey] })).filter((i) => i.product);
    const subtotal = items.reduce((sum, i) => sum + (i.product?.min_price ?? 0), 0);
    return (
        <>
            <div className="kc-cart-items">
                {items.map(({key, product: p}) => p && (
                    <div className="kc-cart-item" key={key}>
                        <span className="kc-ph kc-ph-thumb" />
                        <span >{p.canonical_name}</span>
                        <span className="kc-price">${p.min_price}</span>
                        <button className="kc-cart-remove" onClick={() => onRemove(key)} aria-label={`Remove ${p.canonical_name} from cart`}><CloseIcon /></button>
                    </div>
                ))}
            </div>
            <div className="kc-totals">
                <div>
                    <span>Subtotal:</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div>
                    <span>Taxes:</span><span>$##.##</span>
                </div>
                <div>
                    <span>Shipping:</span><span>$##.##</span>
                </div>
                <div className="kc-total"><span>Total:</span><span>$###.##</span></div>
            </div>
        </>
    );
};