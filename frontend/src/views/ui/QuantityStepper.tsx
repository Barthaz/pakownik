import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  disabled?: boolean;
}

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        disabled={disabled || quantity <= min}
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-coral hover:text-coral disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted"
        aria-label="Zmniejsz ilość"
      >
        <FontAwesomeIcon icon={faMinus} className="text-xs" />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-medium text-navy tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(quantity + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-coral hover:text-coral disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Zwiększ ilość"
      >
        <FontAwesomeIcon icon={faPlus} className="text-xs" />
      </button>
    </div>
  );
}
