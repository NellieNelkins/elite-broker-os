export interface SmartList {
  id: string;
  name: string;
  contactIds: string[];
  createdAt: string;
}

const STORAGE_KEY = "elite-broker-smart-lists";

export function getSmartLists(): SmartList[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSmartList(list: Omit<SmartList, "id" | "createdAt">): SmartList {
  const lists = getSmartLists();
  const newList: SmartList = {
    ...list,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  lists.push(newList);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  return newList;
}

export function addToSmartList(listId: string, contactIds: string[]): void {
  const lists = getSmartLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  const existing = new Set(list.contactIds);
  for (const id of contactIds) {
    existing.add(id);
  }
  list.contactIds = Array.from(existing);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function deleteSmartList(id: string): void {
  const lists = getSmartLists().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}
