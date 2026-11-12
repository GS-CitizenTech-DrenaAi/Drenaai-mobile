import { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ALVO_MIN, cores, espaco, raio } from './tema';
import { Texto } from './Texto';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
  icone?: LucideIcon;
  carregando?: boolean;
  desabilitado?: boolean;
};

export function Botao({ titulo, onPress, variante = 'primario', icone: Icone, carregando = false, desabilitado = false }: Props) {
  const inativo = desabilitado || carregando;
  const corTexto = variante === 'secundario' ? cores.primaria : cores.branco;
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({ transform: [{ scale: escala.get() }] }));

  return (
    <Animated.View style={estiloAnimado}>
      <Pressable
        onPress={onPress}
        onPressIn={() => escala.set(withSpring(0.96))}
        onPressOut={() => escala.set(withSpring(1))}
        disabled={inativo}
        accessibilityRole="button"
        accessibilityLabel={titulo}
        accessibilityState={{ disabled: inativo, busy: carregando }}
        style={({ pressed }) => [
          styles.base,
          styles[variante],
          pressed && variante === 'primario' && { backgroundColor: cores.primariaPressionada },
          inativo && styles.inativo,
        ]}
      >
        {carregando ? (
          <ActivityIndicator color={corTexto} />
        ) : (
          <View style={styles.conteudo}>
            {Icone && <Icone size={20} color={corTexto} strokeWidth={1.9} />}
            <Texto variante="destaque" cor={corTexto}>{titulo}</Texto>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: ALVO_MIN,
    borderRadius: raio.md,
    paddingHorizontal: espaco.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primario: { backgroundColor: cores.primaria },
  secundario: { backgroundColor: cores.branco, borderWidth: 1.5, borderColor: cores.primaria },
  perigo: { backgroundColor: cores.alerta },
  inativo: { opacity: 0.5 },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
});