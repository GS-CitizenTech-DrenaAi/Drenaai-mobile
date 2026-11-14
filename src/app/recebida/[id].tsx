import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CircleCheck, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, ZoomIn } from 'react-native-reanimated';
import { BAIRRO } from '@/dados/mock/dadosMock';
import { repo } from '@/dados/repo';
import { faixaSeveridade, formatarNumero, rotuloTipo } from '@/dados/textos';
import { Ocorrencia } from '@/dados/tipos';
import { Botao } from '@/ui/Botao';
import { Entrada } from '@/ui/Entrada';
import { Texto } from '@/ui/Texto';
import { cores, espaco, raio } from '@/ui/tema';

const FAIXAS = ['Baixa', 'Média', 'Alta', 'Crítica'] as const;
const COR_FAIXA = { Baixa: cores.verde.solido, Média: cores.ambar.texto, Alta: cores.vermelho.solido, Crítica: cores.alerta };

function BarraParcela({ rotulo, valor, texto, ordem }: { rotulo: string; valor: number; texto: string; ordem: number }) {
  const largura = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({ width: `${largura.get() * 100}%` }));

  useEffect(() => {
    largura.set(withDelay(300 + ordem * 150, withTiming(valor, { duration: 700 })));
  }, [valor, ordem, largura]);

  return (
    <View style={styles.parcela} accessible accessibilityLabel={`${rotulo}: ${texto}`}>
      <Texto variante="pequeno" style={styles.parcelaRotulo}>
        {rotulo}
      </Texto>
      <View style={styles.trilho}>
        <Animated.View style={[styles.preenchido, estilo]} />
      </View>
      <Texto variante="pequeno" style={styles.parcelaValor}>
        {texto}
      </Texto>
    </View>
  );
}

export default function Recebida() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ocorrencia, setOcorrencia] = useState<Ocorrencia | null>(null);
  const [chuva12h, setChuva12h] = useState(0);

  useEffect(() => {
    Promise.all([repo.obterOcorrencia(id), repo.previsao(BAIRRO)]).then(([o, p]) => {
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

  const faixa = faixaSeveridade(ocorrencia.severidade);
  const v = ocorrencia.parcelasIpc ? ocorrencia.parcelasIpc.v / 0.3 : null;

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <StatusBar style="dark" />
      <View style={styles.cabeca}>
        <Animated.View entering={ZoomIn.springify().delay(100)} style={styles.check}>
          <CircleCheck size={40} color={cores.verde.solido} strokeWidth={1.9} />
        </Animated.View>
        <Texto variante="grande" accessibilityRole="header">
          Denúncia recebida
        </Texto>
        <Texto cor={cores.textoSec} style={styles.centralizado}>
          {rotuloTipo(ocorrencia.tipo)} · {ocorrencia.endereco}
        </Texto>
      </View>

      <Entrada ordem={1} style={styles.card}>
        <View style={styles.linhaEntre}>
          <View style={styles.linha}>
            <Sparkles size={18} color={cores.primaria} strokeWidth={1.9} />
            <Texto variante="destaque" accessibilityRole="header">
              Avaliação da foto pela IA
            </Texto>
          </View>
          {ocorrencia.confianca !== undefined && (
            <Texto variante="pequeno" cor={cores.textoSec}>
              confiança {Math.round(ocorrencia.confianca * 100)}%
            </Texto>
          )}
        </View>
        <View
          style={styles.escala}
          accessible
          accessibilityLabel={`Severidade ${faixa.toLowerCase()}, ${formatarNumero(ocorrencia.severidade)} numa escala de 0 a 1`}
        >
          {FAIXAS.map((f) => {
            const ativa = f === faixa;
            return (
              <View key={f} style={[styles.faixa, ativa && { flex: 2, backgroundColor: COR_FAIXA[f] }]}>
                <Texto variante="pequeno" cor={ativa ? cores.branco : cores.textoSec} style={ativa && styles.negrito}>
                  {ativa ? `${f} · ${formatarNumero(ocorrencia.severidade)}` : f}
                </Texto>
              </View>
            );
          })}
        </View>
        {ocorrencia.justificativa && (
          <Texto cor={cores.textoSec} style={styles.citacao}>
            “{ocorrencia.justificativa}”
          </Texto>
        )}
      </Entrada>

      <Entrada ordem={2} style={styles.card}>
        <View style={styles.linhaEntre}>
          <Texto variante="destaque" accessibilityRole="header">
            Prioridade de coleta (IPC)
          </Texto>
          <Texto variante="titulo" cor={cores.primaria}>
            {formatarNumero(ocorrencia.ipc)}
          </Texto>
        </View>
        <BarraParcela rotulo="Severidade" valor={ocorrencia.severidade} texto={formatarNumero(ocorrencia.severidade)} ordem={0} />
        <BarraParcela rotulo="Chuva em 12h" valor={Math.min(chuva12h / 50, 1)} texto={`${chuva12h} mm`} ordem={1} />
        {v !== null && <BarraParcela rotulo="Risco da rua" valor={v} texto={formatarNumero(v)} ordem={2} />}
      </Entrada>

      {ocorrencia.posicaoFila !== undefined && (
        <Entrada ordem={3} style={styles.posicao}>
          <Animated.View entering={ZoomIn.springify().delay(900)}>
            <Texto cor={cores.branco} style={styles.numero}>
              {ocorrencia.posicaoFila}º
            </Texto>
          </Animated.View>
          <Texto cor="#D6E6F5" style={styles.flex}>
            na fila de coleta do bairro.{' '}
            {chuva12h >= 25 ? 'Chuva forte prevista e rua que costuma alagar.' : 'A fila muda conforme a chuva prevista.'}
          </Texto>
        </Entrada>
      )}

      <Entrada ordem={4} style={styles.botoes}>
        <Botao titulo="Acompanhar denúncia" onPress={() => router.replace({ pathname: '/ocorrencia/[id]', params: { id } })} />
        <Botao titulo="Voltar ao bairro" variante="secundario" onPress={() => router.dismissTo('/')} />
      </Entrada>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: espaco.xl, paddingTop: 64, gap: espaco.lg },
  cabeca: { alignItems: 'center', gap: espaco.sm },
  check: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: cores.verde.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralizado: { textAlign: 'center' },
  card: {
    backgroundColor: cores.branco,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.md,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  linhaEntre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco.sm, flexWrap: 'wrap' },
  escala: { flexDirection: 'row', gap: 4 },
  faixa: {
    flex: 1,
    minHeight: 40,
    borderRadius: raio.sm,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  negrito: { fontFamily: 'Inter_700Bold' },
  citacao: { fontStyle: 'italic' },
  parcela: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  parcelaRotulo: { width: 96 },
  trilho: { flex: 1, height: 10, borderRadius: 5, backgroundColor: cores.azulClaro, overflow: 'hidden' },
  preenchido: { height: '100%', borderRadius: 5, backgroundColor: cores.primaria },
  parcelaValor: { width: 52, textAlign: 'right', fontFamily: 'Inter_700Bold' },
  posicao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.lg,
    backgroundColor: cores.primaria,
    borderRadius: 20,
    padding: espaco.lg,
  },
  numero: { fontSize: 44, lineHeight: 52, fontFamily: 'Inter_700Bold' },
  flex: { flex: 1 },
  botoes: { gap: espaco.sm, marginTop: espaco.sm },
});
