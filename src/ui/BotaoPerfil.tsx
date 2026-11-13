import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { iniciais } from '@/dados/textos';
import { useSessao } from '@/estado/SessaoContext';
import { ALVO_MIN, cores } from './tema';
import { Texto } from './Texto';

export function BotaoPerfil() {
  const router = useRouter();
  const { usuario } = useSessao();

  return (
    <Pressable
      onPress={() => router.push('/perfil')}
      accessibilityRole="button"
      accessibilityLabel="Meu perfil"
      style={styles.botao}
    >
      <Texto variante="destaque" cor={cores.branco}>
        {iniciais(usuario?.nome ?? '')}
      </Texto>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: ALVO_MIN,
    height: ALVO_MIN,
    borderRadius: 16,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
});