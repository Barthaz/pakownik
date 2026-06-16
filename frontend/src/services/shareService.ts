import type { SharedList, ListItem } from '@/models/types';
import { apiClient } from './apiClient';

export const shareService = {
  getShared(shareId: string): Promise<SharedList> {
    return apiClient.get<SharedList>(`/api/shared/${shareId}`);
  },

  togglePacked(shareId: string, itemId: string): Promise<ListItem> {
    return apiClient.patch<ListItem>(`/api/shared/${shareId}/items/${itemId}`);
  },

  createItem(
    shareId: string,
    data: { category: string; name: string; quantity: number },
  ): Promise<ListItem> {
    return apiClient.post<ListItem>(`/api/shared/${shareId}/items`, data);
  },

  updateItem(
    shareId: string,
    itemId: string,
    data: Partial<Pick<ListItem, 'category' | 'name' | 'quantity' | 'packed'>>,
  ): Promise<ListItem> {
    return apiClient.put<ListItem>(`/api/shared/${shareId}/items/${itemId}`, data);
  },

  deleteItem(shareId: string, itemId: string): Promise<void> {
    return apiClient.delete(`/api/shared/${shareId}/items/${itemId}`);
  },
};
