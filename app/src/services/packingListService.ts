import type { ItemsByMember, PackingList, ListItem, SharePermission } from '@/models/types';
import { apiClient } from './apiClient';

export const packingListService = {
  getAll() {
    return apiClient.get<PackingList[]>('/api/packing-lists');
  },

  getById(id: string) {
    return apiClient.get<PackingList>(`/api/packing-lists/${id}`);
  },

  create(name: string, selectedMemberIds?: string[], itemsByMember?: ItemsByMember) {
    return apiClient.post<PackingList>('/api/packing-lists', {
      name,
      selectedMemberIds,
      itemsByMember,
    });
  },

  update(
    id: string,
    data: Partial<{ name: string; sharePermission: SharePermission; selectedMemberIds: string[] }>,
  ) {
    return apiClient.put<PackingList>(`/api/packing-lists/${id}`, data);
  },

  delete(id: string) {
    return apiClient.delete(`/api/packing-lists/${id}`);
  },

  addMembers(id: string, memberIds: string[], itemsByMember?: ItemsByMember) {
    return apiClient.post<PackingList>(`/api/packing-lists/${id}/members`, {
      memberIds,
      itemsByMember,
    });
  },

  createItem(listId: string, data: { category: string; name: string; quantity: number }) {
    return apiClient.post<ListItem>(`/api/packing-lists/${listId}/items`, data);
  },

  updateItem(
    listId: string,
    itemId: string,
    data: Partial<Pick<ListItem, 'category' | 'name' | 'quantity' | 'packed'>>,
  ) {
    return apiClient.put<ListItem>(`/api/packing-lists/${listId}/items/${itemId}`, data);
  },

  deleteItem(listId: string, itemId: string) {
    return apiClient.delete(`/api/packing-lists/${listId}/items/${itemId}`);
  },
};
