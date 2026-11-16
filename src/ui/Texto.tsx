import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { usePreferencias } from '@/estado/PreferenciasContext';
import { cores, fonte } from './tema';

const variantes = {
  pequeno: { fontSize: fonte.pequeno, fontFamily: 'Inter_400Regular' },
  corpo: { fontSize: fonte.corpo, fontFamily: 'Inter_400Regular' },
  destaque: { fontSize: fonte.corpo, fontFamily: 'Inter_600SemiBold' },
  titulo: { fontSize: fonte.titulo, fontFamily: 'Inter_700Bold' },
  grande: { fontSize: fonte.grande, fontFamily: 'Inter_700Bold' },
};

type Props = TextProps & {
  variante?: keyof typeof variantes;
  cor?: string;
};

export function Texto({ variante = 'corpo', cor = cores.texto, style, ...resto }: Props) {
  const { escala } = usePreferencias();
  const junto: TextStyle = StyleSheet.flatten([variantes[variante], { color: cor }, style]) ?? {};
  const ajustado = {
    ...junto,
    fontSize: (junto.fontSize ?? fonte.corpo) * escala,
    lineHeight: junto.lineHeight ? junto.lineHeight * escala : undefined,
  };

  return <Text style={ajustado} {...resto} />;
}
