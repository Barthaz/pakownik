import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { PackingProgress } from '@/models/types';
import { pl } from '@/models/pl';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export function ProgressBar({ progress }: { progress: PackingProgress }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{pl.lists.progress}</Text>
        <Text style={styles.percent}>{progress.percent}%</Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={[colors.sand, colors.coral]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.max(progress.percent, 0)}%` }]}
        />
      </View>
      <Text style={styles.meta}>
        {pl.lists.packed}: {progress.packedQuantity} {pl.lists.of} {progress.totalQuantity}{' '}
        {pl.lists.pieces}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.navy,
  },
  percent: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.coral,
  },
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
});
