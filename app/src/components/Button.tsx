import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.coral, text: colors.white },
  secondary: { bg: colors.navy, text: colors.white },
  ghost: { bg: 'transparent', text: colors.navy, border: colors.border },
  danger: { bg: colors.red, text: colors.white },
};

export function Button({ title, variant = 'primary', loading, disabled, style, ...props }: ButtonProps) {
  const v = variantStyles[variant];
  const isPrimary = variant === 'primary' || variant === 'secondary';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border ?? v.bg, borderWidth: v.border ? 1 : 0 },
        isPrimary && shadows.sm,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={[styles.text, { color: v.text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
