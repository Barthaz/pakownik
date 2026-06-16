export type SharePermission = 'readonly' | 'checkoff' | 'full_edit';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

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
}

export interface JwtPayload {
  userId: string;
  email: string;
}
