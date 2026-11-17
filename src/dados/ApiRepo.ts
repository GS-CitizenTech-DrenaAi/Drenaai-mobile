import { Platform } from 'react-native';
import { ErroConexao, ErroDrena } from './DrenaRepo';
import { BAIRRO } from './mock/dadosMock';
import { MockRepo } from './mock/MockRepo';
import { Bueiro, NovaOcorrencia, Ocorrencia, Status, Tipo, Usuario } from './tipos';

const PADRAO_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5239' : 'http://localhost:5239';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? PADRAO_URL;

type ErroPayloadApi = {
  erro?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

type EnderecoVoApi = {
  logradouro: string;
  bairro: string;
  latitude: number;
  longitude: number;
};

type ParcelasIpcVoApi = {
  s: number;
  c: number;
  v: number;
};

type SensorBueiroApi = {
  id: string;
  codigoSensor: string;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  obstrucao: number;
  distanciaCm: number;
  gasPpm: number;
  gasDetectado: boolean;
  ultimaLeitura: string;
  ocorrenciaId?: string | null;
};

type OcorrenciaResumoApi = {
  id: string;
  origem: string;
  tipo: Tipo;
  descricao: string;
  bairro: string;
  severidade: number;
  ipc: number;
  status: Status;
  criadaEm: string;
  endereco?: EnderecoVoApi | null;
  fotoUrl?: string | null;
  posicaoFila?: number | null;
  confirmacoes?: number | null;
};

type OcorrenciaDetalheApi = OcorrenciaResumoApi & {
  latitude: number;
  longitude: number;
  historicoStatus?: { status: Status; dataHora: string }[];
  confianca?: number | null;
  justificativa?: string | null;
  parcelasIpc?: ParcelasIpcVoApi | null;
  confirmacoes?: number | null;
  usuarioId?: string | null;
};

function extrairMensagemErro(corpo: ErroPayloadApi | null, padrao: string): string {
  if (!corpo) return padrao;
  if (typeof corpo.erro === 'string' && corpo.erro.trim().length > 0) {
    return corpo.erro;
  }
  if (corpo.errors && typeof corpo.errors === 'object') {
    const primeiraChave = Object.keys(corpo.errors)[0];
    const mensagens = primeiraChave ? corpo.errors[primeiraChave] : undefined;
    if (Array.isArray(mensagens) && mensagens.length > 0) {
      return mensagens[0];
    }
  }
  if (typeof corpo.title === 'string' && corpo.title.trim().length > 0) {
    return corpo.title;
  }
  return padrao;
}

function normalizarTipo(tipo: string): Tipo {
  const t = (tipo ?? '').trim().toUpperCase();
  if (t === 'OBSTRUCAO_BUEIRO' || t === 'BUEIRO_ENTUPIDO') return 'BUEIRO_ENTUPIDO';
  if (t === 'LIXO_ACUMULADO' || t === 'SACOS_LIXO') return 'SACOS_LIXO';
  if (t === 'ENTULHO' || t === 'MOVEL_VOLUMOSO' || t === 'LIXO_ORGANICO' || t === 'OUTRO') {
    return t as Tipo;
  }
  return 'OUTRO';
}

function normalizarHistorico(
  criadaEm: string,
  historicoApi?: { status: Status; dataHora: string }[],
): { status: Status; dataHora: string }[] {
  const baseMs = new Date(criadaEm).getTime() || Date.now();
  const quando = (seg: number) => new Date(baseMs + seg * 1000).toISOString();

  const temRecebida = historicoApi?.some((h) => h.status === 'RECEBIDA');
  const temValidada = historicoApi?.some((h) => h.status === 'VALIDADA');

  const etapasIniciais: { status: Status; dataHora: string }[] = [];
  if (!temRecebida) etapasIniciais.push({ status: 'RECEBIDA', dataHora: quando(0) });
  if (!temValidada) etapasIniciais.push({ status: 'VALIDADA', dataHora: quando(1) });

  return [...etapasIniciais, ...(historicoApi ?? [{ status: 'NA_FILA', dataHora: quando(2) }])];
}

export class ApiRepo extends MockRepo {
  private token: string | null = null;
  private usuarioLogadoId: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  private headersAutenticados(json = true): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (json) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  override async login(email: string, senha: string): Promise<Usuario> {
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !senha) {
      throw new ErroDrena('Digite seu e-mail e sua senha.');
    }

    let resposta: Response;
    try {
      resposta = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: emailLimpo, senha }),
      });
    } catch {
      throw new ErroConexao('Não foi possível conectar à API DrenaAi. Verifique se o backend está rodando.');
    }

    const corpo = (await resposta.json().catch(() => null)) as
      | (ErroPayloadApi & { token?: string; id?: string; nome?: string; email?: string })
      | null;

    if (!resposta.ok || !corpo?.id) {
      if (resposta.status === 401) {
        throw new ErroDrena('E-mail ou senha incorretos.');
      }
      throw new ErroDrena(extrairMensagemErro(corpo, 'Não foi possível entrar na sua conta.'));
    }

    this.token = corpo.token ?? null;
    this.usuarioLogadoId = String(corpo.id);
    return {
      id: String(corpo.id),
      nome: corpo.nome ?? '',
      email: corpo.email ?? emailLimpo,
    };
  }

  override async cadastrar(nome: string, email: string, senha: string): Promise<Usuario> {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    if (!nomeLimpo) throw new ErroDrena('Digite seu nome.');
    if (!emailLimpo.includes('@')) throw new ErroDrena('Digite um e-mail válido.');
    if (senha.length < 8) throw new ErroDrena('A senha precisa ter pelo menos 8 caracteres.');

    let resposta: Response;
    try {
      resposta = await fetch(`${API_BASE_URL}/api/auth/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ nome: nomeLimpo, email: emailLimpo, senha }),
      });
    } catch {
      throw new ErroConexao('Não foi possível conectar à API DrenaAi. Verifique se o backend está rodando.');
    }

    const corpo = (await resposta.json().catch(() => null)) as ErroPayloadApi | null;
    if (!resposta.ok) {
      throw new ErroDrena(extrairMensagemErro(corpo, 'Não foi possível criar sua conta.'));
    }

    return await this.login(emailLimpo, senha);
  }

  override async sair(): Promise<void> {
    this.token = null;
    this.usuarioLogadoId = null;
    await super.sair();
  }

  override async criarOcorrencia(nova: NovaOcorrencia): Promise<Ocorrencia> {
    if (!this.token) {
      throw new ErroDrena('Sua sessão expirou. Faça login novamente.');
    }

    const enderecoVo: EnderecoVoApi = {
      logradouro: nova.endereco.trim() || 'Av. São João, 290',
      bairro: BAIRRO,
      latitude: nova.latitude,
      longitude: nova.longitude,
    };

    let resposta: Response;
    try {
      resposta = await fetch(`${API_BASE_URL}/api/ocorrencias`, {
        method: 'POST',
        headers: this.headersAutenticados(true),
        body: JSON.stringify({
          tipo: nova.tipo,
          descricao: nova.descricao,
          fotoUrl: nova.fotoUri,
          latitude: nova.latitude,
          longitude: nova.longitude,
          bairro: BAIRRO,
          endereco: enderecoVo,
        }),
      });
    } catch {
      throw new ErroConexao('Não foi possível conectar ao servidor DrenaAi. Verifique se a API foi reiniciada.');
    }

    const corpo = (await resposta.json().catch(() => null)) as
      | (ErroPayloadApi & {
          id?: string;
          severidade?: number;
          ipc?: number;
          status?: Status;
          descricao?: string;
          fotoUrl?: string;
          endereco?: EnderecoVoApi;
          confianca?: number;
          justificativa?: string;
          parcelasIpc?: ParcelasIpcVoApi;
          posicaoFila?: number;
          criadaEm?: string;
          confirmacoes?: number;
        })
      | null;

    if (!resposta.ok || !corpo?.id) {
      if (resposta.status === 401) {
        throw new ErroDrena('Sessão expirada. Saia e entre novamente no app.');
      }
      throw new ErroDrena(extrairMensagemErro(corpo, `Erro ao registrar denúncia (HTTP ${resposta.status}).`));
    }

    const criadaEm = corpo.criadaEm ?? new Date().toISOString();
    return {
      id: String(corpo.id),
      tipo: nova.tipo,
      descricao: corpo.descricao ?? nova.descricao,
      fotoUrl: corpo.fotoUrl ?? nova.fotoUri,
      latitude: corpo.endereco?.latitude ?? nova.latitude,
      longitude: corpo.endereco?.longitude ?? nova.longitude,
      endereco: corpo.endereco?.logradouro ?? enderecoVo.logradouro,
      bairro: corpo.endereco?.bairro ?? BAIRRO,
      severidade: corpo.severidade ?? 0.6,
      status: corpo.status ?? 'NA_FILA',
      ipc: corpo.ipc ?? 0.6,
      criadaEm,
      usuarioId: this.usuarioLogadoId ?? 'anonimo',
      historicoStatus: normalizarHistorico(criadaEm),
      confirmacoes: corpo.confirmacoes ?? 0,
      posicaoFila: corpo.posicaoFila ?? 1,
      confianca: corpo.confianca,
      justificativa: corpo.justificativa,
      parcelasIpc: corpo.parcelasIpc,
    };
  }

  private mapearOcorrencia(corpo: OcorrenciaResumoApi | OcorrenciaDetalheApi): Ocorrencia {
    const detalhe = corpo as Partial<OcorrenciaDetalheApi>;
    return {
      id: String(corpo.id),
      origem: corpo.origem === 'SENSOR' ? 'SENSOR' : 'APP',
      tipo: normalizarTipo(corpo.tipo),
      descricao: corpo.descricao ?? '',
      fotoUrl: corpo.fotoUrl ?? '',
      latitude: corpo.endereco?.latitude ?? detalhe.latitude ?? -23.5448,
      longitude: corpo.endereco?.longitude ?? detalhe.longitude ?? -46.6386,
      endereco: corpo.endereco?.logradouro ?? 'Local marcado no mapa',
      bairro: corpo.endereco?.bairro ?? corpo.bairro,
      severidade: corpo.severidade,
      status: corpo.status,
      ipc: corpo.ipc,
      criadaEm: corpo.criadaEm,
      usuarioId: detalhe.usuarioId ? String(detalhe.usuarioId) : (this.usuarioLogadoId ?? 'anonimo'),
      historicoStatus: normalizarHistorico(corpo.criadaEm, detalhe.historicoStatus),
      confirmacoes: detalhe.confirmacoes ?? corpo.confirmacoes ?? 0,
      posicaoFila: corpo.posicaoFila ?? undefined,
      confianca: detalhe.confianca ?? undefined,
      justificativa: detalhe.justificativa ?? undefined,
      parcelasIpc: detalhe.parcelasIpc ?? undefined,
    };
  }

  override async listarOcorrencias(bairro: string): Promise<Ocorrencia[]> {
    let resposta: Response;
    try {
      const query = bairro.trim() ? `?bairro=${encodeURIComponent(bairro.trim())}` : '';
      resposta = await fetch(`${API_BASE_URL}/api/ocorrencias${query}`, {
        method: 'GET',
        headers: this.headersAutenticados(false),
      });
    } catch {
      throw new ErroConexao('Não foi possível conectar ao servidor DrenaAi para carregar o bairro.');
    }

    if (resposta.status === 401) {
      throw new ErroDrena('Sua sessão expirou. Faça login novamente.');
    }

    const corpo = (await resposta.json().catch(() => null)) as
      | OcorrenciaResumoApi[]
      | ErroPayloadApi
      | null;

    if (!resposta.ok || !Array.isArray(corpo)) {
      const erroPayload = !Array.isArray(corpo) ? corpo : null;
      throw new ErroDrena(extrairMensagemErro(erroPayload, 'Não foi possível carregar as ocorrências do bairro.'));
    }

    return corpo.map((item) => this.mapearOcorrencia(item));
  }

  override async fila(bairro: string): Promise<Ocorrencia[]> {
    let resposta: Response;
    try {
      const query = bairro.trim() ? `?bairro=${encodeURIComponent(bairro.trim())}` : '';
      resposta = await fetch(`${API_BASE_URL}/api/fila${query}`, {
        method: 'GET',
        headers: this.headersAutenticados(false),
      });
    } catch {
      throw new ErroConexao('Não foi possível conectar ao servidor DrenaAi para carregar a fila do mapa.');
    }

    const corpo = (await resposta.json().catch(() => null)) as
      | OcorrenciaResumoApi[]
      | ErroPayloadApi
      | null;

    if (!resposta.ok || !Array.isArray(corpo)) {
      const erroPayload = !Array.isArray(corpo) ? corpo : null;
      throw new ErroDrena(extrairMensagemErro(erroPayload, 'Não foi possível carregar a fila de coleta.'));
    }

    return corpo.map((item) => this.mapearOcorrencia(item));
  }

  override async obterOcorrencia(id: string): Promise<Ocorrencia> {
    if (id.startsWith('oc-')) {
      return await super.obterOcorrencia(id);
    }

    let resposta: Response;
    try {
      resposta = await fetch(`${API_BASE_URL}/api/ocorrencias/${id}`, {
        method: 'GET',
        headers: this.headersAutenticados(false),
      });
    } catch {
      throw new ErroConexao('Não foi possível consultar os detalhes da denúncia no servidor.');
    }

    const corpo = (await resposta.json().catch(() => null)) as (ErroPayloadApi & OcorrenciaDetalheApi) | null;
    if (!resposta.ok || !corpo?.id) {
      throw new ErroDrena(extrairMensagemErro(corpo, 'Denúncia não encontrada.'));
    }

    return this.mapearOcorrencia(corpo);
  }

  override async listarBueiros(bairro?: string): Promise<Bueiro[]> {
    let resposta: Response;
    try {
      const query = bairro?.trim() ? `?bairro=${encodeURIComponent(bairro.trim())}` : '';
      resposta = await fetch(`${API_BASE_URL}/api/telemetria/sensores${query}`, {
        method: 'GET',
        headers: this.headersAutenticados(false),
      });
    } catch {
      throw new ErroConexao('Não foi possível conectar ao servidor DrenaAi para carregar os sensores.');
    }

    const corpo = (await resposta.json().catch(() => null)) as
      | SensorBueiroApi[]
      | ErroPayloadApi
      | null;

    if (!resposta.ok || !Array.isArray(corpo)) {
      const erroPayload = !Array.isArray(corpo) ? corpo : null;
      throw new ErroDrena(extrairMensagemErro(erroPayload, 'Não foi possível carregar os sensores do bairro.'));
    }

    return corpo.map((item) => ({
      id: String(item.id),
      codigoSensor: item.codigoSensor,
      endereco: item.endereco,
      bairro: item.bairro,
      latitude: item.latitude,
      longitude: item.longitude,
      obstrucao: item.obstrucao,
      distanciaCm: item.distanciaCm,
      gasPpm: item.gasPpm,
      gasDetectado: item.gasDetectado,
      ultimaLeitura: item.ultimaLeitura,
      ocorrenciaId: item.ocorrenciaId ? String(item.ocorrenciaId) : undefined,
    }));
  }
}
