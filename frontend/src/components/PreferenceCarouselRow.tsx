import React, { useRef, useState } from 'react';
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
    const lastWheelStep = useRef<number | null>(null);
    const touchStartX = useRef<number | null>(null);
    const option = category.options[index];
    const previous = category.options[(index - 1 + category.options.length) % category.options.length];
    const next = category.options[(index + 1) % category.options.length];
    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (Math.abs(delta) < 10 || (lastWheelStep.current !== null && event.timeStamp - lastWheelStep.current < 180)) return;
        lastWheelStep.current = event.timeStamp;
        onStep(delta > 0 ? 1 : -1);
    };
    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (startX === null || endX === undefined || Math.abs(endX - startX) < 40) return;
        onStep(endX < startX ? 1 : -1);
    };

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
            <div
                className="kc-choice-track"
                role="group"
                aria-label={`${category.label}: ${option}`}
                onWheel={handleWheel}
                onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
                onTouchEnd={handleTouchEnd}
            >
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
