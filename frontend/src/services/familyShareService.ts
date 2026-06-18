import type { FamilyMemberShare, FamilyMemberSharePermission } from '@/models/types';
import { apiClient } from './apiClient';

export const familyShareService = {
  getShares(): Promise<FamilyMemberShare[]> {
    return apiClient.get<FamilyMemberShare[]>('/api/family-members/shares');
  },

  createShares(data: {
    memberIds: string[];
    email: string;
    permission?: FamilyMemberSharePermission;
  }): Promise<FamilyMemberShare[]> {
    return apiClient.post<FamilyMemberShare[]>('/api/family-members/shares', data);
  },

  deleteShare(shareId: string): Promise<void> {
    return apiClient.delete(`/api/family-members/shares/${shareId}`);
  },
};
