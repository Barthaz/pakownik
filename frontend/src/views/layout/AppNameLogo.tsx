import nameLogo from '@assets/pakownik-name-logo.png';
import { pl } from '@/models/pl';

type AppNameLogoProps = {
  className?: string;
};

export function AppNameLogo({ className = 'h-8 w-auto' }: AppNameLogoProps) {
  return (
    <img
      src={nameLogo}
      alt={pl.appName}
      className={className}
      decoding="async"
    />
  );
}
