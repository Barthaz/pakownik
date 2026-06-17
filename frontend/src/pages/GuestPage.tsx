import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useGuestListController } from '@/controllers/useControllers';
import { pl } from '@/models/pl';
import { routes } from '@/models/constants';
import { usePageMeta } from '@/seo/usePageMeta';
import { Header } from '@/views/layout/Header';
import { PublicLayout } from '@/views/layout/PublicLayout';
import { Button } from '@/views/ui/Button';
import { PackingProgressBar } from '@/views/lists/PackingProgress';
import { ListItemsView } from '@/views/lists/ListItemsView';
import { AddItemModal } from '@/views/lists/AddItemModal';

export function GuestPage() {
  const { list, progress, addItem, togglePacked, deleteItem, updateItem } = useGuestListController();
  const [showAdd, setShowAdd] = useState(false);

  usePageMeta({
    title: pl.landing.seo.guestTitle,
    description: pl.landing.seo.guestDescription,
    path: routes.guest,
  });

  return (
    <PublicLayout header={<Header />}>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-navy">
          {pl.guest.banner}{' '}
          <Link to={routes.register} className="font-medium text-coral hover:underline">
            {pl.auth.register}
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy">{list.name}</h1>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <FontAwesomeIcon icon={faPlus} />
            {pl.lists.addItem}
          </Button>
        </div>

        <div className="mb-6">
          <PackingProgressBar progress={progress} />
        </div>

        <ListItemsView
          items={list.items.map((i) => ({ ...i, listId: 'guest', familyMemberId: null }))}
          onToggle={togglePacked}
          onDelete={deleteItem}
          onUpdateItem={updateItem}
          canCheck
          canEdit
        />

        <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addItem} />
      </div>
    </PublicLayout>
  );
}
