import { useEffect, useRef, useState } from 'react';

interface InlineEditableTextProps {
  value: string;
  onSave: (value: string) => void;
  editable?: boolean;
  className?: string;
  packed?: boolean;
}

export function InlineEditableText({
  value,
  onSave,
  editable = true,
  className = '',
  packed = false,
}: InlineEditableTextProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focused) setDraft(value);
  }, [value, focused]);

  const commit = () => {
    setFocused(false);
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(value);
      return;
    }
    if (trimmed !== value) onSave(trimmed);
  };

  if (!editable) {
    return (
      <span className={`block truncate ${packed ? 'line-through' : ''} ${className}`}>
        {value}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={() => {
        setFocused(true);
        requestAnimationFrame(() => inputRef.current?.select());
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
        if (e.key === 'Escape') {
          setDraft(value);
          e.currentTarget.blur();
        }
      }}
      className={`w-full min-w-0 bg-transparent border-0 p-0 text-navy outline-none ring-0 focus:ring-0 placeholder:text-muted ${
        packed ? 'line-through opacity-80' : ''
      } ${focused ? 'cursor-text' : 'cursor-pointer'} ${className}`}
      aria-label="Nazwa pozycji"
    />
  );
}
