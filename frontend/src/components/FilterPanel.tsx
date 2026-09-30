interface FilterPanelProps {
  onSelectType: (type: string | null) => void;
}

const PRODUCT_TYPES = ["75% Keyboards", "TKL Keyboards", "Full-size Keyboards"];

export function FilterPanel({ onSelectType }: FilterPanelProps) {
  return (
    <div className="w-48 p-4 border-r">
      <h4 className="font-semibold mb-2">Layout</h4>
      <button className="block text-sm mb-1" onClick={() => onSelectType(null)}>
        All
      </button>
      {PRODUCT_TYPES.map((type) => (
        <button
          key={type}
          className="block text-sm mb-1"
          onClick={() => onSelectType(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
}