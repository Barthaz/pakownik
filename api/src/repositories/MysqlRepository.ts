import type { IRepository } from './interfaces/IRepository.js';
import { FileRepository } from './FileRepository.js';

/**
 * MySQL repository stub — mirrors FileRepository interface.
 * Full implementation connects to SEOHOST MySQL when BETA_MODE=false.
 * For MVP, delegates to FileRepository until DB credentials are configured.
 */
export class MysqlRepository implements IRepository {
  private fallback = new FileRepository();

  async read() {
    return this.fallback.read();
  }

  async write(data: Parameters<IRepository['write']>[0]) {
    return this.fallback.write(data);
  }

  async findUserByEmail(email: string) {
    return this.fallback.findUserByEmail(email);
  }

  async findUserById(id: string) {
    return this.fallback.findUserById(id);
  }

  async createUser(user: Parameters<IRepository['createUser']>[0]) {
    return this.fallback.createUser(user);
  }

  async getFamilyMembers(userId: string) {
    return this.fallback.getFamilyMembers(userId);
  }

  async getFamilyMemberById(id: string, userId: string) {
    return this.fallback.getFamilyMemberById(id, userId);
  }

  async createFamilyMember(member: Parameters<IRepository['createFamilyMember']>[0]) {
    return this.fallback.createFamilyMember(member);
  }

  async updateFamilyMember(member: Parameters<IRepository['updateFamilyMember']>[0]) {
    return this.fallback.updateFamilyMember(member);
  }

  async deleteFamilyMember(id: string, userId: string) {
    return this.fallback.deleteFamilyMember(id, userId);
  }

  async getFamilyMemberItems(familyMemberId: string, userId: string) {
    return this.fallback.getFamilyMemberItems(familyMemberId, userId);
  }

  async getFamilyMemberItemById(id: string, userId: string) {
    return this.fallback.getFamilyMemberItemById(id, userId);
  }

  async createFamilyMemberItem(item: Parameters<IRepository['createFamilyMemberItem']>[0], userId: string) {
    return this.fallback.createFamilyMemberItem(item, userId);
  }

  async updateFamilyMemberItem(item: Parameters<IRepository['updateFamilyMemberItem']>[0], userId: string) {
    return this.fallback.updateFamilyMemberItem(item, userId);
  }

  async deleteFamilyMemberItem(id: string, userId: string) {
    return this.fallback.deleteFamilyMemberItem(id, userId);
  }

  async getPackingLists(userId: string) {
    return this.fallback.getPackingLists(userId);
  }

  async getPackingListById(id: string, userId: string) {
    return this.fallback.getPackingListById(id, userId);
  }

  async getPackingListByShareId(shareId: string) {
    return this.fallback.getPackingListByShareId(shareId);
  }

  async createPackingList(list: Parameters<IRepository['createPackingList']>[0]) {
    return this.fallback.createPackingList(list);
  }

  async updatePackingList(list: Parameters<IRepository['updatePackingList']>[0]) {
    return this.fallback.updatePackingList(list);
  }

  async deletePackingList(id: string, userId: string) {
    return this.fallback.deletePackingList(id, userId);
  }

  async getListItems(listId: string) {
    return this.fallback.getListItems(listId);
  }

  async getListItemById(id: string, listId: string) {
    return this.fallback.getListItemById(id, listId);
  }

  async createListItem(item: Parameters<IRepository['createListItem']>[0]) {
    return this.fallback.createListItem(item);
  }

  async updateListItem(item: Parameters<IRepository['updateListItem']>[0]) {
    return this.fallback.updateListItem(item);
  }

  async deleteListItem(id: string, listId: string) {
    return this.fallback.deleteListItem(id, listId);
  }

  async deleteListItemsByListId(listId: string) {
    return this.fallback.deleteListItemsByListId(listId);
  }
}
