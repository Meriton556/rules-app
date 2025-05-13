"use client"

import { useParams } from 'next/navigation';
import useRules from '@/hooks/useRules';

export default function CategoryPage() {
  const params = useParams();
  const { rules } = useRules();
  const category = decodeURIComponent(params.category as string);
  
  const categoryRules = rules.filter(rule => 
    rule.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="p-6">
      <h1 className="text-[28px] font-medium mb-6 text-zinc-100">
        {category.toLowerCase()} Rules
      </h1>
      <div className="grid gap-4">
        {categoryRules.map(rule => (
          <div 
            key={rule.id} 
            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700"
          >
            <h2 className="text-lg font-medium mb-2 text-zinc-100">
              {rule.title}
            </h2>
            <p className="text-zinc-400 mb-4">
              {rule.description}
            </p>
            <div className="flex gap-2">
              {rule.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 rounded-md bg-zinc-700 text-zinc-300 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 