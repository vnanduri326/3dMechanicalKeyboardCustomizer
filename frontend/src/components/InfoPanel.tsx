// the info section (right side) with title + logo, then one block per row showing the centered product's name and information
import React from 'react';
import {Product} from '../types';
import {CATEGORIES, CategoryKey} from '../categories';
import {InfoIcon, CloseIcon} from '../icons';

interface InfoPanelProps{
    // centered product for each row
    focused: Record<CategoryKey, Product | undefined>;
    onClose: () => void;
}

// no free-text descriptions yet for a product description, so this is going to be brand, price, and tags
const describe = (p: Product) =>
    [p.brand, `${p.min_price}`, ...(p.tags ?? [])].filter(Boolean).join(' · ');

export const InfoPanel: React.FC<InfoPanelProps> = ({focused, onClose}) => (
    <aside className="kc-info">
        <div className="kc-panel-head">
            <div className="kc-section-title kc-px"><InfoIcon /><span>Info</span></div>
            <button className="kc-x" onClick={onClose} aria-label="Close info"><CloseIcon /></button>
        </div>
        {CATEGORIES.map((c)=> {
            const p = focused[c.key];
            return (
                <section className="kc-info-block" key={c.key}>
                    <h3>{p ? p.canonical_name : c.label}</h3>
                    <p>
                        {p ? describe(p) : `This is a placeholder for information about the ${c.label.toLowerCase()} currently selected on-screen.`}
                    </p>
                </section>
            );
        })}
    </aside>
);
