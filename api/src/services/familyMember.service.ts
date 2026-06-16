import { nanoid } from 'nanoid';
import type { FamilyMember, FamilyMemberItem } from '../models/types.js';
import { getRepository } from '../repositories/index.js';

export class FamilyMemberService {
  private repo = getRepository();

  async getAll(userId: string) {
    const members = await this.repo.getFamilyMembers(userId);
    return Promise.all(
      members.map(async (member) => ({
        ...member,
        items: await this.repo.getFamilyMemberItems(member.id, userId),
      })),
    );
  }

  async create(userId: string, name: string) {
    const member: FamilyMember = { id: nanoid(), userId, name };
    await this.repo.createFamilyMember(member);
    return { ...member, items: [] };
  }

  async update(id: string, userId: string, name: string) {
    const member = await this.repo.getFamilyMemberById(id, userId);
    if (!member) throw new Error('Członek rodziny nie znaleziony');
    member.name = name;
    await this.repo.updateFamilyMember(member);
    const items = await this.repo.getFamilyMemberItems(id, userId);
    return { ...member, items };
  }

  async delete(id: string, userId: string) {
    const deleted = await this.repo.deleteFamilyMember(id, userId);
    if (!deleted) throw new Error('Członek rodziny nie znaleziony');
  }

  async createItem(
    memberId: string,
    userId: string,
    data: { category: string; name: string; quantity: number },
  ) {
    const member = await this.repo.getFamilyMemberById(memberId, userId);
    if (!member) throw new Error('Członek rodziny nie znaleziony');

    const item: FamilyMemberItem = {
      id: nanoid(),
      familyMemberId: memberId,
      category: data.category,
      name: data.name,
      quantity: data.quantity,
    };

    await this.repo.createFamilyMemberItem(item, userId);
    return item;
  }

  async updateItem(
    memberId: string,
    itemId: string,
    userId: string,
    data: Partial<Pick<FamilyMemberItem, 'category' | 'name' | 'quantity'>>,
  ) {
    const member = await this.repo.getFamilyMemberById(memberId, userId);
    if (!member) throw new Error('Członek rodziny nie znaleziony');

    const item = await this.repo.getFamilyMemberItemById(itemId, userId);
    if (!item || item.familyMemberId !== memberId) throw new Error('Pozycja nie znaleziona');

    if (data.category !== undefined) item.category = data.category;
    if (data.name !== undefined) item.name = data.name;
    if (data.quantity !== undefined) item.quantity = data.quantity;

    await this.repo.updateFamilyMemberItem(item, userId);
    return item;
  }

  async deleteItem(memberId: string, itemId: string, userId: string) {
    const member = await this.repo.getFamilyMemberById(memberId, userId);
    if (!member) throw new Error('Członek rodziny nie znaleziony');

    const deleted = await this.repo.deleteFamilyMemberItem(itemId, userId);
    if (!deleted) throw new Error('Pozycja nie znaleziona');
  }
}
