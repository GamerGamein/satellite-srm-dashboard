import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-white text-black font-bold hover:bg-neutral-200',
        secondary:
          'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
        destructive:
          'border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800',
        outline:
          'border-neutral-700 text-neutral-300 hover:border-neutral-500',
        cyan:
          'border-white/40 bg-white/10 text-white font-semibold hover:border-white/60 shadow-sm shadow-white/5',
        emerald:
          'border-white bg-white text-black font-bold hover:bg-neutral-200',
        amber:
          'border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-neutral-500',
        purple:
          'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
