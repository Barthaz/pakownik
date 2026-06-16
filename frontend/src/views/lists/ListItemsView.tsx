import type { ListItem } from '@/models/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { groupByCategory } from '@/models/progress';
import { useState } from 'react';
import { InlineEditableText } from '@/views/ui/InlineEditableText';
import { QuantityStepper } from '@/views/ui/QuantityStepper';

interface ListItemsViewProps {
  items: ListItem[];
  onToggle: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onUpdateItem?: (itemId: string, data: { name?: string; quantity?: number }) => void;
  readOnly?: boolean;
  canCheck?: boolean;
  canEdit?: boolean;
}

export function ListItemsView({
  items,
  onToggle,
  onDelete,
  onUpdateItem,
  readOnly = false,
  canCheck = true,
  canEdit = false,
}: ListItemsViewProps) {
  const grouped = groupByCategory(items);
  const categories = Object.keys(grouped).sort();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const canEditDetails = canEdit && !!onUpdateItem;

  if (items.length === 0) {
    return (
      <p className="text-center text-muted py-8">Brak pozycji na liście. Dodaj pierwszą rzecz do spakowania.</p>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const catItems = grouped[category];
        const isCollapsed = collapsed[category];
        const catPacked = catItems.filter((i) => i.packed).length;

        return (
          <div key={category} className="rounded-2xl border border-border bg-white overflow-hidden">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-cream/50 transition-colors"
              onClick={() => setCollapsed((c) => ({ ...c, [category]: !c[category] }))}
            >
              <span className="font-medium text-navy">{category}</span>
              <span className="text-sm text-muted">
                {catPacked}/{catItems.length} · {isCollapsed ? '▸' : '▾'}
              </span>
            </button>
            {!isCollapsed && (
              <ul className="divide-y divide-border">
                {catItems.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 ${item.packed ? 'opacity-60' : ''}`}
                  >
                    {!readOnly && canCheck && (
                      <button
                        onClick={() => onToggle(item.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                          item.packed
                            ? 'border-coral bg-coral text-white'
                            : 'border-border hover:border-coral'
                        }`}
                        aria-label={item.packed ? 'Odznacz' : 'Zaznacz jako spakowane'}
                      >
                        {item.packed && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                      </button>
                    )}
                    {readOnly && (
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                          item.packed ? 'bg-coral/20 text-coral' : 'bg-border'
                        }`}
                      >
                        {item.packed && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <InlineEditableText
                        value={item.name}
                        packed={item.packed}
                        editable={canEditDetails}
                        onSave={(name) => onUpdateItem?.(item.id, { name })}
                      />
                    </div>
                    {canEditDetails ? (
                      <QuantityStepper
                        quantity={item.quantity}
                        onChange={(quantity) => onUpdateItem(item.id, { quantity })}
                      />
                    ) : (
                      <span className="text-sm text-muted shrink-0 tabular-nums">×{item.quantity}</span>
                    )}
                    {canEdit && onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-muted hover:text-red-500 transition-colors p-1 shrink-0"
                        aria-label="Usuń"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
