import type { FamilyMember, FamilyMemberShare, FamilyMemberSharePermission } from '../models/types.js';
import { getRepository } from '../repositories/index.js';

export type MemberAccess = {
  member: FamilyMember;
  ownership: 'own' | 'shared';
  permission: FamilyMemberSharePermission;
  share?: FamilyMemberShare;
};

export async function resolveMemberAccess(
  memberId: string,
  userId: string,
): Promise<MemberAccess | null> {
  const repo = getRepository();

  const owned = await repo.getFamilyMemberById(memberId, userId);
  if (owned) {
    return { member: owned, ownership: 'own', permission: 'full_edit' };
  }

  const share = await repo.getFamilyMemberShareForRecipientAndMember(userId, memberId);
  if (!share) return null;

  const member = await repo.getFamilyMemberByIdOnly(memberId);
  if (!member) return null;

  return { member, ownership: 'shared', permission: share.permission, share };
}

export function assertCanEditMember(access: MemberAccess) {
  if (access.ownership === 'shared' && access.permission === 'readonly') {
    throw new Error('Ten profil jest tylko do odczytu');
  }
}

export function assertCanManageMember(access: MemberAccess) {
  if (access.ownership !== 'own') {
    throw new Error('Tylko właściciel może zarządzać tym członkiem rodziny');
  }
}
