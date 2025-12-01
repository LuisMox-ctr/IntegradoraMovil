import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioSesionPage } from './inicio-sesion.page';
import { Login } from 'src/app/services/login/login';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('InicioSesionPage', () => {
  let component: InicioSesionPage;
  let fixture: ComponentFixture<InicioSesionPage>;
  let loginServiceSpy: jasmine.SpyObj<Login>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockUsuario = {
    id: '1',
    nombre: 'Test User',
    email: 'test@test.com'
  };

  beforeEach(async () => {
    const loginSpy = jasmine.createSpyObj('Login', ['isLoggedIn', 'autenticar']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [InicioSesionPage],
      providers: [
        { provide: Login, useValue: loginSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: AlertController, useValue: alertSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioSesionPage);
    component = fixture.componentInstance;
    loginServiceSpy = TestBed.inject(Login) as jasmine.SpyObj<Login>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to /inicio if user is already logged in', () => {
      loginServiceSpy.isLoggedIn.and.returnValue(true);
      
      component.ngOnInit();
      
      expect(loginServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/inicio']);
    });

    it('should not redirect if user is not logged in', () => {
      loginServiceSpy.isLoggedIn.and.returnValue(false);
      
      component.ngOnInit();
      
      expect(loginServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('togglePassword', () => {
    it('should toggle showPassword from false to true', () => {
      component.showPassword = false;
      component.togglePassword();
      expect(component.showPassword).toBe(true);
    });

    it('should toggle showPassword from true to false', () => {
      component.showPassword = true;
      component.togglePassword();
      expect(component.showPassword).toBe(false);
    });
  });

  describe('iniciarSesion', () => {
    it('should show error if email is empty', async () => {
      component.email = '';
      component.password = 'password123';
      
      await component.iniciarSesion();
      
      expect(component.error).toBe('Por favor completa todos los campos');
      expect(loginServiceSpy.autenticar).not.toHaveBeenCalled();
    });

    it('should show error if password is empty', async () => {
      component.email = 'test@test.com';
      component.password = '';
      
      await component.iniciarSesion();
      
      expect(component.error).toBe('Por favor completa todos los campos');
      expect(loginServiceSpy.autenticar).not.toHaveBeenCalled();
    });

    it('should show error if email format is invalid', async () => {
      component.email = 'invalid-email';
      component.password = 'password123';
      
      await component.iniciarSesion();
      
      expect(component.error).toBe('El formato del email no es válido');
      expect(loginServiceSpy.autenticar).not.toHaveBeenCalled();
    });

    it('should authenticate and redirect on successful login', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      loginServiceSpy.autenticar.and.returnValue(Promise.resolve(mockUsuario as any));
      spyOn(console, 'log');

      component.email = 'test@test.com';
      component.password = 'password123';
      
      await component.iniciarSesion();
      
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
      expect(loginServiceSpy.autenticar).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(console.log).toHaveBeenCalledWith('✅ Usuario logueado:', mockUsuario);
      expect(alertControllerSpy.create).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/inicio']);
    });

    it('should handle authentication error', async () => {
      const errorMessage = 'Credenciales inválidas';
      loginServiceSpy.autenticar.and.returnValue(Promise.reject({ message: errorMessage }));
      spyOn(console, 'error');

      component.email = 'test@test.com';
      component.password = 'wrongpassword';
      
      await component.iniciarSesion();
      
      expect(component.loading).toBe(false);
      expect(component.error).toBe(errorMessage);
      expect(console.error).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('irARegistro', () => {
    it('should navigate to /registro', () => {
      component.irARegistro();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/registro']);
    });
  });

  describe('recuperarPassword', () => {
    it('should show alert with email input', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      component.email = 'test@test.com';

      await component.recuperarPassword();

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('Recuperar Contraseña');
      expect(alertConfig?.inputs?.length).toBe(1);
      expect(mockAlert.present).toHaveBeenCalled();
    });

    it('should call enviarRecuperacion when email is provided', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      spyOn(component, 'enviarRecuperacion');

      await component.recuperarPassword();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const sendButton = alertConfig?.buttons?.[1] as any;
      
      if (sendButton?.handler) {
        sendButton.handler({ email: 'test@test.com' });
      }

      expect(component.enviarRecuperacion).toHaveBeenCalledWith('test@test.com');
    });

    it('should not call enviarRecuperacion when email is empty', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      spyOn(component, 'enviarRecuperacion');

      await component.recuperarPassword();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const sendButton = alertConfig?.buttons?.[1] as any;
      
      if (sendButton?.handler) {
        sendButton.handler({ email: '' });
      }

      expect(component.enviarRecuperacion).not.toHaveBeenCalled();
    });
  });

  describe('enviarRecuperacion', () => {
    it('should show confirmation alert', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

      await component.enviarRecuperacion('test@test.com');

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('Email Enviado');
      expect(mockAlert.present).toHaveBeenCalled();
    });
  });

  describe('mostrarBienvenida', () => {
    it('should show welcome alert with user name', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

      await component.mostrarBienvenida('Test User');

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('¡Bienvenido!');
      expect(alertConfig?.message).toBe('Hola Test User, prepárate para sobrevivir en V Magma');
      expect(mockAlert.present).toHaveBeenCalled();
    });
  });

  describe('validarEmail', () => {
    const validEmails = ['test@test.com', 'user.name@example.co.uk', 'test+tag@domain.com'];
    const invalidEmails = ['invalid', '@test.com', 'test@', 'test @test.com', 'test.com'];

    validEmails.forEach(email => {
      it(`should return true for valid email: ${email}`, () => {
        expect((component as any).validarEmail(email)).toBe(true);
      });
    });

    invalidEmails.forEach(email => {
      it(`should return false for invalid email: ${email}`, () => {
        expect((component as any).validarEmail(email)).toBe(false);
      });
    });
  });
});