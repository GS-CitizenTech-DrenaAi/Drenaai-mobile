import { Text, TextProps } from 'react-native';
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
  return <Text style={[variantes[variante], { color: cor }, style]} {...resto} />;
}