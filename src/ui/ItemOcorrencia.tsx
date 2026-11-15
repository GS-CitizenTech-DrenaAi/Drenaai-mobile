import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { rotuloStatus, rotuloTipo, tempoRelativo } from '@/dados/textos';
import { Ocorrencia } from '@/dados/tipos';
import { ChipStatus } from './ChipStatus';
import { cores, espaco } from './tema';
import { Texto } from './Texto';

export function ItemOcorrencia({ ocorrencia }: { ocorrencia: Ocorrencia }) {
  const router = useRouter();
  const titulo = rotuloTipo(ocorrencia.tipo);
  const complemento =
    ocorrencia.confirmacoes > 0
      ? ` · +${ocorrencia.confirmacoes} ${ocorrencia.confirmacoes === 1 ? 'vizinho confirmou' : 'vizinhos confirmaram'}`
      : ocorrencia.origem === 'SENSOR'
        ? ' · Sensor: bueiro cheio'
        : '';
  const detalhe = `${ocorrencia.endereco} · ${tempoRelativo(ocorrencia.criadaEm)}${complemento}`;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/ocorrencia/[id]', params: { id: ocorrencia.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ${detalhe}, ${rotuloStatus(ocorrencia.status)}`}
      accessibilityHint="Abre o acompanhamento da denúncia"
      style={({ pressed }) => [styles.item, pressed && styles.pressionado]}
    >
      <View style={styles.textos}>
        <Texto variante="destaque">{titulo}</Texto>
        <Texto variante="pequeno" cor={cores.textoSec}>
          {detalhe}
        </Texto>
      </View>
      <ChipStatus status={ocorrencia.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.md,
    minHeight: 72,
    padding: espaco.lg,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 16,
  },
  pressionado: { backgroundColor: cores.azulClaro },
  textos: { flex: 1, gap: 3 },
});