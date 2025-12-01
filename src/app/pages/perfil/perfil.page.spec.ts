import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilPage } from './perfil.page';
import { Router } from '@angular/router';
import { Login } from 'src/app/services/login/login';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;
  let loginServiceSpy: jasmine.SpyObj<Login>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let authSpy: jasmine.SpyObj<Auth>;

  const mockUsuario: any = {
    id: '1',
    nombre: 'Test User',
    apellidos: 'Test Apellidos',
    username: 'testuser',
    email: 'test@test.com',
    foto: 'assets/img/avatares/avatar1.webp',
    avatar: 'assets/img/avatares/avatar1.webp',
    puntos: 500,
    logrosCompletados: 5
  };

  beforeEach(async () => {
    const loginSpy = jasmine.createSpyObj('Login', ['getCurrentUser', 'actualizarUsuario', 'cerrarSesion'], {
      currentUser$: of(mockUsuario)
    });
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    const actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const authSpyObj = jasmine.createSpyObj('Auth', [], { currentUser: { email: 'test@test.com' } });

    await TestBed.configureTestingModule({
      declarations: [PerfilPage],
      providers: [
        { provide: Login, useValue: loginSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: AlertController, useValue: alertSpy },
        { provide: ToastController, useValue: toastSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: Auth, useValue: authSpyObj }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
    loginServiceSpy = TestBed.inject(Login) as jasmine.SpyObj<Login>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    toastControllerSpy = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    authSpy = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;

    loginServiceSpy.getCurrentUser.and.returnValue(mockUsuario);
    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call cargarPerfil', () => {
      spyOn(component, 'cargarPerfil');
      component.ngOnInit();
      expect(component.cargarPerfil).toHaveBeenCalled();
    });
  });

  describe('cargarPerfil', () => {
    it('should load user profile and subscribe to currentUser$', () => {
      component.cargarPerfil();
      
      expect(loginServiceSpy.getCurrentUser).toHaveBeenCalled();
      expect(component.usuario).toEqual(mockUsuario);
      expect(console.log).toHaveBeenCalledWith('Usuario cargado:', mockUsuario);
    });
  });

  describe('Level calculations', () => {
    it('should calculate nivel correctly', () => {
      component.usuario = { ...mockUsuario, puntos: 400 };
      expect(component.calcularNivel()).toBe(3);
    });

    it('should return nivel 1 if usuario is null', () => {
      component.usuario = null;
      expect(component.calcularNivel()).toBe(1);
    });

    it('should calculate siguienteNivel correctly', () => {
      component.usuario = { ...mockUsuario, puntos: 400 };
      expect(component.siguienteNivel()).toBe(900);
    });

    it('should calculate puntosParaSiguienteNivel correctly', () => {
      component.usuario = { ...mockUsuario, puntos: 500 };
      expect(component.puntosParaSiguienteNivel()).toBe(400);
    });

    it('should return 0 puntosParaSiguienteNivel if usuario is null', () => {
      component.usuario = null;
      expect(component.puntosParaSiguienteNivel()).toBe(0);
    });

    it('should calculate progreso correctly', () => {
      component.usuario = { ...mockUsuario, puntos: 500 };
      const progreso = component.calcularProgreso();
      expect(progreso).toBeGreaterThan(0);
      expect(progreso).toBeLessThanOrEqual(100);
    });

    it('should return 0 progreso if usuario is null', () => {
      component.usuario = null;
      expect(component.calcularProgreso()).toBe(0);
    });
  });

  describe('volver', () => {
    it('should navigate to /inicio', () => {
      component.volver();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/inicio']);
    });
  });

  describe('cambiarAvatar', () => {
    it('should call seleccionarAvatarPredeterminado', async () => {
      spyOn(component, 'seleccionarAvatarPredeterminado').and.returnValue(Promise.resolve());
      await component.cambiarAvatar();
      expect(component.seleccionarAvatarPredeterminado).toHaveBeenCalled();
    });
  });

  describe('seleccionarAvatarPredeterminado', () => {
    it('should show alert with avatar options', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      component.usuario = mockUsuario;

      await component.seleccionarAvatarPredeterminado();

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('🎭 Selecciona tu Avatar');
      expect(alertConfig?.inputs?.length).toBe(6);
    });

    it('should call actualizarFoto when avatar selected', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      spyOn(component, 'actualizarFoto').and.returnValue(Promise.resolve());
      component.usuario = mockUsuario;

      await component.seleccionarAvatarPredeterminado();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const selectButton = alertConfig?.buttons?.[1] as any;
      
      if (selectButton?.handler) {
        await selectButton.handler('assets/img/avatares/avatar2.webp');
      }

      expect(component.actualizarFoto).toHaveBeenCalledWith('assets/img/avatares/avatar2.webp');
    });
  });

  describe('actualizarFoto', () => {
    it('should update foto successfully', async () => {
      const mockToast = { present: jasmine.createSpy('present') };
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));
      loginServiceSpy.actualizarUsuario.and.returnValue(Promise.resolve());
      component.usuario = mockUsuario;

      await component.actualizarFoto('new-avatar.png');

      expect(loginServiceSpy.actualizarUsuario).toHaveBeenCalledWith('1', {
        foto: 'new-avatar.png',
        avatar: 'new-avatar.png'
      });
      expect(component.usuario?.foto).toBe('new-avatar.png');
      expect(toastControllerSpy.create).toHaveBeenCalled();
    });

    it('should handle error when updating foto', async () => {
      const mockToast = { present: jasmine.createSpy('present') };
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));
      loginServiceSpy.actualizarUsuario.and.returnValue(Promise.reject('Error'));
      component.usuario = mockUsuario;

      await component.actualizarFoto('new-avatar.png');

      expect(console.error).toHaveBeenCalledWith('Error al actualizar avatar:', 'Error');
    });

    it('should return early if usuario.id is not set', async () => {
      component.usuario = { ...mockUsuario, id: undefined };
      await component.actualizarFoto('new-avatar.png');
      expect(loginServiceSpy.actualizarUsuario).not.toHaveBeenCalled();
    });
  });

  describe('editarPerfil', () => {
    it('should show alert with profile inputs', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      component.usuario = mockUsuario;

      await component.editarPerfil();

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('✏️ Editar Perfil');
      expect(alertConfig?.inputs?.length).toBe(3);
    });

    it('should call guardarCambiosPerfil on save', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      spyOn(component, 'guardarCambiosPerfil').and.returnValue(Promise.resolve());

      await component.editarPerfil();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const saveButton = alertConfig?.buttons?.[1] as any;
      
      if (saveButton?.handler) {
        await saveButton.handler({ nombre: 'New Name' });
      }

      expect(component.guardarCambiosPerfil).toHaveBeenCalled();
    });
  });

  describe('guardarCambiosPerfil', () => {
    it('should show warning if nombre is empty', async () => {
      const mockToast = { present: jasmine.createSpy('present') };
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));
      component.usuario = mockUsuario;

      await component.guardarCambiosPerfil({ nombre: '' });

      expect(toastControllerSpy.create).toHaveBeenCalled();
      expect(loginServiceSpy.actualizarUsuario).not.toHaveBeenCalled();
    });

    it('should update profile successfully', async () => {
      const mockToast = { present: jasmine.createSpy('present') };
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));
      loginServiceSpy.actualizarUsuario.and.returnValue(Promise.resolve());
      component.usuario = mockUsuario;

      await component.guardarCambiosPerfil({
        nombre: 'New Name',
        apellidos: 'New Apellidos',
        username: 'newuser'
      });

      expect(loginServiceSpy.actualizarUsuario).toHaveBeenCalled();
    });

    it('should handle error when updating profile', async () => {
      const mockToast = { present: jasmine.createSpy('present') };
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));
      loginServiceSpy.actualizarUsuario.and.returnValue(Promise.reject('Error'));
      component.usuario = mockUsuario;

      await component.guardarCambiosPerfil({ nombre: 'Test' });

      expect(console.error).toHaveBeenCalled();
    });

    it('should return early if usuario.id is not set', async () => {
      component.usuario = null;
      await component.guardarCambiosPerfil({ nombre: 'Test' });
      expect(loginServiceSpy.actualizarUsuario).not.toHaveBeenCalled();
    });
  });

  describe('cambiarPassword', () => {
    it('should show alert for password reset', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

      await component.cambiarPassword();

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('🔒 Cambiar Contraseña');
    });

    it('should show success toast when email provided', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      const mockToast = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));

      await component.cambiarPassword();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const sendButton = alertConfig?.buttons?.[1] as any;
      
      if (sendButton?.handler) {
        await sendButton.handler({ email: 'test@test.com' });
      }

      expect(toastControllerSpy.create).toHaveBeenCalled();
    });
  });

  describe('Navigation methods', () => {
    const navTests = [
      { method: 'verEstadisticas', route: '/estadisticas' },
      { method: 'verTodosLogros', route: '/logros' }
    ];

    navTests.forEach(({ method, route }) => {
      it(`should navigate to ${route}`, () => {
        (component as any)[method]();
        expect(routerSpy.navigate).toHaveBeenCalledWith([route]);
      });
    });
  });

  describe('compartirPerfil', () => {
    it('should show toast and log message', async () => {
      const mockToast = { present: jasmine.createSpy('present') };
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));
      component.usuario = mockUsuario;

      await component.compartirPerfil();

      expect(toastControllerSpy.create).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Compartir:', jasmine.any(String));
    });
  });

  describe('cerrarSesion', () => {
    it('should show confirmation alert', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

      await component.cerrarSesion();

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('⚠️ ¿Cerrar Sesión?');
    });

    it('should logout and redirect on confirm', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      const mockToast = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));
      loginServiceSpy.cerrarSesion.and.returnValue(Promise.resolve());

      await component.cerrarSesion();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const confirmButton = alertConfig?.buttons?.[1] as any;
      
      if (confirmButton?.handler) {
        await confirmButton.handler();
      }

      expect(loginServiceSpy.cerrarSesion).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle logout error', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      const mockToast = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));
      loginServiceSpy.cerrarSesion.and.returnValue(Promise.reject('Error'));

      await component.cerrarSesion();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const confirmButton = alertConfig?.buttons?.[1] as any;
      
      if (confirmButton?.handler) {
        await confirmButton.handler();
      }

      expect(console.error).toHaveBeenCalledWith('Error al cerrar sesión:', 'Error');
    });
  });
});