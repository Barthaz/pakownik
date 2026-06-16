import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { config } from '@fortawesome/fontawesome-svg-core';
import {
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RootNavigation } from '@/navigation';
import { Logo } from '@/components/Logo';
import { colors } from '@/theme';

config.autoAddCss = false;

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <Logo size={96} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigation isAuthenticated={!!user} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_600SemiBold,
    DMSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <Logo size={96} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
