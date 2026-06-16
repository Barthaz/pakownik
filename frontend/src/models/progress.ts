import type { ListItem, PackingProgress } from './types';

export function calculateProgress(items: Pick<ListItem, 'quantity' | 'packed'>[]): PackingProgress {
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const packedQuantity = items
    .filter((i) => i.packed)
    .reduce((sum, i) => sum + i.quantity, 0);
  const totalItems = items.length;
  const packedItems = items.filter((i) => i.packed).length;
  const percent = totalQuantity > 0 ? Math.round((packedQuantity / totalQuantity) * 100) : 0;

  return { totalQuantity, packedQuantity, totalItems, packedItems, percent };
}

export function groupByCategory<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}
