import { nanoid } from 'nanoid';
import type { ListItem, PackingList, SharePermission } from '../models/types.js';
import { getRepository } from '../repositories/index.js';
import {
  assertCanCheckOff,
  assertCanEdit,
  filterItemUpdate,
  resolveListAccess,
} from './listAccess.js';
import { resolveMemberAccess } from './familyMemberAccess.js';

export class PackingListService {
  private repo = getRepository();

  async getAll(userId: string) {
    const ownedLists = await this.repo.getPackingLists(userId);
    const ownedWithMeta = await Promise.all(
      ownedLists.map(async (list) => ({
        ...list,
        items: await this.repo.getListItems(list.id),
        ownership: 'own' as const,
      })),
    );

    const shares = await this.repo.getSharesForRecipient(userId);
    const sharedWithMeta = await Promise.all(
      shares.map(async (share) => {
        const list = await this.repo.getPackingListByIdOnly(share.listId);
        if (!list) return null;
        const owner = await this.repo.findUserById(list.userId);
        return {
          ...list,
          items: await this.repo.getListItems(list.id),
          ownership: 'shared' as const,
          sharedByEmail: owner?.email ?? '',
          myPermission: share.permission,
        };
      }),
    );

    return [
      ...ownedWithMeta,
      ...sharedWithMeta.filter((l): l is NonNullable<typeof l> => l !== null),
    ];
  }

  private async resolveMemberNames(
    listUserId: string,
    memberIds: string[],
  ): Promise<Record<string, string>> {
    const names: Record<string, string> = {};
    for (const memberId of memberIds) {
      const access = await resolveMemberAccess(memberId, listUserId);
      if (access) names[memberId] = access.member.name;
    }
    return names;
  }

  private async assertMembersAccessible(userId: string, memberIds: string[]) {
    for (const memberId of memberIds) {
      const access = await resolveMemberAccess(memberId, userId);
      if (!access) throw new Error('Członek rodziny nie znaleziony');
    }
  }

  async getById(id: string, userId: string) {
    const access = await resolveListAccess(id, userId);
    if (!access) throw new Error('Lista nie znaleziona');

    const items = await this.repo.getListItems(id);
    const memberNames = await this.resolveMemberNames(
      access.list.userId,
      access.list.selectedMemberIds,
    );

    if (access.ownership === 'own') {
      return { ...access.list, items, memberNames, ownership: 'own' as const };
    }

    const owner = await this.repo.findUserById(access.list.userId);
    return {
      ...access.list,
      items,
      memberNames,
      ownership: 'shared' as const,
      sharedByEmail: owner?.email ?? '',
      myPermission: access.permission,
    };
  }

  async create(
    userId: string,
    name: string,
    selectedMemberIds: string[] = [],
    itemsByMember?: Record<string, string[]>,
  ) {
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
      await this.assertMembersAccessible(userId, selectedMemberIds);
      await this.mergeFamilyItems(list.id, userId, selectedMemberIds, itemsByMember);
      list.selectedMemberIds = selectedMemberIds;
      list.updatedAt = new Date().toISOString();
      await this.repo.updatePackingList(list);
    }

    const items = await this.repo.getListItems(list.id);
    return { ...list, items, ownership: 'own' as const };
  }

  async update(
    id: string,
    userId: string,
    data: Partial<
      Pick<PackingList, 'name' | 'sharePermission' | 'selectedMemberIds'> & {
        itemsByMember?: Record<string, string[]>;
      }
    >,
  ) {
    const list = await this.repo.getPackingListById(id, userId);
    if (!list) throw new Error('Lista nie znaleziona');

    if (data.name !== undefined) list.name = data.name;
    if (data.sharePermission !== undefined) list.sharePermission = data.sharePermission;

    if (data.selectedMemberIds !== undefined) {
      const newIds = data.selectedMemberIds.filter((mid) => !list.selectedMemberIds.includes(mid));
      list.selectedMemberIds = data.selectedMemberIds;
      if (newIds.length > 0) {
        await this.assertMembersAccessible(userId, newIds);
        await this.mergeFamilyItems(list.id, userId, newIds, data.itemsByMember);
      }
    }

    list.updatedAt = new Date().toISOString();
    await this.repo.updatePackingList(list);
    const items = await this.repo.getListItems(id);
    return { ...list, items, ownership: 'own' as const };
  }

  async delete(id: string, userId: string) {
    const deleted = await this.repo.deletePackingList(id, userId);
    if (!deleted) throw new Error('Lista nie znaleziona');
  }

  async addMembers(
    id: string,
    userId: string,
    memberIds: string[],
    itemsByMember?: Record<string, string[]>,
  ) {
    const list = await this.repo.getPackingListById(id, userId);
    if (!list) throw new Error('Lista nie znaleziona');

    const newIds = memberIds.filter((mid) => !list.selectedMemberIds.includes(mid));
    if (memberIds.length > 0) {
      await this.assertMembersAccessible(userId, memberIds);
    }
    list.selectedMemberIds = [...new Set([...list.selectedMemberIds, ...memberIds])];
    list.updatedAt = new Date().toISOString();

    if (newIds.length > 0) {
      await this.mergeFamilyItems(list.id, userId, newIds, itemsByMember);
    }

    await this.repo.updatePackingList(list);
    const items = await this.repo.getListItems(id);
    const memberNames = await this.resolveMemberNames(list.userId, list.selectedMemberIds);
    return { ...list, items, memberNames, ownership: 'own' as const };
  }

  private async mergeFamilyItems(
    listId: string,
    userId: string,
    memberIds: string[],
    itemsByMember?: Record<string, string[]>,
  ) {
    const existingItems = await this.repo.getListItems(listId);

    for (const memberId of memberIds) {
      const access = await resolveMemberAccess(memberId, userId);
      if (!access) continue;

      const memberItems = await this.repo.getFamilyMemberItemsByMemberId(memberId);
      const selectedIds = itemsByMember?.[memberId];
      const toMerge =
        itemsByMember !== undefined
          ? memberItems.filter((mi) => selectedIds?.includes(mi.id))
          : memberItems;

      for (const mi of toMerge) {
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
    const access = await resolveListAccess(listId, userId);
    if (!access) throw new Error('Lista nie znaleziona');
    assertCanEdit(access);

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
    const access = await resolveListAccess(listId, userId);
    if (!access) throw new Error('Lista nie znaleziona');
    assertCanCheckOff(access);

    const filtered = filterItemUpdate(access, data);

    const item = await this.repo.getListItemById(itemId, listId);
    if (!item) throw new Error('Pozycja nie znaleziona');

    if (filtered.category !== undefined) item.category = filtered.category;
    if (filtered.name !== undefined) item.name = filtered.name;
    if (filtered.quantity !== undefined) item.quantity = filtered.quantity;
    if (filtered.packed !== undefined) item.packed = filtered.packed;

    await this.repo.updateListItem(item);
    return item;
  }

  async deleteItem(listId: string, itemId: string, userId: string) {
    const access = await resolveListAccess(listId, userId);
    if (!access) throw new Error('Lista nie znaleziona');
    assertCanEdit(access);

    const deleted = await this.repo.deleteListItem(itemId, listId);
    if (!deleted) throw new Error('Pozycja nie znaleziona');
  }
}
