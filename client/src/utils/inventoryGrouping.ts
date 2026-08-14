export interface ReceiptComparableItem {
  item_code?: string;
  item_name?: string;
  specifications?: string;
  unit?: string;
  notes?: string;
}

export const normalizeInventoryName = (value?: string) =>
  (value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko-KR');

const normalizeItemCode = (value?: string) => (value || '').trim().toLocaleUpperCase('en-US');

export const getReceiptParentItemCode = (item: ReceiptComparableItem) => {
  const match = item.notes?.match(/수령관리 묶음 기준 품목:\s*([^\s,\n]+)/);
  return normalizeItemCode(match?.[1]);
};

// 수령관리에서는 품목명이 같은 모든 등록을 하나의 품목으로 본다.
export const groupReceiptItems = <T extends ReceiptComparableItem>(items: T[]): T[][] => {
  const groups = new Map<string, T[]>();
  items.forEach((item, index) => {
    const normalizedName = normalizeInventoryName(item.item_name);
    const key = normalizedName || `__unnamed_${index}`;
    groups.set(key, [...(groups.get(key) || []), item]);
  });
  return Array.from(groups.values());
};
