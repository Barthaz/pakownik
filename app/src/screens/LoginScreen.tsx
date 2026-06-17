import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!isValidEmail(email)) {
      setEmailError(pl.auth.invalidEmail);
      return;
    }
    if (!password) {
      setPasswordError(pl.auth.invalidCredentials);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      const mapped = mapAuthError((e as Error).message);
      if (mapped.emailError) setEmailError(mapped.emailError);
      if (mapped.passwordError) setPasswordError(mapped.passwordError);
      if (mapped.general) Alert.alert(pl.common.error, mapped.general);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.top}>
        <AppNameLogo align="center" />
        <Text style={styles.title}>{pl.auth.login}</Text>
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
            autoComplete="email"
            error={emailError}
          />
          <Input
            label={pl.auth.password}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (passwordError) setPasswordError('');
            }}
            secureTextEntry
            autoComplete="password"
            error={passwordError}
          />
          <Button title={pl.auth.login} onPress={handleLogin} loading={loading} />
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>
          {pl.auth.noAccount} <Text style={styles.linkBold}>{pl.auth.register}</Text>
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
