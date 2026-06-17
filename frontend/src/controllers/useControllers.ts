import { useCallback, useEffect, useState } from 'react';
import type { GuestList } from '@/models/types';
import { guestStorageService } from '@/services/guestStorageService';
import { calculateProgress } from '@/models/progress';

export function useGuestListController() {
  const [list, setList] = useState<GuestList>(() => guestStorageService.load());

  const progress = calculateProgress(list.items);

  const addItem = useCallback(
    (data: { category: string; name: string; quantity: number }) => {
      setList((prev) => guestStorageService.addItem(prev, data));
    },
    [],
  );

  const togglePacked = useCallback((itemId: string) => {
    setList((prev) => guestStorageService.togglePacked(prev, itemId));
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setList((prev) => guestStorageService.deleteItem(prev, itemId));
  }, []);

  const updateItem = useCallback(
    (itemId: string, data: { name?: string; quantity?: number }) => {
      setList((prev) => guestStorageService.updateItem(prev, itemId, data));
    },
    [],
  );

  return { list, progress, addItem, togglePacked, deleteItem, updateItem };
}

export function usePackingListController(listId?: string) {
  const [list, setList] = useState<import('@/models/types').PackingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!listId) return;
    setLoading(true);
    setError(null);
    try {
      const { packingListService } = await import('@/services/packingListService');
      const data = await packingListService.getById(listId);
      setList(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    load();
  }, [load]);

  const progress = calculateProgress(list?.items ?? []);

  const togglePacked = useCallback(
    async (itemId: string) => {
      if (!list) return;
      const item = list.items?.find((i) => i.id === itemId);
      if (!item) return;
      const { packingListService } = await import('@/services/packingListService');
      const updated = await packingListService.updateItem(list.id, itemId, {
        packed: !item.packed,
      });
      setList((prev) =>
        prev
          ? { ...prev, items: prev.items?.map((i) => (i.id === itemId ? updated : i)) }
          : null,
      );
    },
    [list],
  );

  const addItem = useCallback(
    async (data: { category: string; name: string; quantity: number }) => {
      if (!list) return;
      const { packingListService } = await import('@/services/packingListService');
      const item = await packingListService.createItem(list.id, data);
      setList((prev) => (prev ? { ...prev, items: [...(prev.items ?? []), item] } : null));
    },
    [list],
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!list) return;
      const { packingListService } = await import('@/services/packingListService');
      await packingListService.deleteItem(list.id, itemId);
      setList((prev) =>
        prev ? { ...prev, items: prev.items?.filter((i) => i.id !== itemId) } : null,
      );
    },
    [list],
  );

  const updateItem = useCallback(
    async (itemId: string, data: { name?: string; quantity?: number }) => {
      if (!list) return;
      const { packingListService } = await import('@/services/packingListService');
      const updated = await packingListService.updateItem(list.id, itemId, data);
      setList((prev) =>
        prev
          ? { ...prev, items: prev.items?.map((i) => (i.id === itemId ? updated : i)) }
          : null,
      );
    },
    [list],
  );

  const updateList = useCallback(
    async (data: Partial<{ name: string; sharePermission: import('@/models/types').SharePermission }>) => {
      if (!list) return;
      const { packingListService } = await import('@/services/packingListService');
      const updated = await packingListService.update(list.id, data);
      setList(updated);
      return updated;
    },
    [list],
  );

  const addMembers = useCallback(
    async (memberIds: string[]) => {
      if (!list) return;
      const { packingListService } = await import('@/services/packingListService');
      const updated = await packingListService.addMembers(list.id, memberIds);
      setList(updated);
      return updated;
    },
    [list],
  );

  return {
    list,
    loading,
    error,
    progress,
    reload: load,
    togglePacked,
    addItem,
    deleteItem,
    updateItem,
    updateList,
    addMembers,
  };
}

export function usePackingListsController() {
  const [lists, setLists] = useState<import('@/models/types').PackingList[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { packingListService } = await import('@/services/packingListService');
      const data = await packingListService.getAll();
      setLists(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createList = useCallback(
    async (name: string, selectedMemberIds?: string[]) => {
      const { packingListService } = await import('@/services/packingListService');
      const list = await packingListService.create(name, selectedMemberIds);
      setLists((prev) => [...prev, list]);
      return list;
    },
    [],
  );

  const deleteList = useCallback(async (id: string) => {
    const { packingListService } = await import('@/services/packingListService');
    await packingListService.delete(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { lists, loading, reload: load, createList, deleteList };
}

export function useFamilyController() {
  const [members, setMembers] = useState<import('@/models/types').FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { familyService } = await import('@/services/familyService');
      const data = await familyService.getAll();
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createMember = useCallback(async (name: string) => {
    const { familyService } = await import('@/services/familyService');
    const member = await familyService.create(name);
    setMembers((prev) => [...prev, member]);
    return member;
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    const { familyService } = await import('@/services/familyService');
    await familyService.delete(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addItem = useCallback(
    async (memberId: string, data: { category: string; name: string; quantity: number }) => {
      const { familyService } = await import('@/services/familyService');
      const item = await familyService.createItem(memberId, data);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, items: [...(m.items ?? []), item] } : m,
        ),
      );
    },
    [],
  );

  const deleteItem = useCallback(async (memberId: string, itemId: string) => {
    const { familyService } = await import('@/services/familyService');
    await familyService.deleteItem(memberId, itemId);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, items: m.items?.filter((i) => i.id !== itemId) } : m,
      ),
    );
  }, []);

  return { members, loading, reload: load, createMember, deleteMember, addItem, deleteItem };
}
