import { Status, Tipo } from './tipos';

const ROTULOS_STATUS: Record<Status, string> = {
  RECEBIDA: 'Recebida',
  VALIDADA: 'Validada',
  NA_FILA: 'Na fila',
  EM_ATENDIMENTO: 'Em atendimento',
  CONCLUIDA: 'Concluída',
};

export const ORDEM_STATUS: Status[] = ['RECEBIDA', 'VALIDADA', 'NA_FILA', 'EM_ATENDIMENTO', 'CONCLUIDA'];

const ROTULOS_TIPO: Record<Tipo, string> = {
  ENTULHO: 'Entulho',
  BUEIRO_ENTUPIDO: 'Bueiro entupido',
  SACOS_LIXO: 'Sacos de lixo',
  MOVEL_VOLUMOSO: 'Móvel/volumoso',
  LIXO_ORGANICO: 'Lixo orgânico',
  OUTRO: 'Outro',
};

export const TIPOS: Tipo[] = ['ENTULHO', 'BUEIRO_ENTUPIDO', 'SACOS_LIXO', 'MOVEL_VOLUMOSO', 'LIXO_ORGANICO', 'OUTRO'];

export function rotuloStatus(status: Status): string {
  return ROTULOS_STATUS[status];
}

export function rotuloTipo(tipo: Tipo | string): string {
  return ROTULOS_TIPO[tipo as Tipo] ?? tipo;
}

export function faixaSeveridade(s: number): 'Baixa' | 'Média' | 'Alta' | 'Crítica' {
  if (s < 0.35) return 'Baixa';
  if (s < 0.6) return 'Média';
  if (s < 0.85) return 'Alta';
  return 'Crítica';
}

export function nivelPrioridade(ipc: number): 'alta' | 'media' | 'baixa' {
  if (ipc >= 0.7) return 'alta';
  if (ipc >= 0.4) return 'media';
  return 'baixa';
}

export function formatarNumero(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

export function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  const doisDigitos = (n: number) => String(n).padStart(2, '0');
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)} ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

export function tempoRelativo(iso: string, agora = new Date()): string {
  const minutos = Math.floor((agora.getTime() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas}h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'ontem' : `há ${dias} dias`;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}
export function apenasHora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function diaEHora(iso: string, agora = new Date()): string {
  const d = new Date(iso);
  const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);
  if (d.toDateString() === agora.toDateString()) return `Hoje, ${hora}`;
  if (d.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}, ${hora}`;
}
