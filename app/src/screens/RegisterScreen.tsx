import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/models/types';
import { useAuth } from '@/contexts/AuthContext';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AppNameLogo } from '@/components/AppNameLogo';
import { pl } from '@/models/pl';
import { isValidEmail, mapAuthError } from '@/utils/authErrors';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const webBase = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:5173';

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [loading, setLoading] = useState(false);

  const openLegal = (path: string) => {
    void Linking.openURL(`${webBase}${path}`);
  };

  const handleRegister = async () => {
    setEmailError('');
    setConfirmError('');
    setTermsError('');

    if (!isValidEmail(email)) {
      setEmailError(pl.auth.invalidEmail);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError(pl.auth.passwordMismatch);
      return;
    }
    if (!acceptTerms) {
      setTermsError(pl.legal.termsRequired);
      return;
    }

    setLoading(true);
    try {
      await register(email, password, acceptTerms);
    } catch (e) {
      const mapped = mapAuthError((e as Error).message);
      if (mapped.emailError) setEmailError(mapped.emailError);
      if (mapped.termsError) setTermsError(mapped.termsError);
      if (mapped.general) Alert.alert(pl.common.error, mapped.general);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.top}>
        <AppNameLogo align="center" />
        <Text style={styles.title}>{pl.auth.register}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.form}>
          <Input
            label={pl.auth.email}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (emailError) setEmailError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            error={emailError}
          />
          <Input
            label={pl.auth.password}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (confirmError && value === confirmPassword) setConfirmError('');
            }}
            secureTextEntry
          />
          <Input
            label={pl.auth.confirmPassword}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (confirmError) setConfirmError('');
            }}
            secureTextEntry
            error={confirmError}
          />

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => {
              setAcceptTerms((v) => !v);
              if (termsError) setTermsError('');
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkboxOn]}>
              {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              {pl.legal.acceptTerms}{' '}
              <Text style={styles.termsLink} onPress={() => openLegal('/regulamin')}>
                {pl.legal.terms}
              </Text>
              ,{' '}
              <Text style={styles.termsLink} onPress={() => openLegal('/polityka-prywatnosci')}>
                {pl.legal.privacy}
              </Text>{' '}
              {pl.legal.and}{' '}
              <Text style={styles.termsLink} onPress={() => openLegal('/rodo')}>
                {pl.legal.rodo}
              </Text>
            </Text>
          </TouchableOpacity>
          {termsError ? <Text style={styles.termsError}>{termsError}</Text> : null}

          <Button title={pl.auth.register} onPress={handleRegister} loading={loading} />
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>
          {pl.auth.hasAccount} <Text style={styles.linkBold}>{pl.auth.login}</Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.navy,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  form: { gap: spacing.md },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: { backgroundColor: colors.coral, borderColor: colors.coral },
  checkmark: { color: colors.white, fontSize: 14, fontFamily: fonts.bodySemi },
  termsText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.navy,
    lineHeight: 20,
  },
  termsLink: { color: colors.coral, fontFamily: fonts.bodySemi },
  termsError: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.red,
    marginTop: -spacing.xs,
  },
  link: {
    textAlign: 'center',
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
  },
  linkBold: {
    color: colors.coral,
    fontFamily: fonts.bodySemi,
  },
});
