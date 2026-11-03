// cart contents shown in left panel when the cart is selected
// shipping/taxes/total are placeholders for now but subtotal is computed

import React from 'react';
import {CustomizerSelection} from '../types';

export const CartPanel: React.FC<{selection: CustomizerSelection}> = ({selection}) =>{
    const items = Object.values(selection).filter(Boolean);
    const subtotal = items.reduce((sum, p) => sum + (p?.min_price ?? 0), 0);
    return (
        <>
            <div className="kc-cart-items">
                {items.map((p) => p && (
                    <div className="kc-cart-item" key={p.id}>
                        <span className="kc-ph kc-ph-thumb" />
                        <span >{p.canonical_name}</span>
                        <span className="kc-price">${p.min_price}</span>
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