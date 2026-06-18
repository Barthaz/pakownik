import { nanoid } from 'nanoid';
import type { FamilyMember, FamilyMemberItem } from '../models/types.js';
import { getRepository } from '../repositories/index.js';
import {
  assertCanEditMember,
  assertCanManageMember,
  resolveMemberAccess,
} from './familyMemberAccess.js';

export class FamilyMemberService {
  private repo = getRepository();

  async getAll(userId: string) {
    const owned = await this.repo.getFamilyMembers(userId);
    const ownedWithItems = await Promise.all(
      owned.map(async (member) => ({
        ...member,
        items: await this.repo.getFamilyMemberItemsByMemberId(member.id),
        ownership: 'own' as const,
      })),
    );

    const shares = await this.repo.getFamilyMemberSharesForRecipient(userId);
    const sharedMemberIds = [...new Set(shares.map((s) => s.familyMemberId))];
    const sharedMembers = [];

    for (const memberId of sharedMemberIds) {
      const member = await this.repo.getFamilyMemberByIdOnly(memberId);
      if (!member) continue;

      const share = shares.find((s) => s.familyMemberId === memberId);
      const owner = await this.repo.findUserById(member.userId);
      const items = await this.repo.getFamilyMemberItemsByMemberId(memberId);

      sharedMembers.push({
        ...member,
        items,
        ownership: 'shared' as const,
        sharedByEmail: owner?.email ?? '',
        myPermission: share?.permission ?? 'full_edit',
      });
    }

    return [...ownedWithItems, ...sharedMembers];
  }

  async create(userId: string, name: string) {
    const member: FamilyMember = { id: nanoid(), userId, name };
    await this.repo.createFamilyMember(member);
    return { ...member, items: [], ownership: 'own' as const };
  }

  async update(id: string, userId: string, name: string) {
    const access = await resolveMemberAccess(id, userId);
    if (!access) throw new Error('Członek rodziny nie znaleziony');
    assertCanManageMember(access);

    access.member.name = name;
    await this.repo.updateFamilyMember(access.member);
    const items = await this.repo.getFamilyMemberItemsByMemberId(id);
    return { ...access.member, items, ownership: 'own' as const };
  }

  async delete(id: string, userId: string) {
    const access = await resolveMemberAccess(id, userId);
    if (!access) throw new Error('Członek rodziny nie znaleziony');
    assertCanManageMember(access);

    const deleted = await this.repo.deleteFamilyMember(id, userId);
    if (!deleted) throw new Error('Członek rodziny nie znaleziony');
  }

  async createItem(
    memberId: string,
    userId: string,
    data: { category: string; name: string; quantity: number },
  ) {
    const access = await resolveMemberAccess(memberId, userId);
    if (!access) throw new Error('Członek rodziny nie znaleziony');
    assertCanEditMember(access);

    const item: FamilyMemberItem = {
      id: nanoid(),
      familyMemberId: memberId,
      category: data.category,
      name: data.name,
      quantity: data.quantity,
    };

    await this.repo.insertFamilyMemberItem(item);
    return item;
  }

  async updateItem(
    memberId: string,
    itemId: string,
    userId: string,
    data: Partial<Pick<FamilyMemberItem, 'category' | 'name' | 'quantity'>>,
  ) {
    const access = await resolveMemberAccess(memberId, userId);
    if (!access) throw new Error('Członek rodziny nie znaleziony');
    assertCanEditMember(access);

    const items = await this.repo.getFamilyMemberItemsByMemberId(memberId);
    const item = items.find((i) => i.id === itemId);
    if (!item) throw new Error('Pozycja nie znaleziona');

    if (data.category !== undefined) item.category = data.category;
    if (data.name !== undefined) item.name = data.name;
    if (data.quantity !== undefined) item.quantity = data.quantity;

    await this.repo.saveFamilyMemberItem(item);
    return item;
  }

  async deleteItem(memberId: string, itemId: string, userId: string) {
    const access = await resolveMemberAccess(memberId, userId);
    if (!access) throw new Error('Członek rodziny nie znaleziony');
    assertCanEditMember(access);

    const items = await this.repo.getFamilyMemberItemsByMemberId(memberId);
    if (!items.some((i) => i.id === itemId)) {
      throw new Error('Pozycja nie znaleziona');
    }

    const deleted = await this.repo.removeFamilyMemberItem(itemId);
    if (!deleted) throw new Error('Pozycja nie znaleziona');
  }
}
