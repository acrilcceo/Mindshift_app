import { describe, it, expect, beforeEach } from 'vitest';
import { getAll, create, update, remove, duplicate, exportJSON, importJSON } from '../services/affirmationService';

beforeEach(() => {
  localStorage.clear();
});

describe('affirmationService CRUD', () => {
  it('creates and validates text length', () => {
    expect(() => create('short', 'Custom')).toThrow();
    const a = create('I am powerful and calm now.', 'Success', 'Daily');
    expect(a.text.length).toBeGreaterThanOrEqual(10);
    const list = getAll();
    expect(list.length).toBe(1);
  });

  it('updates and tracks versions', () => {
    const a = create('I am consistent and courageous.', 'Success', 'None');
    const b = update(a.id, { text: 'I am consistent and free.', category: 'Self-Love' });
    expect(b.versions.length).toBeGreaterThanOrEqual(2);
    expect(getAll()[0].category).toBe('Self-Love');
  });

  it('duplicates and removes', () => {
    const a = create('I honor my energy daily.', 'Health', 'Weekly');
    const copy = duplicate(a.id);
    expect(copy.id).not.toBe(a.id);
    expect(getAll().length).toBe(2);
    remove(a.id);
    expect(getAll().length).toBe(1);
  });
});

describe('export/import', () => {
  it('exports and imports JSON backup', () => {
    const a = create('I attract aligned opportunities now.', 'Success', 'Monthly');
    const json = exportJSON();
    localStorage.clear();
    const count = importJSON(json);
    expect(count).toBe(1);
    expect(getAll()[0].text).toContain('aligned opportunities');
  });

  it('rejects invalid JSON', () => {
    expect(() => importJSON('not-json')).toThrow();
    expect(() => importJSON('{"x":1}')).toThrow();
  });
});
