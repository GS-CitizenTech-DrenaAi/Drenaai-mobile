import { TriangleAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Previsao } from '@/dados/tipos';
import { cores, espaco, raio } from './tema';
import { Texto } from './Texto';

function minutosAteChuva(inicio: number, fim: number, agora: Date) {
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const minutosInicio = inicio * 60;
  if (minutosAgora < minutosInicio) return minutosInicio - minutosAgora;
  if (agora.getHours() <= fim) return 0;
  return 24 * 60 - minutosAgora + minutosInicio;
}

export function CardAlerta({ previsao }: { previsao: Previsao }) {
  const [agora, setAgora] = useState(new Date());
  const pulso = useSharedValue(1);
  const estiloPulso = useAnimatedStyle(() => ({ transform: [{ scale: pulso.get() }] }));

  useEffect(() => {
    const relogio = setInterval(() => setAgora(new Date()), 30000);
    pulso.set(withRepeat(withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })), -1));
    return () => clearInterval(relogio);
  }, [pulso]);

  const janela = previsao.janela ?? { inicio: previsao.pico.hora, fim: previsao.pico.hora };
  const faltam = minutosAteChuva(janela.inicio, janela.fim, agora);
  const horas = String(Math.floor(faltam / 60)).padStart(2, '0');
  const minutos = String(faltam % 60).padStart(2, '0');
  const contagem = faltam === 0 ? 'A chuva já começou' : `Começa em ${Number(horas)} horas e ${Number(minutos)} minutos`;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`Alerta de chuva forte: ${previsao.chuvaMm24h} milímetros previstos entre ${janela.inicio} e ${janela.fim} horas. ${contagem}.`}
    >
      <View style={styles.linha}>
        <Animated.View style={estiloPulso}>
          <TriangleAlert size={22} color={cores.branco} strokeWidth={2.3} />
        </Animated.View>
        <Texto variante="destaque" cor={cores.branco}>
          Chuva forte chegando
        </Texto>
      </View>
      <Texto cor={cores.branco} style={styles.mm}>
        {previsao.chuvaMm24h} mm
      </Texto>
      <Texto cor="#FDE2E1">
        previstos entre {janela.inicio}h e {janela.fim}h
      </Texto>

      {faltam === 0 ? (
        <View style={styles.caixa}>
          <Texto variante="destaque" cor={cores.branco}>
            A chuva já começou. Evite deixar lixo na rua.
          </Texto>
        </View>
      ) : (
        <View style={styles.contagem}>
          <View style={styles.caixa}>
            <Texto variante="titulo" cor={cores.branco}>{horas}</Texto>
            <Texto variante="pequeno" cor="#FDE2E1">horas</Texto>
          </View>
          <View style={styles.caixa}>
            <Texto variante="titulo" cor={cores.branco}>{minutos}</Texto>
            <Texto variante="pequeno" cor="#FDE2E1">min</Texto>
          </View>
          <Texto variante="pequeno" cor="#FDE2E1" style={styles.ate}>
            até começar a chuva
          </Texto>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: cores.alerta, borderRadius: 22, padding: espaco.xl, gap: espaco.xs },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  mm: { fontSize: 48, fontFamily: 'Inter_700Bold', lineHeight: 56, marginTop: espaco.sm },
  contagem: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, marginTop: espaco.md },
  caixa: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: raio.md,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.md,
    alignItems: 'center',
    marginTop: espaco.sm,
  },
  ate: { flex: 1 },
});