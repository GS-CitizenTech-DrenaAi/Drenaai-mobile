import { StyleSheet, View } from 'react-native';
import { Texto } from '@/ui/Texto';
import { cores, espaco } from '@/ui/tema';

export default function Mapa() {
  return (
    <View style={styles.tela}>
      <Texto variante="titulo">Mapa</Texto>
      <Texto cor={cores.textoSec}>Em construção</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', gap: espaco.sm },
});