export * from './mindshift';
export * from './guide';

export type JournalType = 'affirmation' | '369' | 'reframing';

export interface JournalEntry {
  id?: string;
  userId: string;
  content: string;
  type: JournalType;
  createdAt: number;
}
