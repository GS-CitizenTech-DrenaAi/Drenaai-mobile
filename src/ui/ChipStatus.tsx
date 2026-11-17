import { BadgeCheck, CheckCheck, Clock, Inbox, LucideIcon, Truck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { rotuloStatus } from '@/dados/textos';
import { Status } from '@/dados/tipos';
import { cores, espaco, familia, raio } from './tema';
import { Texto } from './Texto';

const azul = { fundo: cores.azulClaro, texto: cores.primaria };

const ESTILO: Record<Status, { icone: LucideIcon; cor: { fundo: string; texto: string } }> = {
  RECEBIDA: { icone: Inbox, cor: azul },
  VALIDADA: { icone: BadgeCheck, cor: azul },
  NA_FILA: { icone: Clock, cor: cores.vermelho },
  EM_ATENDIMENTO: { icone: Truck, cor: cores.ambar },
  CONCLUIDA: { icone: CheckCheck, cor: cores.verde },
};

export function ChipStatus({ status }: { status: Status }) {
  const { icone: Icone, cor } = ESTILO[status];
  const texto = rotuloStatus(status);

  return (
    <View style={[styles.chip, { backgroundColor: cor.fundo }]} accessible accessibilityLabel={`Status: ${texto}`}>
      <Icone size={16} color={cor.texto} strokeWidth={2.3} />
      <Texto variante="pequeno" cor={cor.texto} style={styles.texto}>
        {texto}
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