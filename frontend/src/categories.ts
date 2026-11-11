export const PREFERENCE_CATEGORIES = [
    {
        key: 'size',
        label: 'Keyboard Size',
        options: ['Full-size', 'Tenkeyless', '75%', '60%', 'Low profile'],
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
] as const;

export const PLATE_CATEGORY = {
    key: 'pcb',
    label: 'PCB/Plate',
    type: 'pcb_plate',
    selKey: 'pcbPlate',
    slides: false,
} as const;

export type PreferenceCategory = (typeof PREFERENCE_CATEGORIES)[number];
export type PreferenceCategoryKey = PreferenceCategory['key'];
export type Category = typeof PLATE_CATEGORY;