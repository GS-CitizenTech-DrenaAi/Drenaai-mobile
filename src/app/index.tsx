import { StyleSheet, Text, View } from 'react-native';
import { cores, espaco, fonte, raio } from '@/ui/tema';

export default function Index() {
  return (
    <View style={styles.tela}>
      <Text style={styles.titulo}>DrenaAi</Text>
      <View style={styles.chip}>
        <Text style={styles.chipTexto}>Prioridade alta</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', gap: espaco.lg },
  titulo: { fontSize: fonte.grande, fontWeight: '700', color: cores.primaria },
  chip: { backgroundColor: cores.vermelho.fundo, paddingHorizontal: espaco.md, paddingVertical: espaco.sm, borderRadius: raio.pilula },
  chipTexto: { color: cores.vermelho.texto, fontWeight: '600' },
});