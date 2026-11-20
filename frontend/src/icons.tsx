// all svg icons used 
import React from 'react';
const base = {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true} as const;

// halo prop for icons to draw the icon twice and give it the "stroke" effrct
const Halo = ({ halo, children }: { halo?: boolean; children: React.ReactNode }) =>
  halo ? <><g className="kc-halo">{children}</g><g className="kc-line">{children}</g></> : <>{children}</>;

export const FilterIcon = ({halo}: {halo?: boolean}) => (
    <svg {...base}><Halo halo={halo}><path d="M3 4h18l-7 9v6l-4 2v8z" strokeLinejoin="round" /></Halo></svg>
);
export const CartIcon = ({halo}: {halo?: boolean}) => (
    <svg {...base}><Halo halo={halo}><path d="M2 3h3l2.5 12h11L21 7H6" strokeLinejoin="round" /></Halo></svg>
);
export const CloseIcon = () => <svg {...base} strokeWidth={2.4}><path d="M4 4l16 16M20 4L4 20" /></svg>;
export const ChevronIcon = () => <svg {...base} strokeWidth={3}><path d="M5 15l7-7 7 7" /></svg>;
export const ArrowIcon = ({dir}: {dir: 'left' | 'right'}) => (
    <svg viewBox="0 0 22 34" fill="none" stroke="currentColor" strokeWidth={2.6} aria-hidden>
        <path d={dir === 'left' ? 'M17 3L5 17l12 14' : 'M5 3l12 14L5 31'} />
    </svg>
);

    // info logo is built different from filled shapes so defined separately
export const InfoIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm0 2.2a8.3 8.3 0 1 1 0 16.6 8.3 8.3 0 0 1 0-16.6z" />
    <circle cx="12" cy="7.6" r="1.4" />
    <rect x="10.9" y="10.5" width="2.2" height="6.8" />
  </svg>
);