import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import useRules from '@/hooks/useRules';

export default function SearchRules() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();
  const { searchRules } = useRules();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      const results = searchRules(debouncedQuery);
      // You could store these results in a context or state management solution
      // For now, we'll just console.log them
      console.log('Search results:', results);
    }
  }, [debouncedQuery, searchRules]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
      <Input
        type="search"
        placeholder="Search rules..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 bg-zinc-800/50 border-zinc-700"
      />
    </div>
  );
} 