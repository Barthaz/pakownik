import type { FamilyMember } from '@/models/types';
import { pl } from '@/models/pl';

interface FamilyMemberSelectChipProps {
  member: FamilyMember;
  selected?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onClick?: () => void;
  variant?: 'add' | 'added';
}

export function FamilyMemberSelectChip({
  member,
  selected = false,
  disabled = false,
  busy = false,
  onClick,
  variant = 'add',
}: FamilyMemberSelectChipProps) {
  const isShared = member.ownership === 'shared';
  const isAdded = variant === 'added';

  const className = isAdded
    ? 'rounded-xl px-3 py-1.5 text-sm border border-coral/30 bg-coral/10 text-navy'
    : `inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm border transition-colors disabled:opacity-50 ${
        selected || busy
          ? 'border-coral bg-coral/15 text-coral-dark'
          : 'border-border text-muted hover:border-coral/50 hover:text-navy'
      }`;

  const content = (
    <span className="inline-flex flex-col items-start min-w-0">
      <span className={isAdded ? undefined : 'leading-tight'}>
        {!isAdded && '+ '}
        {member.name}
      </span>
      {isShared && member.sharedByEmail && (
        <span className="text-[11px] text-muted leading-tight mt-0.5">
          {pl.family.sharedBadge} · {member.sharedByEmail}
        </span>
      )}
    </span>
  );

  if (isAdded || !onClick) {
    return <span className={className}>{content}</span>;
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {busy && (
        <span
          className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-coral border-t-transparent shrink-0"
          aria-hidden
        />
      )}
      {content}
    </button>
  );
}
