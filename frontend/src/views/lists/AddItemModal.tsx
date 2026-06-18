import { Modal } from '@/views/ui/Modal';
import { Input } from '@/views/ui/Input';
import { ItemNameAutocomplete } from '@/views/ui/ItemNameAutocomplete';
import { Select } from '@/views/ui/Select';
import { Button } from '@/views/ui/Button';
import { DEFAULT_CATEGORIES } from '@/models/constants';
import { collectItemSuggestions, type ItemSuggestion } from '@/models/itemSuggestions';
import { pl } from '@/models/pl';
import { useEffect, useMemo, useState } from 'react';

interface SuggestionMember {
  id: string;
  items?: { name: string; category: string }[];
}

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; name: string; quantity: number }) => void;
  members?: SuggestionMember[];
  excludeMemberId?: string | null;
}

export function AddItemModal({
  open,
  onClose,
  onSubmit,
  members = [],
  excludeMemberId = null,
}: AddItemModalProps) {
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');

  const suggestions = useMemo(
    () => (open ? collectItemSuggestions(members, excludeMemberId) : []),
    [open, members, excludeMemberId],
  );

  useEffect(() => {
    if (open) {
      setCategory(DEFAULT_CATEGORIES[0]);
      setName('');
      setQuantity('1');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ category, name: name.trim(), quantity: Math.max(1, Number(quantity) || 1) });
    setName('');
    setQuantity('1');
    onClose();
  };

  const handleSuggestionSelect = (suggestion: ItemSuggestion) => {
    setName(suggestion.name);
    setCategory(suggestion.category);
  };

  return (
    <Modal open={open} onClose={onClose} title={pl.lists.addItem}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label={pl.form.category}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        {suggestions.length > 0 ? (
          <ItemNameAutocomplete
            label={pl.form.name}
            value={name}
            onChange={setName}
            onSelect={handleSuggestionSelect}
            suggestions={suggestions}
            placeholder="np. Koszulka"
            required
          />
        ) : (
          <Input
            label={pl.form.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Koszulka"
            required
          />
        )}
        <Input
          label={pl.form.quantity}
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {pl.form.cancel}
          </Button>
          <Button type="submit">{pl.form.save}</Button>
        </div>
      </form>
    </Modal>
  );
}
