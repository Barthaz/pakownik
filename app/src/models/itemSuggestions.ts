export interface ItemSuggestion {
  name: string;
  category: string;
}

/** Lowercase + strip Polish diacritics for fuzzy matching (e.g. "lado" → "Ładowarkę"). */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
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
      const key = `${normalizeForSearch(item.category)}\0${normalizeForSearch(item.name)}`;
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
  const q = normalizeForSearch(query.trim());
  if (!q) return [];

  return suggestions
    .filter(
      (s) =>
        normalizeForSearch(s.name).includes(q) ||
        normalizeForSearch(s.category).includes(q),
    )
    .slice(0, limit);
}
