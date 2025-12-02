import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DocumentReference } from '@angular/fire/firestore';
import { Usuario, Actividad, Evento, Logro } from '../../interfaces/interfaces';
import { FirestoreWrapper } from 'src/app/wraper/firestore.wrapper';

@Injectable({
  providedIn: 'root',
})
export class ComunidadService {

  constructor(private firestoreWrapper: FirestoreWrapper) {}

  // ============================================
  // RANKING - Con logros expandidos
  // ============================================
  
  getRanking(): Observable<Usuario[]> {
    const ref = this.firestoreWrapper.collection('usuario');
    
    return this.firestoreWrapper.collectionData(ref, { idField: 'id' }).pipe(
      switchMap(async (usuarios: any[]) => {
        
        // Procesar cada usuario
        const usuariosConLogros = await Promise.all(
          usuarios.map(async (usuario) => {
            
            // Asegurar valores por defecto
            usuario.puntos = usuario.puntos || 0;
            usuario.logrosCompletados = usuario.logrosCompletados || 0;
            usuario.avatar = usuario.foto || usuario.avatar;
            
            // ✨ EXPANDIR REFERENCIAS DE LOGROS
            if (usuario.logros && Array.isArray(usuario.logros)) {
              const logrosExpandidos = await Promise.all(
                usuario.logros.map(async (logroRef: DocumentReference) => {
                  try {
                    const logroSnap = await this.firestoreWrapper.getDoc(logroRef);
                    return logroSnap.exists() ? { id: logroSnap.id, ...logroSnap.data() } : null;
                  } catch (error) {
                    console.error('Error al obtener logro:', error);
                    return null;
                  }
                })
              );
              
              // Filtrar nulls
              usuario.logrosExpandidos = logrosExpandidos.filter(l => l !== null);
            } else {
              usuario.logrosExpandidos = [];
            }
            
            return usuario;
          })
        );
        
        return usuariosConLogros;
      })
    ) as Observable<Usuario[]>;
  }

  // ============================================
  // ACTIVIDAD
  // ============================================
  
  getActividad(): Observable<Actividad[]> {
    const ref = this.firestoreWrapper.collection('actividadReciente');

    return this.firestoreWrapper.collectionData(ref, { idField: 'id' }).pipe(
      switchMap(async (actividades: any[]) => {
        
        const actividadesExpandidas = await Promise.all(
          actividades.map(async (actividad: any) => {
            
            // Expandir jugador
            if (actividad.jugador && typeof actividad.jugador === 'object' && 'path' in actividad.jugador) {
              try {
                const jugadorRef = actividad.jugador as DocumentReference;
                const jugadorSnap = await this.firestoreWrapper.getDoc(jugadorRef);
                
                if (jugadorSnap.exists()) {
                  const jugadorData = jugadorSnap.data();
                  actividad.jugadorExpandido = { id: jugadorSnap.id, ...jugadorData };
                  actividad.jugador = jugadorData['nombre'] || 'Usuario';
                  actividad.avatar = jugadorData['foto'] || jugadorData['avatar'] || actividad.avatar;
                }
              } catch (error) {
                console.error('Error expandiendo jugador:', error);
              }
            }
            
            // Expandir logro
            if (actividad.logro && typeof actividad.logro === 'object' && 'path' in actividad.logro) {
              try {
                const logroRef = actividad.logro as DocumentReference;
                const logroSnap = await this.firestoreWrapper.getDoc(logroRef);
                actividad.logro = logroSnap.exists() ? logroSnap.data() : null;
              } catch (error) {
                console.error('Error expandiendo logro:', error);
              }
            }
            
            return actividad;
          })
        );
        
        return actividadesExpandidas;
      })
    ) as Observable<Actividad[]>;
  }

  // ============================================
  // EVENTOS
  // ============================================
  
  getEventos(): Observable<Evento[]> {
    const ref = this.firestoreWrapper.collection('eventos');
    return this.firestoreWrapper.collectionData(ref, { idField: 'id' }) as Observable<Evento[]>;
  }

  // ============================================
  // DESBLOQUEAR LOGRO
  // ============================================
  
  async desbloquearLogro(usuarioId: string, logroId: string): Promise<{success: boolean, mensaje: string, puntos?: number}> {
    try {
      // 1. Obtener datos del logro
      const logroRef = this.firestoreWrapper.doc('logros', logroId);
      const logroSnap = await this.firestoreWrapper.getDoc(logroRef);
      
      if (!logroSnap.exists()) {
        return { success: false, mensaje: 'Logro no encontrado' };
      }
      
      const logroData = logroSnap.data() as Logro;
      const puntosLogro = logroData.puntos || 0;
      
      // 2. Verificar si el usuario ya tiene este logro
      const usuarioRef = this.firestoreWrapper.doc('usuario', usuarioId);
      const usuarioSnap = await this.firestoreWrapper.getDoc(usuarioRef);
      
      if (!usuarioSnap.exists()) {
        return { success: false, mensaje: 'Usuario no encontrado' };
      }
      
      const usuarioData = usuarioSnap.data();
      const logrosActuales = usuarioData['logros'] || [];
      
      // Verificar si ya tiene el logro
      const yaDesbloqueado = logrosActuales.some((ref: DocumentReference) => ref.id === logroId);
      
      if (yaDesbloqueado) {
        return { success: false, mensaje: 'Logro ya desbloqueado', puntos: 0 };
      }
      
      // 3. Actualizar usuario: agregar logro + sumar puntos
      await this.firestoreWrapper.updateDoc(usuarioRef, {
        logros: this.firestoreWrapper.arrayUnion(logroRef),
        logrosCompletados: this.firestoreWrapper.increment(1),
        puntos: this.firestoreWrapper.increment(puntosLogro)
      });
      
      // 4. Crear actividad reciente
      await this.crearActividadLogro(usuarioRef, logroRef, logroData);
      
      console.log(`✅ Logro desbloqueado: +${puntosLogro} puntos`);
      
      return { 
        success: true, 
        mensaje: `¡Logro desbloqueado! +${puntosLogro} puntos`,
        puntos: puntosLogro
      };
      
    } catch (error) {
      console.error('Error al desbloquear logro:', error);
      return { success: false, mensaje: 'Error al desbloquear logro' };
    }
  }

  // ============================================
  // CREAR ACTIVIDAD
  // ============================================
  
  private async crearActividadLogro(
    usuarioRef: DocumentReference, 
    logroRef: DocumentReference,
    logroData: Logro
  ): Promise<void> {
    try {
      const actividadData = {
        jugador: usuarioRef,
        tipo: 'logro',
        descripcion: `desbloqueó un nuevo logro`,
        tiempo: 'ahora mismo',
        logro: logroRef,
        avatar: '',
        fecha: new Date().toISOString()
      };
      
      const collectionRef = this.firestoreWrapper.collection('actividadReciente');
      await this.firestoreWrapper.addDoc(collectionRef, actividadData);
      console.log('✅ Actividad creada');
    } catch (error) {
      console.error('Error al crear actividad:', error);
    }
  }

  // ============================================
  // SUMAR PUNTOS
  // ============================================
  
  async sumarPuntos(usuarioId: string, cantidad: number, motivo?: string): Promise<boolean> {
    try {
      const usuarioRef = this.firestoreWrapper.doc('usuario', usuarioId);
      
      await this.firestoreWrapper.updateDoc(usuarioRef, {
        puntos: this.firestoreWrapper.increment(cantidad)
      });
      
      console.log(`✅ +${cantidad} puntos agregados${motivo ? ` por: ${motivo}` : ''}`);
      return true;
    } catch (error) {
      console.error('Error al sumar puntos:', error);
      return false;
    }
  }

  // ============================================
  // LOGROS DISPONIBLES
  // ============================================
  
  async getLogrosDisponibles(usuarioId: string): Promise<Logro[]> {
    try {
      // 1. Obtener todos los logros
      const logrosRef = this.firestoreWrapper.collection('logros');
      const logrosSnap = await this.firestoreWrapper.collectionData(logrosRef, { idField: 'id' }).toPromise();
      
      // 2. Obtener logros del usuario
      const usuarioRef = this.firestoreWrapper.doc('usuario', usuarioId);
      const usuarioSnap = await this.firestoreWrapper.getDoc(usuarioRef);
      
      if (!usuarioSnap.exists()) {
        return [];
      }
      
      const logrosUsuario = usuarioSnap.data()['logros'] || [];
      const idsDesbloqueados = logrosUsuario.map((ref: DocumentReference) => ref.id);
      
      // 3. Filtrar logros no desbloqueados
      const logrosDisponibles = (logrosSnap || []).filter(
        (logro: any) => !idsDesbloqueados.includes(logro.id)
      );
      
      return logrosDisponibles as Logro[];
    } catch (error) {
      console.error('Error al obtener logros disponibles:', error);
      return [];
    }
  }

  // ============================================
  // LOGROS DESBLOQUEADOS
  // ============================================
  
  async getLogrosDesbloqueados(usuarioId: string): Promise<Logro[]> {
    try {
      const usuarioRef = this.firestoreWrapper.doc('usuario', usuarioId);
      const usuarioSnap = await this.firestoreWrapper.getDoc(usuarioRef);
      
      if (!usuarioSnap.exists()) {
        return [];
      }
      
      const logrosRefs = usuarioSnap.data()['logros'] || [];
      
      // Expandir referencias
      const logros = await Promise.all(
        logrosRefs.map(async (ref: DocumentReference) => {
          const logroSnap = await this.firestoreWrapper.getDoc(ref);
          return logroSnap.exists() ? { id: logroSnap.id, ...logroSnap.data() } : null;
        })
      );
      
      return logros.filter(l => l !== null) as Logro[];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }
}