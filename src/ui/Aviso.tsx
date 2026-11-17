import { CloudOff, Inbox, LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Botao } from './Botao';
import { cores, espaco, raio } from './tema';
import { Texto } from './Texto';

type Props = {
  tipo: 'erro' | 'vazio';
  titulo: string;
  mensagem?: string;
  aoTentarDeNovo?: () => void;
};

const ICONE: Record<Props['tipo'], LucideIcon> = { erro: CloudOff, vazio: Inbox };

export function Aviso({ tipo, titulo, mensagem, aoTentarDeNovo }: Props) {
  const Icone = ICONE[tipo];
  const cor = tipo === 'erro' ? cores.vermelho : { fundo: cores.azulClaro, texto: cores.primaria };

  return (
    <View style={styles.caixa} accessibilityLiveRegion="polite">
      <View style={[styles.icone, { backgroundColor: cor.fundo }]}>
        <Icone size={28} color={cor.texto} strokeWidth={1.9} />
      </View>
      <Texto variante="destaque" style={styles.centro}>
        {titulo}
      </Texto>
      {mensagem && (
        <Texto variante="pequeno" cor={cores.textoSec} style={styles.centro}>
          {mensagem}
        </Texto>
      )}
      {aoTentarDeNovo && <Botao titulo="Tentar de novo" variante="secundario" onPress={aoTentarDeNovo} />}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.xl,
    backgroundColor: cores.branco,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  icone: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  centro: { textAlign: 'center' },
});
