import React from 'react';
import { PartRecommendation, Product, RecommendationPreferences } from '../types';
import { CloseIcon, InfoIcon } from '../icons';

interface InfoPanelProps {
    preferences: RecommendationPreferences;
    plateProduct?: Product;
    recommendations: PartRecommendation[];
    catalogProducts: Product[];
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    preferences,
    plateProduct,
    recommendations,
    catalogProducts,
    onClose,
}) => (
    <aside className="kc-info">
        <div className="kc-panel-head">
            <div className="kc-section-title kc-px"><InfoIcon /><span>Info</span></div>
            <button className="kc-x" onClick={onClose} aria-label="Close info"><CloseIcon /></button>
        </div>
        <section className="kc-info-block">
            <h3>Keycap profile</h3>
            <p>{preferences.keycap || 'Choose a keycap profile in the carousel.'}</p>
        </section>
        <section className="kc-info-block">
            <h3>Switch type</h3>
            <p>{preferences.switch || 'Choose a switch type in the carousel.'}</p>
        </section>
        <section className="kc-info-block">
            <h3>Keyboard size</h3>
            <p>{preferences.size || 'Choose a size in the carousel.'}</p>
        </section>
        <section className="kc-info-block">
            <h3>PCB/Plate</h3>
            <p>{plateProduct?.canonical_name ?? 'Select a PCB/plate product in the carousel.'}</p>
            {plateProduct?.min_price != null && <p>${plateProduct.min_price}</p>}
        </section>
        {recommendations.map((recommendation) => {
            const label = recommendation.category === 'pcb_plate'
                ? 'PCB / Plate'
                : recommendation.category === 'keycap' ? 'Keycaps' : 'Switches';
            return (
                <section className="kc-info-block" key={recommendation.id}>
                    <h3>Closest {label}</h3>
                    <p>{recommendation.canonical_name} · {recommendation.score}% match</p>
                    {recommendation.min_price != null && <p>${recommendation.min_price}</p>}
                    {recommendation.matching_preferences.length > 0 && (
                        <p className="kc-recommend-reasons">
                            Matches: {recommendation.matching_preferences.join(' · ')}
                        </p>
                    )}
                    {recommendation.source_url && (
                        <a href={recommendation.source_url} target="_blank" rel="noreferrer">
                            View product
                        </a>
                    )}
                </section>
            );
        })}
        <section className="kc-info-block kc-catalog-results">
            <h3>Filtered catalog</h3>
            {catalogProducts.length === 0 ? (
                <p>No products match these filters.</p>
            ) : (
                <ul>
                    {catalogProducts.slice(0, 8).map((product) => (
                        <li key={product.id}>
                            <span>{product.canonical_name}</span>
                            {product.min_price != null && <span>${product.min_price}</span>}
                            {product.source_url && (
                                <a href={product.source_url} target="_blank" rel="noreferrer">
                                    View
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    </aside>
);
