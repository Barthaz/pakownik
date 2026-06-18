export function getMemberItemStats(items: { quantity: number }[] = []) {
  const positions = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  return { positions, totalQuantity };
}
