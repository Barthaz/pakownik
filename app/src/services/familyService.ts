import type { FamilyMember, FamilyMemberItem } from '@/models/types';
import { apiClient } from './apiClient';

export const familyService = {
  getAll() {
    return apiClient.get<FamilyMember[]>('/api/family-members');
  },

  create(name: string) {
    return apiClient.post<FamilyMember>('/api/family-members', { name });
  },

  update(id: string, name: string) {
    return apiClient.put<FamilyMember>(`/api/family-members/${id}`, { name });
  },

  delete(id: string) {
    return apiClient.delete(`/api/family-members/${id}`);
  },

  createItem(memberId: string, data: { category: string; name: string; quantity: number }) {
    return apiClient.post<FamilyMemberItem>(`/api/family-members/${memberId}/items`, data);
  },

  deleteItem(memberId: string, itemId: string) {
    return apiClient.delete(`/api/family-members/${memberId}/items/${itemId}`);
  },
};
