import React, { useState } from 'react';
import { PreferenceCategory } from '../categories';
import { ArrowIcon } from '../icons';

interface PreferenceCarouselRowProps {
    category: PreferenceCategory;
    index: number;
    selected?: string;
    onStep: (direction: 1 | -1) => void;
    onSelect: (value: string) => void;
    onChoose: (index: number) => void;
}

export const PreferenceCarouselRow: React.FC<PreferenceCarouselRowProps> = ({
    category,
    index,
    selected,
    onStep,
    onSelect,
    onChoose,
}) => {
    const [gridOpen, setGridOpen] = useState(false);
    const option = category.options[index];
    const previous = category.options[(index - 1 + category.options.length) % category.options.length];
    const next = category.options[(index + 1) % category.options.length];

    return (
        <div className="kc-row">
            <button
                className="kc-grid-btn"
                aria-label={`Browse all ${category.label} options`}
                aria-expanded={gridOpen}
                onClick={() => setGridOpen((open) => !open)}
            >
                {Array.from({ length: 9 }, (_, i) => <i key={i} />)}
            </button>
            <button
                className="kc-arrow"
                onClick={() => onStep(-1)}
                aria-label={`Previous ${category.label}`}
            >
                <ArrowIcon dir="left" />
            </button>
            <div className="kc-choice-track" role="group" aria-label={`${category.label}: ${option}`}>
                <span className="kc-choice-side">{previous}</span>
                <button
                    className={`kc-choice-main ${selected === option ? 'kc-choice-picked' : ''}`}
                    onClick={() => onSelect(option)}
                    aria-pressed={selected === option}
                >
                    {option}
                </button>
                <span className="kc-choice-side">{next}</span>
            </div>
            <button
                className="kc-arrow"
                onClick={() => onStep(1)}
                aria-label={`Next ${category.label}`}
            >
                <ArrowIcon dir="right" />
            </button>
            {gridOpen && (
                <div className="kc-choice-grid" role="group" aria-label={`All ${category.label} options`}>
                    <strong>{category.label}</strong>
                    <div>
                        {category.options.map((value, optionIndex) => (
                            <button
                                key={value}
                                className={selected === value ? 'kc-choice-grid-picked' : ''}
                                aria-pressed={selected === value}
                                onClick={() => {
                                    onSelect(value);
                                    onChoose(optionIndex);
                                    setGridOpen(false);
                                }}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
