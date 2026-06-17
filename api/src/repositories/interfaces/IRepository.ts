import type {
  DataStore,
  FamilyMember,
  FamilyMemberItem,
  ListItem,
  ListShare,
  PackingList,
  User,
} from '../../models/types.js';

export interface IRepository {
  read(): Promise<DataStore>;
  write(data: DataStore): Promise<void>;

  findUserByEmail(email: string): Promise<User | undefined>;
  findUserById(id: string): Promise<User | undefined>;
  createUser(user: User): Promise<User>;

  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  getFamilyMemberById(id: string, userId: string): Promise<FamilyMember | undefined>;
  createFamilyMember(member: FamilyMember): Promise<FamilyMember>;
  updateFamilyMember(member: FamilyMember): Promise<FamilyMember>;
  deleteFamilyMember(id: string, userId: string): Promise<boolean>;

  getFamilyMemberItems(familyMemberId: string, userId: string): Promise<FamilyMemberItem[]>;
  getFamilyMemberItemById(id: string, userId: string): Promise<FamilyMemberItem | undefined>;
  createFamilyMemberItem(item: FamilyMemberItem, userId: string): Promise<FamilyMemberItem>;
  updateFamilyMemberItem(item: FamilyMemberItem, userId: string): Promise<FamilyMemberItem>;
  deleteFamilyMemberItem(id: string, userId: string): Promise<boolean>;

  getPackingLists(userId: string): Promise<PackingList[]>;
  getPackingListById(id: string, userId: string): Promise<PackingList | undefined>;
  getPackingListByIdOnly(id: string): Promise<PackingList | undefined>;
  getPackingListByShareId(shareId: string): Promise<PackingList | undefined>;
  createPackingList(list: PackingList): Promise<PackingList>;
  updatePackingList(list: PackingList): Promise<PackingList>;
  deletePackingList(id: string, userId: string): Promise<boolean>;

  getSharesForList(listId: string): Promise<ListShare[]>;
  getSharesForRecipient(userId: string): Promise<ListShare[]>;
  getShareForRecipientAndList(userId: string, listId: string): Promise<ListShare | undefined>;
  getShareById(shareId: string, listId: string): Promise<ListShare | undefined>;
  createListShare(share: ListShare): Promise<ListShare>;
  deleteListShare(shareId: string, listId: string): Promise<boolean>;
  linkSharesByEmail(userId: string, email: string): Promise<void>;

  getListItems(listId: string): Promise<ListItem[]>;
  getListItemById(id: string, listId: string): Promise<ListItem | undefined>;
  createListItem(item: ListItem): Promise<ListItem>;
  updateListItem(item: ListItem): Promise<ListItem>;
  deleteListItem(id: string, listId: string): Promise<boolean>;
  deleteListItemsByListId(listId: string): Promise<void>;
}
