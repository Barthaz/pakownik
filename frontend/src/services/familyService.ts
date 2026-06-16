import type { FamilyMember, FamilyMemberItem } from '@/models/types';
import { apiClient } from './apiClient';

export const familyService = {
  getAll(): Promise<FamilyMember[]> {
    return apiClient.get<FamilyMember[]>('/api/family-members');
  },

  create(name: string): Promise<FamilyMember> {
    return apiClient.post<FamilyMember>('/api/family-members', { name });
  },

  update(id: string, name: string): Promise<FamilyMember> {
    return apiClient.put<FamilyMember>(`/api/family-members/${id}`, { name });
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/api/family-members/${id}`);
  },

  createItem(
    memberId: string,
    data: { category: string; name: string; quantity: number },
  ): Promise<FamilyMemberItem> {
    return apiClient.post<FamilyMemberItem>(`/api/family-members/${memberId}/items`, data);
  },

  updateItem(
    memberId: string,
    itemId: string,
    data: Partial<Pick<FamilyMemberItem, 'category' | 'name' | 'quantity'>>,
  ): Promise<FamilyMemberItem> {
    return apiClient.put<FamilyMemberItem>(`/api/family-members/${memberId}/items/${itemId}`, data);
  },

  deleteItem(memberId: string, itemId: string): Promise<void> {
    return apiClient.delete(`/api/family-members/${memberId}/items/${itemId}`);
  },
};
