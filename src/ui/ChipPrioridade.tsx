import { ArrowDown, ArrowUp, Minus, LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { formatarNumero, nivelPrioridade } from '@/dados/textos';
import { cores, espaco, familia, raio } from './tema';
import { Texto } from './Texto';

const ESTILO: Record<'alta' | 'media' | 'baixa', { icone: LucideIcon; cor: { fundo: string; texto: string }; texto: string }> = {
  alta: { icone: ArrowUp, cor: cores.vermelho, texto: 'Prioridade alta' },
  media: { icone: Minus, cor: cores.ambar, texto: 'Prioridade média' },
  baixa: { icone: ArrowDown, cor: cores.verde, texto: 'Prioridade baixa' },
};

export function ChipPrioridade({ ipc }: { ipc: number }) {
  const { icone: Icone, cor, texto } = ESTILO[nivelPrioridade(ipc)];
  const completo = `${texto} · IPC ${formatarNumero(ipc)}`;

  return (
    <View style={[styles.chip, { backgroundColor: cor.fundo }]} accessible accessibilityLabel={completo}>
      <Icone size={16} color={cor.texto} strokeWidth={2.3} />
      <Texto variante="pequeno" cor={cor.texto} style={styles.texto}>
        {completo}
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    paddingVertical: espaco.s,
    paddingHorizontal: espaco.ms,
    borderRadius: raio.pilula,
    alignSelf: 'flex-start',
  },
  texto: { fontFamily: familia.negrito },
});
