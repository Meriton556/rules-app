import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rule } from '@/hooks/useRules';

export type SortOption = 'newest' | 'oldest' | 'title' | 'category';

interface SortRulesProps {
  onSort: (sortedRules: Rule[]) => void;
  rules: Rule[];
}

export default function SortRules({ onSort, rules }: SortRulesProps) {
  const handleSort = (value: SortOption) => {
    const sortedRules = [...rules].sort((a, b) => {
      switch (value) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    onSort(sortedRules);
  };

  return (
    <Select onValueChange={handleSort}>
      <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest First</SelectItem>
        <SelectItem value="oldest">Oldest First</SelectItem>
        <SelectItem value="title">Title (A-Z)</SelectItem>
        <SelectItem value="category">Category (A-Z)</SelectItem>
      </SelectContent>
    </Select>
  );
} 