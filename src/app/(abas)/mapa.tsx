import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronDown, ChevronRight, ChevronUp, Flame, ListOrdered, LocateFixed, Radio, Search, X } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { BAIRRO, CENTRO_BAIRRO } from '@/dados/mock/dadosMock';
import { repo } from '@/dados/repo';
import { formatarNumero, nivelPrioridade, rotuloTipo, tempoRelativo } from '@/dados/textos';
import { Bueiro, Ocorrencia } from '@/dados/tipos';
import { BotaoPerfil } from '@/ui/BotaoPerfil';
import { Texto } from '@/ui/Texto';
import { ALVO_MIN, cores, espaco, raio } from '@/ui/tema';

const COR_NIVEL = { alta: cores.vermelho.solido, media: cores.ambar.solido, baixa: cores.verde.solido };
const TEXTO_NIVEL = { alta: 'alta', media: 'média', baixa: 'baixa' };

function estadoSensor(obstrucao: number) {
  if (obstrucao >= 70) return { texto: 'Crítico', cor: cores.vermelho };
  if (obstrucao >= 40) return { texto: 'Atenção', cor: cores.ambar };
  return { texto: 'Normal', cor: cores.verde };
}

const REGIAO_INICIAL = { ...CENTRO_BAIRRO, latitudeDelta: 0.016, longitudeDelta: 0.016 };

export default function Mapa() {
  const router = useRouter();
  const mapa = useRef<MapView>(null);
  const [filtro, setFiltro] = useState<'denuncias' | 'sensores'>('denuncias');
  const [fila, setFila] = useState<Ocorrencia[]>([]);
  const [bueiros, setBueiros] = useState<Bueiro[]>([]);
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState(false);
  const [sensor, setSensor] = useState<Bueiro | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([repo.fila(BAIRRO), repo.listarBueiros(BAIRRO)]).then(([f, b]) => {
        setFila(f);
        setBueiros(b);
        setSensor((atual) => (atual ? b.find((item) => item.id === atual.id) ?? null : null));
      });
    }, []),
  );

  async function irParaMinhaLocalizacao() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    mapa.current?.animateToRegion({ latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 600);
  }

  function abrirOcorrencia(id: string) {
    router.push({ pathname: '/ocorrencia/[id]', params: { id } });
  }

  const termo = busca.trim().toLowerCase();
  const filaVisivel = fila.filter(
    (o) => !termo || rotuloTipo(o.tipo).toLowerCase().includes(termo) || o.endereco.toLowerCase().includes(termo),
  );
  const bueirosVisiveis = bueiros.filter(
    (b) =>
      !termo ||
      b.endereco.toLowerCase().includes(termo) ||
      (b.codigoSensor ?? b.id).toLowerCase().includes(termo),
  );
  const listaTexto = aberta ? filaVisivel : filaVisivel.slice(0, 2);

  return (
    <View style={styles.tela}>
      <StatusBar style="dark" />
      <MapView
        ref={mapa}
        style={StyleSheet.absoluteFill}
        initialRegion={REGIAO_INICIAL}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={() => setSensor(null)}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {filtro === 'denuncias' &&
          filaVisivel.map((o) => {
            const nivel = nivelPrioridade(o.ipc);
            return (
              <Marker
                key={o.id}
                coordinate={{ latitude: o.latitude, longitude: o.longitude }}
                title={`${o.posicaoFila}º · ${rotuloTipo(o.tipo)}`}
                description={`Prioridade ${TEXTO_NIVEL[nivel]} · IPC ${formatarNumero(o.ipc)}`}
                onCalloutPress={() => abrirOcorrencia(o.id)}
              >
                <View style={[styles.pino, { backgroundColor: COR_NIVEL[nivel] }]}>
                  <Texto variante="destaque" cor={nivel === 'media' ? cores.texto : cores.branco}>
                    {o.posicaoFila}
                  </Texto>
                </View>
              </Marker>
            );
          })}
        {filtro === 'sensores' &&
          bueirosVisiveis.map((b) => {
            const estado = estadoSensor(b.obstrucao);
            const selecionado = sensor?.id === b.id;
            return (
              <Marker key={b.id} coordinate={{ latitude: b.latitude, longitude: b.longitude }} onPress={() => setSensor(b)}>
                <View style={[styles.sensor, { borderColor: estado.cor.solido }, selecionado && styles.sensorSelecionado]}>
                  <Radio size={14} color={estado.cor.texto} strokeWidth={2.3} />
                  <Texto variante="pequeno" cor={estado.cor.texto} style={styles.negrito}>
                    {b.obstrucao}%
                  </Texto>
                </View>
              </Marker>
            );
          })}
      </MapView>

      <View style={styles.topo}>
        <View style={styles.linha}>
          <View style={styles.busca}>
            <Search size={20} color={cores.textoSec} strokeWidth={1.9} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar rua ou tipo"
              placeholderTextColor={cores.textoSec}
              accessibilityLabel="Buscar rua ou tipo de denúncia"
              style={styles.buscaTexto}
            />
            {busca !== '' && (
              <Pressable onPress={() => setBusca('')} accessibilityRole="button" accessibilityLabel="Limpar busca" style={styles.limpar}>
                <X size={18} color={cores.textoSec} strokeWidth={2} />
              </Pressable>
            )}
          </View>
          <BotaoPerfil />
        </View>

        <View style={styles.linha}>
          <View style={styles.filtro} accessibilityRole="tablist">
            {(['denuncias', 'sensores'] as const).map((f) => {
              const ativo = filtro === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => {
                    setFiltro(f);
                    setSensor(null);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: ativo }}
                  style={[styles.opcao, ativo && styles.opcaoAtiva]}
                >
                  {f === 'denuncias' ? (
                    <ListOrdered size={16} color={ativo ? cores.branco : cores.primaria} strokeWidth={2.3} />
                  ) : (
                    <Radio size={16} color={ativo ? cores.branco : cores.primaria} strokeWidth={2.3} />
                  )}
                  <Texto variante="pequeno" cor={ativo ? cores.branco : cores.primaria} style={styles.negrito}>
                    {f === 'denuncias' ? 'Denúncias' : 'Sensores'}
                  </Texto>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={irParaMinhaLocalizacao}
            accessibilityRole="button"
            accessibilityLabel="Centralizar na minha localização"
            style={styles.redondo}
          >
            <LocateFixed size={22} color={cores.primaria} strokeWidth={1.9} />
          </Pressable>
        </View>

        {filtro === 'denuncias' && (
          <Animated.View entering={FadeIn} style={styles.legenda} accessible accessibilityLabel="Legenda: vermelho alta, amarelo média, verde baixa prioridade">
            {(['alta', 'media', 'baixa'] as const).map((n) => (
              <View key={n} style={styles.itemLegenda}>
                <View style={[styles.ponto, { backgroundColor: COR_NIVEL[n] }]} />
                <Texto variante="pequeno" style={styles.negrito}>
                  {n === 'alta' ? 'Alta' : n === 'media' ? 'Média' : 'Baixa'}
                </Texto>
              </View>
            ))}
          </Animated.View>
        )}
      </View>

      {filtro === 'denuncias' && (
        <Animated.View entering={SlideInDown.springify().damping(18)} style={styles.gaveta}>
          <Pressable
            onPress={() => setAberta(!aberta)}
            accessibilityRole="button"
            accessibilityState={{ expanded: aberta }}
            accessibilityLabel={`Fila de coleta em texto, ${filaVisivel.length} denúncias`}
            style={styles.gavetaTopo}
          >
            <View style={styles.alca} />
            <View style={styles.linhaEntre}>
              <View>
                <Texto variante="titulo">Fila de coleta</Texto>
                <Texto variante="pequeno" cor={cores.textoSec}>
                  ordenada pelo IPC · {filaVisivel.length} denúncias
                </Texto>
              </View>
              {aberta ? (
                <ChevronDown size={24} color={cores.primaria} strokeWidth={2} />
              ) : (
                <ChevronUp size={24} color={cores.primaria} strokeWidth={2} />
              )}
            </View>
          </Pressable>
          <ScrollView style={aberta ? styles.listaAberta : undefined} scrollEnabled={aberta}>
            {listaTexto.map((o) => {
              const nivel = nivelPrioridade(o.ipc);
              return (
                <Pressable
                  key={o.id}
                  onPress={() => abrirOcorrencia(o.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Prioridade ${o.posicaoFila}, ${TEXTO_NIVEL[nivel]}: ${rotuloTipo(o.tipo)}, ${o.endereco}, IPC ${formatarNumero(o.ipc)}`}
                  style={styles.itemFila}
                >
                  <View style={[styles.numero, { backgroundColor: COR_NIVEL[nivel] }]}>
                    <Texto variante="destaque" cor={nivel === 'media' ? cores.texto : cores.branco}>
                      {o.posicaoFila}
                    </Texto>
                  </View>
                  <View style={styles.flex}>
                    <Texto variante="destaque">{rotuloTipo(o.tipo)}</Texto>
                    <Texto variante="pequeno" cor={cores.textoSec}>
                      IPC {formatarNumero(o.ipc)} · {o.endereco}
                    </Texto>
                  </View>
                  <ChevronRight size={20} color={cores.textoSec} strokeWidth={1.9} />
                </Pressable>
              );
            })}
            {filaVisivel.length === 0 && (
              <Texto cor={cores.textoSec} style={styles.vazio}>
                Nenhuma denúncia encontrada para essa busca.
              </Texto>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {filtro === 'sensores' && sensor && (
        <Animated.View key={sensor.id} entering={SlideInDown.springify().damping(18)} style={styles.gaveta}>
          <View style={styles.alca} />
          <View style={styles.linhaEntre}>
            <View style={styles.flex}>
              <Texto variante="pequeno" cor={cores.textoSec}>
                Sensor {sensor.codigoSensor ?? sensor.id} · ESP32
              </Texto>
              <Texto variante="titulo">{sensor.endereco}</Texto>
            </View>
            <View style={[styles.estado, { backgroundColor: estadoSensor(sensor.obstrucao).cor.fundo }]}>
              <Texto variante="pequeno" cor={estadoSensor(sensor.obstrucao).cor.texto} style={styles.negrito}>
                {estadoSensor(sensor.obstrucao).texto}
              </Texto>
            </View>
          </View>
          <View style={styles.linhaEntre}>
            <Texto variante="destaque">Obstrução</Texto>
            <Texto variante="destaque">{sensor.obstrucao}%</Texto>
          </View>
          <View
            style={styles.trilho}
            accessibilityRole="progressbar"
            accessibilityLabel="Obstrução do bueiro"
            accessibilityValue={{ min: 0, max: 100, now: sensor.obstrucao }}
          >
            <View style={[styles.preenchido, { width: `${sensor.obstrucao}%`, backgroundColor: estadoSensor(sensor.obstrucao).cor.solido }]} />
          </View>
          <View style={styles.linhaEntre}>
            <View style={styles.dado}>
              <Texto variante="pequeno" cor={cores.textoSec}>
                Gás de matéria orgânica
              </Texto>
              <View style={styles.linha}>
                {sensor.gasDetectado && <Flame size={16} color={cores.vermelho.texto} strokeWidth={2.3} />}
                <Texto variante="destaque" cor={sensor.gasDetectado ? cores.vermelho.texto : cores.texto}>
                  {sensor.gasDetectado ? 'Detectado' : 'Não detectado'}
                </Texto>
              </View>
            </View>
            <View style={styles.dado}>
              <Texto variante="pequeno" cor={cores.textoSec}>
                Última leitura
              </Texto>
              <Texto variante="destaque">{tempoRelativo(sensor.ultimaLeitura)}</Texto>
            </View>
          </View>
          {sensor.ocorrenciaId && (
            <Pressable
              onPress={() => abrirOcorrencia(sensor.ocorrenciaId!)}
              accessibilityRole="link"
              style={styles.link}
            >
              <Texto variante="destaque" cor={cores.primaria}>
                Ver denúncia ligada a este bueiro
              </Texto>
              <ChevronRight size={18} color={cores.primaria} strokeWidth={2} />
            </Pressable>
          )}
        </Animated.View>
      )}

      {filtro === 'sensores' && !sensor && (
        <View style={styles.dicaSensor}>
          <Texto variante="pequeno" style={styles.centralizado}>
            Toque num sensor no mapa ou na lista abaixo para ver a obstrução do bueiro.
          </Texto>
          {bueirosVisiveis.length > 0 ? (
            <ScrollView
              style={styles.listaSensores}
              contentContainerStyle={styles.chipsSensor}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {bueirosVisiveis.map((b) => {
                const estado = estadoSensor(b.obstrucao);
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => setSensor(b)}
                    accessibilityRole="button"
                    accessibilityLabel={`Sensor ${b.codigoSensor ?? b.id}, ${b.endereco}: ${b.obstrucao}% obstruído, ${estado.texto}`}
                    style={[styles.chipSensor, { backgroundColor: estado.cor.fundo }]}
                  >
                    <Texto variante="pequeno" cor={estado.cor.texto} style={[styles.negrito, styles.flex]} numberOfLines={1}>
                      {b.endereco}
                    </Texto>
                    <Texto variante="pequeno" cor={estado.cor.texto} style={styles.negrito}>
                      {b.obstrucao}%
                    </Texto>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <Texto variante="pequeno" cor={cores.textoSec} style={styles.vazio}>
              Nenhum sensor encontrado para este bairro.
            </Texto>
          )}
        </View>
      )}
    </View>
  );
}

const sombra = { elevation: 4, shadowColor: '#0F1B2D', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } };

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { position: 'absolute', top: 48, left: espaco.lg, right: espaco.lg, gap: espaco.sm },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  linhaEntre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco.md },
  flex: { flex: 1 },
  negrito: { fontFamily: 'Inter_700Bold' },
  centralizado: { textAlign: 'center' },
  busca: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    minHeight: ALVO_MIN,
    paddingLeft: espaco.md,
    backgroundColor: cores.branco,
    borderRadius: 16,
    ...sombra,
  },
  buscaTexto: { flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular', color: cores.texto, minHeight: ALVO_MIN },
  limpar: { width: ALVO_MIN, height: ALVO_MIN, alignItems: 'center', justifyContent: 'center' },
  filtro: { flex: 1, flexDirection: 'row', backgroundColor: cores.branco, borderRadius: raio.pilula, padding: 4, ...sombra },
  opcao: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 40,
    borderRadius: raio.pilula,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoAtiva: { backgroundColor: cores.primaria },
  redondo: {
    width: ALVO_MIN,
    height: ALVO_MIN,
    borderRadius: 24,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra,
  },
  legenda: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: espaco.md,
    backgroundColor: cores.branco,
    borderRadius: raio.pilula,
    paddingVertical: 6,
    paddingHorizontal: espaco.md,
    ...sombra,
  },
  itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ponto: { width: 12, height: 12, borderRadius: 6 },
  pino: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: cores.branco,
    borderWidth: 2.5,
    borderRadius: raio.pilula,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sensorSelecionado: { transform: [{ scale: 1.15 }] },
  gaveta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.branco,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: espaco.lg,
    paddingTop: espaco.sm,
    gap: espaco.md,
    ...sombra,
  },
  gavetaTopo: { gap: espaco.sm },
  alca: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: cores.borda, marginBottom: espaco.xs },
  listaAberta: { maxHeight: 320 },
  itemFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: 64,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  numero: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  vazio: { paddingVertical: espaco.lg, textAlign: 'center' },
  estado: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: raio.pilula },
  trilho: { height: 12, borderRadius: 6, backgroundColor: cores.fundo, overflow: 'hidden' },
  preenchido: { height: '100%', borderRadius: 6 },
  dado: { flex: 1, gap: 2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: ALVO_MIN },
  dicaSensor: {
    position: 'absolute',
    left: espaco.lg,
    right: espaco.lg,
    bottom: espaco.lg,
    backgroundColor: cores.branco,
    borderRadius: 16,
    padding: espaco.md,
    gap: espaco.sm,
    ...sombra,
  },
  listaSensores: { maxHeight: 92 },
  chipsSensor: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: espaco.sm },
  chipSensor: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: raio.pilula,
  },
});
