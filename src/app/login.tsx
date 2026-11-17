import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Droplet } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ErroConexao, ErroDrena } from '@/dados/DrenaRepo';
import { modoDados, usarDemonstracao } from '@/dados/repo';
import { useSessao } from '@/estado/SessaoContext';
import { Botao } from '@/ui/Botao';
import { Campo } from '@/ui/Campo';
import { Entrada } from '@/ui/Entrada';
import { Texto } from '@/ui/Texto';
import { ALVO_MIN, cores, espaco, fonte } from '@/ui/tema';

export default function Login() {
  const router = useRouter();
  const { entrar } = useSessao();
  const demonstracao = modoDados() === 'mock';
  const [email, setEmail] = useState(demonstracao ? 'ana@teste.com' : '');
  const [senha, setSenha] = useState(demonstracao ? 'senha123' : '');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function aoEntrar() {
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (e) {
      if (e instanceof ErroConexao) oferecerDemonstracao();
      else setErro(e instanceof ErroDrena ? e.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  function oferecerDemonstracao() {
    Alert.alert(
      'Servidor fora do ar',
      'Não conseguimos falar com o servidor do DrenaAi. Você pode tentar de novo mais tarde ou ver o app com dados de demonstração.',
      [
        { text: 'Tentar de novo', style: 'cancel' },
        {
          text: 'Usar demonstração',
          onPress: () => {
            usarDemonstracao();
            entrar('ana@teste.com', 'senha123');
          },
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior="padding">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.rolagem} keyboardShouldPersistTaps="handled">
        <View style={styles.topo}>
          <Animated.View entering={ZoomIn.springify().delay(150)} style={styles.logo}>
            <Droplet size={48} color={cores.primaria} strokeWidth={1.8} />
          </Animated.View>
          <Texto variante="grande" cor={cores.branco} style={styles.marca}>
            DrenaAi
          </Texto>
          <Texto cor={cores.textoSobreAzul} style={styles.slogan}>
            Menos lixo no bueiro, menos alagamento no seu bairro.
          </Texto>
          <Svg viewBox="0 0 430 60" preserveAspectRatio="none" style={styles.onda}>
            <Path d="M0 30 C80 0 150 55 235 28 S370 8 430 26 V60 H0Z" fill={cores.fundo} />
          </Svg>
        </View>

        <Entrada ordem={3} style={styles.form}>
          <Texto variante="titulo" accessibilityRole="header">
            Entre na sua conta
          </Texto>

          <Campo
            rotulo="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Campo rotulo="Senha" value={senha} onChangeText={setSenha} segredo autoComplete="password" />

          <Pressable
            onPress={() => Alert.alert('Esqueci minha senha', 'Função disponível em breve.')}
            accessibilityRole="link"
            style={styles.esqueci}
          >
            <Texto variante="destaque" cor={cores.primaria}>
              Esqueci minha senha
            </Texto>
          </Pressable>

                    {erro !== '' && (
            <Animated.View entering={FadeIn}>
              <Texto cor={cores.vermelho.texto} accessibilityLiveRegion="polite">
                {erro}
              </Texto>
            </Animated.View>
          )}

          <Botao titulo="Entrar" onPress={aoEntrar} carregando={enviando} />

          <View style={styles.divisor}>
            <View style={styles.linha} />
            <Texto variante="pequeno" cor={cores.textoSec}>
              Novo por aqui?
            </Texto>
            <View style={styles.linha} />
          </View>

          <Botao titulo="Criar conta" variante="secundario" onPress={() => router.push('/cadastro')} />
        </Entrada>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { flexGrow: 1 },
  topo: {
    backgroundColor: cores.primaria,
    alignItems: 'center',
    paddingTop: espaco.topoAlto,
    paddingBottom: espaco.topoAlto,
    paddingHorizontal: espaco.xxl,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.lg,
  },
  marca: { fontSize: fonte.marca },
  slogan: { textAlign: 'center', marginTop: espaco.sm, maxWidth: 300 },
  onda: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 60 },
  form: { flex: 1, padding: espaco.xxl, paddingTop: espaco.md, gap: espaco.lg },
  esqueci: { alignSelf: 'flex-end', minHeight: ALVO_MIN, justifyContent: 'center' },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginTop: espaco.sm },
  linha: { flex: 1, height: 1, backgroundColor: cores.borda },
});