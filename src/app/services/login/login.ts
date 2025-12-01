import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Usuario } from '../../interfaces/interfaces';
import { BehaviorSubject, Observable } from 'rxjs';

// Wrapper para funciones de Firebase Auth
@Injectable({
  providedIn: 'root'
})
export class AuthWrapper {
  createUser(auth: Auth, email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  signIn(auth: Auth, email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  signOut(auth: Auth) {
    return signOut(auth);
  }
}

// Wrapper para funciones de Firestore
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  doc(path: string) {
    return doc(this.firestore, path);
  }

  async setDoc(docRef: any, data: any, options?: any) {
    return setDoc(docRef, data, options);
  }

  async getDoc(docRef: any) {
    return getDoc(docRef);
  }
}

@Injectable({
  providedIn: 'root',
})
export class Login {
  
  // 🔥 Observable para saber si hay usuario logueado
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$: Observable<Usuario | null> = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private authWrapper: AuthWrapper,
    private firestoreService: FirestoreService
  ) {
    // Escuchar cambios de autenticación automáticamente
    this.validarSesion();
  }

  // ============================================
  // 1. REGISTRO DE NUEVO USUARIO
  // ============================================
  async registrar(email: string, password: string, nombre: string, apellidos?: string, username?: string): Promise<Usuario> {
    try {
      // Crear usuario en Firebase Auth
      const result = await this.authWrapper.createUser(this.auth, email, password);
      const uid = result.user.uid;

      // Crear documento en Firestore con la interface Usuario
      const nuevoUsuario: Usuario = {
        id: uid,
        nombre: nombre,
        apellidos: apellidos || '',
        username: username || email.split('@')[0],
        foto: 'assets/img/default-avatar.png',
        puntos: 0,
        logrosCompletados: 0,
        logros: []
      };

      // Guardar en Firestore en la colección "usuario"
      const usuarioRef = this.firestoreService.doc(`usuario/${uid}`);
      await this.firestoreService.setDoc(usuarioRef, nuevoUsuario);

      console.log('✅ Usuario registrado:', nuevoUsuario);
      this.currentUserSubject.next(nuevoUsuario);
      
      return nuevoUsuario;
    } catch (error: any) {
      console.error('❌ Error al registrar:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // ============================================
  // 2. INICIO DE SESIÓN
  // ============================================
  async autenticar(email: string, password: string): Promise<Usuario> {
    try {
      // Autenticar en Firebase Auth
      const result = await this.authWrapper.signIn(this.auth, email, password);
      const uid = result.user.uid;

      // Obtener datos del usuario desde Firestore
      const usuarioData = await this.obtenerUsuarioFirestore(uid);
      
      console.log('✅ Inicio de sesión exitoso:', usuarioData);
      this.currentUserSubject.next(usuarioData);
      
      return usuarioData;
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // ============================================
  // 3. OBTENER USUARIO DE FIRESTORE
  // ============================================
  private async obtenerUsuarioFirestore(uid: string): Promise<Usuario> {
    const usuarioRef = this.firestoreService.doc(`usuario/${uid}`);
    const usuarioSnap = await this.firestoreService.getDoc(usuarioRef);

    if (usuarioSnap.exists()) {
      const data = usuarioSnap.data() as Usuario;
      return {
        id: uid,
        ...data
      };
    } else {
      throw new Error('Usuario no encontrado en Firestore');
    }
  }

  // ============================================
  // 4. VALIDAR SESIÓN (Auto-login)
  // ============================================
  validarSesion(): void {
    this.auth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        try {
          // Usuario logueado - obtener sus datos
          const usuarioData = await this.obtenerUsuarioFirestore(user.uid);
          this.currentUserSubject.next(usuarioData);
          console.log('✅ Usuario logueado:', usuarioData);
        } catch (error) {
          console.error('❌ Error al obtener datos del usuario:', error);
          this.currentUserSubject.next(null);
        }
      } else {
        // No hay usuario
        this.currentUserSubject.next(null);
        console.log('⚠️ No hay usuario logueado');
      }
    });
  }

  // ============================================
  // 5. CERRAR SESIÓN
  // ============================================
  async cerrarSesion(): Promise<void> {
    try {
      await this.authWrapper.signOut(this.auth);
      this.currentUserSubject.next(null);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  }

  // ============================================
  // 6. OBTENER USUARIO ACTUAL (Sincrónico)
  // ============================================
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  // ============================================
  // 7. VERIFICAR SI HAY SESIÓN ACTIVA
  // ============================================
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // ============================================
  // 8. ACTUALIZAR DATOS DEL USUARIO
  // ============================================
  async actualizarUsuario(uid: string, datos: Partial<Usuario>): Promise<void> {
    try {
      const usuarioRef = this.firestoreService.doc(`usuario/${uid}`);
      await this.firestoreService.setDoc(usuarioRef, datos, { merge: true });
      
      // Actualizar el observable
      const usuarioActual = this.currentUserSubject.value;
      if (usuarioActual && usuarioActual.id === uid) {
        this.currentUserSubject.next({ ...usuarioActual, ...datos });
      }
      
      console.log('✅ Usuario actualizado');
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      throw error;
    }
  }

  // ============================================
  // 9. MENSAJES DE ERROR TRADUCIDOS
  // ============================================
  private getErrorMessage(errorCode: string): string {
    const errores: { [key: string]: string } = {
      'auth/invalid-email': 'El email no es válido',
      'auth/user-disabled': 'El usuario ha sido deshabilitado',
      'auth/user-not-found': 'No existe un usuario con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/invalid-credential': 'Credenciales inválidas'
    };

    return errores[errorCode] || 'Error desconocido al autenticar';
  }
}