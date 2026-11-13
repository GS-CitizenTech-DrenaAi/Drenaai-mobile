import { usePathname } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { cores } from './tema';
import { Texto } from './Texto';

type Props = {
  onPress?: (e: GestureResponderEvent) => void;
};

export function BotaoDenunciar({ onPress }: Props) {
  const focado = usePathname() === '/denunciar';
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({ transform: [{ scale: escala.get() }] }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => escala.set(withSpring(0.9))}
      onPressOut={() => escala.set(withSpring(1))}
      accessibilityRole="tab"
      accessibilityLabel="Denunciar"
      accessibilityState={{ selected: focado }}
      style={styles.area}
    >
      <Animated.View style={[styles.quadrado, estiloAnimado]}>
        <Plus size={30} color={cores.branco} strokeWidth={2.3} />
      </Animated.View>
      <Texto variante="pequeno" cor={cores.primaria} style={styles.rotulo}>
        Denunciar
      </Texto>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  quadrado: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: cores.primaria,
    borderWidth: 5,
    borderColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    elevation: 8,
    shadowColor: cores.primaria,
    shadowOpacity: 0.35,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 8 },
  },
  rotulo: { fontFamily: 'Inter_700Bold', marginTop: 2 },
});