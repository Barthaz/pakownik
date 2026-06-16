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

export interface PackingProgress {
  totalQuantity: number;
  packedQuantity: number;
  totalItems: number;
  packedItems: number;
  percent: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  ListsTab: undefined;
  FamilyTab: undefined;
};

export type ListsStackParamList = {
  Lists: undefined;
  ListDetail: { listId: string };
};
