import { createContext, ReactNode, useContext, useState } from 'react';
import { repo } from '@/dados/repo';
import { Usuario } from '@/dados/tipos';

type Sessao = {
  usuario: Usuario | null;
  entrar: (email: string, senha: string) => Promise<void>;
  criarConta: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

const SessaoContext = createContext<Sessao | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  async function entrar(email: string, senha: string) {
    setUsuario(await repo.login(email, senha));
  }

  async function criarConta(nome: string, email: string, senha: string) {
    setUsuario(await repo.cadastrar(nome, email, senha));
  }

  async function sair() {
    await repo.sair();
    setUsuario(null);
  }

  return (
    <SessaoContext.Provider value={{ usuario, entrar, criarConta, sair }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  const sessao = useContext(SessaoContext);
  if (!sessao) throw new Error('useSessao precisa estar dentro do SessaoProvider');
  return sessao;
}