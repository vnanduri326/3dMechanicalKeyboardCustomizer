// frontend/src/components/FilterPanel.tsx
import React from 'react';

interface FilterPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedTags,
  onTagToggle,
}) => {
  return (
    <aside className="w-64 bg-slate-100 p-4 border-r border-slate-300">
      <h2 className="text-xl font-bold mb-4 font-mono">Filters</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full p-2 border rounded font-mono text-sm"
        />
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 font-mono">Category</h3>
        {['all', 'keyboard', 'switch', 'keycaps', 'pcb_plate'].map((cat) => (
          <label key={cat} className="block text-sm capitalize mb-1 font-mono">
            <input
              type="radio"
              name="category"
              checked={selectedType === cat}
              onChange={() => onTypeChange(cat)}
              className="mr-2"
            />
            {cat}
          </label>
        ))}
      </div>

      {/* Spec Tags */}
      <div>
        <h3 className="font-semibold mb-2 font-mono">Specs</h3>
        {['feel:linear', 'feel:tactile', 'layout:75%', 'profile:cherry'].map((tag) => (
          <label key={tag} className="block text-sm mb-1 font-mono">
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => onTagToggle(tag)}
              className="mr-2"
            />
            {tag}
          </label>
        ))}
      </div>
    </aside>
  );
};