import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Check, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ErroDrena } from '@/dados/DrenaRepo';
import { useSessao } from '@/estado/SessaoContext';
import { Botao } from '@/ui/Botao';
import { Campo } from '@/ui/Campo';
import { Texto } from '@/ui/Texto';
import { ALVO_MIN, cores, espaco } from '@/ui/tema';

export default function Cadastro() {
  const router = useRouter();
  const { criarConta } = useSessao();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function aoCriar() {
    setErro('');
    setEnviando(true);
    try {
      await criarConta(nome, email, senha);
    } catch (e) {
      setErro(e instanceof ErroDrena ? e.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior="padding">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o login"
          style={styles.voltar}
        >
          <ChevronLeft size={28} color={cores.primaria} strokeWidth={1.9} />
        </Pressable>

        <View>
          <Texto variante="grande" accessibilityRole="header">
            Criar conta
          </Texto>
          <Texto cor={cores.textoSec} style={styles.subtitulo}>
            Leva menos de um minuto. Pedimos só o necessário.
          </Texto>
        </View>

        <Campo rotulo="Nome" value={nome} onChangeText={setNome} autoComplete="name" />
        <Campo
          rotulo="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Campo
          rotulo="Senha"
          value={senha}
          onChangeText={setSenha}
          segredo
          autoComplete="new-password"
          dica="Pelo menos 8 caracteres"
        />

        <Pressable
          onPress={() => setAceite(!aceite)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: aceite }}
          style={styles.aceite}
        >
          <View style={[styles.caixinha, aceite && styles.caixinhaMarcada]}>
            {aceite && <Check size={18} color={cores.branco} strokeWidth={3} />}
          </View>
          <Texto style={styles.aceiteTexto}>
            Li e aceito a política de privacidade. Meus dados só serão usados para as denúncias (LGPD).
          </Texto>
        </Pressable>

        {erro !== '' && (
          <Texto cor={cores.vermelho.texto} accessibilityLiveRegion="polite">
            {erro}
          </Texto>
        )}

        <Botao titulo="Criar conta" onPress={aoCriar} carregando={enviando} desabilitado={!aceite} />

        <View style={styles.aviso}>
          <ShieldCheck size={20} color={cores.primaria} strokeWidth={1.9} />
          <Texto variante="pequeno" style={styles.avisoTexto}>
            Sua senha é guardada de forma protegida e nunca aparece para ninguém.
          </Texto>
        </View>

        <Pressable onPress={() => router.back()} accessibilityRole="link" style={styles.jaTenho}>
          <Texto cor={cores.textoSec}>
            Já tem conta?{' '}
            <Texto variante="destaque" cor={cores.primaria}>
              Entrar
            </Texto>
          </Texto>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.xxl, paddingTop: 56, gap: espaco.lg },
  voltar: {
    width: ALVO_MIN,
    height: ALVO_MIN,
    marginLeft: -espaco.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitulo: { marginTop: espaco.sm },
  aceite: { flexDirection: 'row', gap: espaco.md, alignItems: 'flex-start', minHeight: ALVO_MIN },
  caixinha: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: cores.bordaCampo,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  caixinhaMarcada: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  aceiteTexto: { flex: 1 },
  aviso: {
    flexDirection: 'row',
    gap: espaco.md,
    backgroundColor: cores.azulClaro,
    borderRadius: 14,
    padding: espaco.md,
    alignItems: 'center',
  },
  avisoTexto: { flex: 1 },
  jaTenho: { alignSelf: 'center', minHeight: ALVO_MIN, justifyContent: 'center' },
});