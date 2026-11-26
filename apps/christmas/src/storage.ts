import type { ChildId } from './data';

const KEY = 'christmas-village-v1';

export type Wish = { id: string; name: string; favorite: boolean; icon: string };
export type ChildProgress = { completed: number[]; wishes: Wish[] };
export type VillageData = Record<ChildId, ChildProgress>;

const emptyChild = (): ChildProgress => ({ completed: [], wishes: [] });
export const emptyVillage = (): VillageData => ({
  emma: emptyChild(),
  sophie: emptyChild(),
  adam: emptyChild(),
});

function validWish(value: unknown): value is Wish {
  if (!value || typeof value !== 'object') return false;
  const wish = value as Partial<Wish>;
  return typeof wish.id === 'string' && typeof wish.name === 'string' &&
    wish.name.trim().length > 0 && typeof wish.favorite === 'boolean' &&
    typeof wish.icon === 'string';
}

export function loadVillage(): VillageData {
  const blank = emptyVillage();
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!stored || typeof stored !== 'object') return blank;
    for (const child of ['emma', 'sophie', 'adam'] as ChildId[]) {
      const entry = stored[child];
      if (!entry || typeof entry !== 'object') continue;
      blank[child] = {
        completed: Array.isArray(entry.completed)
          ? [...new Set(entry.completed.filter((id: unknown) => Number.isInteger(id) && (id as number) >= 1 && (id as number) <= 24))] as number[]
          : [],
        wishes: Array.isArray(entry.wishes) ? entry.wishes.filter(validWish).slice(0, 100) : [],
      };
    }
    return blank;
  } catch {
    return blank;
  }
}

export function saveVillage(data: VillageData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function newWish(name: string, icon: string): Wish {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + String(Math.random()),
    name: name.trim().slice(0, 100),
    favorite: false,
    icon,
  };
}
