import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import type { FamilyMember } from '@/models/types';
import { pl } from '@/models/pl';
import { colors, fonts, radius, spacing } from '@/theme';

interface FamilyMemberSelectChipProps {
  member: FamilyMember;
  selected?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onPress?: () => void;
  variant?: 'add' | 'added';
}

export function FamilyMemberSelectChip({
  member,
  selected = false,
  disabled = false,
  busy = false,
  onPress,
  variant = 'add',
}: FamilyMemberSelectChipProps) {
  const isShared = member.ownership === 'shared';
  const isAdded = variant === 'added';

  const content = (
    <View style={styles.content}>
      <Text style={[styles.name, isAdded && styles.nameAdded, selected && styles.nameSelected]}>
        {!isAdded && '+ '}
        {member.name}
      </Text>
      {isShared && member.sharedByEmail && (
        <Text style={styles.sharedMeta}>
          {pl.family.sharedBadge} · {member.sharedByEmail}
        </Text>
      )}
    </View>
  );

  if (isAdded || !onPress) {
    return <View style={[styles.chip, isAdded && styles.chipAdded]}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        styles.chipAdd,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {busy ? <ActivityIndicator size="small" color={colors.coral} /> : content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipAdd: { backgroundColor: colors.white },
  chipAdded: {
    backgroundColor: 'rgba(232,168,124,0.1)',
    borderColor: 'rgba(232,168,124,0.35)',
  },
  chipSelected: {
    backgroundColor: 'rgba(232,168,124,0.15)',
    borderColor: colors.coral,
  },
  chipDisabled: { opacity: 0.5 },
  content: { gap: 2 },
  name: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
  },
  nameAdded: {
    fontFamily: fonts.bodyMedium,
    color: colors.navy,
  },
  nameSelected: {
    color: colors.coralDark,
    fontFamily: fonts.bodySemi,
  },
  sharedMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
});
