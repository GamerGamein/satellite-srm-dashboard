import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none font-mono',
  {
    variants: {
      variant: {
        default:
          'bg-white text-black font-bold hover:bg-neutral-200 shadow-sm shadow-white/10 active:scale-[0.98]',
        destructive:
          'bg-neutral-900 text-white border border-neutral-700 hover:bg-neutral-800 shadow-sm active:scale-[0.98]',
        outline:
          'border border-neutral-800 bg-black text-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-600',
        secondary:
          'bg-neutral-900 text-neutral-100 hover:bg-neutral-850 border border-neutral-800',
        ghost:
          'hover:bg-neutral-900 text-neutral-400 hover:text-white',
        link:
          'text-white underline-offset-4 hover:underline',
        telemetry:
          'bg-white text-black font-bold hover:bg-neutral-200 border border-white shadow-sm shadow-white/20 active:scale-[0.98]',
        emerald:
          'bg-neutral-200 text-black font-bold hover:bg-white shadow-sm active:scale-[0.98]',
      },
      size: {
        default: 'h-9 px-4 py-2 text-xs',
        sm: 'h-8 rounded-md px-3 text-[11px]',
        lg: 'h-11 rounded-xl px-6 text-sm',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
