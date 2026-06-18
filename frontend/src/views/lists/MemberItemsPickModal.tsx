import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import type { FamilyMemberItem } from '@/models/types';
import { pl } from '@/models/pl';
import { Modal } from '@/views/ui/Modal';
import { Button } from '@/views/ui/Button';

interface MemberItemsPickModalProps {
  open: boolean;
  memberName: string;
  items: FamilyMemberItem[];
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (selectedItemIds: string[]) => void;
}

export function MemberItemsPickModal({
  open,
  memberName,
  items,
  submitting = false,
  onClose,
  onConfirm,
}: MemberItemsPickModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  }, [open, items]);

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const title = `${pl.lists.pickMemberItemsTitle} ${pl.lists.pickMemberItemsFor} ${memberName}`;

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <p className="text-sm text-muted mb-4">{pl.lists.pickMemberItemsHint}</p>

      <ul className="max-h-80 overflow-y-auto rounded-xl border border-border divide-y divide-border mb-4">
        {items.map((item) => {
          const checked = selectedIds.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cream/60 transition-colors"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    checked ? 'border-coral bg-coral text-white' : 'border-border bg-white'
                  }`}
                  aria-hidden
                >
                  {checked && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="text-navy">{item.name}</span>
                  <span className="text-sm text-muted ml-2">· {item.category}</span>
                </span>
                <span className="text-sm text-muted shrink-0">×{item.quantity}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          {pl.form.cancel}
        </Button>
        <Button
          type="button"
          onClick={() => onConfirm([...selectedIds])}
          disabled={submitting}
        >
          {submitting ? pl.common.loading : pl.lists.pickMemberItemsConfirm}
        </Button>
      </div>
    </Modal>
  );
}
