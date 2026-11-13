import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSessao } from '@/estado/SessaoContext';
import { Botao } from '@/ui/Botao';
import { Texto } from '@/ui/Texto';
import { cores, espaco } from '@/ui/tema';

export default function Perfil() {
  const router = useRouter();
  const { usuario, sair } = useSessao();

  return (
    <View style={styles.tela}>
      <Texto variante="titulo">{usuario?.nome}</Texto>
      <Texto cor={cores.textoSec}>Perfil em construção</Texto>
      <Botao titulo="Voltar" variante="secundario" onPress={() => router.back()} />
      <Botao titulo="Sair" variante="perigo" onPress={sair} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, justifyContent: 'center', padding: espaco.xl, gap: espaco.md },
});