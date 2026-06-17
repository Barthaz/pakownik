import { useState } from 'react';
import {
  Image,
  View,
  StyleSheet,
  type ImageStyle,
  type LayoutChangeEvent,
  type StyleProp,
} from 'react-native';
import { pl } from '@/models/pl';

const nameLogoSource = Image.resolveAssetSource(
  require('../../assets/pakownik-name-logo.png'),
);
const aspectRatio = nameLogoSource.width / nameLogoSource.height;

interface AppNameLogoProps {
  style?: StyleProp<ImageStyle>;
  align?: 'left' | 'center';
}

export function AppNameLogo({ style, align = 'left' }: AppNameLogoProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0 && nextWidth !== width) {
      setWidth(nextWidth);
    }
  };

  return (
    <View
      style={[styles.wrap, align === 'center' && styles.wrapCenter]}
      onLayout={onLayout}
    >
      {width > 0 ? (
        <Image
          source={nameLogoSource}
          style={[{ width, height: width / aspectRatio }, style]}
          resizeMode="contain"
          accessibilityLabel={pl.appName}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '80%',
    alignSelf: 'flex-start',
  },
  wrapCenter: {
    alignSelf: 'center',
  },
});
