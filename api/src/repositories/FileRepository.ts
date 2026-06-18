import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  DataStore,
  FamilyMember,
  FamilyMemberItem,
  FamilyMemberShare,
  ListItem,
  ListShare,
  PackingList,
  User,
} from '../models/types.js';
import type { IRepository } from './interfaces/IRepository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../../data/data.json');
const TEMP_PATH = path.resolve(__dirname, '../../data/data.json.tmp');

let writeQueue: Promise<void> = Promise.resolve();

export class FileRepository implements IRepository {
  async read(): Promise<DataStore> {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw) as DataStore;
    if (!data.listShares) data.listShares = [];
    if (!data.familyMemberShares) data.familyMemberShares = [];
    return data;
  }

  async write(data: DataStore): Promise<void> {
    writeQueue = writeQueue.then(async () => {
      await fs.writeFile(TEMP_PATH, JSON.stringify(data, null, 2), 'utf-8');
      await fs.rename(TEMP_PATH, DATA_PATH);
    });
    await writeQueue;
  }

  private async mutate(mutator: (data: DataStore) => void): Promise<DataStore> {
    const data = await this.read();
    mutator(data);
    await this.write(data);
    return data;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const data = await this.read();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string): Promise<User | undefined> {
    const data = await this.read();
    return data.users.find((u) => u.id === id);
  }

  async createUser(user: User): Promise<User> {
    await this.mutate((data) => {
      data.users.push(user);
    });
    return user;
  }

  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const data = await this.read();
    return data.familyMembers.filter((m) => m.userId === userId);
  }

  async getFamilyMemberById(id: string, userId: string): Promise<FamilyMember | undefined> {
    const data = await this.read();
    return data.familyMembers.find((m) => m.id === id && m.userId === userId);
  }

  async getFamilyMemberByIdOnly(id: string): Promise<FamilyMember | undefined> {
    const data = await this.read();
    return data.familyMembers.find((m) => m.id === id);
  }

  async createFamilyMember(member: FamilyMember): Promise<FamilyMember> {
    await this.mutate((data) => {
      data.familyMembers.push(member);
    });
    return member;
  }

  async updateFamilyMember(member: FamilyMember): Promise<FamilyMember> {
    await this.mutate((data) => {
      const idx = data.familyMembers.findIndex((m) => m.id === member.id);
      if (idx >= 0) data.familyMembers[idx] = member;
    });
    return member;
  }

  async deleteFamilyMember(id: string, userId: string): Promise<boolean> {
    let deleted = false;
    await this.mutate((data) => {
      const idx = data.familyMembers.findIndex((m) => m.id === id && m.userId === userId);
      if (idx < 0) return;
      data.familyMembers.splice(idx, 1);
      const itemIds = data.familyMemberItems
        .filter((i) => i.familyMemberId === id)
        .map((i) => i.id);
      data.familyMemberItems = data.familyMemberItems.filter((i) => i.familyMemberId !== id);
      data.listItems = data.listItems.filter((i) => !itemIds.includes(i.id) && i.familyMemberId !== id);
      deleted = true;
    });
    return deleted;
  }

  async getFamilyMemberItems(familyMemberId: string, userId: string): Promise<FamilyMemberItem[]> {
    const owned = await this.getFamilyMemberById(familyMemberId, userId);
    if (owned) return this.getFamilyMemberItemsByMemberId(familyMemberId);

    const share = await this.getFamilyMemberShareForRecipientAndMember(userId, familyMemberId);
    if (!share) return [];

    return this.getFamilyMemberItemsByMemberId(familyMemberId);
  }

  async getFamilyMemberItemsByMemberId(familyMemberId: string): Promise<FamilyMemberItem[]> {
    const data = await this.read();
    return data.familyMemberItems.filter((i) => i.familyMemberId === familyMemberId);
  }

  async getFamilyMemberItemById(id: string, userId: string): Promise<FamilyMemberItem | undefined> {
    const data = await this.read();
    const item = data.familyMemberItems.find((i) => i.id === id);
    if (!item) return undefined;
    const member = data.familyMembers.find((m) => m.id === item.familyMemberId && m.userId === userId);
    return member ? item : undefined;
  }

  async createFamilyMemberItem(item: FamilyMemberItem, userId: string): Promise<FamilyMemberItem> {
    const member = await this.getFamilyMemberById(item.familyMemberId, userId);
    if (!member) throw new Error('Family member not found');
    return this.insertFamilyMemberItem(item);
  }

  async insertFamilyMemberItem(item: FamilyMemberItem): Promise<FamilyMemberItem> {
    await this.mutate((data) => {
      data.familyMemberItems.push(item);
    });
    return item;
  }

  async updateFamilyMemberItem(item: FamilyMemberItem, userId: string): Promise<FamilyMemberItem> {
    const existing = await this.getFamilyMemberItemById(item.id, userId);
    if (!existing) throw new Error('Item not found');
    return this.saveFamilyMemberItem(item);
  }

  async saveFamilyMemberItem(item: FamilyMemberItem): Promise<FamilyMemberItem> {
    await this.mutate((data) => {
      const idx = data.familyMemberItems.findIndex((i) => i.id === item.id);
      if (idx >= 0) data.familyMemberItems[idx] = item;
    });
    return item;
  }

  async deleteFamilyMemberItem(id: string, userId: string): Promise<boolean> {
    const existing = await this.getFamilyMemberItemById(id, userId);
    if (!existing) return false;
    return this.removeFamilyMemberItem(id);
  }

  async removeFamilyMemberItem(id: string): Promise<boolean> {
    let deleted = false;
    await this.mutate((data) => {
      const idx = data.familyMemberItems.findIndex((i) => i.id === id);
      if (idx < 0) return;
      data.familyMemberItems.splice(idx, 1);
      deleted = true;
    });
    return deleted;
  }

  async getPackingLists(userId: string): Promise<PackingList[]> {
    const data = await this.read();
    return data.packingLists.filter((l) => l.userId === userId);
  }

  async getPackingListById(id: string, userId: string): Promise<PackingList | undefined> {
    const data = await this.read();
    return data.packingLists.find((l) => l.id === id && l.userId === userId);
  }

  async getPackingListByIdOnly(id: string): Promise<PackingList | undefined> {
    const data = await this.read();
    return data.packingLists.find((l) => l.id === id);
  }

  async getPackingListByShareId(shareId: string): Promise<PackingList | undefined> {
    const data = await this.read();
    return data.packingLists.find((l) => l.shareId === shareId);
  }

  async createPackingList(list: PackingList): Promise<PackingList> {
    await this.mutate((data) => {
      data.packingLists.push(list);
    });
    return list;
  }

  async updatePackingList(list: PackingList): Promise<PackingList> {
    await this.mutate((data) => {
      const idx = data.packingLists.findIndex((l) => l.id === list.id);
      if (idx >= 0) data.packingLists[idx] = list;
    });
    return list;
  }

  async deletePackingList(id: string, userId: string): Promise<boolean> {
    let deleted = false;
    await this.mutate((data) => {
      const idx = data.packingLists.findIndex((l) => l.id === id && l.userId === userId);
      if (idx < 0) return;
      data.packingLists.splice(idx, 1);
      data.listItems = data.listItems.filter((i) => i.listId !== id);
      data.listShares = data.listShares.filter((s) => s.listId !== id);
      deleted = true;
    });
    return deleted;
  }

  async getListItems(listId: string): Promise<ListItem[]> {
    const data = await this.read();
    return data.listItems.filter((i) => i.listId === listId);
  }

  async getListItemById(id: string, listId: string): Promise<ListItem | undefined> {
    const data = await this.read();
    return data.listItems.find((i) => i.id === id && i.listId === listId);
  }

  async createListItem(item: ListItem): Promise<ListItem> {
    await this.mutate((data) => {
      data.listItems.push(item);
    });
    return item;
  }

  async updateListItem(item: ListItem): Promise<ListItem> {
    await this.mutate((data) => {
      const idx = data.listItems.findIndex((i) => i.id === item.id);
      if (idx >= 0) data.listItems[idx] = item;
    });
    return item;
  }

  async deleteListItem(id: string, listId: string): Promise<boolean> {
    let deleted = false;
    await this.mutate((data) => {
      const idx = data.listItems.findIndex((i) => i.id === id && i.listId === listId);
      if (idx < 0) return;
      data.listItems.splice(idx, 1);
      deleted = true;
    });
    return deleted;
  }

  async deleteListItemsByListId(listId: string): Promise<void> {
    await this.mutate((data) => {
      data.listItems = data.listItems.filter((i) => i.listId !== listId);
    });
  }

  async getSharesForList(listId: string): Promise<ListShare[]> {
    const data = await this.read();
    return data.listShares.filter((s) => s.listId === listId);
  }

  async getSharesForRecipient(userId: string): Promise<ListShare[]> {
    const data = await this.read();
    return data.listShares.filter((s) => s.recipientUserId === userId);
  }

  async getShareForRecipientAndList(userId: string, listId: string): Promise<ListShare | undefined> {
    const data = await this.read();
    return data.listShares.find((s) => s.recipientUserId === userId && s.listId === listId);
  }

  async getShareById(shareId: string, listId: string): Promise<ListShare | undefined> {
    const data = await this.read();
    return data.listShares.find((s) => s.id === shareId && s.listId === listId);
  }

  async createListShare(share: ListShare): Promise<ListShare> {
    await this.mutate((data) => {
      data.listShares.push(share);
    });
    return share;
  }

  async deleteListShare(shareId: string, listId: string): Promise<boolean> {
    let deleted = false;
    await this.mutate((data) => {
      const idx = data.listShares.findIndex((s) => s.id === shareId && s.listId === listId);
      if (idx < 0) return;
      data.listShares.splice(idx, 1);
      deleted = true;
    });
    return deleted;
  }

  async linkSharesByEmail(userId: string, email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    await this.mutate((data) => {
      for (const share of data.listShares) {
        if (
          share.sharedWithEmail.toLowerCase() === normalized &&
          share.recipientUserId === null
        ) {
          share.recipientUserId = userId;
        }
      }
    });
  }

  async getFamilyMemberSharesByOwner(ownerUserId: string): Promise<FamilyMemberShare[]> {
    const data = await this.read();
    return data.familyMemberShares.filter((s) => s.sharedByUserId === ownerUserId);
  }

  async getFamilyMemberSharesForRecipient(userId: string): Promise<FamilyMemberShare[]> {
    const data = await this.read();
    return data.familyMemberShares.filter((s) => s.recipientUserId === userId);
  }

  async getFamilyMemberShareForRecipientAndMember(
    userId: string,
    memberId: string,
  ): Promise<FamilyMemberShare | undefined> {
    const data = await this.read();
    return data.familyMemberShares.find(
      (s) => s.recipientUserId === userId && s.familyMemberId === memberId,
    );
  }

  async getFamilyMemberShareForMemberAndEmail(
    memberId: string,
    email: string,
  ): Promise<FamilyMemberShare | undefined> {
    const data = await this.read();
    return data.familyMemberShares.find(
      (s) =>
        s.familyMemberId === memberId &&
        s.sharedWithEmail.toLowerCase() === email.trim().toLowerCase(),
    );
  }

  async getFamilyMemberShareById(shareId: string): Promise<FamilyMemberShare | undefined> {
    const data = await this.read();
    return data.familyMemberShares.find((s) => s.id === shareId);
  }

  async createFamilyMemberShare(share: FamilyMemberShare): Promise<FamilyMemberShare> {
    await this.mutate((data) => {
      data.familyMemberShares.push(share);
    });
    return share;
  }

  async deleteFamilyMemberShare(shareId: string): Promise<boolean> {
    let deleted = false;
    await this.mutate((data) => {
      const idx = data.familyMemberShares.findIndex((s) => s.id === shareId);
      if (idx < 0) return;
      data.familyMemberShares.splice(idx, 1);
      deleted = true;
    });
    return deleted;
  }

  async linkFamilySharesByEmail(userId: string, email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    await this.mutate((data) => {
      for (const share of data.familyMemberShares) {
        if (
          share.sharedWithEmail.toLowerCase() === normalized &&
          share.recipientUserId === null
        ) {
          share.recipientUserId = userId;
        }
      }
    });
  }
}
