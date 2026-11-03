// defines the four selection rows as keycaps, switches, pcb/plates, and cases
export const CATEGORIES = [
    { key: 'keycap', label: 'Keycap', type: 'keycaps', selKey: 'keycap', slides: true},
    { key: 'switch', label: 'Switch', type: 'switch', selKey: 'switch', slides: true},
    { key: 'pcb', label: 'PCB/Plate', type: 'pcb_plate', selKey: 'pcbPlate', slides: false},
    { key: 'case', label: 'Case', type: 'keyboard', selKey: 'case', slides: false},
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryKey = Category['key'];