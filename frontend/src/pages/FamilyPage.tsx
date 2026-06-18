import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { AppLayout } from '@/views/layout/AppLayout';
import { useFamilyController } from '@/controllers/useControllers';
import { pl } from '@/models/pl';
import { Button } from '@/views/ui/Button';
import { Modal } from '@/views/ui/Modal';
import { Input } from '@/views/ui/Input';
import { ConfirmDialog } from '@/views/ui/ConfirmDialog';
import { AddItemModal } from '@/views/lists/AddItemModal';
import { useToast } from '@/contexts/ToastContext';
import type { FamilyMemberShare } from '@/models/types';
import { getMemberItemStats } from '@/models/familyMemberStats';
import { familyShareService } from '@/services/familyShareService';

export function FamilyPage() {
  const { members, loading, reload, createMember, deleteMember, addItem, deleteItem } =
    useFamilyController();
  const { showToast } = useToast();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [newName, setNewName] = useState('');
  const [addItemMemberId, setAddItemMemberId] = useState<string | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedShareMembers, setSelectedShareMembers] = useState<string[]>([]);
  const [shares, setShares] = useState<FamilyMemberShare[]>([]);
  const [sharing, setSharing] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const ownedMembers = members.filter((m) => m.ownership !== 'shared');

  const loadShares = async () => {
    try {
      const data = await familyShareService.getShares();
      setShares(data);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const openShareModal = () => {
    setShowShare(true);
    setSelectedShareMembers([]);
    void loadShares();
  };

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
      await reload();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleDeleteItem = async (memberId: string, itemId: string) => {
    try {
      await deleteItem(memberId, itemId);
      await reload();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim() || selectedShareMembers.length === 0) return;
    setSharing(true);
    try {
      await familyShareService.createShares({
        memberIds: selectedShareMembers,
        email: shareEmail.trim(),
        permission: 'full_edit',
      });
      showToast('Profile udostępnione', 'success');
      setShareEmail('');
      setSelectedShareMembers([]);
      await loadShares();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await familyShareService.deleteShare(shareId);
      showToast('Dostęp cofnięty', 'success');
      await loadShares();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const canEditMember = (member: (typeof members)[number]) =>
    member.ownership !== 'shared' || member.myPermission === 'full_edit';

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-navy">{pl.family.title}</h1>
        <div className="flex flex-wrap gap-2">
          {ownedMembers.length > 0 && (
            <Button variant="ghost" size="sm" onClick={openShareModal}>
              <FontAwesomeIcon icon={faShareNodes} />
              {pl.family.share}
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddMember(true)}>
            <FontAwesomeIcon icon={faPlus} />
            {pl.family.add}
          </Button>
        </div>
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
          {members.map((member) => {
            const isShared = member.ownership === 'shared';
            const canEdit = canEditMember(member);
            const memberItems = member.items ?? [];
            const { positions, totalQuantity } = getMemberItemStats(memberItems);
            const isCollapsed = collapsed[member.id];
            const statsLabel =
              positions === 0
                ? 'Brak rzeczy'
                : `${positions} ${pl.lists.items} · ${totalQuantity} ${pl.lists.pieces}`;

            return (
              <div key={member.id} className="rounded-2xl border border-border bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left hover:opacity-80 transition-opacity"
                    onClick={() =>
                      setCollapsed((c) => ({ ...c, [member.id]: !c[member.id] }))
                    }
                    aria-expanded={!isCollapsed}
                  >
                    <div className="min-w-0">
                      <h2 className="font-semibold text-navy">{member.name}</h2>
                      {isShared && member.sharedByEmail && (
                        <p className="text-xs text-muted mt-0.5">
                          {pl.family.sharedBadge} · {pl.family.sharedFrom} {member.sharedByEmail}
                        </p>
                      )}
                      <p className="text-sm text-muted mt-0.5">{statsLabel}</p>
                    </div>
                    <span className="text-sm text-muted shrink-0" aria-hidden>
                      {isCollapsed ? '▸' : '▾'}
                    </span>
                  </button>
                  <div className="flex gap-2 shrink-0">
                    {canEdit && (
                      <Button variant="ghost" size="sm" onClick={() => setAddItemMemberId(member.id)}>
                        <FontAwesomeIcon icon={faPlus} />
                        {pl.family.addItem}
                      </Button>
                    )}
                    {!isShared && (
                      <button
                        onClick={() => setDeleteMemberId(member.id)}
                        className="text-muted hover:text-red-500 p-2"
                        aria-label="Usuń"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
                {!isCollapsed && (
                  <>
                {!canEdit && (
                  <p className="px-4 py-2 text-sm text-muted border-b border-border bg-cream/40">
                    {pl.family.sharedReadonly}
                  </p>
                )}
                {memberItems.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">Brak przypisanych rzeczy</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {memberItems.map((item) => (
                      <li key={item.id} className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <span className="text-navy">{item.name}</span>
                          <span className="text-sm text-muted ml-2">· {item.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted">×{item.quantity}</span>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteItem(member.id, item.id)}
                              className="text-muted hover:text-red-500"
                              aria-label="Usuń"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                  </>
                )}
              </div>
            );
          })}
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

      <Modal open={showShare} onClose={() => setShowShare(false)} title={pl.family.share}>
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-navy mb-2">{pl.family.shareSelectMembers}</p>
            <div className="flex flex-wrap gap-2">
              {ownedMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    setSelectedShareMembers((prev) =>
                      prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id],
                    )
                  }
                  className={`rounded-xl px-3 py-1.5 text-sm border transition-colors ${
                    selectedShareMembers.includes(m.id)
                      ? 'border-coral bg-coral/15 text-coral-dark'
                      : 'border-border text-muted hover:border-coral/50'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <Input
            label={pl.family.shareEmail}
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder={pl.family.shareEmailPlaceholder}
            required
          />
          <Button
            type="submit"
            disabled={sharing || !shareEmail.trim() || selectedShareMembers.length === 0}
          >
            {sharing ? pl.common.loading : pl.family.shareAdd}
          </Button>
        </form>

        {shares.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-medium text-navy mb-3">{pl.family.shareList}</p>
            <ul className="space-y-2">
              {shares.map((share) => (
                <li
                  key={share.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-cream px-3 py-2 text-sm"
                >
                  <div>
                    <span className="text-navy">{share.familyMemberName}</span>
                    <span className="text-muted ml-2">→ {share.sharedWithEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevokeShare(share.id)}
                    className="text-muted hover:text-red-500 p-1"
                    aria-label={pl.family.shareRevoke}
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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
