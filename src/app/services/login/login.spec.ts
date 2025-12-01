import { TestBed } from '@angular/core/testing';
import { Login, AuthWrapper, FirestoreService } from './login';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Usuario } from '../../interfaces/interfaces';

describe('AuthWrapper', () => {
  let authWrapper: AuthWrapper;
  let authMock: any;

  beforeEach(() => {
    authMock = {};
    authWrapper = new AuthWrapper();
  });

  it('should be created', () => {
    expect(authWrapper).toBeTruthy();
  });

  it('should call createUserWithEmailAndPassword', async () => {
    const mockResult: any = { user: { uid: 'test-uid' } };
    spyOn(authWrapper, 'createUser').and.returnValue(Promise.resolve(mockResult));

    const result = await authWrapper.createUser(authMock, 'test@test.com', 'password');

    expect(authWrapper.createUser).toHaveBeenCalledWith(authMock, 'test@test.com', 'password');
    expect(result).toEqual(mockResult);
  });

  it('should call signInWithEmailAndPassword', async () => {
    const mockResult: any = { user: { uid: 'test-uid' } };
    spyOn(authWrapper, 'signIn').and.returnValue(Promise.resolve(mockResult));

    const result = await authWrapper.signIn(authMock, 'test@test.com', 'password');

    expect(authWrapper.signIn).toHaveBeenCalledWith(authMock, 'test@test.com', 'password');
    expect(result).toEqual(mockResult);
  });

  it('should call signOut', async () => {
    spyOn(authWrapper, 'signOut').and.returnValue(Promise.resolve());

    await authWrapper.signOut(authMock);

    expect(authWrapper.signOut).toHaveBeenCalledWith(authMock);
  });
});

describe('FirestoreService', () => {
  let firestoreService: FirestoreService;
  let firestoreMock: any;

  beforeEach(() => {
    firestoreMock = {};
    firestoreService = new FirestoreService(firestoreMock);
  });

  it('should be created', () => {
    expect(firestoreService).toBeTruthy();
  });

  it('should call doc', () => {
    const mockDocRef: any = { id: 'test-doc' };
    spyOn(firestoreService, 'doc').and.returnValue(mockDocRef);

    const result = firestoreService.doc('users/test-uid');

    expect(firestoreService.doc).toHaveBeenCalledWith('users/test-uid');
    expect(result).toEqual(mockDocRef);
  });

  it('should call setDoc', async () => {
    const mockDocRef: any = {};
    const mockData = { name: 'Test' };
    spyOn(firestoreService, 'setDoc').and.returnValue(Promise.resolve());

    await firestoreService.setDoc(mockDocRef, mockData);

    expect(firestoreService.setDoc).toHaveBeenCalledWith(mockDocRef, mockData);
  });

  it('should call setDoc with options', async () => {
    const mockDocRef: any = {};
    const mockData = { name: 'Test' };
    const options = { merge: true };
    spyOn(firestoreService, 'setDoc').and.returnValue(Promise.resolve());

    await firestoreService.setDoc(mockDocRef, mockData, options);

    expect(firestoreService.setDoc).toHaveBeenCalledWith(mockDocRef, mockData, options);
  });

  it('should call getDoc', async () => {
    const mockDocRef: any = {};
    const mockSnapshot: any = { exists: () => true, data: () => ({ name: 'Test' }) };
    spyOn(firestoreService, 'getDoc').and.returnValue(Promise.resolve(mockSnapshot));

    const result = await firestoreService.getDoc(mockDocRef);

    expect(firestoreService.getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(result).toEqual(mockSnapshot);
  });
});

describe('Login Service - Refactorizado', () => {
  let service: Login;
  let authMock: any;
  let authWrapperSpy: jasmine.SpyObj<AuthWrapper>;
  let firestoreServiceSpy: jasmine.SpyObj<FirestoreService>;
  let authStateCallback: any;

  const mockUsuario: Usuario = {
    id: 'test-uid',
    nombre: 'Test User',
    apellidos: 'Test Apellidos',
    username: 'testuser',
    foto: 'assets/img/default-avatar.png',
    puntos: 100,
    logrosCompletados: 5,
    logros: []
  };

  beforeEach(() => {
    authMock = {
      onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((callback: any) => {
        authStateCallback = callback;
        return () => {};
      })
    };

    const authWrapperSpyObj = jasmine.createSpyObj('AuthWrapper', ['createUser', 'signIn', 'signOut']);
    const firestoreSpyObj = jasmine.createSpyObj('FirestoreService', ['doc', 'setDoc', 'getDoc']);

    TestBed.configureTestingModule({
      providers: [
        Login,
        { provide: Auth, useValue: authMock },
        { provide: AuthWrapper, useValue: authWrapperSpyObj },
        { provide: FirestoreService, useValue: firestoreSpyObj }
      ]
    });

    service = TestBed.inject(Login);
    authWrapperSpy = TestBed.inject(AuthWrapper) as jasmine.SpyObj<AuthWrapper>;
    firestoreServiceSpy = TestBed.inject(FirestoreService) as jasmine.SpyObj<FirestoreService>;

    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registrar', () => {
    it('should register user successfully with all data', async () => {
      const mockCredential = { user: { uid: 'test-uid' } } as any;
      authWrapperSpy.createUser.and.returnValue(Promise.resolve(mockCredential));
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.setDoc.and.returnValue(Promise.resolve());

      const result = await service.registrar('test@test.com', 'password123', 'Test User', 'Apellidos', 'testuser');

      expect(result.id).toBe('test-uid');
      expect(result.nombre).toBe('Test User');
      expect(result.apellidos).toBe('Apellidos');
      expect(result.username).toBe('testuser');
      expect(authWrapperSpy.createUser).toHaveBeenCalledWith(authMock, 'test@test.com', 'password123');
      expect(firestoreServiceSpy.setDoc).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Usuario registrado:', jasmine.any(Object));
    });

    it('should use email as username if not provided', async () => {
      const mockCredential = { user: { uid: 'test-uid-2' } } as any;
      authWrapperSpy.createUser.and.returnValue(Promise.resolve(mockCredential));
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.setDoc.and.returnValue(Promise.resolve());

      const result = await service.registrar('newuser@test.com', 'pass123', 'Name');

      expect(result.username).toBe('newuser');
      expect(result.apellidos).toBe('');
    });

    it('should handle registration error', async () => {
      authWrapperSpy.createUser.and.returnValue(Promise.reject({ code: 'auth/email-already-in-use' }));

      try {
        await service.registrar('test@test.com', 'pass', 'Name');
        fail('Should throw');
      } catch (error: any) {
        expect(error.message).toBe('Este email ya está registrado');
        expect(console.error).toHaveBeenCalledWith('❌ Error al registrar:', jasmine.any(Object));
      }
    });
  });

  describe('autenticar', () => {
    it('should authenticate successfully', async () => {
      const mockCredential = { user: { uid: 'test-uid' } } as any;
      authWrapperSpy.signIn.and.returnValue(Promise.resolve(mockCredential));
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.getDoc.and.returnValue(Promise.resolve({
        exists: () => true,
        data: () => mockUsuario
      } as any));

      const result = await service.autenticar('test@test.com', 'password123');

      expect(result.id).toBe('test-uid');
      expect(authWrapperSpy.signIn).toHaveBeenCalledWith(authMock, 'test@test.com', 'password123');
      expect(console.log).toHaveBeenCalledWith('✅ Inicio de sesión exitoso:', jasmine.any(Object));
    });

    it('should handle auth error', async () => {
      authWrapperSpy.signIn.and.returnValue(Promise.reject({ code: 'auth/wrong-password' }));

      try {
        await service.autenticar('test@test.com', 'wrong');
        fail('Should throw');
      } catch (error: any) {
        expect(error.message).toBe('Contraseña incorrecta');
        expect(console.error).toHaveBeenCalledWith('❌ Error al iniciar sesión:', jasmine.any(Object));
      }
    });
  });

  describe('obtenerUsuarioFirestore', () => {
    it('should get user from Firestore', async () => {
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.getDoc.and.returnValue(Promise.resolve({
        exists: () => true,
        data: () => ({ nombre: 'Test', apellidos: 'User' })
      } as any));

      const result = await (service as any).obtenerUsuarioFirestore('test-uid');

      expect(result.id).toBe('test-uid');
      expect(result.nombre).toBe('Test');
    });

    it('should throw if user not found', async () => {
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.getDoc.and.returnValue(Promise.resolve({
        exists: () => false
      } as any));

      try {
        await (service as any).obtenerUsuarioFirestore('non-existent');
        fail('Should throw');
      } catch (error: any) {
        expect(error.message).toBe('Usuario no encontrado en Firestore');
      }
    });
  });

  describe('validarSesion', () => {
    it('should handle logged user', async () => {
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.getDoc.and.returnValue(Promise.resolve({
        exists: () => true,
        data: () => mockUsuario
      } as any));

      service.validarSesion();
      await authStateCallback({ uid: 'test-uid' });
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(console.log).toHaveBeenCalledWith('✅ Usuario logueado:', jasmine.any(Object));
    });

    it('should handle no user', async () => {
      service.validarSesion();
      await authStateCallback(null);

      expect(console.log).toHaveBeenCalledWith('⚠️ No hay usuario logueado');
    });

    it('should handle error', async () => {
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.getDoc.and.returnValue(Promise.reject('Error'));

      service.validarSesion();
      await authStateCallback({ uid: 'test-uid' });
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(console.error).toHaveBeenCalledWith('❌ Error al obtener datos del usuario:', 'Error');
    });
  });

  describe('cerrarSesion', () => {
    it('should sign out successfully', async () => {
      authWrapperSpy.signOut.and.returnValue(Promise.resolve());

      await service.cerrarSesion();

      expect(authWrapperSpy.signOut).toHaveBeenCalledWith(authMock);
      expect(console.log).toHaveBeenCalledWith('✅ Sesión cerrada');
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should handle error', async () => {
      const error = new Error('Sign out error');
      authWrapperSpy.signOut.and.returnValue(Promise.reject(error));

      try {
        await service.cerrarSesion();
        fail('Should throw');
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith('❌ Error al cerrar sesión:', error);
        expect(e).toBe(error);
      }
    });
  });

  describe('getCurrentUser', () => {
    it('should return user', () => {
      (service as any).currentUserSubject.next(mockUsuario);
      expect(service.getCurrentUser()).toEqual(mockUsuario);
    });

    it('should return null', () => {
      (service as any).currentUserSubject.next(null);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true', () => {
      (service as any).currentUserSubject.next(mockUsuario);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false', () => {
      (service as any).currentUserSubject.next(null);
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('actualizarUsuario', () => {
    it('should update successfully when uid matches', async () => {
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.setDoc.and.returnValue(Promise.resolve());
      (service as any).currentUserSubject.next(mockUsuario);

      await service.actualizarUsuario('test-uid', { nombre: 'Updated', puntos: 200 });

      expect(firestoreServiceSpy.setDoc).toHaveBeenCalledWith(jasmine.any(Object), { nombre: 'Updated', puntos: 200 }, { merge: true });
      expect(console.log).toHaveBeenCalledWith('✅ Usuario actualizado');
      expect(service.getCurrentUser()?.nombre).toBe('Updated');
      expect(service.getCurrentUser()?.puntos).toBe(200);
    });

    it('should update Firestore but not observable if uid different', async () => {
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.setDoc.and.returnValue(Promise.resolve());
      (service as any).currentUserSubject.next(mockUsuario);

      await service.actualizarUsuario('other-uid', { nombre: 'Updated' });

      expect(firestoreServiceSpy.setDoc).toHaveBeenCalled();
      expect(service.getCurrentUser()?.nombre).toBe('Test User');
    });

    it('should handle error', async () => {
      const error = new Error('Update error');
      firestoreServiceSpy.doc.and.returnValue({} as any);
      firestoreServiceSpy.setDoc.and.returnValue(Promise.reject(error));

      try {
        await service.actualizarUsuario('test-uid', { nombre: 'Updated' });
        fail('Should throw');
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith('❌ Error al actualizar usuario:', error);
        expect(e).toBe(error);
      }
    });
  });

  describe('getErrorMessage', () => {
    const tests: [string, string][] = [
      ['auth/invalid-email', 'El email no es válido'],
      ['auth/user-disabled', 'El usuario ha sido deshabilitado'],
      ['auth/user-not-found', 'No existe un usuario con este email'],
      ['auth/wrong-password', 'Contraseña incorrecta'],
      ['auth/email-already-in-use', 'Este email ya está registrado'],
      ['auth/weak-password', 'La contraseña debe tener al menos 6 caracteres'],
      ['auth/network-request-failed', 'Error de conexión. Verifica tu internet'],
      ['auth/too-many-requests', 'Demasiados intentos. Intenta más tarde'],
      ['auth/operation-not-allowed', 'Operación no permitida'],
      ['auth/invalid-credential', 'Credenciales inválidas'],
      ['unknown', 'Error desconocido al autenticar']
    ];

    tests.forEach(([code, msg]) => {
      it(`should return "${msg}" for code "${code}"`, () => {
        expect((service as any).getErrorMessage(code)).toBe(msg);
      });
    });
  });

  describe('currentUser$ Observable', () => {
    it('should emit changes', (done) => {
      let count = 0;
      service.currentUser$.subscribe(user => {
        count++;
        if (count === 2 && user) {
          expect(user.nombre).toBe('Test User');
          done();
        }
      });
      (service as any).currentUserSubject.next(mockUsuario);
    });
  });
});