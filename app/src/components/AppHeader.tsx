import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSuitcaseRolling } from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/Logo';
import { pl } from '@/models/pl';
import { colors, fonts, radius, spacing } from '@/theme';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function AppHeader({ title, showLogo = false, rightAction }: AppHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        {showLogo ? (
          <Logo size={36} style={styles.inlineLogo} />
        ) : (
          <View style={styles.iconBadge}>
            <FontAwesomeIcon icon={faSuitcaseRolling} size={18} color={colors.coral} />
          </View>
        )}
        <View style={styles.titles}>
          <Text style={styles.appName}>{pl.appName}</Text>
          {title ? <Text style={styles.pageTitle}>{title}</Text> : null}
        </View>
      </View>
      {rightAction ? (
        <TouchableOpacity onPress={rightAction.onPress} hitSlop={8}>
          <Text style={styles.action}>{rightAction.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(232,168,124,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineLogo: {
    width: 36,
    height: 36,
  },
  titles: {
    flex: 1,
  },
  appName: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.navy,
  },
  pageTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 1,
  },
  action: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.muted,
  },
});
