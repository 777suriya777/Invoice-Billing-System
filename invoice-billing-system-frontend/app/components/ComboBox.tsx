'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

interface Props<T> {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  isLoading?: boolean;
  options: T[];
  renderOption?: (item: T) => React.ReactNode;
  getOptionLabel?: (item: T) => string;
}

export function ComboBox<T>(props: Props<T>) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  const getOptionLabel = props.getOptionLabel ?? ((option: T) => (option as Record<string, unknown>).name as string);

  const filteredOptions = props.options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(props.value.toLowerCase()),
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropDown) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          props.onSelect(filteredOptions[selectedIndex]);
          setShowDropDown(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowDropDown(false);
        break;
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowDropDown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative" role="combobox" aria-expanded={showDropDown}>
      <div className="relative">
        <input
          type="text"
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onFocus={() => setShowDropDown(true)}
          onKeyDown={handleKeyDown}
          aria-activedescendant={selectedIndex > -1 ? `option-${selectedIndex}` : undefined}
          className="w-full px-3 py-2.5 pr-9 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white"
        />
        <ChevronDown
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>

      {showDropDown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {props.isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Loader2 size={14} className="animate-spin" />
              Loading…
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">No results found</div>
          ) : (
            filteredOptions.map((item, index) => (
              <div
                key={index}
                id={`option-${index}`}
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => {
                  props.onSelect(item);
                  setShowDropDown(false);
                }}
                className={`px-4 py-3 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-0 ${
                  selectedIndex === index
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {props.renderOption ? props.renderOption(item) : getOptionLabel(item)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
