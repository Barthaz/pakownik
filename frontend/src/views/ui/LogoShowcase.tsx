import logo from '@assets/logo.png';
import { pl } from '@/models/pl';

type LogoShowcaseProps = {
  className?: string;
};

export function LogoShowcase({ className = '' }: LogoShowcaseProps) {
  return (
    <div className={`relative w-56 h-56 sm:w-64 sm:h-64 ${className}`}>
      <div
        className="absolute inset-0 rounded-2xl bg-sand/25 rotate-[6deg]"
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-[88%] w-[88%] flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-lg -rotate-2">
          <img
            src={logo}
            alt={pl.appName}
            className="h-28 w-28 object-contain sm:h-32 sm:w-32"
            decoding="async"
          />
          <div className="mt-2 w-full rounded-xl bg-cream px-3 py-2 text-left">
            <div className="mb-1.5 flex justify-between text-[11px] text-muted">
              <span>Postęp pakowania</span>
              <span className="font-semibold text-coral">78%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full w-[78%] rounded-full bg-coral" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
