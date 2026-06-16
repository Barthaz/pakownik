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
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setConfirmError(pl.auth.passwordMismatch);
      return;
    }

    setConfirmError('');
    setLoading(true);
    try {
      await register(email, password);
    } catch (e) {
      Alert.alert(pl.common.error, (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.top}>
        <AppNameLogo />
        <Text style={styles.title}>{pl.auth.register}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.form}>
          <Input
            label={pl.auth.email}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label={pl.auth.password}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (confirmError && value === confirmPassword) {
                setConfirmError('');
              }
            }}
            secureTextEntry
          />
          <Input
            label={pl.auth.confirmPassword}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (confirmError) {
                setConfirmError('');
              }
            }}
            secureTextEntry
            error={confirmError}
          />
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
