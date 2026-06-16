export type SharePermission = 'readonly' | 'checkoff' | 'full_edit';

export interface User {
  id: string;
  email: string;
  createdAt: string;
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

export interface PackingList {
  id: string;
  userId: string;
  shareId: string;
  name: string;
  sharePermission: SharePermission;
  selectedMemberIds: string[];
  createdAt: string;
  updatedAt: string;
  items?: ListItem[];
}

export interface FamilyMemberItem {
  id: string;
  familyMemberId: string;
  category: string;
  name: string;
  quantity: number;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  items?: FamilyMemberItem[];
}

export interface GuestList {
  name: string;
  items: Omit<ListItem, 'listId' | 'familyMemberId'>[];
}

export interface SharedList {
  id: string;
  name: string;
  shareId: string;
  sharePermission: SharePermission;
  items: ListItem[];
}

export interface PackingProgress {
  totalQuantity: number;
  packedQuantity: number;
  totalItems: number;
  packedItems: number;
  percent: number;
}
