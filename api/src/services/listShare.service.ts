import { nanoid } from 'nanoid';
import type { ListShare, SharePermission } from '../models/types.js';
import { getRepository } from '../repositories/index.js';
import { isValidEmail, normalizeEmail } from '../utils/email.js';
import { NotificationService } from './notification.service.js';

export class ListShareService {
  private repo = getRepository();
  private notifications = new NotificationService();

  async getSharesForList(listId: string, ownerUserId: string): Promise<ListShare[]> {
    const list = await this.repo.getPackingListById(listId, ownerUserId);
    if (!list) throw new Error('Lista nie znaleziona');
    return this.repo.getSharesForList(listId);
  }

  async createShare(
    listId: string,
    ownerUserId: string,
    email: string,
    permission: SharePermission,
  ): Promise<ListShare> {
    const list = await this.repo.getPackingListById(listId, ownerUserId);
    if (!list) throw new Error('Lista nie znaleziona');

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Podaj poprawny adres e-mail');
    }

    const owner = await this.repo.findUserById(ownerUserId);
    if (owner && owner.email.toLowerCase() === normalizedEmail) {
      throw new Error('Nie możesz udostępnić listy samemu sobie');
    }

    const existingShares = await this.repo.getSharesForList(listId);
    if (existingShares.some((s) => s.sharedWithEmail.toLowerCase() === normalizedEmail)) {
      throw new Error('Lista jest już udostępniona temu adresowi e-mail');
    }

    const recipient = await this.repo.findUserByEmail(normalizedEmail);
    const share: ListShare = {
      id: nanoid(),
      listId,
      sharedWithEmail: normalizedEmail,
      sharedByUserId: ownerUserId,
      recipientUserId: recipient?.id ?? null,
      permission,
      createdAt: new Date().toISOString(),
    };

    await this.repo.createListShare(share);

    if (owner) {
      await this.notifications.sendShareInvite(normalizedEmail, list.name, owner.email);
    }

    return share;
  }

  async deleteShare(listId: string, shareId: string, ownerUserId: string): Promise<void> {
    const list = await this.repo.getPackingListById(listId, ownerUserId);
    if (!list) throw new Error('Lista nie znaleziona');

    const deleted = await this.repo.deleteListShare(shareId, listId);
    if (!deleted) throw new Error('Udostępnienie nie znalezione');
  }
}
