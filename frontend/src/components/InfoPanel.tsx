import React from 'react';
import { KeyboardRecommendation, Product, RecommendationPreferences } from '../types';
import { CloseIcon, InfoIcon } from '../icons';

interface InfoPanelProps {
    preferences: RecommendationPreferences;
    plateProduct?: Product;
    recommendation?: KeyboardRecommendation;
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    preferences,
    plateProduct,
    recommendation,
    onClose,
}) => (
    <aside className="kc-info">
        <div className="kc-panel-head">
            <div className="kc-section-title kc-px"><InfoIcon /><span>Info</span></div>
            <button className="kc-x" onClick={onClose} aria-label="Close info"><CloseIcon /></button>
        </div>
        <section className="kc-info-block">
            <h3>Keyboard size</h3>
            <p>{preferences.size || 'Choose a size in the carousel.'}</p>
        </section>
        <section className="kc-info-block">
            <h3>Switch type</h3>
            <p>{preferences.switch || 'Choose a switch type in the carousel.'}</p>
        </section>
        <section className="kc-info-block">
            <h3>Keycap profile</h3>
            <p>{preferences.keycap || 'Choose a keycap profile in the carousel.'}</p>
        </section>
        <section className="kc-info-block">
            <h3>PCB/Plate</h3>
            <p>{plateProduct?.canonical_name ?? 'Select a PCB/plate product in the carousel.'}</p>
            {plateProduct?.min_price != null && <p>${plateProduct.min_price}</p>}
        </section>
        {recommendation && (
            <section className="kc-info-block">
                <h3>Closest keyboard</h3>
                <p>{recommendation.canonical_name} · {recommendation.score}% match</p>
                {recommendation.matching_preferences.length > 0 && (
                    <p className="kc-recommend-reasons">
                        Matches: {recommendation.matching_preferences.join(' · ')}
                    </p>
                )}
            </section>
        )}
    </aside>
);
