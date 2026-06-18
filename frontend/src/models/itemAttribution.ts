import type { ListItem } from '@/models/types';

export function getItemMemberLabel(
  item: Pick<ListItem, 'name' | 'familyMemberId'>,
  categoryItems: Pick<ListItem, 'name' | 'familyMemberId'>[],
  memberNames: Record<string, string>,
): string | null {
  if (!item.familyMemberId) return null;

  const duplicateNames = categoryItems.filter((i) => i.name === item.name).length > 1;
  if (!duplicateNames) return null;

  const name = memberNames[item.familyMemberId];
  return name ? `dla ${name}` : null;
}
