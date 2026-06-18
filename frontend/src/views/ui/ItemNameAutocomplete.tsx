import { useEffect, useId, useRef, useState } from 'react';
import { filterItemSuggestions, type ItemSuggestion } from '@/models/itemSuggestions';
import { pl } from '@/models/pl';

interface ItemNameAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: ItemSuggestion) => void;
  suggestions: ItemSuggestion[];
  placeholder?: string;
  required?: boolean;
}

export function ItemNameAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  required,
}: ItemNameAutocompleteProps) {
  const inputId = useId();
  const listId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = filterItemSuggestions(suggestions, value);
  const showList = open && value.trim().length > 0 && matches.length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [value, matches.length]);

  useEffect(() => {
    return () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);

  const pick = (suggestion: ItemSuggestion) => {
    onSelect(suggestion);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter' && matches[activeIndex]) {
      e.preventDefault();
      pick(matches[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-navy">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete="list"
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-navy placeholder:text-muted focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-lg"
          >
            {matches.map((suggestion, index) => (
              <li key={`${suggestion.category}-${suggestion.name}`} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    index === activeIndex ? 'bg-coral/10 text-navy' : 'text-navy hover:bg-cream/80'
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(suggestion)}
                >
                  <span>{suggestion.name}</span>
                  <span className="text-muted shrink-0">{suggestion.category}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {suggestions.length > 0 && !showList && value.trim().length === 0 && (
        <p className="text-xs text-muted">{pl.form.itemSuggestionsHint}</p>
      )}
    </div>
  );
}
