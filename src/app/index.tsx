import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { PONTO_GRAVACAO } from '@/dados/mock/dadosMock';
import { repo } from '@/dados/repo';
import { formatarNumero, rotuloTipo } from '@/dados/textos';
import { Ocorrencia } from '@/dados/tipos';
import { Botao } from '@/ui/Botao';
import { Entrada } from '@/ui/Entrada';
import { Texto } from '@/ui/Texto';
import { cores, espaco } from '@/ui/tema';
import { useSessao } from '@/estado/SessaoContext';

export default function Index() {
  const [fila, setFila] = useState<Ocorrencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { usuario, sair } = useSessao();

  async function carregar() {
    setCarregando(true);
    setFila(await repo.fila('Jardim Pantanal'));
    setCarregando(false);
  }

  async function criarTeste() {
    setCarregando(true);
    await repo.criarOcorrencia({
      fotoUri: '',
      tipo: 'BUEIRO_ENTUPIDO',
      descricao: '',
      endereco: 'R. Erva Doce',
      ...PONTO_GRAVACAO,
    });
    await carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
            <Texto variante="titulo">Olá, {usuario?.nome}</Texto>
      {fila.map((o, i) => (
        <Entrada key={o.id} ordem={i} style={styles.item}>
          <Texto variante="destaque">{o.posicaoFila}º {rotuloTipo(o.tipo)}</Texto>
          <Texto cor={cores.textoSec}>IPC {formatarNumero(o.ipc)}</Texto>
        </Entrada>
      ))}
      <Botao titulo="Criar denúncia de teste" carregando={carregando} onPress={criarTeste} />
      <Botao titulo="Sair" variante="secundario" onPress={sair} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.xl, paddingTop: 64, gap: espaco.md },
  item: {
    backgroundColor: cores.branco,
    padding: espaco.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});