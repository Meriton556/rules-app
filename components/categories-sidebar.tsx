"use client"

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useRules from '@/hooks/useRules';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Rule } from '@/lib/data';

interface Category {
  name: string;
  count: number;
}

export function CategoriesSidebar() {
  const { rules } = useRules();
  const pathname = usePathname();

  // Get categories with their counts
  const categories = rules.reduce((acc: Record<string, number>, rule: Rule) => {
    // Handle single categories or comma-separated categories
    const cats = rule.category.split(',');
    cats.forEach(cat => {
      const trimmedCat = cat.trim();
      if (trimmedCat) {
        acc[trimmedCat] = (acc[trimmedCat] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by count (descending) for popular categories
  const sortedByCount = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  // Get top 5 popular categories
  const popularCategories = sortedByCount.slice(0, 5).map(([name, count]) => ({ name, count }));
  
  // Sort all categories alphabetically for the "All Categories" section
  const allCategories = Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count }));

  return (
    <div className="w-64 bg-transparent h-screen fixed left-0 top-14 flex flex-col">
      {/* Header - fixed */}
      <div className="p-4 flex-shrink-0">
        <h2 className="text-[13px] font-medium mb-1">CATEGORIES</h2>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-grow overflow-y-auto custom-scrollbar px-4 pb-24">
        {/* Popular Categories Section */}
        <h3 className="text-[11px] uppercase text-zinc-500 font-medium mb-2">Popular</h3>
        <nav className="space-y-[2px] mb-4">
          {popularCategories.map((category) => (
            <Link
              key={`popular-${category.name}`}
              href={`/category/${category.name.toLowerCase()}`}
              className={`
                flex items-center justify-between py-[3px] px-2 leading-relaxed rounded-sm
                ${pathname === `/category/${category.name.toLowerCase()}`
                  ? 'bg-zinc-800/50 text-zinc-100'
                  : 'text-[#858699] hover:text-zinc-300 hover:bg-zinc-800/30'}
                transition-colors duration-150
              `}
            >
              <span className="text-[15px] font-normal tracking-[-0.01em]">{category.name}</span>
              <span className="text-[13px] text-[#4D4D4D] tabular-nums">{category.count}</span>
            </Link>
          ))}
        </nav>
        
        {/* Separator between sections */}
        <Separator className="my-3 bg-zinc-800" />
        
        {/* All Categories Section */}
        <h3 className="text-[11px] uppercase text-zinc-500 font-medium mb-2 mt-4">All Categories</h3>
        <nav className="space-y-[2px]">
          {/* Add All categories link */}
          <Link
            href="/category/all"
            className={cn(
              "flex w-full justify-start rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-white transition-colors",
              pathname === "/category/all" 
                ? "bg-blue-500/10 text-blue-500" 
                : "text-white"
            )}
            prefetch={false}
          >
            All Categories
          </Link>
          
          {/* Add Officials link */}
          <Link
            href="/category/officials"
            className={cn(
              "flex w-full justify-start rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-white transition-colors",
              pathname === "/category/officials" 
                ? "bg-blue-500/10 text-blue-500" 
                : "text-white"
            )}
            prefetch={false}
          >
            Officials
          </Link>
          
          {/* Add General link */}
          <Link
            href="/category/general"
            className={cn(
              "flex w-full justify-start rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-white transition-colors",
              (pathname === "/category/general" || pathname === "/general")
                ? "bg-blue-500/10 text-blue-500" 
                : "text-white"
            )}
            prefetch={false}
          >
            General
          </Link>
          
          {allCategories.map((category) => (
            <Link
              key={`all-${category.name}`}
              href={`/category/${category.name.toLowerCase()}`}
              className={`
                flex items-center justify-between py-[3px] px-2 leading-relaxed rounded-sm
                ${pathname === `/category/${category.name.toLowerCase()}`
                  ? 'bg-zinc-800/50 text-zinc-100'
                  : 'text-[#858699] hover:text-zinc-300 hover:bg-zinc-800/30'}
                transition-colors duration-150
              `}
            >
              <span className="text-[15px] font-normal tracking-[-0.01em]">{category.name}</span>
              <span className="text-[13px] text-[#4D4D4D] tabular-nums">{category.count}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Fixed Submit Button */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800/30 p-4 z-20">
        <Link href="/rules/new">
          <button className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
            <span className="font-medium">Add Rule</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
} 