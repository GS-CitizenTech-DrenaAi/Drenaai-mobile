import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BadgeCheck, CheckCheck, ChevronLeft, Clock, ImageIcon, Inbox, LucideIcon, Truck, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { repo } from '@/dados/repo';
import { diaEHora, faixaSeveridade, formatarNumero, ORDEM_STATUS, rotuloStatus, rotuloTipo } from '@/dados/textos';
import { Ocorrencia, Status } from '@/dados/tipos';
import { ChipPrioridade } from '@/ui/ChipPrioridade';
import { Entrada } from '@/ui/Entrada';
import { Texto } from '@/ui/Texto';
import { ALVO_MIN, cores, espaco, raio } from '@/ui/tema';

const ICONE: Record<Status, LucideIcon> = {
  RECEBIDA: Inbox,
  VALIDADA: BadgeCheck,
  NA_FILA: Clock,
  EM_ATENDIMENTO: Truck,
  CONCLUIDA: CheckCheck,
};

function Halo() {
  const escala = useSharedValue(1);
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.get() }], opacity: 2 - escala.get() }));

  useEffect(() => {
    escala.set(withRepeat(withTiming(1.6, { duration: 1200 }), -1));
  }, [escala]);

  return <Animated.View style={[styles.halo, estilo]} />;
}

export default function Rastreio() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ocorrencia, setOcorrencia] = useState<Ocorrencia | null>(null);
  const [chuva12h, setChuva12h] = useState(0);

  useEffect(() => {
    Promise.all([repo.obterOcorrencia(id), repo.previsao('Jardim Pantanal')]).then(([o, p]) => {
      setOcorrencia(o);
      setChuva12h(p.chuvaMm12h);
    });
  }, [id]);

  if (!ocorrencia) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  const atual = ocorrencia.status;
  const indiceAtual = ORDEM_STATUS.indexOf(atual);

  function detalheEtapa(status: Status, feita: boolean) {
    const registro = ocorrencia!.historicoStatus.find((h) => h.status === status);
    if (feita && registro) {
      const quando = diaEHora(registro.dataHora);
      if (status === 'VALIDADA') {
        return `${quando} · IA avaliou severidade ${faixaSeveridade(ocorrencia!.severidade).toLowerCase()} (${formatarNumero(ocorrencia!.severidade)})`;
      }
      return quando;
    }
    if (status === 'CONCLUIDA') return 'Você recebe um aviso no app';
    return 'Ainda não';
  }

  return (
    <View style={styles.tela}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.rolagem}>
        <View style={styles.capa}>
          {ocorrencia.fotoUrl ? (
            <Image source={{ uri: ocorrencia.fotoUrl }} style={StyleSheet.absoluteFill} accessibilityLabel="Foto enviada na denúncia" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.semFoto]}>
              <ImageIcon size={48} color="#D6E6F5" strokeWidth={1.5} />
            </View>
          )}
          <View style={styles.sombraCapa} />
        </View>

        <View style={styles.corpo}>
          <Entrada ordem={0} style={styles.bloco}>
            <Texto variante="grande" accessibilityRole="header">
              {rotuloTipo(ocorrencia.tipo)}
            </Texto>
            <Texto cor={cores.textoSec}>
              {ocorrencia.endereco} · enviada {diaEHora(ocorrencia.criadaEm).toLowerCase()}
            </Texto>
            <View style={styles.chips}>
              <ChipPrioridade ipc={ocorrencia.ipc} />
              <View style={styles.chipAzul} accessible accessibilityLabel={`${ocorrencia.confirmacoes} vizinhos confirmaram`}>
                <Users size={16} color={cores.primaria} strokeWidth={2.3} />
                <Texto variante="pequeno" cor={cores.primaria} style={styles.negrito}>
                  {ocorrencia.confirmacoes} {ocorrencia.confirmacoes === 1 ? 'vizinho confirmou' : 'vizinhos confirmaram'}
                </Texto>
              </View>
            </View>
          </Entrada>

          <Texto variante="titulo" accessibilityRole="header">
            Acompanhamento
          </Texto>
          <View accessibilityLabel="Etapas da denúncia">
            {ORDEM_STATUS.map((status, i) => {
              const feita = i <= indiceAtual;
              const eAtual = i === indiceAtual;
              const Icone = ICONE[status];
              const detalhe = detalheEtapa(status, feita);
              const mostraFila = eAtual && ocorrencia.posicaoFila !== undefined;
              const leitura = `${rotuloStatus(status)}, ${eAtual ? 'etapa atual, ' : ''}${detalhe}${mostraFila ? `, ${ocorrencia.posicaoFila}º na fila` : ''}`;

              return (
                <Entrada key={status} ordem={i + 1} style={styles.etapa}>
                  <View style={styles.trilhaCol}>
                    <View style={styles.bolinhaCaixa}>
                      {eAtual && <Halo />}
                      <View style={[styles.bolinha, feita && styles.bolinhaFeita, eAtual && styles.bolinhaAtual]}>
                        <Icone size={18} color={feita ? cores.branco : cores.bordaCampo} strokeWidth={2.3} />
                      </View>
                    </View>
                    {i < ORDEM_STATUS.length - 1 && <View style={[styles.trilha, i < indiceAtual && styles.trilhaFeita]} />}
                  </View>
                  <View
                    style={[styles.etapaTexto, eAtual && styles.etapaAtual]}
                    accessible
                    accessibilityLabel={leitura}
                  >
                    <View style={styles.flex}>
                      <Texto variante="destaque" cor={feita ? cores.texto : cores.textoSec}>
                        {rotuloStatus(status)}
                      </Texto>
                      <Texto variante="pequeno" cor={cores.textoSec}>
                        {detalhe}
                      </Texto>
                    </View>
                    {mostraFila && (
                      <View style={styles.fila}>
                        <Texto variante="titulo" cor={cores.primaria}>
                          {ocorrencia.posicaoFila}º
                        </Texto>
                        <Texto variante="pequeno" cor={cores.textoSec}>
                          na fila
                        </Texto>
                      </View>
                    )}
                  </View>
                </Entrada>
              );
            })}
          </View>

          <Texto variante="titulo" accessibilityRole="header">
            Detalhes
          </Texto>
          <View style={styles.detalhes}>
            <View style={styles.detalheLinha}>
              <Texto cor={cores.textoSec}>Tipo</Texto>
              <Texto variante="destaque">{rotuloTipo(ocorrencia.tipo)}</Texto>
            </View>
            <View style={styles.detalheLinha}>
              <Texto cor={cores.textoSec}>Descrição</Texto>
              <Texto variante="destaque" style={styles.detalheValor}>
                {ocorrencia.descricao || 'Sem descrição'}
              </Texto>
            </View>
            <View style={[styles.detalheLinha, styles.semBorda]}>
              <Texto cor={cores.textoSec}>Chuva prevista (12h)</Texto>
              <Texto variante="destaque">{chuva12h} mm</Texto>
            </View>
          </View>
        </View>
      </ScrollView>

      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.voltar}>
        <ChevronLeft size={26} color={cores.texto} strokeWidth={2.3} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { alignItems: 'center', justifyContent: 'center' },
  rolagem: { paddingBottom: espaco.xxl },
  capa: { height: 240, backgroundColor: cores.primaria },
  semFoto: { alignItems: 'center', justifyContent: 'center' },
  sombraCapa: { position: 'absolute', left: 0, right: 0, top: 0, height: 90, backgroundColor: 'rgba(15,27,45,0.25)' },
  voltar: {
    position: 'absolute',
    top: 48,
    left: espaco.lg,
    width: ALVO_MIN,
    height: ALVO_MIN,
    borderRadius: 16,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  corpo: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: cores.fundo,
    padding: espaco.xl,
    gap: espaco.lg,
  },
  bloco: { gap: espaco.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, marginTop: espaco.xs },
  chipAzul: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: raio.pilula,
    backgroundColor: cores.azulClaro,
  },
  negrito: { fontFamily: 'Inter_700Bold' },
  etapa: { flexDirection: 'row', gap: espaco.md },
  trilhaCol: { alignItems: 'center', width: 40 },
  bolinhaCaixa: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: cores.primaria },
  bolinha: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolinhaFeita: { backgroundColor: cores.verde.solido, borderColor: cores.verde.solido },
  bolinhaAtual: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  trilha: { flex: 1, width: 3, minHeight: 20, backgroundColor: cores.borda, marginVertical: 2 },
  trilhaFeita: { backgroundColor: cores.verde.solido },
  etapaTexto: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: espaco.sm, marginBottom: espaco.sm, gap: espaco.sm },
  etapaAtual: {
    backgroundColor: cores.branco,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    paddingHorizontal: espaco.md,
  },
  flex: { flex: 1, gap: 2 },
  fila: { alignItems: 'center' },
  detalhes: { backgroundColor: cores.branco, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, paddingHorizontal: espaco.lg },
  detalheLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espaco.lg,
    paddingVertical: espaco.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  detalheValor: { flex: 1, textAlign: 'right' },
  semBorda: { borderBottomWidth: 0 },
});
