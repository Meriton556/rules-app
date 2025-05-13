import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OfficialBadgeProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'icon-only';
}

export function OfficialBadge({ className, variant = 'default' }: OfficialBadgeProps) {
  if (variant === 'icon-only') {
    return (
      <CheckCircle className={cn("h-4 w-4 text-orange-500", className)} />
    );
  }

  return (
    <Badge 
      className={cn(
        variant === 'default' 
          ? "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border-[0.5px] border-orange-500/30 flex items-center gap-1"
          : "bg-orange-600/10 text-orange-400 hover:bg-orange-600/20 flex items-center gap-1",
        className
      )}
    >
      <CheckCircle className="h-3.5 w-3.5 mr-0.5" />
      <span>Official</span>
    </Badge>
  );
} 