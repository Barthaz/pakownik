import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faShareNodes, faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AppLayout } from '@/views/layout/AppLayout';
import { usePackingListController, useFamilyController } from '@/controllers/useControllers';
import { pl } from '@/models/pl';
import { SHARE_PERMISSION_LABELS } from '@/models/constants';
import { Button } from '@/views/ui/Button';
import { Select } from '@/views/ui/Select';
import { Modal } from '@/views/ui/Modal';
import { Input } from '@/views/ui/Input';
import { PackingProgressBar } from '@/views/lists/PackingProgress';
import { ListItemsView } from '@/views/lists/ListItemsView';
import { AddItemModal } from '@/views/lists/AddItemModal';
import { useToast } from '@/contexts/ToastContext';
import type { ListShare, SharePermission } from '@/models/types';
import { listShareService } from '@/services/listShareService';

export function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { list, loading, error, progress, togglePacked, addItem, deleteItem, updateItem, addMembers } =
    usePackingListController(id);
  const { members } = useFamilyController();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [shares, setShares] = useState<ListShare[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<SharePermission>('checkoff');
  const [sharing, setSharing] = useState(false);

  const isOwner = list?.ownership !== 'shared';
  const canCheck = isOwner || list?.myPermission !== 'readonly';
  const canEdit = isOwner || list?.myPermission === 'full_edit';
  const canAddItems = canEdit;

  const loadShares = async () => {
    if (!list || !isOwner) return;
    try {
      const data = await listShareService.getShares(list.id);
      setShares(data);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const openShareModal = () => {
    setShowShare(true);
    void loadShares();
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!list || !shareEmail.trim()) return;
    setSharing(true);
    try {
      await listShareService.createShare(list.id, {
        email: shareEmail.trim(),
        permission: sharePermission,
      });
      showToast('Lista udostępniona', 'success');
      setShareEmail('');
      await loadShares();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    if (!list) return;
    try {
      await listShareService.deleteShare(list.id, shareId);
      showToast('Dostęp cofnięty', 'success');
      await loadShares();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;
    try {
      await addMembers(selectedMembers);
      showToast('Członkowie dodani do listy', 'success');
      setShowMembers(false);
      setSelectedMembers([]);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <p className="text-muted">{pl.common.loading}</p>
      </AppLayout>
    );
  }

  if (error || !list) {
    return (
      <AppLayout>
        <p className="text-red-500">{error ?? 'Lista nie znaleziona'}</p>
        <Link to="/app" className="text-coral hover:underline mt-2 inline-block">
          Wróć do list
        </Link>
      </AppLayout>
    );
  }

  const availableMembers = members.filter((m) => !list.selectedMemberIds.includes(m.id));

  return (
    <AppLayout>
      <Link
        to="/app"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-navy mb-4"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Wróć
      </Link>

      {!isOwner && list.sharedByEmail && (
        <div className="mb-4 rounded-xl border border-coral/30 bg-coral/10 px-4 py-2 text-sm text-navy">
          {pl.lists.sharedBadge} · {pl.lists.sharedFrom} {list.sharedByEmail}
        </div>
      )}

      {!canCheck && (
        <div className="mb-4 rounded-xl border border-border bg-white px-4 py-2 text-sm text-muted">
          {pl.lists.sharedReadonly}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-navy">{list.name}</h1>
        <div className="flex flex-wrap gap-2">
          {isOwner && availableMembers.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowMembers(true)}>
              {pl.lists.addMembers}
            </Button>
          )}
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={openShareModal}>
              <FontAwesomeIcon icon={faShareNodes} />
              {pl.lists.share}
            </Button>
          )}
          {canAddItems && (
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <FontAwesomeIcon icon={faPlus} />
              {pl.lists.addItem}
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <PackingProgressBar progress={progress} />
      </div>

      <ListItemsView
        items={list.items ?? []}
        onToggle={togglePacked}
        onDelete={deleteItem}
        onUpdateItem={updateItem}
        canCheck={canCheck}
        canEdit={canEdit}
      />

      {canAddItems && (
        <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addItem} />
      )}

      <Modal open={showShare} onClose={() => setShowShare(false)} title={pl.lists.share}>
        <form onSubmit={handleShare} className="space-y-4">
          <Input
            label={pl.lists.shareEmail}
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder={pl.lists.shareEmailPlaceholder}
            required
          />
          <Select
            label={pl.lists.sharePermission}
            value={sharePermission}
            onChange={(e) => setSharePermission(e.target.value as SharePermission)}
            options={Object.entries(SHARE_PERMISSION_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Button type="submit" disabled={sharing || !shareEmail.trim()}>
            {sharing ? pl.common.loading : pl.lists.shareAdd}
          </Button>
        </form>

        {shares.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-medium text-navy mb-3">{pl.lists.shareList}</p>
            <ul className="space-y-2">
              {shares.map((share) => (
                <li
                  key={share.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-cream px-3 py-2 text-sm"
                >
                  <div>
                    <span className="text-navy">{share.sharedWithEmail}</span>
                    <span className="text-muted ml-2">
                      ({SHARE_PERMISSION_LABELS[share.permission]})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevokeShare(share.id)}
                    className="text-muted hover:text-red-500 p-1"
                    aria-label={pl.lists.shareRevoke}
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      <Modal open={showMembers} onClose={() => setShowMembers(false)} title={pl.lists.addMembers}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {availableMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() =>
                  setSelectedMembers((prev) =>
                    prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id],
                  )
                }
                className={`rounded-xl px-3 py-1.5 text-sm border transition-colors ${
                  selectedMembers.includes(m.id)
                    ? 'border-coral bg-coral/15 text-coral-dark'
                    : 'border-border text-muted hover:border-coral/50'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowMembers(false)}>
              {pl.form.cancel}
            </Button>
            <Button onClick={handleAddMembers} disabled={selectedMembers.length === 0}>
              {pl.form.save}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
