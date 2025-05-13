"use client"

import { useState, useEffect } from 'react';
import { Rule, initialRules } from '@/lib/data';

export default function useRules() {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    // Load rules from localStorage on mount
    const storedRules = localStorage.getItem('rules');
    if (storedRules) {
      setRules(JSON.parse(storedRules));
    } else {
      // Initialize with sample rules if no stored rules exist
      setRules(initialRules);
      localStorage.setItem('rules', JSON.stringify(initialRules));
    }
  }, []);

  const addRule = (rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: Rule = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRules(prev => {
      const updated = [...prev, newRule];
      localStorage.setItem('rules', JSON.stringify(updated));
      return updated;
    });
    return newRule;
  };

  const updateRule = (id: string, updatedFields: Partial<Rule>) => {
    setRules(prev => {
      const updated = prev.map(rule =>
        rule.id === id
          ? { ...rule, ...updatedFields, updatedAt: new Date().toISOString() }
          : rule
      );
      localStorage.setItem('rules', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteRule = (id: string) => {
    setRules(prev => {
      const updated = prev.filter(rule => rule.id !== id);
      localStorage.setItem('rules', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Function to get rules by category
  const getRulesByCategory = (category: string, filterType: 'all' | 'official' | 'community' = 'all') => {
    const lowerCategory = category.toLowerCase();
    return rules.filter(rule => {
      const ruleCat = rule.category.toLowerCase();
      const categoryMatch = ruleCat === lowerCategory || 
                          (lowerCategory === 'tailwind' && ruleCat.includes('tailwind')) ||
                          (lowerCategory === 'tailwindcss' && ruleCat.includes('tailwind'));
                          
      // Apply filter by official status if specified
      if (filterType === 'official') {
        return categoryMatch && rule.isOfficial === true;
      } else if (filterType === 'community') {
        return categoryMatch && rule.isOfficial === false;
      }
      
      return categoryMatch;
    });
  };

  // Function to get rule by id
  const getRuleById = (id: string) => {
    return rules.find(rule => rule.id === id);
  };

  // Function to get rules by author
  const getRulesByAuthor = (authorId: string) => {
    return rules.filter(rule => rule.author === authorId);
  };
  
  // Function to get variants of a rule
  const getRuleVariants = (parentRuleId: string) => {
    return rules.filter(rule => rule.forkFrom === parentRuleId);
  };

  // Function to get rule counts by category
  const getRuleCounts = () => {
    const counts: Record<string, number> = {};
    rules.forEach(rule => {
      counts[rule.category] = (counts[rule.category] || 0) + 1;
    });
    return counts;
  };

  // Function to search rules by query text
  const searchRules = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return rules.filter(rule => {
      return (
        rule.title.toLowerCase().includes(lowerQuery) ||
        rule.description.toLowerCase().includes(lowerQuery) ||
        rule.content.toLowerCase().includes(lowerQuery) ||
        rule.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        rule.category.toLowerCase().includes(lowerQuery)
      );
    });
  };

  return {
    rules,
    addRule,
    updateRule,
    deleteRule,
    getRulesByCategory,
    getRuleById,
    getRulesByAuthor,
    getRuleVariants,
    getRuleCounts,
    searchRules,
  };
} 