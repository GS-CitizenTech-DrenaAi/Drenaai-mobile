import { Bueiro, NovaOcorrencia, Ocorrencia, Previsao, Usuario } from './tipos';

export interface DrenaRepo {
  login(email: string, senha: string): Promise<Usuario>;
  cadastrar(nome: string, email: string, senha: string): Promise<Usuario>;
  sair(): Promise<void>;

  listarOcorrencias(bairro: string): Promise<Ocorrencia[]>;
  obterOcorrencia(id: string): Promise<Ocorrencia>;
  criarOcorrencia(nova: NovaOcorrencia): Promise<Ocorrencia>;
  fila(bairro: string): Promise<Ocorrencia[]>;

  buscarProximas(latitude: number, longitude: number, raioM: number): Promise<Ocorrencia[]>;
  confirmar(id: string): Promise<void>;

  previsao(bairro: string): Promise<Previsao>;
  listarBueiros(bairro?: string): Promise<Bueiro[]>;
  meusNumeros(): Promise<{ denuncias: number; concluidas: number; confirmacoes: number }>;
}

export class ErroDrena extends Error {} 