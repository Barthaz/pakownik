export interface ItemSuggestion {
  name: string;
  category: string;
}

export function collectItemSuggestions(
  members: { id: string; items?: { name: string; category: string }[] }[],
  excludeMemberId?: string | null,
): ItemSuggestion[] {
  const seen = new Set<string>();
  const result: ItemSuggestion[] = [];

  for (const member of members) {
    if (excludeMemberId && member.id === excludeMemberId) continue;
    for (const item of member.items ?? []) {
      const key = `${item.category.toLowerCase()}\0${item.name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ name: item.name, category: item.category });
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

export function filterItemSuggestions(
  suggestions: ItemSuggestion[],
  query: string,
  limit = 8,
): ItemSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return suggestions
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    )
    .slice(0, limit);
}
