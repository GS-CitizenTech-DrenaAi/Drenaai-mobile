import { CloudRain, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Previsao } from '@/dados/tipos';
import { cores, espaco, raio } from './tema';
import { Texto } from './Texto';

const TEXTO_RISCO = { ALTO: 'Risco alto de alagamento', MEDIO: 'Risco médio de alagamento', BAIXO: 'Risco baixo de alagamento' };
const COR_RISCO = { ALTO: cores.vermelho.texto, MEDIO: cores.ambar.texto, BAIXO: cores.verde.texto };

function Barra({ altura, ordem }: { altura: number; ordem: number }) {
  const valor = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({ height: valor.get() }));

  useEffect(() => {
    valor.set(withDelay(ordem * 60, withTiming(altura, { duration: 500 })));
  }, [altura, ordem, valor]);

  return <Animated.View style={[styles.barra, estilo]} />;
}

export function CardChuva({ previsao }: { previsao: Previsao }) {
  const horas = previsao.porHora.slice(12, 22);
  const maior = Math.max(...horas.map((h) => h.mm), 1);
  const IconeRisco = previsao.risco === 'BAIXO' ? ShieldCheck : ShieldAlert;
  const resumo = `Chuva prevista nas próximas 24 horas: ${previsao.chuvaMm24h} milímetros. ${TEXTO_RISCO[previsao.risco]}. Pico às ${previsao.pico.hora} horas.`;

  return (
    <View style={styles.card} accessible accessibilityLabel={resumo}>
      <View style={styles.bolha} />
      <View style={styles.linha}>
        <CloudRain size={20} color="#D6E6F5" strokeWidth={1.9} />
        <Texto variante="pequeno" cor="#D6E6F5">
          Chuva prevista · próximas 24h
        </Texto>
      </View>

      <View style={styles.meio}>
        <Texto cor={cores.branco} style={styles.mm}>
          {previsao.chuvaMm24h}
          <Texto variante="titulo" cor={cores.branco}> mm</Texto>
        </Texto>
        <View style={styles.barras}>
          {horas.map((h, i) => (
            <Barra key={h.hora} ordem={i} altura={Math.max(4, (h.mm / maior) * 48)} />
          ))}
        </View>
      </View>

      <View style={styles.rodape}>
        <View style={styles.risco}>
          <IconeRisco size={18} color={COR_RISCO[previsao.risco]} strokeWidth={2.3} />
          <Texto variante="pequeno" cor={COR_RISCO[previsao.risco]} style={styles.negrito}>
            {TEXTO_RISCO[previsao.risco]}
          </Texto>
        </View>
        <Texto variante="pequeno" cor="#D6E6F5">
          Pico às {previsao.pico.hora}h
        </Texto>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.primaria,
    borderRadius: 22,
    padding: espaco.xl,
    overflow: 'hidden',
    gap: espaco.md,
  },
  bolha: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  meio: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  mm: { fontSize: 48, fontFamily: 'Inter_700Bold', lineHeight: 52 },
  barras: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 48 },
  barra: { width: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.85)' },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: espaco.sm },
  risco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: cores.branco,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: raio.pilula,
  },
  negrito: { fontFamily: 'Inter_700Bold' },
});