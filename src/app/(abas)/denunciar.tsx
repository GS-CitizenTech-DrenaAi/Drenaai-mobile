import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Camera, CircleAlert, LocateFixed, MapPin, Send, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { ErroDrena } from '@/dados/DrenaRepo';
import { distanciaM } from '@/dados/geo';
import { CENTRO_BAIRRO } from '@/dados/mock/dadosMock';
import { repo } from '@/dados/repo';
import { rotuloTipo, TIPOS } from '@/dados/textos';
import { Ocorrencia, Tipo } from '@/dados/tipos';
import { Botao } from '@/ui/Botao';
import { Campo } from '@/ui/Campo';
import { Entrada } from '@/ui/Entrada';
import { FolhaRepetida } from '@/ui/FolhaRepetida';
import { Texto } from '@/ui/Texto';
import { ALVO_MIN, cores, espaco, raio } from '@/ui/tema';

type Local = { latitude: number; longitude: number; endereco: string; peloGps: boolean };

function montarEndereco(e: Location.LocationGeocodedAddress) {
  const rua = e.street ?? e.name ?? 'Endereço sem nome';
  return e.streetNumber ? `${rua}, ${e.streetNumber}` : rua;
}

async function lerGps(): Promise<Local | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const posicao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = posicao.coords;
    const [achado] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return { latitude, longitude, endereco: achado ? montarEndereco(achado) : 'Local marcado no mapa', peloGps: true };
  } catch {
    return null;
  }
}

export default function Denunciar() {
  const router = useRouter();
  const [foto, setFoto] = useState<string | null>(null);
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState<Local | null>(null);
  const [buscandoLocal, setBuscandoLocal] = useState(true);
  const [editandoEndereco, setEditandoEndereco] = useState(false);
  const [enderecoDigitado, setEnderecoDigitado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [parecida, setParecida] = useState<Ocorrencia | null>(null);

  function aplicarGps(achado: Local | null) {
    if (achado) setLocal(achado);
    setEditandoEndereco(achado === null);
    setBuscandoLocal(false);
  }

  useEffect(() => {
    lerGps().then(aplicarGps);
  }, []);

  function usarGps() {
    setBuscandoLocal(true);
    lerGps().then(aplicarGps);
  }

  async function confirmarEndereco() {
    const texto = enderecoDigitado.trim();
    if (!texto) return;
    setBuscandoLocal(true);
    try {
      const [achado] = await Location.geocodeAsync(`${texto}, Jardim Pantanal, São Paulo`);
      if (achado) setLocal({ latitude: achado.latitude, longitude: achado.longitude, endereco: texto, peloGps: false });
      else setLocal({ ...CENTRO_BAIRRO, endereco: texto, peloGps: false });
    } catch {
      setLocal({ ...CENTRO_BAIRRO, endereco: texto, peloGps: false });
    } finally {
      setEditandoEndereco(false);
      setBuscandoLocal(false);
    }
  }

  async function tirarFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Precisamos da câmera',
        'Para evitar fotos antigas ou de outros lugares, a denúncia só aceita foto tirada na hora. Libere a câmera nas configurações do celular.',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!resultado.canceled) setFoto(resultado.assets[0].uri);
  }

  function limpar() {
    setFoto(null);
    setTipo(null);
    setDescricao('');
    setParecida(null);
  }

  async function criar() {
    if (!foto || !tipo || !local) return;
    setEnviando(true);
    try {
      const nova = await repo.criarOcorrencia({
        fotoUri: foto,
        tipo,
        descricao: descricao.trim(),
        latitude: local.latitude,
        longitude: local.longitude,
        endereco: local.endereco,
      });
      limpar();
      router.push({ pathname: '/recebida/[id]', params: { id: nova.id } });
    } catch (e) {
      Alert.alert('Não foi possível enviar', e instanceof ErroDrena ? e.message : 'Tente de novo em instantes.');
    } finally {
      setEnviando(false);
    }
  }

  async function aoEnviar() {
    if (!local || enviando) return;
    setEnviando(true);
    const proximas = local.peloGps ? await repo.buscarProximas(local.latitude, local.longitude, 50) : [];
    setEnviando(false);
    if (proximas.length > 0) setParecida(proximas[0]);
    else criar();
  }

  async function confirmarParecida() {
    if (!parecida) return;
    setEnviando(true);
    await repo.confirmar(parecida.id);
    const id = parecida.id;
    limpar();
    setEnviando(false);
    router.push({ pathname: '/ocorrencia/[id]', params: { id } });
  }

  const podeEnviar = foto !== null && tipo !== null && local !== null && !buscandoLocal;
  const distanciaParecida =
    parecida && local ? Math.round(distanciaM(local.latitude, local.longitude, parecida.latitude, parecida.longitude)) : 0;

  return (
    <KeyboardAvoidingView style={styles.tela} behavior="padding">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Texto variante="grande" accessibilityRole="header">
          Nova denúncia
        </Texto>

        <Entrada ordem={0} style={styles.bloco}>
          <Texto variante="destaque">Foto do local</Texto>
          {foto ? (
            <Animated.View entering={ZoomIn.springify()} style={styles.fotoCaixa}>
              <Image source={{ uri: foto }} style={styles.foto} accessibilityLabel="Foto escolhida para a denúncia" />
              <View style={styles.fotoAcoes}>
                <Botao titulo="Trocar" variante="secundario" icone={Camera} onPress={tirarFoto} />
                <Pressable
                  onPress={() => setFoto(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Remover foto"
                  style={styles.remover}
                >
                  <Trash2 size={22} color={cores.vermelho.texto} strokeWidth={1.9} />
                </Pressable>
              </View>
            </Animated.View>
          ) : (
            <Pressable
              onPress={tirarFoto}
              accessibilityRole="button"
              accessibilityHint="Abre a câmera. Só vale foto tirada na hora."
              style={styles.opcaoFoto}
            >
              <Camera size={32} color={cores.primaria} strokeWidth={1.9} />
              <Texto variante="destaque" cor={cores.primaria}>
                Tirar foto agora
              </Texto>
              <Texto variante="pequeno" cor={cores.textoSec}>
                Só vale foto tirada na hora, no local
              </Texto>
            </Pressable>
          )}
        </Entrada>

        <Entrada ordem={1} style={styles.bloco}>
          <Texto variante="destaque" nativeID="rotulo-tipo">
            O que você encontrou?
          </Texto>
          <View style={styles.tipos} accessibilityRole="radiogroup" accessibilityLabelledBy="rotulo-tipo">
            {TIPOS.map((t) => {
              const marcado = tipo === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTipo(t)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: marcado, checked: marcado }}
                  style={[styles.tipo, marcado && styles.tipoMarcado]}
                >
                  <Texto variante="destaque" cor={marcado ? cores.branco : cores.texto}>
                    {rotuloTipo(t)}
                  </Texto>
                </Pressable>
              );
            })}
          </View>
        </Entrada>

        <Entrada ordem={2} style={styles.bloco}>
          <Texto variante="destaque">
            Descrição <Texto cor={cores.textoSec}>(opcional)</Texto>
          </Texto>
          <TextInput
            value={descricao}
            onChangeText={setDescricao}
            multiline
            placeholder="Ex.: entulho cobrindo metade do bueiro"
            placeholderTextColor={cores.textoSec}
            accessibilityLabel="Descrição, opcional"
            accessibilityHint="Não escreva dados pessoais, como CPF ou telefone"
            style={styles.descricao}
          />
          <View style={styles.linha}>
            <CircleAlert size={16} color={cores.textoSec} strokeWidth={1.9} />
            <Texto variante="pequeno" cor={cores.textoSec}>
              Não escreva dados pessoais, como CPF ou telefone.
            </Texto>
          </View>
        </Entrada>

        <Entrada ordem={3} style={styles.bloco}>
          <Texto variante="destaque">Local</Texto>
          {editandoEndereco ? (
            <Animated.View entering={FadeIn} style={styles.bloco}>
              <Campo
                rotulo="Endereço"
                value={enderecoDigitado}
                onChangeText={setEnderecoDigitado}
                placeholder="Rua e número"
                returnKeyType="done"
                onSubmitEditing={confirmarEndereco}
              />
              <View style={styles.linhaBotoes}>
                <View style={styles.flex}>
                  <Botao titulo="Usar este endereço" onPress={confirmarEndereco} carregando={buscandoLocal} />
                </View>
                <Pressable onPress={usarGps} accessibilityRole="button" accessibilityLabel="Usar minha localização" style={styles.gps}>
                  <LocateFixed size={22} color={cores.primaria} strokeWidth={1.9} />
                </Pressable>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.local}>
              <View style={styles.iconeLocal}>
                <MapPin size={22} color={cores.primaria} strokeWidth={1.9} />
              </View>
              <View style={styles.flex}>
                <Texto variante="destaque">{buscandoLocal ? 'Buscando sua localização...' : local?.endereco}</Texto>
                {!buscandoLocal && (
                  <Texto variante="pequeno" cor={cores.textoSec}>
                    {local?.peloGps ? 'Localização pelo GPS' : 'Endereço digitado'}
                  </Texto>
                )}
              </View>
              <Pressable
                onPress={() => setEditandoEndereco(true)}
                accessibilityRole="button"
                accessibilityLabel="Alterar endereço"
                style={styles.alterar}
              >
                <Texto variante="destaque" cor={cores.primaria}>
                  Alterar
                </Texto>
              </Pressable>
            </View>
          )}
        </Entrada>

        <Entrada ordem={4}>
          <Botao titulo="Enviar denúncia" icone={Send} onPress={aoEnviar} carregando={enviando} desabilitado={!podeEnviar} />
          {!podeEnviar && !enviando && (
            <Texto variante="pequeno" cor={cores.textoSec} style={styles.falta}>
              {!foto ? 'Adicione uma foto' : !tipo ? 'Escolha o tipo' : 'Confirme o local'} para enviar.
            </Texto>
          )}
        </Entrada>
      </ScrollView>

      <FolhaRepetida
        ocorrencia={parecida}
        distancia={distanciaParecida}
        ocupado={enviando}
        aoConfirmar={confirmarParecida}
        aoEnviarMesmoAssim={() => {
          setParecida(null);
          criar();
        }}
        aoFechar={() => setParecida(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.xl, paddingTop: 56, gap: espaco.xl },
  bloco: { gap: espaco.sm },
  flex: { flex: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  opcaoFoto: {
    minHeight: 140,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: cores.bordaCampo,
    backgroundColor: cores.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
  },
  fotoCaixa: { gap: espaco.sm },
  foto: { width: '100%', height: 200, borderRadius: 18 },
  fotoAcoes: { flexDirection: 'row', gap: espaco.sm, alignItems: 'center' },
  remover: {
    width: ALVO_MIN,
    height: ALVO_MIN,
    borderRadius: raio.md,
    backgroundColor: cores.vermelho.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  tipo: {
    minHeight: ALVO_MIN,
    paddingHorizontal: espaco.lg,
    borderRadius: raio.pilula,
    borderWidth: 1.5,
    borderColor: cores.bordaCampo,
    backgroundColor: cores.branco,
    justifyContent: 'center',
  },
  tipoMarcado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  descricao: {
    minHeight: 96,
    borderWidth: 1.5,
    borderColor: cores.bordaCampo,
    borderRadius: 14,
    backgroundColor: cores.branco,
    padding: espaco.lg,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: cores.texto,
    textAlignVertical: 'top',
  },
  local: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 16,
  },
  iconeLocal: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: cores.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alterar: { minHeight: ALVO_MIN, justifyContent: 'center', paddingHorizontal: espaco.sm },
  linhaBotoes: { flexDirection: 'row', gap: espaco.sm, alignItems: 'center' },
  gps: {
    width: ALVO_MIN,
    height: ALVO_MIN,
    borderRadius: raio.md,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  falta: { textAlign: 'center', marginTop: espaco.sm },
});
