import { nanoid } from 'nanoid';
import type { ListItem, SharePermission } from '../models/types.js';
import { getRepository } from '../repositories/index.js';

export class ShareService {
  private repo = getRepository();

  async getSharedList(shareId: string) {
    const list = await this.repo.getPackingListByShareId(shareId);
    if (!list) throw new Error('Udostępniona lista nie znaleziona');

    const items = await this.repo.getListItems(list.id);
    return {
      id: list.id,
      name: list.name,
      shareId: list.shareId,
      sharePermission: list.sharePermission,
      items,
    };
  }

  assertCanCheckOff(permission: SharePermission) {
    if (permission === 'readonly') {
      throw new Error('Ta lista jest tylko do odczytu');
    }
  }

  assertCanEdit(permission: SharePermission) {
    if (permission !== 'full_edit') {
      throw new Error('Brak uprawnień do edycji tej listy');
    }
  }

  async togglePacked(shareId: string, itemId: string) {
    const list = await this.repo.getPackingListByShareId(shareId);
    if (!list) throw new Error('Udostępniona lista nie znaleziona');

    this.assertCanCheckOff(list.sharePermission);

    const item = await this.repo.getListItemById(itemId, list.id);
    if (!item) throw new Error('Pozycja nie znaleziona');

    item.packed = !item.packed;
    await this.repo.updateListItem(item);
    return item;
  }

  async createItem(
    shareId: string,
    data: { category: string; name: string; quantity: number },
  ) {
    const list = await this.repo.getPackingListByShareId(shareId);
    if (!list) throw new Error('Udostępniona lista nie znaleziona');

    this.assertCanEdit(list.sharePermission);

    const item: ListItem = {
      id: nanoid(),
      listId: list.id,
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
    shareId: string,
    itemId: string,
    data: Partial<Pick<ListItem, 'category' | 'name' | 'quantity' | 'packed'>>,
  ) {
    const list = await this.repo.getPackingListByShareId(shareId);
    if (!list) throw new Error('Udostępniona lista nie znaleziona');

    if (data.packed !== undefined && Object.keys(data).length === 1) {
      this.assertCanCheckOff(list.sharePermission);
    } else {
      this.assertCanEdit(list.sharePermission);
    }

    const item = await this.repo.getListItemById(itemId, list.id);
    if (!item) throw new Error('Pozycja nie znaleziona');

    if (data.category !== undefined) item.category = data.category;
    if (data.name !== undefined) item.name = data.name;
    if (data.quantity !== undefined) item.quantity = data.quantity;
    if (data.packed !== undefined) item.packed = data.packed;

    await this.repo.updateListItem(item);
    return item;
  }

  async deleteItem(shareId: string, itemId: string) {
    const list = await this.repo.getPackingListByShareId(shareId);
    if (!list) throw new Error('Udostępniona lista nie znaleziona');

    this.assertCanEdit(list.sharePermission);

    const deleted = await this.repo.deleteListItem(itemId, list.id);
    if (!deleted) throw new Error('Pozycja nie znaleziona');
  }
}
