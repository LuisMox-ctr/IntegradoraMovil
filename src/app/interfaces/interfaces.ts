export interface RespDB{
    datos: Logro[];
}

export interface Logro{
    categoria:string;
    descripcion:string;
    icono:string;
    puntos:number;
    titulo:string;
}

export interface Jugador {
  id: number;
  nombre: string;
  puntos: number;
  logrosCompletados: number;
  avatar: string;
}

export interface Actividad {
  id: number;
  jugador: string;
  avatar: string;
  tipo: 'logro' | 'nivel' | 'evento' | 'social';
  descripcion: string;
  tiempo: string;
  logro?: {
    nombre: string;
    icono: string;
  };
}

export interface Evento {
  id: number;
  nombre: string;
  tipo: 'Desafío' | 'Torneo' | 'Cooperativo';
  descripcion: string;
  fecha: string;
  recompensa: string;
  participantes: number;
  icono: string;
}

export interface ComunidadData {
  ranking: Jugador[];
  actividadReciente: Actividad[];
  eventos: Evento[];
}

export interface LogrosFirebase{
    categoria:string;
    descripcion:string;
    icono:string;
    puntos:number;
    titulo:string;
}
