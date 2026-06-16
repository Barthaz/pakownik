import { nanoid } from 'nanoid';
import type { ListItem, PackingList, SharePermission } from '../models/types.js';
import { getRepository } from '../repositories/index.js';

export class PackingListService {
  private repo = getRepository();

  async getAll(userId: string) {
    const lists = await this.repo.getPackingLists(userId);
    return Promise.all(
      lists.map(async (list) => ({
        ...list,
        items: await this.repo.getListItems(list.id),
      })),
    );
  }

  async getById(id: string, userId: string) {
    const list = await this.repo.getPackingListById(id, userId);
    if (!list) throw new Error('Lista nie znaleziona');
    const items = await this.repo.getListItems(id);
    return { ...list, items };
  }

  async create(userId: string, name: string, selectedMemberIds: string[] = []) {
    const now = new Date().toISOString();
    const list: PackingList = {
      id: nanoid(),
      userId,
      shareId: nanoid(10),
      name,
      sharePermission: 'checkoff',
      selectedMemberIds,
      createdAt: now,
      updatedAt: now,
    };

    await this.repo.createPackingList(list);

    if (selectedMemberIds.length > 0) {
      await this.mergeFamilyItems(list.id, userId, selectedMemberIds);
      list.selectedMemberIds = selectedMemberIds;
      list.updatedAt = new Date().toISOString();
      await this.repo.updatePackingList(list);
    }

    const items = await this.repo.getListItems(list.id);
    return { ...list, items };
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<PackingList, 'name' | 'sharePermission' | 'selectedMemberIds'>>,
  ) {
    const list = await this.repo.getPackingListById(id, userId);
    if (!list) throw new Error('Lista nie znaleziona');

    if (data.name !== undefined) list.name = data.name;
    if (data.sharePermission !== undefined) list.sharePermission = data.sharePermission;

    if (data.selectedMemberIds !== undefined) {
      const newIds = data.selectedMemberIds.filter((mid) => !list.selectedMemberIds.includes(mid));
      list.selectedMemberIds = data.selectedMemberIds;
      if (newIds.length > 0) {
        await this.mergeFamilyItems(list.id, userId, newIds);
      }
    }

    list.updatedAt = new Date().toISOString();
    await this.repo.updatePackingList(list);
    const items = await this.repo.getListItems(id);
    return { ...list, items };
  }

  async delete(id: string, userId: string) {
    const deleted = await this.repo.deletePackingList(id, userId);
    if (!deleted) throw new Error('Lista nie znaleziona');
  }

  async addMembers(id: string, userId: string, memberIds: string[]) {
    const list = await this.repo.getPackingListById(id, userId);
    if (!list) throw new Error('Lista nie znaleziona');

    const newIds = memberIds.filter((mid) => !list.selectedMemberIds.includes(mid));
    list.selectedMemberIds = [...new Set([...list.selectedMemberIds, ...memberIds])];
    list.updatedAt = new Date().toISOString();

    if (newIds.length > 0) {
      await this.mergeFamilyItems(list.id, userId, newIds);
    }

    await this.repo.updatePackingList(list);
    const items = await this.repo.getListItems(id);
    return { ...list, items };
  }

  private async mergeFamilyItems(listId: string, userId: string, memberIds: string[]) {
    const existingItems = await this.repo.getListItems(listId);

    for (const memberId of memberIds) {
      const member = await this.repo.getFamilyMemberById(memberId, userId);
      if (!member) continue;

      const memberItems = await this.repo.getFamilyMemberItems(memberId, userId);
      for (const mi of memberItems) {
        const duplicate = existingItems.find(
          (ei) =>
            ei.familyMemberId === memberId &&
            ei.name === mi.name &&
            ei.category === mi.category,
        );

        if (duplicate) {
          duplicate.quantity += mi.quantity;
          await this.repo.updateListItem(duplicate);
        } else {
          const item: ListItem = {
            id: nanoid(),
            listId,
            category: mi.category,
            name: mi.name,
            quantity: mi.quantity,
            packed: false,
            familyMemberId: memberId,
          };
          await this.repo.createListItem(item);
          existingItems.push(item);
        }
      }
    }
  }

  async createItem(
    listId: string,
    userId: string,
    data: { category: string; name: string; quantity: number },
  ) {
    const list = await this.repo.getPackingListById(listId, userId);
    if (!list) throw new Error('Lista nie znaleziona');

    const item: ListItem = {
      id: nanoid(),
      listId,
      category: data.category,
      name: data.name,
      quantity: data.quantity,
      packed: false,
      familyMemberId: null,
    };

    await this.repo.createListItem(item);
    return item;
  }

  async updateItem(
    listId: string,
    itemId: string,
    userId: string,
    data: Partial<Pick<ListItem, 'category' | 'name' | 'quantity' | 'packed'>>,
  ) {
    const list = await this.repo.getPackingListById(listId, userId);
    if (!list) throw new Error('Lista nie znaleziona');

    const item = await this.repo.getListItemById(itemId, listId);
    if (!item) throw new Error('Pozycja nie znaleziona');

    if (data.category !== undefined) item.category = data.category;
    if (data.name !== undefined) item.name = data.name;
    if (data.quantity !== undefined) item.quantity = data.quantity;
    if (data.packed !== undefined) item.packed = data.packed;

    await this.repo.updateListItem(item);
    return item;
  }

  async deleteItem(listId: string, itemId: string, userId: string) {
    const list = await this.repo.getPackingListById(listId, userId);
    if (!list) throw new Error('Lista nie znaleziona');

    const deleted = await this.repo.deleteListItem(itemId, listId);
    if (!deleted) throw new Error('Pozycja nie znaleziona');
  }
}
