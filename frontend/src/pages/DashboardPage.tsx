import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AppLayout } from '@/views/layout/AppLayout';
import { usePackingListsController } from '@/controllers/useControllers';
import { useFamilyController } from '@/controllers/useControllers';
import { pl } from '@/models/pl';
import { Button } from '@/views/ui/Button';
import { Modal } from '@/views/ui/Modal';
import { Input } from '@/views/ui/Input';
import { ConfirmDialog } from '@/views/ui/ConfirmDialog';
import { MemberItemsPickModal } from '@/views/lists/MemberItemsPickModal';
import { FamilyMemberSelectChip } from '@/views/lists/FamilyMemberSelectChip';
import { calculateProgress } from '@/models/progress';
import { useToast } from '@/contexts/ToastContext';
import type { FamilyMember, ItemsByMember } from '@/models/types';

export function DashboardPage() {
  const { lists, loading, createList, deleteList } = usePackingListsController();
  const { members } = useFamilyController();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickQueue, setPickQueue] = useState<FamilyMember[]>([]);
  const [itemsByMember, setItemsByMember] = useState<ItemsByMember>({});
  const [pendingCreateName, setPendingCreateName] = useState('');

  const resetCreateState = () => {
    setShowCreate(false);
    setNewName('');
    setSelectedMembers([]);
    setPickQueue([]);
    setItemsByMember({});
    setPendingCreateName('');
  };

  const finishCreate = async (name: string, memberIds: string[], selections: ItemsByMember) => {
    setCreating(true);
    try {
      await createList(name, memberIds, selections);
      showToast('Lista utworzona', 'success');
      resetCreateState();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (selectedMembers.length === 0) {
      await finishCreate(newName.trim(), [], {});
      return;
    }

    const selected = selectedMembers
      .map((id) => members.find((m) => m.id === id))
      .filter((m): m is FamilyMember => m !== undefined);
    const withoutItems = selected.filter((m) => (m.items ?? []).length === 0);
    const withItems = selected.filter((m) => (m.items ?? []).length > 0);
    const initialSelections = Object.fromEntries(withoutItems.map((m) => [m.id, []]));

    if (withItems.length === 0) {
      await finishCreate(newName.trim(), selectedMembers, initialSelections);
      return;
    }

    setPendingCreateName(newName.trim());
    setItemsByMember(initialSelections);
    setPickQueue(withItems);
    setShowCreate(false);
  };

  const handlePickConfirm = async (selectedItemIds: string[]) => {
    const current = pickQueue[0];
    if (!current) return;

    const nextSelections = { ...itemsByMember, [current.id]: selectedItemIds };
    const rest = pickQueue.slice(1);

    if (rest.length === 0) {
      await finishCreate(pendingCreateName, selectedMembers, nextSelections);
      return;
    }

    setItemsByMember(nextSelections);
    setPickQueue(rest);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteList(deleteId);
      showToast('Lista usunięta', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
    setDeleteId(null);
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">{pl.lists.title}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <FontAwesomeIcon icon={faPlus} />
          {pl.lists.new}
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">{pl.common.loading}</p>
      ) : lists.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <p className="text-muted mb-4">{pl.lists.empty}</p>
          <Button onClick={() => setShowCreate(true)}>{pl.lists.new}</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map((list) => {
            const progress = calculateProgress(list.items ?? []);
            const isShared = list.ownership === 'shared';
            return (
              <div
                key={list.id}
                className="rounded-2xl border border-border bg-white p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link to={`/app/lists/${list.id}`} className="flex-1">
                    <h2 className="font-semibold text-navy hover:text-coral transition-colors">
                      {list.name}
                    </h2>
                    {isShared && list.sharedByEmail && (
                      <p className="text-xs text-coral mt-1">
                        {pl.lists.sharedBadge} · {pl.lists.sharedFrom} {list.sharedByEmail}
                      </p>
                    )}
                  </Link>
                  {!isShared && (
                    <button
                      onClick={() => setDeleteId(list.id)}
                      className="text-muted hover:text-red-500 p-1"
                      aria-label={pl.lists.delete}
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  )}
                </div>
                <Link to={`/app/lists/${list.id}`}>
                  <div className="h-2 rounded-full bg-border overflow-hidden mb-2">
                    <div
                      className="h-full bg-coral rounded-full transition-all"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted">
                    {progress.percent}% · {progress.packedQuantity}/{progress.totalQuantity}{' '}
                    {pl.lists.pieces}
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={pl.lists.new}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={pl.form.name}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="np. Wakacje nad morzem"
            required
          />
          {members.length > 0 && (
            <div>
              <p className="text-sm font-medium text-navy mb-2">{pl.lists.addMembers}</p>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <FamilyMemberSelectChip
                    key={m.id}
                    member={m}
                    selected={selectedMembers.includes(m.id)}
                    onClick={() => toggleMember(m.id)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
              {pl.form.cancel}
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? pl.common.loading : pl.form.save}
            </Button>
          </div>
        </form>
      </Modal>

      <MemberItemsPickModal
        open={pickQueue.length > 0}
        memberName={pickQueue[0]?.name ?? ''}
        items={pickQueue[0]?.items ?? []}
        submitting={creating}
        onClose={() => {
          setPickQueue([]);
          setItemsByMember({});
          setPendingCreateName('');
        }}
        onConfirm={(selectedItemIds) => void handlePickConfirm(selectedItemIds)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={pl.lists.delete}
        message={pl.lists.deleteConfirm}
        confirmLabel={pl.form.delete}
        variant="danger"
      />
    </AppLayout>
  );
}
