import { nanoid } from 'nanoid';
import type { FamilyMemberShare, FamilyMemberSharePermission } from '../models/types.js';
import { getRepository } from '../repositories/index.js';
import { isValidEmail, normalizeEmail } from '../utils/email.js';
import { NotificationService } from './notification.service.js';

export class FamilyMemberShareService {
  private repo = getRepository();
  private notifications = new NotificationService();

  async getSharesByOwner(ownerUserId: string) {
    const shares = await this.repo.getFamilyMemberSharesByOwner(ownerUserId);
    return Promise.all(
      shares.map(async (share) => {
        const member = await this.repo.getFamilyMemberByIdOnly(share.familyMemberId);
        return { ...share, familyMemberName: member?.name ?? '' };
      }),
    );
  }

  async createShares(
    ownerUserId: string,
    memberIds: string[],
    email: string,
    permission: FamilyMemberSharePermission = 'full_edit',
  ): Promise<FamilyMemberShare[]> {
    if (memberIds.length === 0) {
      throw new Error('Wybierz co najmniej jednego członka rodziny');
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Podaj poprawny adres e-mail');
    }

    const owner = await this.repo.findUserById(ownerUserId);
    if (owner && owner.email.toLowerCase() === normalizedEmail) {
      throw new Error('Nie możesz udostępnić profilu samemu sobie');
    }

    const recipient = await this.repo.findUserByEmail(normalizedEmail);
    const created: FamilyMemberShare[] = [];

    for (const memberId of memberIds) {
      const member = await this.repo.getFamilyMemberById(memberId, ownerUserId);
      if (!member) {
        throw new Error('Członek rodziny nie znaleziony');
      }

      const existing = await this.repo.getFamilyMemberShareForMemberAndEmail(memberId, normalizedEmail);
      if (existing) {
        throw new Error(`${member.name} jest już udostępniony temu adresowi e-mail`);
      }

      const share: FamilyMemberShare = {
        id: nanoid(),
        familyMemberId: memberId,
        sharedWithEmail: normalizedEmail,
        sharedByUserId: ownerUserId,
        recipientUserId: recipient?.id ?? null,
        permission,
        createdAt: new Date().toISOString(),
      };

      await this.repo.createFamilyMemberShare(share);
      created.push(share);
    }

    if (owner) {
      const names = (
        await Promise.all(memberIds.map((id) => this.repo.getFamilyMemberById(id, ownerUserId)))
      )
        .map((m) => m?.name)
        .filter(Boolean)
        .join(', ');
      await this.notifications.sendShareInvite(normalizedEmail, `profile: ${names}`, owner.email);
    }

    return created;
  }

  async deleteShare(shareId: string, ownerUserId: string): Promise<void> {
    const share = await this.repo.getFamilyMemberShareById(shareId);
    if (!share || share.sharedByUserId !== ownerUserId) {
      throw new Error('Udostępnienie nie znalezione');
    }

    const deleted = await this.repo.deleteFamilyMemberShare(shareId);
    if (!deleted) throw new Error('Udostępnienie nie znalezione');
  }
}
