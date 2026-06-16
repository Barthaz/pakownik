import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSuitcaseRolling } from '@fortawesome/free-solid-svg-icons';
import { useSharedListController } from '@/controllers/useControllers';
import { pl } from '@/models/pl';
import { Header } from '@/views/layout/Header';
import { PublicLayout } from '@/views/layout/PublicLayout';
import { Button } from '@/views/ui/Button';
import { PackingProgressBar } from '@/views/lists/PackingProgress';
import { ListItemsView } from '@/views/lists/ListItemsView';
import { AddItemModal } from '@/views/lists/AddItemModal';

export function SharedPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const {
    list,
    loading,
    error,
    progress,
    canCheck,
    canEdit,
    togglePacked,
    addItem,
    deleteItem,
    updateItem,
  } = useSharedListController(shareId ?? '');
  const [showAdd, setShowAdd] = useState(false);

  if (loading) {
    return (
      <PublicLayout header={<Header />}>
        <p className="text-center text-muted py-12">{pl.common.loading}</p>
      </PublicLayout>
    );
  }

  if (error || !list) {
    return (
      <PublicLayout header={<Header />}>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-red-500">{error ?? pl.shared.notFound}</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout header={<Header />}>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faSuitcaseRolling} className="text-coral" />
          <span className="text-sm text-muted">{pl.shared.title}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-navy">{list.name}</h1>
          {canEdit && (
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <FontAwesomeIcon icon={faPlus} />
              {pl.lists.addItem}
            </Button>
          )}
        </div>

        {list.sharePermission === 'readonly' && (
          <div className="mb-4 rounded-xl border border-border bg-white px-4 py-2 text-sm text-muted">
            {pl.shared.readonly}
          </div>
        )}

        <div className="mb-6">
          <PackingProgressBar progress={progress} />
        </div>

        <ListItemsView
          items={list.items}
          onToggle={togglePacked}
          onDelete={canEdit ? deleteItem : undefined}
          onUpdateItem={canEdit ? updateItem : undefined}
          readOnly={!canCheck}
          canCheck={canCheck}
          canEdit={canEdit}
        />

        {canEdit && (
          <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addItem} />
        )}
      </div>
    </PublicLayout>
  );
}
