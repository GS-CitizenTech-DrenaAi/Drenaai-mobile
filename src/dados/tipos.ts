
export type Status = 'RECEBIDA' | 'VALIDADA' | 'NA_FILA' | 'EM_ATENDIMENTO' | 'CONCLUIDA';

export type Tipo =
  | 'ENTULHO'
  | 'BUEIRO_ENTUPIDO'
  | 'SACOS_LIXO'
  | 'MOVEL_VOLUMOSO'
  | 'LIXO_ORGANICO'
  | 'OUTRO';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
};

export type Ocorrencia = {
  id: string;
  origem?: 'APP' | 'SENSOR';
  tipo: Tipo;
  descricao: string;
  fotoUrl: string;
  latitude: number;
  longitude: number;
  endereco: string;
  bairro: string;
  severidade: number; // 0 a 1, dada pela IA
  status: Status;
  ipc: number; // 0 a 1, prioridade na fila
  criadaEm: string; // data em texto ISO, ex.: "2026-11-12T14:05:00-03:00"
  usuarioId: string;
  historicoStatus: { status: Status; dataHora: string }[];
  confirmacoes: number;
  posicaoFila?: number; // o "?" quer dizer que pode não vir (ex.: concluída não tem posição)
  confianca?: number;
  justificativa?: string;
  parcelasIpc?: { s: number; c: number; v: number };
};

// O que a tela Denunciar manda para criar uma ocorrência.
export type NovaOcorrencia = {
  fotoUri: string;
  tipo: Tipo;
  descricao: string;
  latitude: number;
  longitude: number;
  endereco: string;
};

export type Bueiro = {
  id: string;
  latitude: number;
  longitude: number;
  obstrucao: number; // 0 a 100 (%)
  gasDetectado: boolean;
  ultimaLeitura: string;
  endereco: string;
  ocorrenciaId?: string;
};

export type Previsao = {
  chuvaMm12h: number;
  chuvaMm24h: number;
  porHora: { hora: number; mm: number }[]; // hora de 0 a 23
  risco: 'BAIXO' | 'MEDIO' | 'ALTO';
  alerta: boolean; // true quando chuva em 24h >= 25 mm
  pico: { hora: number; mm: number };
  janela: { inicio: number; fim: number } | null;
};