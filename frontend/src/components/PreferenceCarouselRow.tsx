import React, { useRef, useState } from 'react';
import { PreferenceCategory } from '../categories';
import { ArrowIcon } from '../icons';
import ModelViewer from './ModelViewer';

const modelUrls: Partial<Record<PreferenceCategory['key'], Record<string, string>>> = {
    plate: {
        Aluminum: '/models/plates/3d-mechanical-keyboard-plate.glb',
        Brass: '/models/plates/3d-mechanical-keyboard-plate.glb',
        Polycarbonate: '/models/plates/3d-mechanical-keyboard-plate.glb',
        FR4: '/models/plates/3d-mechanical-keyboard-plate.glb',
        'Stainless Steel': '/models/plates/3d-mechanical-keyboard-plate.glb',
    },
    keycap: {
        'Cherry Profile': '/models/keycaps/cherry-cap.glb',
        'Leopold Profile': '/models/keycaps/cherry-cap.glb',
        'SA Profile': '/models/keycaps/sa-cap.glb',
        'OEM Profile': '/models/keycaps/oem-cap.glb',
        'Cubic Profile': '/models/keycaps/oem-cap.glb',
        'Varmilo Profile': '/models/keycaps/oem-cap.glb',
        'Low Profile': '/models/keycaps/lowprofile-cap.glb',
    },
    switch: {
        'Linear Switches': '/models/switches/switch.glb',
        'Tactile Switches': '/models/switches/switch.glb',
        'Clicky Switches': '/models/switches/switch.glb',
        'HE / Magnetic Switches': '/models/switches/switch.glb',
        'Silent Switches': '/models/switches/switch.glb',
    },
    size: {
        'Full-size': '/models/cases/fullsize-keeb.glb',
        Tenkeyless: '/models/cases/tenkeyless-keeb.glb',
        '75%': '/models/cases/75-keeb.glb',
        '65%': '/models/cases/65-keeb.glb',
        '60%': '/models/cases/Keyboard.glb',
        'Low profile': '/models/cases/K3-Pro-US-Full-Model-3d.glb',
    },
};

const modelColors: Partial<Record<PreferenceCategory['key'], Record<string, string>>> = {
    plate: {
        Aluminum: '#aeb8c2',
        Brass: '#c49a3a',
        Polycarbonate: '#8ecbe8',
        FR4: '#000000',
        'Stainless Steel': '#e0e4e8',
    },
};

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
    const modelUrl = modelUrls[category.key]?.[option];
    const modelColor = modelColors[category.key]?.[option];
    const zoomOutCap = modelUrl?.endsWith('sa-cap.glb') || modelUrl?.endsWith('oem-cap.glb');
    const zoomInModel = category.key === 'size' || category.key === 'plate';
    const boundsMargin = zoomOutCap ? 1.6 : zoomInModel ? 0.9 : 1.2;
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
                <div className="kc-choice-selected">
                    {modelUrl && (
                        <ModelViewer
                            src={modelUrl}
                            boundsMargin={boundsMargin}
                            modelColor={modelColor}
                        />
                    )}
                    <button
                        className={`kc-choice-main ${selected === option ? 'kc-choice-picked' : ''}`}
                        onClick={() => onSelect(option)}
                        aria-pressed={selected === option}
                    >
                        {option}
                    </button>
                </div>
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
