import { createContext, ReactNode, useContext, useState } from 'react';

export type TamanhoTexto = 'normal' | 'grande' | 'muito_grande';

const ESCALA: Record<TamanhoTexto, number> = { normal: 1, grande: 1.15, muito_grande: 1.3 };

type Preferencias = {
  tamanhoTexto: TamanhoTexto;
  escala: number;
  alertas: boolean;
  mudarTamanho: (t: TamanhoTexto) => void;
  mudarAlertas: (ligado: boolean) => void;
};

const PreferenciasContext = createContext<Preferencias>({
  tamanhoTexto: 'normal',
  escala: 1,
  alertas: true,
  mudarTamanho: () => {},
  mudarAlertas: () => {},
});

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [tamanhoTexto, setTamanhoTexto] = useState<TamanhoTexto>('normal');
  const [alertas, setAlertas] = useState(true);

  return (
    <PreferenciasContext.Provider
      value={{
        tamanhoTexto,
        escala: ESCALA[tamanhoTexto],
        alertas,
        mudarTamanho: setTamanhoTexto,
        mudarAlertas: setAlertas,
      }}
    >
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  return useContext(PreferenciasContext);
}
