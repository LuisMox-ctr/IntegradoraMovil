import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMenuComponent } from './user-menu.component';
import { Router } from '@angular/router';
import { AlertController, IonPopover } from '@ionic/angular';
import { Login } from 'src/app/services/login/login';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let loginServiceSpy: jasmine.SpyObj<Login>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockUser: any = {
    id: '1',
    nombre: 'Test User',
    email: 'test@test.com',
    foto: 'assets/img/test.png',
    avatar: 'assets/img/avatar.png',
    puntos: 100,
    logrosCompletados: []
  };

  beforeEach(async () => {
    const loginSpy = jasmine.createSpyObj('Login', ['cerrarSesion'], {
      currentUser$: of(mockUser)
    });
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [UserMenuComponent],
      providers: [
        { provide: Login, useValue: loginSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: AlertController, useValue: alertSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    loginServiceSpy = TestBed.inject(Login) as jasmine.SpyObj<Login>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to currentUser$ on ngOnInit', () => {
    component.ngOnInit();
    expect(component.usuario).toEqual(mockUser);
  });

  it('should have predefined avatars', () => {
    expect(component.avataresPredeterminados.length).toBe(6);
    expect(component.avataresPredeterminados[0].nombre).toBe('Guerrero');
  });

  describe('Menu operations', () => {
    it('should open menu', () => {
      const event = new Event('click');
      component.abrirMenu(event);
      expect(component.isMenuOpen).toBe(true);
    });

    it('should close menu', () => {
      component.isMenuOpen = true;
      component.cerrarMenu();
      expect(component.isMenuOpen).toBe(false);
    });

    it('should set popover event when popover exists', () => {
      const mockPopover = { event: null } as any;
      component.popover = mockPopover;
      const event = new Event('click');
      
      component.abrirMenu(event);
      
      expect(component.popover.event).toBe(event);
    });
  });

  describe('Navigation methods', () => {
    const navigationTests = [
      { method: 'irAPerfil', route: '/perfil' },
      { method: 'irALogros', route: '/logros' },
    ];

    navigationTests.forEach(({ method, route }) => {
      it(`should navigate to ${route} and close menu on ${method}`, () => {
        component.isMenuOpen = true;
        (component as any)[method]();
        
        expect(component.isMenuOpen).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith([route]);
      });
    });
  });

  describe('cerrarSesion', () => {
    it('should show confirmation alert and logout on confirm', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        dismiss: jasmine.createSpy('dismiss')
      };

      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      loginServiceSpy.cerrarSesion.and.returnValue(Promise.resolve());

      component.isMenuOpen = true;
      await component.cerrarSesion();

      expect(component.isMenuOpen).toBe(false);
      expect(alertControllerSpy.create).toHaveBeenCalled();
      expect(mockAlert.present).toHaveBeenCalled();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      expect(alertConfig?.header).toBe('¿Cerrar Sesión?');
      expect(alertConfig?.buttons?.length).toBe(2);

      // Simular click en botón de confirmar
      const confirmButton = alertConfig?.buttons?.[1] as any;
      if (confirmButton?.handler) {
        await confirmButton.handler();
      }

      expect(loginServiceSpy.cerrarSesion).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle logout error', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };

      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      loginServiceSpy.cerrarSesion.and.returnValue(Promise.reject('Error'));
      spyOn(console, 'error');

      await component.cerrarSesion();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const confirmButton = alertConfig?.buttons?.[1] as any;
      
      if (confirmButton?.handler) {
        await confirmButton.handler();
      }

      expect(console.error).toHaveBeenCalledWith('Error al cerrar sesión:', 'Error');
    });

    it('should have cancel button with correct role', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };

      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
      await component.cerrarSesion();

      const alertConfig = alertControllerSpy.create.calls.mostRecent().args[0];
      const cancelButton = alertConfig?.buttons?.[0] as any;

      expect(cancelButton?.text).toBe('Cancelar');
      expect(cancelButton?.role).toBe('cancel');
    });
  });

  describe('getAvatarUrl', () => {
    it('should return foto if available', () => {
      component.usuario = { ...mockUser, foto: 'foto.png' };
      expect(component.getAvatarUrl()).toBe('foto.png');
    });

    it('should return avatar if foto is not available', () => {
      component.usuario = { ...mockUser, foto: '', avatar: 'avatar.png' };
      expect(component.getAvatarUrl()).toBe('avatar.png');
    });

    it('should return default avatar if neither foto nor avatar available', () => {
      component.usuario = { ...mockUser, foto: '', avatar: '' };
      expect(component.getAvatarUrl()).toBe('assets/img/avatares/default-avatar.png');
    });

    it('should return default avatar if usuario is null', () => {
      component.usuario = null;
      expect(component.getAvatarUrl()).toBe('assets/img/avatares/default-avatar.png');
    });
  });
});