import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getPool } from '../config/db.js';
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

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapUser(row: RowDataPacket): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    termsAcceptedAt: row.terms_accepted_at ? toIso(row.terms_accepted_at) : null,
    createdAt: toIso(row.created_at),
  };
}

function mapListShare(row: RowDataPacket): ListShare {
  return {
    id: row.id,
    listId: row.list_id,
    sharedWithEmail: row.shared_with_email,
    sharedByUserId: row.shared_by_user_id,
    recipientUserId: row.recipient_user_id ?? null,
    permission: row.permission,
    createdAt: toIso(row.created_at),
  };
}

function mapFamilyMemberShare(row: RowDataPacket): FamilyMemberShare {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    sharedWithEmail: row.shared_with_email,
    sharedByUserId: row.shared_by_user_id,
    recipientUserId: row.recipient_user_id ?? null,
    permission: row.permission,
    createdAt: toIso(row.created_at),
  };
}

function mapFamilyMember(row: RowDataPacket): FamilyMember {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
  };
}

function mapFamilyMemberItem(row: RowDataPacket): FamilyMemberItem {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    category: row.category,
    name: row.name,
    quantity: row.quantity,
  };
}

function mapListItem(row: RowDataPacket): ListItem {
  return {
    id: row.id,
    listId: row.list_id,
    category: row.category,
    name: row.name,
    quantity: row.quantity,
    packed: Boolean(row.packed),
    familyMemberId: row.family_member_id ?? null,
  };
}

async function loadSelectedMemberIds(listId: string): Promise<string[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT family_member_id FROM packing_list_members WHERE list_id = ?',
    [listId],
  );
  return rows.map((row) => row.family_member_id as string);
}

async function mapPackingList(row: RowDataPacket): Promise<PackingList> {
  return {
    id: row.id,
    userId: row.user_id,
    shareId: row.share_id,
    name: row.name,
    sharePermission: row.share_permission,
    selectedMemberIds: await loadSelectedMemberIds(row.id),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

async function syncPackingListMembers(listId: string, memberIds: string[]): Promise<void> {
  const pool = getPool();
  await pool.execute('DELETE FROM packing_list_members WHERE list_id = ?', [listId]);
  for (const memberId of memberIds) {
    await pool.execute(
      'INSERT INTO packing_list_members (list_id, family_member_id) VALUES (?, ?)',
      [listId, memberId],
    );
  }
}

export class MysqlRepository implements IRepository {
  async read(): Promise<DataStore> {
    const pool = getPool();
    const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users');
    const [familyMembers] = await pool.execute<RowDataPacket[]>('SELECT * FROM family_members');
    const [familyMemberItems] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM family_member_items',
    );
    const [packingListRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM packing_lists',
    );
    const [listItems] = await pool.execute<RowDataPacket[]>('SELECT * FROM list_items');

    const packingLists = await Promise.all(packingListRows.map((row) => mapPackingList(row)));

    return {
      users: users.map(mapUser),
      familyMembers: familyMembers.map(mapFamilyMember),
      familyMemberItems: familyMemberItems.map(mapFamilyMemberItem),
      packingLists,
      listItems: listItems.map(mapListItem),
      listShares: [],
      familyMemberShares: [],
    };
  }

  async write(): Promise<void> {
    throw new Error('MysqlRepository.write() is not supported — use entity methods');
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email],
    );
    return rows[0] ? mapUser(rows[0]) : undefined;
  }

  async findUserById(id: string): Promise<User | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? mapUser(rows[0]) : undefined;
  }

  async createUser(user: User): Promise<User> {
    const pool = getPool();
    try {
      await pool.execute(
        'INSERT INTO users (id, email, password_hash, terms_accepted_at, created_at) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.email, user.passwordHash, user.termsAcceptedAt ?? null, user.createdAt],
      );
      return user;
    } catch (err: unknown) {
      const mysqlErr = err as { code?: string };
      if (mysqlErr.code === 'ER_DUP_ENTRY') {
        throw new Error('Użytkownik o tym adresie e-mail już istnieje');
      }
      throw err;
    }
  }

  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM family_members WHERE user_id = ? ORDER BY name',
      [userId],
    );
    return rows.map(mapFamilyMember);
  }

  async getFamilyMemberById(id: string, userId: string): Promise<FamilyMember | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId],
    );
    return rows[0] ? mapFamilyMember(rows[0]) : undefined;
  }

  async getFamilyMemberByIdOnly(id: string): Promise<FamilyMember | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM family_members WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? mapFamilyMember(rows[0]) : undefined;
  }

  async createFamilyMember(member: FamilyMember): Promise<FamilyMember> {
    const pool = getPool();
    await pool.execute(
      'INSERT INTO family_members (id, user_id, name) VALUES (?, ?, ?)',
      [member.id, member.userId, member.name],
    );
    return member;
  }

  async updateFamilyMember(member: FamilyMember): Promise<FamilyMember> {
    const pool = getPool();
    await pool.execute('UPDATE family_members SET name = ? WHERE id = ? AND user_id = ?', [
      member.name,
      member.id,
      member.userId,
    ]);
    return member;
  }

  async deleteFamilyMember(id: string, userId: string): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM family_members WHERE id = ? AND user_id = ?',
      [id, userId],
    );
    if (result.affectedRows === 0) return false;

    await pool.execute('DELETE FROM list_items WHERE family_member_id = ?', [id]);
    return true;
  }

  async getFamilyMemberItems(familyMemberId: string, userId: string): Promise<FamilyMemberItem[]> {
    const owned = await this.getFamilyMemberById(familyMemberId, userId);
    if (owned) return this.getFamilyMemberItemsByMemberId(familyMemberId);

    const share = await this.getFamilyMemberShareForRecipientAndMember(userId, familyMemberId);
    if (!share) return [];

    return this.getFamilyMemberItemsByMemberId(familyMemberId);
  }

  async getFamilyMemberItemsByMemberId(familyMemberId: string): Promise<FamilyMemberItem[]> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM family_member_items WHERE family_member_id = ? ORDER BY category, name',
      [familyMemberId],
    );
    return rows.map(mapFamilyMemberItem);
  }

  async getFamilyMemberItemById(id: string, userId: string): Promise<FamilyMemberItem | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT i.* FROM family_member_items i
       INNER JOIN family_members m ON m.id = i.family_member_id
       WHERE i.id = ? AND m.user_id = ?
       LIMIT 1`,
      [id, userId],
    );
    return rows[0] ? mapFamilyMemberItem(rows[0]) : undefined;
  }

  async createFamilyMemberItem(item: FamilyMemberItem, userId: string): Promise<FamilyMemberItem> {
    const member = await this.getFamilyMemberById(item.familyMemberId, userId);
    if (!member) throw new Error('Family member not found');
    return this.insertFamilyMemberItem(item);
  }

  async insertFamilyMemberItem(item: FamilyMemberItem): Promise<FamilyMemberItem> {
    const pool = getPool();
    await pool.execute(
      'INSERT INTO family_member_items (id, family_member_id, category, name, quantity) VALUES (?, ?, ?, ?, ?)',
      [item.id, item.familyMemberId, item.category, item.name, item.quantity],
    );
    return item;
  }

  async updateFamilyMemberItem(item: FamilyMemberItem, userId: string): Promise<FamilyMemberItem> {
    const existing = await this.getFamilyMemberItemById(item.id, userId);
    if (!existing) throw new Error('Item not found');
    return this.saveFamilyMemberItem(item);
  }

  async saveFamilyMemberItem(item: FamilyMemberItem): Promise<FamilyMemberItem> {
    const pool = getPool();
    await pool.execute(
      'UPDATE family_member_items SET category = ?, name = ?, quantity = ? WHERE id = ?',
      [item.category, item.name, item.quantity, item.id],
    );
    return item;
  }

  async deleteFamilyMemberItem(id: string, userId: string): Promise<boolean> {
    const existing = await this.getFamilyMemberItemById(id, userId);
    if (!existing) return false;
    return this.removeFamilyMemberItem(id);
  }

  async removeFamilyMemberItem(id: string): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM family_member_items WHERE id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }

  async getPackingLists(userId: string): Promise<PackingList[]> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM packing_lists WHERE user_id = ? ORDER BY updated_at DESC',
      [userId],
    );
    return Promise.all(rows.map((row) => mapPackingList(row)));
  }

  async getPackingListById(id: string, userId: string): Promise<PackingList | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM packing_lists WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId],
    );
    return rows[0] ? mapPackingList(rows[0]) : undefined;
  }

  async getPackingListByIdOnly(id: string): Promise<PackingList | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM packing_lists WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? mapPackingList(rows[0]) : undefined;
  }

  async getPackingListByShareId(shareId: string): Promise<PackingList | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM packing_lists WHERE share_id = ? LIMIT 1',
      [shareId],
    );
    return rows[0] ? mapPackingList(rows[0]) : undefined;
  }

  async createPackingList(list: PackingList): Promise<PackingList> {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO packing_lists
        (id, user_id, share_id, name, share_permission, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        list.id,
        list.userId,
        list.shareId,
        list.name,
        list.sharePermission,
        list.createdAt,
        list.updatedAt,
      ],
    );
    await syncPackingListMembers(list.id, list.selectedMemberIds);
    return list;
  }

  async updatePackingList(list: PackingList): Promise<PackingList> {
    const pool = getPool();
    await pool.execute(
      `UPDATE packing_lists
       SET name = ?, share_permission = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [list.name, list.sharePermission, list.updatedAt, list.id, list.userId],
    );
    await syncPackingListMembers(list.id, list.selectedMemberIds);
    return list;
  }

  async deletePackingList(id: string, userId: string): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM packing_lists WHERE id = ? AND user_id = ?',
      [id, userId],
    );
    return result.affectedRows > 0;
  }

  async getListItems(listId: string): Promise<ListItem[]> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM list_items WHERE list_id = ? ORDER BY category, name',
      [listId],
    );
    return rows.map(mapListItem);
  }

  async getListItemById(id: string, listId: string): Promise<ListItem | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM list_items WHERE id = ? AND list_id = ? LIMIT 1',
      [id, listId],
    );
    return rows[0] ? mapListItem(rows[0]) : undefined;
  }

  async createListItem(item: ListItem): Promise<ListItem> {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO list_items
        (id, list_id, category, name, quantity, packed, family_member_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.listId,
        item.category,
        item.name,
        item.quantity,
        item.packed,
        item.familyMemberId,
      ],
    );
    return item;
  }

  async updateListItem(item: ListItem): Promise<ListItem> {
    const pool = getPool();
    await pool.execute(
      `UPDATE list_items
       SET category = ?, name = ?, quantity = ?, packed = ?, family_member_id = ?
       WHERE id = ? AND list_id = ?`,
      [
        item.category,
        item.name,
        item.quantity,
        item.packed,
        item.familyMemberId,
        item.id,
        item.listId,
      ],
    );
    return item;
  }

  async deleteListItem(id: string, listId: string): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM list_items WHERE id = ? AND list_id = ?',
      [id, listId],
    );
    return result.affectedRows > 0;
  }

  async deleteListItemsByListId(listId: string): Promise<void> {
    const pool = getPool();
    await pool.execute('DELETE FROM list_items WHERE list_id = ?', [listId]);
  }

  async getSharesForList(listId: string): Promise<ListShare[]> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM list_shares WHERE list_id = ? ORDER BY created_at DESC',
      [listId],
    );
    return rows.map(mapListShare);
  }

  async getSharesForRecipient(userId: string): Promise<ListShare[]> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM list_shares WHERE recipient_user_id = ? ORDER BY created_at DESC',
      [userId],
    );
    return rows.map(mapListShare);
  }

  async getShareForRecipientAndList(userId: string, listId: string): Promise<ListShare | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM list_shares WHERE recipient_user_id = ? AND list_id = ? LIMIT 1',
      [userId, listId],
    );
    return rows[0] ? mapListShare(rows[0]) : undefined;
  }

  async getShareById(shareId: string, listId: string): Promise<ListShare | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM list_shares WHERE id = ? AND list_id = ? LIMIT 1',
      [shareId, listId],
    );
    return rows[0] ? mapListShare(rows[0]) : undefined;
  }

  async createListShare(share: ListShare): Promise<ListShare> {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO list_shares
        (id, list_id, shared_with_email, shared_by_user_id, recipient_user_id, permission, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        share.id,
        share.listId,
        share.sharedWithEmail,
        share.sharedByUserId,
        share.recipientUserId,
        share.permission,
        share.createdAt,
      ],
    );
    return share;
  }

  async deleteListShare(shareId: string, listId: string): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM list_shares WHERE id = ? AND list_id = ?',
      [shareId, listId],
    );
    return result.affectedRows > 0;
  }

  async linkSharesByEmail(userId: string, email: string): Promise<void> {
    const pool = getPool();
    await pool.execute(
      `UPDATE list_shares
       SET recipient_user_id = ?
       WHERE LOWER(shared_with_email) = LOWER(?) AND recipient_user_id IS NULL`,
      [userId, email],
    );
  }

  async getFamilyMemberSharesByOwner(ownerUserId: string): Promise<FamilyMemberShare[]> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM family_member_shares WHERE shared_by_user_id = ? ORDER BY created_at DESC',
      [ownerUserId],
    );
    return rows.map(mapFamilyMemberShare);
  }

  async getFamilyMemberSharesForRecipient(userId: string): Promise<FamilyMemberShare[]> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM family_member_shares WHERE recipient_user_id = ? ORDER BY created_at DESC',
      [userId],
    );
    return rows.map(mapFamilyMemberShare);
  }

  async getFamilyMemberShareForRecipientAndMember(
    userId: string,
    memberId: string,
  ): Promise<FamilyMemberShare | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM family_member_shares
       WHERE recipient_user_id = ? AND family_member_id = ? LIMIT 1`,
      [userId, memberId],
    );
    return rows[0] ? mapFamilyMemberShare(rows[0]) : undefined;
  }

  async getFamilyMemberShareForMemberAndEmail(
    memberId: string,
    email: string,
  ): Promise<FamilyMemberShare | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM family_member_shares
       WHERE family_member_id = ? AND LOWER(shared_with_email) = LOWER(?) LIMIT 1`,
      [memberId, email],
    );
    return rows[0] ? mapFamilyMemberShare(rows[0]) : undefined;
  }

  async getFamilyMemberShareById(shareId: string): Promise<FamilyMemberShare | undefined> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM family_member_shares WHERE id = ? LIMIT 1',
      [shareId],
    );
    return rows[0] ? mapFamilyMemberShare(rows[0]) : undefined;
  }

  async createFamilyMemberShare(share: FamilyMemberShare): Promise<FamilyMemberShare> {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO family_member_shares
        (id, family_member_id, shared_with_email, shared_by_user_id, recipient_user_id, permission, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        share.id,
        share.familyMemberId,
        share.sharedWithEmail,
        share.sharedByUserId,
        share.recipientUserId,
        share.permission,
        share.createdAt,
      ],
    );
    return share;
  }

  async deleteFamilyMemberShare(shareId: string): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM family_member_shares WHERE id = ?',
      [shareId],
    );
    return result.affectedRows > 0;
  }

  async linkFamilySharesByEmail(userId: string, email: string): Promise<void> {
    const pool = getPool();
    await pool.execute(
      `UPDATE family_member_shares
       SET recipient_user_id = ?
       WHERE LOWER(shared_with_email) = LOWER(?) AND recipient_user_id IS NULL`,
      [userId, email],
    );
  }
}
