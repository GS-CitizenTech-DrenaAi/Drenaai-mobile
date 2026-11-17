import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { ALVO_MIN, cores, espaco, familia, fonte } from './tema';
import { Texto } from './Texto';

type Props = TextInputProps & {
  rotulo: string;
  segredo?: boolean;
  dica?: string;
};

export function Campo({ rotulo, segredo = false, dica, ...resto }: Props) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <View style={styles.bloco}>
      <Texto variante="destaque">{rotulo}</Texto>
      <View style={styles.caixa}>
        <TextInput
          accessibilityLabel={rotulo}
          accessibilityHint={dica}
          placeholderTextColor={cores.textoSec}
          secureTextEntry={segredo && !mostrar}
          style={styles.input}
          {...resto}
        />
        {segredo && (
          <Pressable
            onPress={() => setMostrar(!mostrar)}
            accessibilityRole="button"
            accessibilityLabel={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            style={styles.olho}
          >
            {mostrar ? (
              <EyeOff size={24} color={cores.textoSec} strokeWidth={1.9} />
            ) : (
              <Eye size={24} color={cores.textoSec} strokeWidth={1.9} />
            )}
          </Pressable>
        )}
      </View>
      {dica && (
        <Texto variante="pequeno" cor={cores.textoSec}>
          {dica}
        </Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: espaco.sm },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: cores.bordaCampo,
    borderRadius: 14,
    backgroundColor: cores.branco,
  },
  input: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: espaco.lg,
    fontSize: fonte.corpo,
    fontFamily: familia.regular,
    color: cores.texto,
  },
  olho: { width: ALVO_MIN, height: ALVO_MIN, alignItems: 'center', justifyContent: 'center' },
});