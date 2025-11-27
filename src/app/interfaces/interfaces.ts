// ============================================
// INTERFACES SIMPLIFICADAS - V MAGMA
// src/app/interfaces/interfaces.ts
// ============================================

import { DocumentReference } from "firebase/firestore";

// ============================================
// 1. USUARIO (Unificado - Compatible con Firestore)
// ============================================

/**
 * Interface principal para usuarios
 * Sirve tanto para "usuario" como para "ranking"
 */
export interface Usuario {
  id?: string;  // ID de Firestore (opcional)
  nombre: string;
  apellidos?: string;  // Para tu colección "usuario"
  username?: string;   // Para tu colección "usuario"
  foto?: string;       // Para tu colección "usuario"
  
  // Para ranking
  avatar?: string;     // Alias de "foto"
  puntos: number;
  logrosCompletados: number;
  logros?: DocumentReference[];
  
  // 🔥 AGREGADO: Para getRanking() cuando expande los logros
  logrosExpandidos?: Logro[];
  
  // 🔥 AGREGADO: Para getActividad() cuando expande el jugador
  jugadorExpandido?: any;
}

/**
 * Alias para mantener compatibilidad con código existente
 */
export type Jugador = Usuario;

// ============================================
// 2. LOGROS
// ============================================

export interface Logro {
  id?: string;  // ID de Firestore
  categoria: string;
  descripcion: string;
  icono: string;
  puntos: number;
  titulo: string;
}

/**
 * Alias para Firestore
 */
export type LogrosFirebase = Logro;

// ============================================
// 3. ACTIVIDADES
// ============================================

export interface Actividad {
  id?: string;  // ID de Firestore
  jugador: any;
  avatar: string;
  tipo: 'logro' | 'nivel' | 'evento' | 'social';
  descripcion: string;
  tiempo: string;
  logro?: Logro | DocumentReference;  // Ahora usa la interface Logro completa
  jugadorExpandido?: any;  // Para cuando se expande la referencia del jugador
}

// ============================================
// 4. EVENTOS
// ============================================

export interface Evento {
  id?: string;  // ID de Firestore
  nombre: string;
  tipo: 'Desafío' | 'Torneo' | 'Cooperativo';
  descripcion: string;
  fecha: string;
  recompensa: string;
  participantes: number;
  icono: string;
}

// ============================================
// 5. RESPUESTAS
// ============================================

export interface RespDB {
  datos: Logro[];
}

export interface ComunidadData {
  ranking: Usuario[];  // Ahora usa Usuario en lugar de Jugador
  actividadReciente: Actividad[];
  eventos: Evento[];
}

// ============================================
// 6. HELPERS (Opcional - Solo si los necesitas)
// ============================================

/**
 * Convertir entre formato "usuario" y formato "ranking"
 */
export function usuarioToRanking(usuario: Usuario): Usuario {
  return {
    ...usuario,
    avatar: usuario.foto || usuario.avatar,
    foto: undefined,
    apellidos: undefined,
    username: undefined
  };
}

/**
 * Obtener nombre completo
 */
export function getNombreCompleto(usuario: Usuario): string {
  if (usuario.apellidos) {
    return `${usuario.nombre} ${usuario.apellidos}`;
  }
  return usuario.nombre;
}

/**
 * Obtener avatar/foto
 */
export function getAvatar(usuario: Usuario): string {
  return usuario.foto || usuario.avatar || 'assets/default-avatar.png';
}