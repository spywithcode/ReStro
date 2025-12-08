import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 hover:opacity-80 transition-opacity duration-200",
        className
      )}
    >
      <div className={cn(
        "bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
        sizeClasses[size]
      )}>
        <span className="text-primary-foreground font-bold text-lg leading-none">
          Q
        </span>
      </div>
      {showText && (
        <span className={cn(
          "font-bold tracking-tight",
          textSizeClasses[size]
        )}>
          QRmenu
        </span>
      )}
    </Link>
  );
}
