// shows filters or cart (groupd under option), leaving the other to be a button in LL corner
import React from 'react';
import {FilterIcon, CartIcon, CloseIcon} from '../icons.tsx';
import {useResizablePanel} from '../hooks/useResizablePanel'; // NEW

export type LeftMode = 'filters' | 'cart';

interface LeftPanelProps {
    mode: LeftMode;
    open: boolean;
    cartCount: number;
    onMode: (m: LeftMode) => void;
    onClose: () => void;
    filters: React.ReactNode;
    cart: React.ReactNode;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({mode, open, cartCount, onMode, onClose, filters, cart}) => {
 // NEW: resizing, capped at 1/3 of the screen. This must stay above the "if (!open)" return below.
 const {width, dragging, min, max, handleProps} = useResizablePanel({side: 'left', initial: 270, min: 210});

 const cartBtn = (
    <button className="kc-fab kc-fab-cart" onClick={() => onMode('cart')} aria-label="Open cart">
        <CartIcon /><span className="kc-badge">{cartCount}</span>
    </button>
 );
 const filterBtn= (
    <button className="kc-fab" onClick={() => onMode('filters')} aria-label="Open filters"><FilterIcon /></button>
 );

 // collapsed allows both buttons to be shown for reopening the tab
 if (!open){
    return <div className="kc-swap kc-swap-fixed">{filterBtn}{cartBtn}</div>;
 }

 // default display to filters
 return (
    <>
        <aside className={`kc-left kc-left-${mode}`} style={{width}}> {/* NEW: style={{width}} */}
            <div className="kc-panel-head">
                {mode === 'filters' ? <FilterIcon halo /> : <CartIcon halo />}
                <h2 className="kc-px">{mode === 'filters' ? 'Filters' : 'Your Cart'}</h2>
                <button className="kc-x" onClick={onClose} aria-label="Close panel"><CloseIcon /></button>
            </div>
            {mode === 'filters' ? filters : cart}
            <div className="kc-swap">{mode === 'filters' ? cartBtn : filterBtn}</div>
        </aside>
        {/* NEW: the draggable edge */}
        <div
            className={`kc-resizer ${dragging ? 'kc-dragging' : ''}`}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(width)}
            aria-valuemin={min}
            aria-valuemax={max}
            tabIndex={0}
            {...handleProps}
        />
    </>
 );
};