import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, ChevronRight, Lightbulb } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { distanciaM } from '@/dados/geo';
import { BAIRRO, PONTO_GRAVACAO } from '@/dados/mock/dadosMock';
import { repo } from '@/dados/repo';
import { rotuloStatus, rotuloTipo } from '@/dados/textos';
import { Ocorrencia, Previsao } from '@/dados/tipos';
import { usePreferencias } from '@/estado/PreferenciasContext';
import { BotaoPerfil } from '@/ui/BotaoPerfil';
import { CardAlerta } from '@/ui/CardAlerta';
import { CardChuva } from '@/ui/CardChuva';
import { Entrada } from '@/ui/Entrada';
import { ItemOcorrencia } from '@/ui/ItemOcorrencia';
import { Texto } from '@/ui/Texto';
import { ALVO_MIN, cores, espaco, raio } from '@/ui/tema';

type Perto = { ocorrencia: Ocorrencia; distancia: number };

function ItemPerto({ ocorrencia, distancia }: Perto) {
  const router = useRouter();
  const situacao = ocorrencia.posicaoFila ? `${ocorrencia.posicaoFila}º na fila` : rotuloStatus(ocorrencia.status).toLowerCase();
  const titulo = rotuloTipo(ocorrencia.tipo);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/ocorrencia/[id]', params: { id: ocorrencia.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${titulo} a ${distancia} metros, ${ocorrencia.endereco}, ${situacao}`}
      style={styles.perto}
    >
      <View style={styles.distancia}>
        <Texto variante="pequeno" cor={cores.vermelho.texto} style={styles.negrito}>
          {distancia}m
        </Texto>
      </View>
      <View style={styles.flex}>
        <Texto variante="destaque">{titulo}</Texto>
        <Texto variante="pequeno" cor={cores.textoSec}>
          {ocorrencia.endereco} · {situacao}
        </Texto>
      </View>
      <ChevronRight size={22} color={cores.textoSec} strokeWidth={1.9} />
    </Pressable>
  );
}

export default function Bairro() {
  const [previsao, setPrevisao] = useState<Previsao | null>(null);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [atualizando, setAtualizando] = useState(false);
  const [verAlerta, setVerAlerta] = useState<boolean | null>(null);
  const { alertas } = usePreferencias();
  const mostrarAlerta = verAlerta ?? alertas;

  async function carregar() {
    const [p, lista] = await Promise.all([repo.previsao(BAIRRO), repo.listarOcorrencias(BAIRRO)]);
    setPrevisao(p);
    setOcorrencias(lista);
  }

  async function atualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, []),
  );

  function aoTocarSino() {
    if (previsao?.alerta) setVerAlerta(!mostrarAlerta);
    else Alert.alert('Sem alertas', 'Nenhuma chuva forte prevista para hoje.');
  }

  if (!previsao) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  const modoAlerta = previsao.alerta && mostrarAlerta;
  const perto: Perto[] = ocorrencias
    .filter((o) => o.status !== 'CONCLUIDA' && (o.tipo === 'BUEIRO_ENTUPIDO' || o.tipo === 'ENTULHO'))
    .map((o) => ({
      ocorrencia: o,
      distancia: Math.round(distanciaM(PONTO_GRAVACAO.latitude, PONTO_GRAVACAO.longitude, o.latitude, o.longitude)),
    }))
    .sort((a, b) => a.distancia - b.distancia);

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} colors={[cores.primaria]} />}
    >
      <StatusBar style="dark" />
      <View style={styles.topo}>
        <View style={styles.flex}>
          {modoAlerta && (
            <Texto variante="pequeno" cor={cores.alerta} style={styles.negrito}>
              MODO ALERTA ATIVO
            </Texto>
          )}
          <Texto variante="grande" accessibilityRole="header">
            {BAIRRO}
          </Texto>
        </View>
        <Pressable
          onPress={aoTocarSino}
          accessibilityRole="button"
          accessibilityLabel={previsao.alerta ? 'Alerta de chuva ativo' : 'Notificações, nenhuma nova'}
          accessibilityHint={previsao.alerta ? 'Mostra ou esconde o modo alerta' : undefined}
          style={styles.sino}
        >
          <Bell size={24} color={cores.primaria} strokeWidth={1.9} />
          {previsao.alerta && <View style={styles.ponto} />}
        </Pressable>
        <BotaoPerfil />
      </View>

      <Entrada key={modoAlerta ? 'alerta' : 'normal'}>
        {modoAlerta ? <CardAlerta previsao={previsao} /> : <CardChuva previsao={previsao} />}
      </Entrada>

      {modoAlerta && (
        <>
          <Texto variante="titulo" accessibilityRole="header">
            Bueiros com lixo perto de você
          </Texto>
          {perto.map((p, i) => (
            <Entrada key={p.ocorrencia.id} ordem={i + 1}>
              <ItemPerto {...p} />
            </Entrada>
          ))}
          <View style={styles.dica}>
            <Lightbulb size={22} color={cores.ambar.texto} strokeWidth={1.9} />
            <Texto style={styles.flex}>
              <Texto variante="destaque">Dica para hoje: </Texto>
              guarde o lixo em casa até a chuva passar. Sacos na calçada vão parar no bueiro.
            </Texto>
          </View>
        </>
      )}

      <Texto variante="titulo" accessibilityRole="header">
        Denúncias no bairro
      </Texto>
      {ocorrencias.map((o, i) => (
        <Entrada key={o.id} ordem={i + 2}>
          <ItemOcorrencia ocorrencia={o} />
        </Entrada>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: espaco.xl, paddingTop: 56, gap: espaco.md },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, marginBottom: espaco.sm },
  flex: { flex: 1 },
  negrito: { fontFamily: 'Inter_700Bold' },
  sino: {
    width: ALVO_MIN,
    height: ALVO_MIN,
    borderRadius: 14,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ponto: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: cores.vermelho.solido,
    borderWidth: 2,
    borderColor: cores.branco,
  },
  perto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: 72,
    padding: espaco.md,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 16,
  },
  distancia: {
    backgroundColor: cores.vermelho.fundo,
    borderRadius: raio.md,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  dica: {
    flexDirection: 'row',
    gap: espaco.md,
    backgroundColor: cores.ambar.fundo,
    borderRadius: 16,
    padding: espaco.lg,
    alignItems: 'flex-start',
  },
});