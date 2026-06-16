export const DEFAULT_CATEGORIES = [
  'Ubrania',
  'Higiena',
  'Elektronika',
  'Dokumenty',
  'Apteczka',
  'Inne',
] as const;

export const SHARE_PERMISSION_LABELS: Record<string, string> = {
  readonly: 'Tylko podgląd',
  checkoff: 'Podgląd i odznaczanie',
  full_edit: 'Pełna edycja',
};
