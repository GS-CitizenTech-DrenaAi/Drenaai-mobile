import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, ChevronDown, ChevronUp, LogOut, MapPin, ShieldCheck, Type, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { BAIRRO } from '@/dados/mock/dadosMock';
import { iniciais } from '@/dados/textos';
import { TamanhoTexto, usePreferencias } from '@/estado/PreferenciasContext';
import { useSessao } from '@/estado/SessaoContext';
import { Entrada } from '@/ui/Entrada';
import { Texto } from '@/ui/Texto';
import { ALVO_MIN, cores, espaco, raio } from '@/ui/tema';

const TAMANHOS: { valor: TamanhoTexto; rotulo: string }[] = [
  { valor: 'normal', rotulo: 'Normal' },
  { valor: 'grande', rotulo: 'Grande' },
  { valor: 'muito_grande', rotulo: 'Muito grande' },
];

export default function Perfil() {
  const router = useRouter();
  const { usuario, sair } = useSessao();
  const { tamanhoTexto, mudarTamanho, alertas, mudarAlertas } = usePreferencias();
  const [verPrivacidade, setVerPrivacidade] = useState(false);

  function confirmarSaida() {
    Alert.alert('Sair da conta?', 'Você vai precisar entrar de novo para fazer denúncias.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  return (
    <View style={styles.tela}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.topo}>
          <Texto variante="destaque" cor={cores.textoSec}>
            Meu perfil
          </Texto>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Fechar perfil" style={styles.fechar}>
            <X size={24} color={cores.texto} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.cabeca}>
          <Animated.View entering={ZoomIn.springify()} style={styles.avatar} importantForAccessibility="no-hide-descendants">
            <Texto variante="grande" cor={cores.branco}>
              {iniciais(usuario?.nome ?? '')}
            </Texto>
          </Animated.View>
          <Texto variante="grande" accessibilityRole="header">
            {usuario?.nome}
          </Texto>
          <Texto cor={cores.textoSec}>{usuario?.email}</Texto>
        </View>

        <Entrada ordem={0} style={styles.cartao}>
          <View style={styles.item}>
            <View style={styles.icone}>
              <MapPin size={20} color={cores.primaria} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Texto variante="destaque">Meu bairro</Texto>
              <Texto variante="pequeno" cor={cores.textoSec}>
                {BAIRRO}
              </Texto>
            </View>
          </View>

          <View style={styles.separador} />

          <View style={styles.bloco}>
            <View style={styles.item}>
              <View style={styles.icone}>
                <Type size={20} color={cores.primaria} strokeWidth={1.9} />
              </View>
              <Texto variante="destaque" nativeID="rotulo-tamanho" style={styles.flex}>
                Tamanho do texto
              </Texto>
            </View>
            <View style={styles.tamanhos} accessibilityRole="radiogroup" accessibilityLabelledBy="rotulo-tamanho">
              {TAMANHOS.map((t) => {
                const marcado = tamanhoTexto === t.valor;
                return (
                  <Pressable
                    key={t.valor}
                    onPress={() => mudarTamanho(t.valor)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: marcado, checked: marcado }}
                    style={[styles.tamanho, marcado && styles.tamanhoMarcado]}
                  >
                    <Texto variante="destaque" cor={marcado ? cores.branco : cores.primaria}>
                      {t.rotulo}
                    </Texto>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.separador} />

          <View style={styles.item}>
            <View style={styles.icone}>
              <Bell size={20} color={cores.primaria} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Texto variante="destaque">Alertas de chuva</Texto>
              <Texto variante="pequeno" cor={cores.textoSec}>
                {alertas ? 'Mostra um aviso no bairro quando houver chuva forte' : 'Desligados'}
              </Texto>
            </View>
            <Switch
              value={alertas}
              onValueChange={mudarAlertas}
              accessibilityLabel="Alertas de chuva"
              trackColor={{ true: cores.primaria, false: cores.bordaCampo }}
              thumbColor={cores.branco}
            />
          </View>

          <View style={styles.separador} />

          <Pressable
            onPress={() => setVerPrivacidade(!verPrivacidade)}
            accessibilityRole="button"
            accessibilityState={{ expanded: verPrivacidade }}
            style={styles.item}
          >
            <View style={styles.icone}>
              <ShieldCheck size={20} color={cores.primaria} strokeWidth={1.9} />
            </View>
            <Texto variante="destaque" style={styles.flex}>
              Privacidade e dados
            </Texto>
            {verPrivacidade ? (
              <ChevronUp size={22} color={cores.textoSec} strokeWidth={1.9} />
            ) : (
              <ChevronDown size={22} color={cores.textoSec} strokeWidth={1.9} />
            )}
          </Pressable>
          {verPrivacidade && (
            <Animated.View entering={FadeIn} style={styles.privacidade}>
              <Texto variante="pequeno" cor={cores.textoSec}>
                O DrenaAi guarda só o seu nome, o seu e-mail e as denúncias que você faz. A senha fica protegida e
                nunca é mostrada. As fotos servem apenas para avaliar o lixo e não devem mostrar rostos, placas ou
                dados de outras pessoas. Seguimos a LGPD: você pode pedir a exclusão da sua conta a qualquer momento.
              </Texto>
            </Animated.View>
          )}
        </Entrada>

        <Entrada ordem={1}>
          <Pressable onPress={confirmarSaida} accessibilityRole="button" style={styles.sair}>
            <LogOut size={20} color={cores.vermelho.texto} strokeWidth={1.9} />
            <Texto variante="destaque" cor={cores.vermelho.texto}>
              Sair da conta
            </Texto>
          </Pressable>
        </Entrada>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.xl, paddingTop: espaco.xl, gap: espaco.lg },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fechar: {
    width: ALVO_MIN,
    height: ALVO_MIN,
    borderRadius: 16,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabeca: { alignItems: 'center', gap: espaco.xs },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.sm,
  },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espaco.lg,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, minHeight: 64, paddingVertical: espaco.sm },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: cores.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  separador: { height: 1, backgroundColor: cores.borda },
  bloco: { paddingBottom: espaco.md },
  tamanhos: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  tamanho: {
    flexGrow: 1,
    minHeight: ALVO_MIN,
    paddingHorizontal: espaco.md,
    borderRadius: raio.pilula,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tamanhoMarcado: { backgroundColor: cores.primaria },
  privacidade: { paddingBottom: espaco.lg },
  sair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: cores.vermelho.fundo,
  },
});
