export const PREFERENCE_CATEGORIES = [
    {
        key: 'keycap',
        label: 'Keycap Profile',
        options: [
            'Cherry Profile',
            'OEM Profile',
            'Leopold Profile',
            'SA Profile',
            'Varmilo Profile',
            'Cubic Profile',
            'Low Profile',
        ],
    },
    {
        key: 'switch',
        label: 'Switch Type',
        options: [
            'Linear Switches',
            'Tactile Switches',
            'Clicky Switches',
            'HE / Magnetic Switches',
            'Silent Switches',
        ],
    },
    {
        key: 'size',
        label: 'Keyboard Size',
        options: ['Full-size', 'Tenkeyless', '75%', '60%', 'Low profile'],
    },
] as const;

/** API-backed product carousels (browse grid + cart lines). */
export const PRODUCT_CATEGORIES = [
    { key: 'keycap', label: 'Keycaps', type: 'keycaps', selKey: 'keycap', slides: true },
    { key: 'switch', label: 'Switches', type: 'switch', selKey: 'switch', slides: true },
    { key: 'pcb', label: 'PCB/Plate', type: 'pcb_plate', selKey: 'pcbPlate', slides: false },
    { key: 'case', label: 'Case', type: 'keyboard', selKey: 'case', slides: false },
] as const;

export const PLATE_CATEGORY = PRODUCT_CATEGORIES[2];

export type PreferenceCategory = (typeof PREFERENCE_CATEGORIES)[number];
export type PreferenceCategoryKey = PreferenceCategory['key'];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type CategoryKey = ProductCategory['key'];
export type Category = ProductCategory;