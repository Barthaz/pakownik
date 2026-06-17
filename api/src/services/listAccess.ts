import type { ListItem, ListShare, PackingList, SharePermission } from '../models/types.js';
import { getRepository } from '../repositories/index.js';

export type ListAccess = {
  list: PackingList;
  ownership: 'own' | 'shared';
  permission: SharePermission;
  share?: ListShare;
};

export async function resolveListAccess(listId: string, userId: string): Promise<ListAccess | null> {
  const repo = getRepository();

  const owned = await repo.getPackingListById(listId, userId);
  if (owned) {
    return { list: owned, ownership: 'own', permission: 'full_edit' };
  }

  const share = await repo.getShareForRecipientAndList(userId, listId);
  if (!share) return null;

  const list = await repo.getPackingListByIdOnly(listId);
  if (!list) return null;

  return { list, ownership: 'shared', permission: share.permission, share };
}

export function assertCanEdit(access: ListAccess) {
  if (access.ownership === 'shared' && access.permission === 'readonly') {
    throw new Error('Ta lista jest tylko do odczytu');
  }
  if (access.ownership === 'shared' && access.permission === 'checkoff') {
    throw new Error('Brak uprawnień do edycji tej listy');
  }
}

export function assertCanCheckOff(access: ListAccess) {
  if (access.ownership === 'shared' && access.permission === 'readonly') {
    throw new Error('Ta lista jest tylko do odczytu');
  }
}

export function filterItemUpdate(
  access: ListAccess,
  data: Partial<Pick<ListItem, 'category' | 'name' | 'quantity' | 'packed'>>,
): Partial<Pick<ListItem, 'category' | 'name' | 'quantity' | 'packed'>> {
  if (access.ownership === 'own') return data;
  if (access.permission === 'full_edit') return data;
  if (access.permission === 'checkoff') {
    if (data.packed === undefined) {
      throw new Error('Brak uprawnień do edycji tej listy');
    }
    return { packed: data.packed };
  }
  throw new Error('Ta lista jest tylko do odczytu');
}
