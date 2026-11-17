import { Image } from 'expo-image';
import { ImageIcon, MapPinned, Users } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { rotuloTipo, tempoRelativo } from '@/dados/textos';
import { Ocorrencia } from '@/dados/tipos';
import { Botao } from './Botao';
import { cores, espaco } from './tema';
import { Texto } from './Texto';

type Props = {
  ocorrencia: Ocorrencia | null;
  distancia: number;
  ocupado: boolean;
  aoConfirmar: () => void;
  aoEnviarMesmoAssim: () => void;
  aoFechar: () => void;
};

export function FolhaRepetida({ ocorrencia, distancia, ocupado, aoConfirmar, aoEnviarMesmoAssim, aoFechar }: Props) {
  return (
    <Modal visible={ocorrencia !== null} transparent animationType="fade" onRequestClose={aoFechar}>
      <Pressable style={styles.fundo} onPress={aoFechar} accessibilityLabel="Fechar aviso" />
      {ocorrencia && (
        <Animated.View entering={SlideInDown.springify().damping(18)} style={styles.folha} accessibilityViewIsModal>
          <View style={styles.alca} />
          <View style={styles.icone}>
            <MapPinned size={28} color={cores.ambar.texto} strokeWidth={1.9} />
          </View>
          <Texto variante="titulo" accessibilityRole="header">
            Alguém já denunciou aqui perto
          </Texto>
          <Texto cor={cores.textoSec}>
            A <Texto variante="destaque">{distancia} m</Texto> de você existe uma denúncia parecida. Confirmar a que já
            existe ajuda a equipe a priorizar mais rápido.
          </Texto>

          <View style={styles.cartao}>
            {ocorrencia.fotoUrl ? (
              <Image source={{ uri: ocorrencia.fotoUrl }} style={styles.foto} />
            ) : (
              <View style={[styles.foto, styles.semFoto]}>
                <ImageIcon size={24} color={cores.textoSec} strokeWidth={1.9} />
              </View>
            )}
            <View style={styles.flex}>
              <Texto variante="destaque">{rotuloTipo(ocorrencia.tipo)}</Texto>
              <Texto variante="pequeno" cor={cores.textoSec}>
                {ocorrencia.endereco} · {tempoRelativo(ocorrencia.criadaEm)}
              </Texto>
              <View style={styles.linha}>
                <Users size={14} color={cores.primaria} strokeWidth={2.3} />
                <Texto variante="pequeno" cor={cores.primaria}>
                  {ocorrencia.confirmacoes} {ocorrencia.confirmacoes === 1 ? 'vizinho confirmou' : 'vizinhos confirmaram'}
                </Texto>
              </View>
            </View>
          </View>

          <Botao titulo="Eu também vi, confirmar" icone={Users} onPress={aoConfirmar} carregando={ocupado} />
          <Botao titulo="É outro problema, enviar mesmo assim" variante="secundario" onPress={aoEnviarMesmoAssim} desabilitado={ocupado} />
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { ...StyleSheet.absoluteFill, backgroundColor: cores.transparente.fundoModal },
  folha: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.branco,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: espaco.xl,
    paddingBottom: espaco.xxl + espaco.lg,
    gap: espaco.md,
  },
  alca: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: cores.borda },
  icone: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: cores.ambar.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartao: {
    flexDirection: 'row',
    gap: espaco.md,
    padding: espaco.md,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 16,
    alignItems: 'center',
  },
  foto: { width: 64, height: 64, borderRadius: 12 },
  semFoto: { backgroundColor: cores.azulClaro, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: espaco.xxs },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs, marginTop: espaco.xxs },
});
