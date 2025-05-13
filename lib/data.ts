export interface Rule {
  id: string;
  title: string;
  description: string;
  content: string;
  bestPractices?: string; // Optional field for best practices
  category: string;
  tags: string[];
  author: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isOfficial: boolean;
  isGeneral: boolean; // Flag for general rules
  forkFrom?: string; // Optional reference to parent rule ID if this is a variant
  votes?: number; // Track community voting
}

// Initial sample rules
export const initialRules: Rule[] = [
  {
    id: '1',
    title: 'TypeScript Type Safety',
    description: 'Best practices for maintaining type safety in TypeScript projects',
    content: 'Always use strict type checking...',
    category: 'TypeScript',
    tags: ['typescript', 'type-safety', 'best-practices'],
    author: 'user',
    authorName: 'User Name',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isOfficial: true,
    votes: 5
  },
  // Add more sample rules as needed
]; 