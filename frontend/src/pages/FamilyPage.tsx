import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AppLayout } from '@/views/layout/AppLayout';
import { useFamilyController } from '@/controllers/useControllers';
import { pl } from '@/models/pl';
import { Button } from '@/views/ui/Button';
import { Modal } from '@/views/ui/Modal';
import { Input } from '@/views/ui/Input';
import { ConfirmDialog } from '@/views/ui/ConfirmDialog';
import { AddItemModal } from '@/views/lists/AddItemModal';
import { useToast } from '@/contexts/ToastContext';

export function FamilyPage() {
  const { members, loading, createMember, deleteMember, addItem, deleteItem } = useFamilyController();
  const { showToast } = useToast();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [addItemMemberId, setAddItemMemberId] = useState<string | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createMember(newName.trim());
      showToast('Członek dodany', 'success');
      setShowAddMember(false);
      setNewName('');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteMemberId) return;
    try {
      await deleteMember(deleteMemberId);
      showToast('Członek usunięty', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
    setDeleteMemberId(null);
  };

  const handleAddItem = async (data: { category: string; name: string; quantity: number }) => {
    if (!addItemMemberId) return;
    try {
      await addItem(addItemMemberId, data);
      showToast('Rzecz dodana', 'success');
      setAddItemMemberId(null);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">{pl.family.title}</h1>
        <Button size="sm" onClick={() => setShowAddMember(true)}>
          <FontAwesomeIcon icon={faPlus} />
          {pl.family.add}
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">{pl.common.loading}</p>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <p className="text-muted mb-4">{pl.family.empty}</p>
          <Button onClick={() => setShowAddMember(true)}>{pl.family.add}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-navy">{member.name}</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setAddItemMemberId(member.id)}>
                    <FontAwesomeIcon icon={faPlus} />
                    {pl.family.addItem}
                  </Button>
                  <button
                    onClick={() => setDeleteMemberId(member.id)}
                    className="text-muted hover:text-red-500 p-2"
                    aria-label="Usuń"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                  </button>
                </div>
              </div>
              {(member.items ?? []).length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">Brak przypisanych rzeczy</p>
              ) : (
                <ul className="divide-y divide-border">
                  {(member.items ?? []).map((item) => (
                    <li key={item.id} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <span className="text-navy">{item.name}</span>
                        <span className="text-sm text-muted ml-2">· {item.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted">×{item.quantity}</span>
                        <button
                          onClick={() => deleteItem(member.id, item.id)}
                          className="text-muted hover:text-red-500"
                          aria-label="Usuń"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title={pl.family.add}>
        <form onSubmit={handleCreateMember} className="space-y-4">
          <Input
            label={pl.form.name}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="np. Anna"
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowAddMember(false)}>
              {pl.form.cancel}
            </Button>
            <Button type="submit">{pl.form.save}</Button>
          </div>
        </form>
      </Modal>

      <AddItemModal
        open={!!addItemMemberId}
        onClose={() => setAddItemMemberId(null)}
        onSubmit={handleAddItem}
      />

      <ConfirmDialog
        open={!!deleteMemberId}
        onClose={() => setDeleteMemberId(null)}
        onConfirm={handleDeleteMember}
        title="Usuń członka"
        message="Czy na pewno chcesz usunąć tego członka rodziny wraz z przypisanymi rzeczami?"
        confirmLabel={pl.form.delete}
        variant="danger"
      />
    </AppLayout>
  );
}
