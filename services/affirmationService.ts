import { UserAffirmation, AffirmationCategory, ReminderFrequency } from '../src/types';

const KEY = 'mindshift_user_affirmations_v1';
const MAX = 1000;

function read(): UserAffirmation[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(validateShape);
  } catch {
    return [];
  }
}

function write(list: UserAffirmation[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

function validateText(text: string) {
  const t = (text || '').trim();
  if (t.length < 10 || t.length > 500) return false;
  return true;
}

function validateShape(x: any): x is UserAffirmation {
  return (
    x &&
    typeof x.id === 'string' &&
    typeof x.text === 'string' &&
    typeof x.createdAt === 'number' &&
    typeof x.updatedAt === 'number' &&
    typeof x.useCount === 'number' &&
    Array.isArray(x.versions) &&
    x.reminder &&
    typeof x.reminder.frequency === 'string'
  );
}

export function getAll(): UserAffirmation[] {
  return read();
}

export function create(text: string, category: AffirmationCategory = 'Custom', frequency: ReminderFrequency = 'None', days?: number[]): UserAffirmation {
  if (!validateText(text)) throw new Error('Affirmation must be between 10 and 500 characters');
  const now = Date.now();
  const item: UserAffirmation = {
    id: crypto.randomUUID(),
    text: text.trim(),
    category,
    reminder: { frequency, days: frequency === 'Custom' ? (days || []) : undefined },
    createdAt: now,
    updatedAt: now,
    useCount: 0,
    versions: [{ text: text.trim(), timestamp: now }]
  };
  const list = read();
  if (list.length >= MAX) throw new Error('Storage limit reached (1000)');
  list.unshift(item);
  write(list);
  return item;
}

export function update(id: string, updates: Partial<Pick<UserAffirmation, 'text' | 'category' | 'reminder'>>) {
  const list = read();
  const idx = list.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Not found');
  const prev = list[idx];
  let next = { ...prev };
  if (updates.text !== undefined) {
    if (!validateText(updates.text)) throw new Error('Affirmation must be between 10 and 500 characters');
    next.text = updates.text.trim();
    next.versions = [{ text: next.text, timestamp: Date.now() }, ...next.versions].slice(0, 50);
  }
  if (updates.category) next.category = updates.category;
  if (updates.reminder) next.reminder = updates.reminder;
  next.updatedAt = Date.now();
  list[idx] = next;
  write(list);
  return next;
}

export function remove(id: string) {
  const list = read();
  const next = list.filter(a => a.id !== id);
  write(next);
}

export function duplicate(id: string) {
  const list = read();
  const src = list.find(a => a.id === id);
  if (!src) throw new Error('Not found');
  const now = Date.now();
  const copy: UserAffirmation = {
    ...src,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    versions: [{ text: src.text, timestamp: now }]
  };
  list.unshift(copy);
  write(list);
  return copy;
}

export function incrementUse(id: string) {
  const list = read();
  const idx = list.findIndex(a => a.id === id);
  if (idx === -1) return;
  list[idx].useCount += 1;
  write(list);
}

export function exportJSON(): string {
  return JSON.stringify(read());
}

export function importJSON(json: string) {
  let arr: any;
  try {
    arr = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON');
  }
  if (!Array.isArray(arr)) throw new Error('Expected an array');
  const cleaned = arr.filter(validateShape).slice(0, MAX);
  write(cleaned);
  return cleaned.length;
}
