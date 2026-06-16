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
}

export function AppNameLogo({ style }: AppNameLogoProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0 && nextWidth !== width) {
      setWidth(nextWidth);
    }
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
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
    width: '100%',
    alignSelf: 'stretch',
  },
});
