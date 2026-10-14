import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/Kuza_Logo_Transparent_Background-02.png"
      alt="KUZA TUK"
      className={cn('h-11 w-auto max-w-[10rem] object-contain', className)}
    />
  );
}
