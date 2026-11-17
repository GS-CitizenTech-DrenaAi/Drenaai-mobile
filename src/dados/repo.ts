import { ApiRepo } from './ApiRepo';
import { DrenaRepo } from './DrenaRepo';
import { MockRepo } from './mock/MockRepo';

type Modo = 'api' | 'mock';

const modoInicial: Modo = process.env.EXPO_PUBLIC_DATA_MODE === 'api' ? 'api' : 'mock';

let atual: DrenaRepo = modoInicial === 'api' ? new ApiRepo() : new MockRepo();
let modo: Modo = modoInicial;

export function modoDados(): Modo {
  return modo;
}

export function usarDemonstracao() {
  atual = new MockRepo();
  modo = 'mock';
}

export const repo: DrenaRepo = {
  login: (email, senha) => atual.login(email, senha),
  cadastrar: (nome, email, senha) => atual.cadastrar(nome, email, senha),
  sair: () => atual.sair(),
  listarOcorrencias: (bairro) => atual.listarOcorrencias(bairro),
  obterOcorrencia: (id) => atual.obterOcorrencia(id),
  criarOcorrencia: (nova) => atual.criarOcorrencia(nova),
  fila: (bairro) => atual.fila(bairro),
  buscarProximas: (latitude, longitude, raioM) => atual.buscarProximas(latitude, longitude, raioM),
  confirmar: (id) => atual.confirmar(id),
  previsao: (bairro) => atual.previsao(bairro),
  listarBueiros: (bairro) => atual.listarBueiros(bairro),
};
