import { DrenaRepo, ErroDrena } from '../DrenaRepo';
import { arredondar, distanciaM } from '../geo';
import { NovaOcorrencia, Ocorrencia, Status, Tipo, Usuario } from '../tipos';
import {
  BAIRRO,
  BUEIROS,
  CHUVA_FORTE,
  OCORRENCIAS,
  OcorrenciaMock,
  PREVISAO_FORTE,
  PREVISAO_FRACA,
  USUARIOS,
  VIAS,
} from './dadosMock';

const SEVERIDADE_POR_TIPO: Record<Tipo, number> = {
  BUEIRO_ENTUPIDO: 0.75,
  ENTULHO: 0.7,
  LIXO_ORGANICO: 0.55,
  MOVEL_VOLUMOSO: 0.5,
  SACOS_LIXO: 0.45,
  OUTRO: 0.4,
};

const JUSTIFICATIVA_POR_TIPO: Record<Tipo, string> = {
  BUEIRO_ENTUPIDO: 'Lixo acumulado sobre a grade do bueiro, com risco de bloquear a água da chuva.',
  ENTULHO: 'Restos de obra perto da sarjeta podem ser levados pela chuva até o bueiro.',
  LIXO_ORGANICO: 'Lixo orgânico espalhado na rua, que a enxurrada pode arrastar.',
  MOVEL_VOLUMOSO: 'Objeto grande na calçada, que pode travar a passagem da água.',
  SACOS_LIXO: 'Sacos de lixo na calçada, que podem rasgar e entupir a sarjeta.',
  OUTRO: 'Lixo identificado na foto, com risco moderado de alagamento.',
};

const EM_FILA: Status[] = ['VALIDADA', 'NA_FILA', 'EM_ATENDIMENTO'];

function esperar(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockRepo implements DrenaRepo {
  private usuarios = [...USUARIOS];
  private ocorrencias: OcorrenciaMock[] = [...OCORRENCIAS];
  private usuarioAtual: Usuario | null = null;
  private confirmadas = new Set<string>();

  private previsaoAtual() {
    return CHUVA_FORTE ? PREVISAO_FORTE : PREVISAO_FRACA;
  }

  private parcelas(o: OcorrenciaMock) {
    const c = Math.min(this.previsaoAtual().chuvaMm12h / 50, 1);
    return { s: 0.4 * o.severidade, c: 0.3 * c, v: 0.3 * o.v };
  }

  private ipcDe(o: OcorrenciaMock) {
    const p = this.parcelas(o);
    return arredondar(p.s + p.c + p.v);
  }

  private ordenarFila(): OcorrenciaMock[] {
    return this.ocorrencias
      .filter((o) => EM_FILA.includes(o.status))
      .sort((a, b) => this.ipcDe(b) - this.ipcDe(a) || a.criadaEm.localeCompare(b.criadaEm));
  }

  private completar(o: OcorrenciaMock): Ocorrencia {
    const p = this.parcelas(o);
    const posicao = this.ordenarFila().findIndex((x) => x.id === o.id);
    return {
      ...o,
      ipc: this.ipcDe(o),
      parcelasIpc: { s: arredondar(p.s), c: arredondar(p.c), v: arredondar(p.v) },
      posicaoFila: posicao >= 0 ? posicao + 1 : undefined,
    };
  }

  private vDoLocal(latitude: number, longitude: number) {
    const via = VIAS.find((v) => distanciaM(latitude, longitude, v.latitude, v.longitude) <= 100);
    return via ? via.v : 0.5;
  }

  async login(email: string, senha: string): Promise<Usuario> {
    await esperar();
    const emailLimpo = email.trim().toLowerCase();
    const achado = this.usuarios.find((u) => u.email === emailLimpo && u.senha === senha);
    if (!achado) throw new ErroDrena('E-mail ou senha incorretos.');
    this.usuarioAtual = { id: achado.id, nome: achado.nome, email: achado.email };
    return this.usuarioAtual;
  }

  async cadastrar(nome: string, email: string, senha: string): Promise<Usuario> {
    await esperar();
    const emailLimpo = email.trim().toLowerCase();
    if (!nome.trim()) throw new ErroDrena('Digite seu nome.');
    if (!emailLimpo.includes('@')) throw new ErroDrena('Digite um e-mail válido.');
    if (senha.length < 8) throw new ErroDrena('A senha precisa ter pelo menos 8 caracteres.');
    if (this.usuarios.some((u) => u.email === emailLimpo)) {
      throw new ErroDrena('Já existe uma conta com este e-mail.');
    }
    const novo = { id: `u-${Date.now()}`, nome: nome.trim(), email: emailLimpo, senha };
    this.usuarios.push(novo);
    this.usuarioAtual = { id: novo.id, nome: novo.nome, email: novo.email };
    return this.usuarioAtual;
  }

  async sair(): Promise<void> {
    this.usuarioAtual = null;
  }

  async listarOcorrencias(bairro: string): Promise<Ocorrencia[]> {
    await esperar();
    return this.ocorrencias
      .filter((o) => o.bairro === bairro)
      .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
      .map((o) => this.completar(o));
  }

  async obterOcorrencia(id: string): Promise<Ocorrencia> {
    await esperar(200);
    const achada = this.ocorrencias.find((o) => o.id === id);
    if (!achada) throw new ErroDrena('Denúncia não encontrada.');
    return this.completar(achada);
  }

  async criarOcorrencia(nova: NovaOcorrencia): Promise<Ocorrencia> {
    await esperar(1200);
    const agora = Date.now();
    const quando = (segundos: number) => new Date(agora + segundos * 1000).toISOString();
    const ocorrencia: OcorrenciaMock = {
      id: `oc-${agora}`,
      tipo: nova.tipo,
      descricao: nova.descricao,
      fotoUrl: nova.fotoUri,
      latitude: nova.latitude,
      longitude: nova.longitude,
      endereco: nova.endereco,
      bairro: BAIRRO,
      severidade: SEVERIDADE_POR_TIPO[nova.tipo],
      v: this.vDoLocal(nova.latitude, nova.longitude),
      status: 'NA_FILA',
      criadaEm: quando(0),
      usuarioId: this.usuarioAtual?.id ?? 'anonimo',
      historicoStatus: [
        { status: 'RECEBIDA', dataHora: quando(0) },
        { status: 'VALIDADA', dataHora: quando(2) },
        { status: 'NA_FILA', dataHora: quando(4) },
      ],
      confirmacoes: 0,
      confianca: 0.82,
      justificativa: JUSTIFICATIVA_POR_TIPO[nova.tipo],
    };
    this.ocorrencias.push(ocorrencia);
    return this.completar(ocorrencia);
  }

  async fila(bairro: string): Promise<Ocorrencia[]> {
    await esperar();
    return this.ordenarFila()
      .filter((o) => o.bairro === bairro)
      .map((o) => this.completar(o));
  }

  async buscarProximas(latitude: number, longitude: number, raioM: number): Promise<Ocorrencia[]> {
    await esperar(300);
    const distancia = (o: OcorrenciaMock) => distanciaM(latitude, longitude, o.latitude, o.longitude);
    return this.ocorrencias
      .filter((o) => o.status !== 'CONCLUIDA' && distancia(o) <= raioM)
      .sort((a, b) => distancia(a) - distancia(b))
      .map((o) => this.completar(o));
  }

  async confirmar(id: string): Promise<void> {
    await esperar(300);
    if (this.confirmadas.has(id)) return;
    const achada = this.ocorrencias.find((o) => o.id === id);
    if (!achada) throw new ErroDrena('Denúncia não encontrada.');
    achada.confirmacoes += 1;
    this.confirmadas.add(id);
  }

  async previsao() {
    await esperar();
    return this.previsaoAtual();
  }

  async listarBueiros(bairro?: string) {
    await esperar();
    void bairro;
    return BUEIROS;
  }
}