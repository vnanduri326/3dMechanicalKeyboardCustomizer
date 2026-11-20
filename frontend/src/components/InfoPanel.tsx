import React from 'react';
import { PartRecommendation, Product, RecommendationPreferences } from '../types';
import { CloseIcon, InfoIcon } from '../icons';
import { useResizablePanel } from '../hooks/useResizablePanel';

interface InfoPanelProps {
    preferences: RecommendationPreferences;
    recommendations: PartRecommendation[];
    cartItemIds: string[];
    onAddToCart: (product: Product) => void;
    catalogProducts: Product[];
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    preferences,
    recommendations,
    cartItemIds,
    onAddToCart,
    catalogProducts,
    onClose,
}) => {
    const { width, dragging, min, max, handleProps } = useResizablePanel({
        side: 'right',
        initial: 340,
        min: 220,
    });

    const renderRecommendation = (
        category: PartRecommendation['category'],
        label: string,
    ) => {
        const recommendation = recommendations.find((item) => item.category === category);
        if (!recommendation) return null;
        const inCart = cartItemIds.includes(recommendation.id);

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
                <div className="kc-recommend-card-actions">
                    {recommendation.source_url && (
                        <a href={recommendation.source_url} target="_blank" rel="noreferrer">
                            View product
                        </a>
                    )}
                    <button
                        type="button"
                        disabled={inCart}
                        onClick={() => onAddToCart(recommendation)}
                    >
                        {inCart ? 'Added to cart' : 'Add to cart'}
                    </button>
                </div>
            </section>
        );
    };

    return (
        <>
            <div
                className={`kc-resizer ${dragging ? 'kc-dragging' : ''}`}
                role="separator"
                aria-label="Resize info panel"
                aria-orientation="vertical"
                aria-valuenow={Math.round(width)}
                aria-valuemin={min}
                aria-valuemax={max}
                tabIndex={0}
                {...handleProps}
            />
            <aside className="kc-info" style={{ width }}>
                <div className="kc-panel-head">
                    <div className="kc-section-title kc-px"><InfoIcon /><span>Info</span></div>
                    <button className="kc-x" onClick={onClose} aria-label="Close info"><CloseIcon /></button>
                </div>
                <section className="kc-info-block">
                    <h3>Keycap profile</h3>
                    <p>{preferences.keycap || 'Choose a keycap profile in the carousel.'}</p>
                </section>
                {renderRecommendation('keycap', 'Keycaps')}
                <section className="kc-info-block">
                    <h3>Switch type</h3>
                    <p>{preferences.switch || 'Choose a switch type in the carousel.'}</p>
                </section>
                {renderRecommendation('switch', 'Switches')}
                <section className="kc-info-block">
                    <h3>Keyboard size</h3>
                    <p>{preferences.size || 'Choose a size in the carousel.'}</p>
                </section>
                {renderRecommendation('case', 'Cases')}
                <section className="kc-info-block">
                    <h3>Plate material</h3>
                    <p>{preferences.plate || 'Choose a plate material in the carousel.'}</p>
                </section>
                {renderRecommendation('pcb_plate', 'PCB / Plate')}
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
        </>
    );
};
