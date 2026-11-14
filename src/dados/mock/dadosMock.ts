import { Bueiro, Ocorrencia, Previsao, Status, Usuario } from '../tipos';

export const BAIRRO = 'Vale do Anhangabaú';
export const CENTRO_BAIRRO = { latitude: -23.5453, longitude: -46.6381 };
// Ponto de referência no Vale do Anhangabaú (Av. São João, 290).
export const PONTO_GRAVACAO = { latitude: -23.5448, longitude: -46.6386 };

export const CHUVA_FORTE = true;

export const USUARIOS: (Usuario & { senha: string })[] = [
  { id: 'u-1', nome: 'Ana Souza', email: 'ana@teste.com', senha: 'senha123' },
];

export const VIAS = [
  { nome: 'Av. São João, 290', ...PONTO_GRAVACAO, v: 0.9 },
  { nome: 'Rua Formosa, 95', latitude: -23.5461, longitude: -46.6388, v: 0.9 },
  { nome: 'Praça da Bandeira, 40', latitude: -23.5493, longitude: -46.6391, v: 0.95 },
];

function horasAtras(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

function historico(ate: Status, comecouHaHoras: number) {
  const ordem: Status[] = ['RECEBIDA', 'VALIDADA', 'NA_FILA', 'EM_ATENDIMENTO', 'CONCLUIDA'];
  const etapas = ordem.slice(0, ordem.indexOf(ate) + 1);
  return etapas.map((status, i) => ({ status, dataHora: horasAtras(comecouHaHoras - i) }));
}

export type OcorrenciaMock = Omit<Ocorrencia, 'ipc' | 'posicaoFila' | 'parcelasIpc'> & { v: number };

export const OCORRENCIAS: OcorrenciaMock[] = [
  {
    id: 'oc-1', tipo: 'BUEIRO_ENTUPIDO', descricao: 'Bueiro tomado por lixo e lama na baixada.', fotoUrl: '',
    latitude: -23.5493, longitude: -46.6391, endereco: 'Praça da Bandeira, 40', bairro: BAIRRO,
    severidade: 0.95, v: 0.95, status: 'EM_ATENDIMENTO', criadaEm: horasAtras(30),
    usuarioId: 'u-2', historicoStatus: historico('EM_ATENDIMENTO', 30), confirmacoes: 4,
    confianca: 0.91, justificativa: 'Grade do bueiro totalmente coberta por lixo.',
  },
  {
    id: 'oc-2', tipo: 'ENTULHO', descricao: 'Restos de obra na calçada, perto do bueiro do metrô.', fotoUrl: '',
    latitude: -23.5461, longitude: -46.6388, endereco: 'Rua Formosa, 95', bairro: BAIRRO,
    severidade: 0.7, v: 0.9, status: 'NA_FILA', criadaEm: horasAtras(20),
    usuarioId: 'u-3', historicoStatus: historico('NA_FILA', 20), confirmacoes: 1,
  },
  {
    id: 'oc-3', tipo: 'SACOS_LIXO', descricao: 'Sacos de lixo deixados na esquina.', fotoUrl: '',
    latitude: -23.5456, longitude: -46.6358, endereco: 'Rua Líbero Badaró, 425', bairro: BAIRRO,
    severidade: 0.5, v: 0.2, status: 'NA_FILA', criadaEm: horasAtras(26),
    usuarioId: 'u-1', historicoStatus: historico('NA_FILA', 26), confirmacoes: 2,
  },
  {
    id: 'oc-4', tipo: 'OUTRO', descricao: 'Pneus velhos no canteiro próximo ao viaduto.', fotoUrl: '',
    latitude: -23.5466, longitude: -46.6401, endereco: 'Rua Coronel Xavier de Toledo, 23', bairro: BAIRRO,
    severidade: 0.4, v: 0.2, status: 'VALIDADA', criadaEm: horasAtras(5),
    usuarioId: 'u-4', historicoStatus: historico('VALIDADA', 5), confirmacoes: 0,
  },
  {
    id: 'oc-5', tipo: 'LIXO_ORGANICO', descricao: 'Restos de feira na calçada.', fotoUrl: '',
    latitude: -23.5435, longitude: -46.6389, endereco: 'Av. São João, 439', bairro: BAIRRO,
    severidade: 0.55, v: 0.5, status: 'CONCLUIDA', criadaEm: horasAtras(72),
    usuarioId: 'u-1', historicoStatus: historico('CONCLUIDA', 72), confirmacoes: 3,
  },
  {
    id: 'oc-6', tipo: 'MOVEL_VOLUMOSO', descricao: 'Sofá velho abandonado perto da ladeira.', fotoUrl: '',
    latitude: -23.5477, longitude: -46.6412, endereco: 'Rua Quirino de Andrade, 215', bairro: BAIRRO,
    severidade: 0.5, v: 0.5, status: 'CONCLUIDA', criadaEm: horasAtras(96),
    usuarioId: 'u-2', historicoStatus: historico('CONCLUIDA', 96), confirmacoes: 1,
  },
];

export const BUEIROS: Bueiro[] = [
  { id: 'B-01', endereco: 'Praça da Bandeira', latitude: -23.5493, longitude: -46.6391, obstrucao: 85, gasDetectado: true, ultimaLeitura: horasAtras(0.2), ocorrenciaId: 'oc-1' },
  { id: 'B-02', endereco: 'Rua Formosa', latitude: -23.5461, longitude: -46.6388, obstrucao: 60, gasDetectado: false, ultimaLeitura: horasAtras(0.3) },
  { id: 'B-03', endereco: 'Av. São João', latitude: -23.5448, longitude: -46.6386, obstrucao: 30, gasDetectado: false, ultimaLeitura: horasAtras(0.5) },
  { id: 'B-04', endereco: 'Rua Líbero Badaró', latitude: -23.5456, longitude: -46.6358, obstrucao: 10, gasDetectado: false, ultimaLeitura: horasAtras(0.4) },
];

// Chuva prevista para cada hora do dia (0h a 23h), em mm. Pico às 18h.
const CHUVA_POR_HORA_FORTE = [0, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.3, 0.5, 0.8, 1, 1.2, 2, 3, 5, 7, 9, 6, 3, 1, 0.5, 0.2];
const CHUVA_POR_HORA_FRACA = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.3, 0.5, 0.8, 1, 0.8, 0.6, 0.4, 0.2, 0.1, 0, 0];

export const PREVISAO_FORTE: Previsao = {
  chuvaMm12h: 35,
  chuvaMm24h: 41,
  porHora: CHUVA_POR_HORA_FORTE.map((mm, hora) => ({ hora, mm })),
  risco: 'ALTO',
  alerta: true,
  pico: { hora: 18, mm: 9 },
  janela: { inicio: 12, fim: 21 },
};

export const PREVISAO_FRACA: Previsao = {
  chuvaMm12h: 4,
  chuvaMm24h: 5,
  porHora: CHUVA_POR_HORA_FRACA.map((mm, hora) => ({ hora, mm })),
  risco: 'BAIXO',
  alerta: false,
  pico: { hora: 16, mm: 1 },
  janela: null,
};
