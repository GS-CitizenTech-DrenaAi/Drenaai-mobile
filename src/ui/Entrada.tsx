import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  ordem?: number;
  style?: StyleProp<ViewStyle>;
};

export function Entrada({ children, ordem = 0, style }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(ordem * 80)}
      layout={LinearTransition.springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}