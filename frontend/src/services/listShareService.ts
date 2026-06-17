import type { ListShare, SharePermission } from '@/models/types';
import { apiClient } from './apiClient';

export const listShareService = {
  getShares(listId: string): Promise<ListShare[]> {
    return apiClient.get<ListShare[]>(`/api/packing-lists/${listId}/shares`);
  },

  createShare(
    listId: string,
    data: { email: string; permission: SharePermission },
  ): Promise<ListShare> {
    return apiClient.post<ListShare>(`/api/packing-lists/${listId}/shares`, data);
  },

  deleteShare(listId: string, shareId: string): Promise<void> {
    return apiClient.delete(`/api/packing-lists/${listId}/shares/${shareId}`);
  },
};
