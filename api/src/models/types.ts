export type SharePermission = 'readonly' | 'checkoff' | 'full_edit';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  termsAcceptedAt?: string | null;
  createdAt: string;
}

export interface ListShare {
  id: string;
  listId: string;
  sharedWithEmail: string;
  sharedByUserId: string;
  recipientUserId: string | null;
  permission: SharePermission;
  createdAt: string;
}

export type ListOwnership = 'own' | 'shared';

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
}

export interface FamilyMemberItem {
  id: string;
  familyMemberId: string;
  category: string;
  name: string;
  quantity: number;
}

export interface PackingList {
  id: string;
  userId: string;
  shareId: string;
  name: string;
  sharePermission: SharePermission;
  selectedMemberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListItem {
  id: string;
  listId: string;
  category: string;
  name: string;
  quantity: number;
  packed: boolean;
  familyMemberId: string | null;
}

export interface DataStore {
  users: User[];
  familyMembers: FamilyMember[];
  familyMemberItems: FamilyMemberItem[];
  packingLists: PackingList[];
  listItems: ListItem[];
  listShares: ListShare[];
}

export interface JwtPayload {
  userId: string;
  email: string;
}
