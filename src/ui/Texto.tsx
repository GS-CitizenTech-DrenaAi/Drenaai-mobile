import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { usePreferencias } from '@/estado/PreferenciasContext';
import { cores, familia, fonte } from './tema';

const variantes = {
  pequeno: { fontSize: fonte.pequeno, fontFamily: familia.regular },
  corpo: { fontSize: fonte.corpo, fontFamily: familia.regular },
  destaque: { fontSize: fonte.corpo, fontFamily: familia.semiNegrito },
  titulo: { fontSize: fonte.titulo, fontFamily: familia.negrito },
  grande: { fontSize: fonte.grande, fontFamily: familia.negrito },
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
