import type { GuestList } from '@/models/types';
import { GUEST_STORAGE_KEY } from '@/models/constants';

function generateId(): string {
  return crypto.randomUUID();
}

const defaultGuestList = (): GuestList => ({
  name: 'Moja lista pakowania',
  items: [],
});

export const guestStorageService = {
  load(): GuestList {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return defaultGuestList();
    try {
      return JSON.parse(raw) as GuestList;
    } catch {
      return defaultGuestList();
    }
  },

  save(list: GuestList): void {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(list));
  },

  clear(): void {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  },

  addItem(list: GuestList, data: { category: string; name: string; quantity: number }): GuestList {
    const updated: GuestList = {
      ...list,
      items: [
        ...list.items,
        {
          id: generateId(),
          category: data.category,
          name: data.name,
          quantity: data.quantity,
          packed: false,
        },
      ],
    };
    this.save(updated);
    return updated;
  },

  updateItem(
    list: GuestList,
    itemId: string,
    data: Partial<{ category: string; name: string; quantity: number; packed: boolean }>,
  ): GuestList {
    const updated: GuestList = {
      ...list,
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, ...data } : item,
      ),
    };
    this.save(updated);
    return updated;
  },

  deleteItem(list: GuestList, itemId: string): GuestList {
    const updated: GuestList = {
      ...list,
      items: list.items.filter((item) => item.id !== itemId),
    };
    this.save(updated);
    return updated;
  },

  togglePacked(list: GuestList, itemId: string): GuestList {
    const updated: GuestList = {
      ...list,
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, packed: !item.packed } : item,
      ),
    };
    this.save(updated);
    return updated;
  },

  toMigrationPayload(list: GuestList) {
    return list.items.map((item) => ({
      category: item.category,
      name: item.name,
      quantity: item.quantity,
    }));
  },
};
