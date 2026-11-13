

import React from 'react';
import {PreferenceSelection} from '../types';

const labels: Record<'keyboardSize' | 'switch' | 'keycapProfile', string> = {
    keyboardSize: 'Keyboard size',
    switch: 'Switch type',
    keycapProfile: 'Keycap profile',
};

export const CartPanel: React.FC<{selection: PreferenceSelection}> = ({selection}) =>{
    const items = Object.entries(selection).filter(
        (entry): entry is ['keyboardSize' | 'switch' | 'keycapProfile', string] =>
            entry[0] !== 'pcbPlate' && Boolean(entry[1])
    );
    return (
        <>
            <div className="kc-cart-items">
                {items.map(([key, value]) => (
                    <div className="kc-cart-item" key={key}>
                        <span className="kc-ph kc-ph-thumb" />
                        <span>{labels[key]}: {value}</span>
                    </div>
                ))}
                {selection.pcbPlate && (
                    <div className="kc-cart-item" key={selection.pcbPlate.id}>
                        <span className="kc-ph kc-ph-thumb" />
                        <span>PCB/Plate: {selection.pcbPlate.canonical_name}</span>
                        {selection.pcbPlate.min_price != null && (
                            <span className="kc-price">${selection.pcbPlate.min_price}</span>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};