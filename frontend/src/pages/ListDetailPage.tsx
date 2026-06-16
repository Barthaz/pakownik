import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faShareNodes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AppLayout } from '@/views/layout/AppLayout';
import { usePackingListController, useFamilyController } from '@/controllers/useControllers';
import { pl } from '@/models/pl';
import { SHARE_PERMISSION_LABELS } from '@/models/constants';
import { Button } from '@/views/ui/Button';
import { Select } from '@/views/ui/Select';
import { Modal } from '@/views/ui/Modal';
import { PackingProgressBar } from '@/views/lists/PackingProgress';
import { ListItemsView } from '@/views/lists/ListItemsView';
import { AddItemModal } from '@/views/lists/AddItemModal';
import { useToast } from '@/contexts/ToastContext';
import type { SharePermission } from '@/models/types';

export function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { list, loading, error, progress, togglePacked, addItem, deleteItem, updateItem, updateList, addMembers } =
    usePackingListController(id);
  const { members } = useFamilyController();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const shareUrl = list ? `${window.location.origin}/share/${list.shareId}` : '';

  const handleCopyShare = async () => {
    await navigator.clipboard.writeText(shareUrl);
    showToast('Link skopiowany', 'success');
  };

  const handlePermissionChange = async (permission: SharePermission) => {
    try {
      await updateList({ sharePermission: permission });
      showToast('Uprawnienia zaktualizowane', 'success');
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

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-navy">{list.name}</h1>
        <div className="flex flex-wrap gap-2">
          {availableMembers.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowMembers(true)}>
              {pl.lists.addMembers}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowShare(true)}>
            <FontAwesomeIcon icon={faShareNodes} />
            {pl.lists.share}
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <FontAwesomeIcon icon={faPlus} />
            {pl.lists.addItem}
          </Button>
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
        canCheck
        canEdit
      />

      <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addItem} />

      <Modal open={showShare} onClose={() => setShowShare(false)} title={pl.lists.share}>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted mb-2">{pl.lists.shareLink}</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-xl border border-border bg-cream px-3 py-2 text-sm text-navy"
              />
              <Button size="sm" onClick={handleCopyShare}>
                Kopiuj
              </Button>
            </div>
          </div>
          <Select
            label={pl.lists.sharePermission}
            value={list.sharePermission}
            onChange={(e) => handlePermissionChange(e.target.value as SharePermission)}
            options={Object.entries(SHARE_PERMISSION_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </div>
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
