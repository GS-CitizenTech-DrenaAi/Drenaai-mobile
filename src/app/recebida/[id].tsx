import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Botao } from '@/ui/Botao';
import { Texto } from '@/ui/Texto';
import { cores, espaco } from '@/ui/tema';

export default function Recebida() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.tela}>
      <Texto variante="titulo">Denúncia recebida</Texto>
      <Texto cor={cores.textoSec}>{id}</Texto>
      <Botao titulo="Voltar ao bairro" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, justifyContent: 'center', padding: espaco.xl, gap: espaco.md },
});
