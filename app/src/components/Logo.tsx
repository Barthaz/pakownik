import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

const logoSource = require('../../assets/logo.png');

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function Logo({ size = 120, style }: LogoProps) {
  return (
    <Image
      source={logoSource}
      style={[styles.logo, { width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="Pakownik"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});
