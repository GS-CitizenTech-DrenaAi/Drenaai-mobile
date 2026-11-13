import { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { cores } from './tema';

type Props = {
  icone: LucideIcon;
  focado: boolean;
};

export function IconeAba({ icone: Icone, focado }: Props) {
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({ transform: [{ scale: escala.get() }] }));

  useEffect(() => {
    if (focado) escala.set(withSequence(withTiming(1.2, { duration: 120 }), withSpring(1)));
  }, [focado, escala]);

  return (
    <Animated.View style={estiloAnimado}>
      <Icone
        size={26}
        color={focado ? cores.primaria : cores.textoSec}
        strokeWidth={focado ? 2.3 : 1.9}
      />
    </Animated.View>
  );
}