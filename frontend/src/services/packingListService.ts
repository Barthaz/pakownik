import type { PackingList, ListItem, SharePermission } from '@/models/types';
import { apiClient } from './apiClient';

export const packingListService = {
  getAll(): Promise<PackingList[]> {
    return apiClient.get<PackingList[]>('/api/packing-lists');
  },

  getById(id: string): Promise<PackingList> {
    return apiClient.get<PackingList>(`/api/packing-lists/${id}`);
  },

  create(name: string, selectedMemberIds?: string[]): Promise<PackingList> {
    return apiClient.post<PackingList>('/api/packing-lists', { name, selectedMemberIds });
  },

  update(
    id: string,
    data: Partial<{ name: string; sharePermission: SharePermission; selectedMemberIds: string[] }>,
  ): Promise<PackingList> {
    return apiClient.put<PackingList>(`/api/packing-lists/${id}`, data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/api/packing-lists/${id}`);
  },

  addMembers(id: string, memberIds: string[]): Promise<PackingList> {
    return apiClient.post<PackingList>(`/api/packing-lists/${id}/members`, { memberIds });
  },

  createItem(
    listId: string,
    data: { category: string; name: string; quantity: number },
  ): Promise<ListItem> {
    return apiClient.post<ListItem>(`/api/packing-lists/${listId}/items`, data);
  },

  updateItem(
    listId: string,
    itemId: string,
    data: Partial<Pick<ListItem, 'category' | 'name' | 'quantity' | 'packed'>>,
  ): Promise<ListItem> {
    return apiClient.put<ListItem>(`/api/packing-lists/${listId}/items/${itemId}`, data);
  },

  deleteItem(listId: string, itemId: string): Promise<void> {
    return apiClient.delete(`/api/packing-lists/${listId}/items/${itemId}`);
  },
};
