import { View, Text, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
}

export function Screen({ children, padded = true, style, ...props }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={[styles.container, padded && styles.padded, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function ScreenTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  container: { flex: 1, backgroundColor: colors.cream },
  padded: { paddingHorizontal: spacing.md },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.navy,
    marginBottom: spacing.md,
  },
});
