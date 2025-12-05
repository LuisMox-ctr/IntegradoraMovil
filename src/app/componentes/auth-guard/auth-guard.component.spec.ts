import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
//import { AuthGuard, NoAuthGuard } from './auth.guard';
import { Login } from 'src/app/services/login/login';
import { AlertController } from '@ionic/angular';
import { NoAuthGuard, AuthGuardComponent } from './auth-guard.component';

describe('AuthGuard', () => {
  let guard: AuthGuardComponent;
  let loginServiceSpy: jasmine.SpyObj<Login>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  beforeEach(() => {
    const loginSpy = jasmine.createSpyObj('Login', ['isLoggedIn']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['createUrlTree']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuardComponent,
        { provide: Login, useValue: loginSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: AlertController, useValue: alertSpy }
      ]
    });

    guard = TestBed.inject(AuthGuardComponent);
    loginServiceSpy = TestBed.inject(Login) as jasmine.SpyObj<Login>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if user is logged in', () => {
    loginServiceSpy.isLoggedIn.and.returnValue(true);

    const result = guard.canActivate({} as any, {} as any);

    expect(result).toBe(true);
    expect(loginServiceSpy.isLoggedIn).toHaveBeenCalled();
  });

  it('should redirect to login if user is not logged in', () => {
    loginServiceSpy.isLoggedIn.and.returnValue(false);
    const mockUrlTree = { toString: () => '/login' } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);
    
    const mockAlert = { present: jasmine.createSpy('present') };
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

    const mockState = { url: '/perfil' } as any;
    const result = guard.canActivate({} as any, mockState);

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/perfil' }
    });
  });

  it('should show alert when access is denied', async () => {
    loginServiceSpy.isLoggedIn.and.returnValue(false);
    routerSpy.createUrlTree.and.returnValue({} as UrlTree);
    
    const mockAlert = { present: jasmine.createSpy('present') };
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

    guard.canActivate({} as any, { url: '/perfil' } as any);

    // Esperar a que se cree el alert
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(alertControllerSpy.create).toHaveBeenCalled();
  });
});

describe('NoAuthGuard', () => {
  let guard: NoAuthGuard;
  let loginServiceSpy: jasmine.SpyObj<Login>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const loginSpy = jasmine.createSpyObj('Login', ['isLoggedIn']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        NoAuthGuard,
        { provide: Login, useValue: loginSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    guard = TestBed.inject(NoAuthGuard);
    loginServiceSpy = TestBed.inject(Login) as jasmine.SpyObj<Login>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if user is NOT logged in', () => {
    loginServiceSpy.isLoggedIn.and.returnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(loginServiceSpy.isLoggedIn).toHaveBeenCalled();
  });

  it('should redirect to /inicio if user is logged in', () => {
    loginServiceSpy.isLoggedIn.and.returnValue(true);
    const mockUrlTree = { toString: () => '/inicio' } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);

    const result = guard.canActivate();

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/inicio']);
  });
});