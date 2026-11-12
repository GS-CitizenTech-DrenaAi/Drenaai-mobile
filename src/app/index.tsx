import { Camera } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Botao } from '@/ui/Botao';
import { Texto } from '@/ui/Texto';
import { cores, espaco } from '@/ui/tema';

export default function Index() {
  return (
    <View style={styles.tela}>
      <Texto variante="grande" cor={cores.primaria}>DrenaAi</Texto>
      <Texto variante="titulo">Título em Inter</Texto>
      <Texto>Texto do corpo em Inter normal.</Texto>
      <Texto variante="pequeno" cor={cores.textoSec}>Texto pequeno secundário</Texto>
      <Botao titulo="Denunciar" icone={Camera} onPress={() => console.log('apertou')} />
      <Botao titulo="Acompanhar" variante="secundario" onPress={() => {}} />
      <Botao titulo="Enviando" carregando onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, justifyContent: 'center', padding: espaco.xl, gap: espaco.md },
});