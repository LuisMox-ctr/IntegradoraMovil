import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroPage } from './registro.page';
import { Router } from '@angular/router';
import { Login } from 'src/app/services/login/login';
import { AlertController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;
  let loginServiceSpy: jasmine.SpyObj<Login>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockUsuario = {
    id: '1',
    nombre: 'Test User',
    email: 'test@test.com'
  };

  beforeEach(async () => {
    const loginSpy = jasmine.createSpyObj('Login', ['isLoggedIn', 'registrar']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [RegistroPage],
      providers: [
        { provide: Login, useValue: loginSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: AlertController, useValue: alertSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    loginServiceSpy = TestBed.inject(Login) as jasmine.SpyObj<Login>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to /inicio if user is logged in', () => {
      loginServiceSpy.isLoggedIn.and.returnValue(true);
      component.ngOnInit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/inicio']);
    });

    it('should not redirect if user is not logged in', () => {
      loginServiceSpy.isLoggedIn.and.returnValue(false);
      component.ngOnInit();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('ngDoCheck', () => {
    it('should call calcularFortalezaPassword', () => {
      spyOn(component, 'calcularFortalezaPassword');
      component.ngDoCheck();
      expect(component.calcularFortalezaPassword).toHaveBeenCalled();
    });
  });

  describe('Toggle methods', () => {
    it('should toggle showPassword', () => {
      component.showPassword = false;
      component.togglePassword();
      expect(component.showPassword).toBe(true);
      component.togglePassword();
      expect(component.showPassword).toBe(false);
    });

    it('should toggle showConfirmPassword', () => {
      component.showConfirmPassword = false;
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBe(true);
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBe(false);
    });
  });

  describe('calcularFortalezaPassword', () => {
    it('should return empty strength for empty password', () => {
      component.password = '';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.percentage).toBe(0);
      expect(component.passwordStrength.text).toBe('');
    });

    it('should calculate weak password strength', () => {
      component.password = 'abc';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.text).toBe('Débil');
      expect(component.passwordStrength.color).toBe('#ff3333');
    });

    it('should calculate medium password strength', () => {
      component.password = 'abc123';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.text).toBe('Media');
      expect(component.passwordStrength.color).toBe('#ffaa00');
    });

    it('should calculate strong password strength', () => {
      component.password = 'Abc123!@#';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.text).toBe('Fuerte');
      expect(component.passwordStrength.color).toBe('#00ff00');
    });

    it('should add strength for length >= 6', () => {
      component.password = 'abcdef';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.percentage).toBeGreaterThanOrEqual(20);
    });

    it('should add strength for length >= 8', () => {
      component.password = 'abcdefgh';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.percentage).toBeGreaterThanOrEqual(35);
    });

    it('should add strength for length >= 12', () => {
      component.password = 'abcdefghijkl';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.percentage).toBeGreaterThanOrEqual(50);
    });

    it('should add strength for numbers', () => {
      component.password = 'abc123';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.percentage).toBeGreaterThan(20);
    });

    it('should add strength for lowercase', () => {
      component.password = 'abcdef';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.percentage).toBeGreaterThan(0);
    });

    it('should add strength for uppercase', () => {
      component.password = 'Abcdef';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.percentage).toBeGreaterThan(35);
    });

    it('should add strength for symbols', () => {
      component.password = 'abc!@#';
      component.calcularFortalezaPassword();
      expect(component.passwordStrength.percentage).toBeGreaterThan(35);
    });
  });

  describe('validarFormulario', () => {
    beforeEach(() => {
      component.nombre = 'Test';
      component.email = 'test@test.com';
      component.password = 'password123';
      component.confirmPassword = 'password123';
      component.aceptaTerminos = true;
    });

    it('should return true when all fields are valid', () => {
      expect(component.validarFormulario()).toBe(true);
    });

    it('should return false when nombre is empty', () => {
      component.nombre = '';
      expect(component.validarFormulario()).toBe(false);
    });

    it('should return false when email is empty', () => {
      component.email = '';
      expect(component.validarFormulario()).toBe(false);
    });

    it('should return false when password is empty', () => {
      component.password = '';
      expect(component.validarFormulario()).toBe(false);
    });

    it('should return false when confirmPassword is empty', () => {
      component.confirmPassword = '';
      expect(component.validarFormulario()).toBe(false);
    });

    it('should return false when aceptaTerminos is false', () => {
      component.aceptaTerminos = false;
      expect(component.validarFormulario()).toBe(false);
    });

    it('should return false when password length < 6', () => {
      component.password = 'abc';
      component.confirmPassword = 'abc';
      expect(component.validarFormulario()).toBe(false);
    });
  });

  describe('registrar', () => {
    beforeEach(() => {
      component.nombre = 'Test User';
      component.apellidos = 'Test Apellidos';
      component.username = 'testuser';
      component.email = 'test@test.com';
      component.password = 'password123';
      component.confirmPassword = 'password123';
      component.aceptaTerminos = true;
      spyOn(console, 'log');
      spyOn(console, 'error');
    });

    it('should show error if nombre is empty', async () => {
      component.nombre = '   ';
      await component.registrar();
      expect(component.error).toBe('El nombre es obligatorio');
    });

    it('should show error if email format is invalid', async () => {
      component.email = 'invalid-email';
      await component.registrar();
      expect(component.error).toBe('El formato del email no es válido');
    });

    it('should show error if password length < 6', async () => {
      component.password = 'abc';
      await component.registrar();
      expect(component.error).toBe('La contraseña debe tener al menos 6 caracteres');
    });

    it('should show error if passwords do not match', async () => {
      component.confirmPassword = 'different';
      await component.registrar();
      expect(component.error).toBe('Las contraseñas no coinciden');
    });

    it('should show error if terms not accepted', async () => {
      component.aceptaTerminos = false;
      await component.registrar();
      expect(component.error).toBe('Debes aceptar los términos y condiciones');
    });

    it('should register successfully and redirect', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      loginServiceSpy.registrar.and.returnValue(Promise.resolve(mockUsuario as any));

      await component.registrar();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
      expect(loginServiceSpy.registrar).toHaveBeenCalledWith(
        'test@test.com',
        'password123',
        'Test User',
        'Test Apellidos',
        'testuser'
      );
      expect(console.log).toHaveBeenCalledWith('✅ Usuario registrado:', mockUsuario);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/inicio']);
    });

    it('should handle registration error', async () => {
      const errorMessage = 'Email ya registrado';
      loginServiceSpy.registrar.and.returnValue(Promise.reject({ message: errorMessage }));

      await component.registrar();

      expect(component.loading).toBe(false);
      expect(component.error).toBe(errorMessage);
      expect(console.error).toHaveBeenCalledWith('❌ Error al registrar:', { message: errorMessage });
    });
  });

  describe('Navigation methods', () => {
    it('should navigate to /login on volver', () => {
      component.volver();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should navigate to /login on irALogin', () => {
      component.irALogin();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('verTerminos', () => {
    it('should show terms and conditions alert', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

      await component.verTerminos();

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('Términos y Condiciones');
      expect(mockAlert.present).toHaveBeenCalled();
    });
  });

  describe('mostrarBienvenida', () => {
    it('should show welcome alert with user name', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

      await component.mostrarBienvenida('Test User');

      expect(alertControllerSpy.create).toHaveBeenCalled();
      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('¡Bienvenido a V Magma!');
      expect(alertConfig?.message).toContain('Test User');
      expect(mockAlert.present).toHaveBeenCalled();
    });
  });

  describe('validarEmail', () => {
    const validEmails = [
      'test@test.com',
      'user.name@example.co.uk',
      'test+tag@domain.com'
    ];
    
    const invalidEmails = [
      'invalid',
      '@test.com',
      'test@',
      'test @test.com',
      'test.com'
    ];

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