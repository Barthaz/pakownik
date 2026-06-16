import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/models/types';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { pl } from '@/models/pl';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.visual}>
          <View style={styles.glow} />
          <View style={styles.card}>
            <Logo size={140} />
            <View style={styles.preview}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewLabel}>Postęp pakowania</Text>
                <Text style={styles.previewPercent}>78%</Text>
              </View>
              <View style={styles.previewTrack}>
                <View style={styles.previewFill} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.tagline}>{pl.tagline}</Text>
        <Text style={styles.title}>{pl.auth.welcomeTitle}</Text>
        <Text style={styles.subtitle}>{pl.auth.welcomeSubtitle}</Text>
      </View>

      <View style={styles.actions}>
        <Button title={pl.auth.login} onPress={() => navigation.navigate('Login')} />
        <Button
          title={pl.auth.register}
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between', paddingBottom: spacing.xl },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing.md },
  visual: {
    width: 220,
    height: 220,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(212,165,116,0.25)',
    transform: [{ rotate: '6deg' }],
  },
  card: {
    width: '88%',
    height: '88%',
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    transform: [{ rotate: '-2deg' }],
    ...shadows.md,
  },
  preview: {
    width: '100%',
    marginTop: spacing.sm,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  previewLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  previewPercent: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.coral,
  },
  previewTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  previewFill: {
    width: '78%',
    height: '100%',
    backgroundColor: colors.coral,
    borderRadius: radius.full,
  },
  tagline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.coral,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.headingSemi,
    fontSize: 22,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  actions: { gap: spacing.sm },
});
