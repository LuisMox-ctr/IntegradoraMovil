
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Login } from 'src/app/services/login/login';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardComponent implements CanActivate {

  constructor(
    private loginService: Login,
    private router: Router,
    private alertController: AlertController
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Verificar si el usuario está logueado
    if (this.loginService.isLoggedIn()) {
      // Usuario autenticado, permitir acceso
      return true;
    } else {
      // Usuario NO autenticado, mostrar alerta y redirigir
      this.mostrarAlertaNoAutenticado();
      
      // Redirigir al login
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url } // Guardar la URL a la que intentaba acceder
      });
    }
  }

  private async mostrarAlertaNoAutenticado() {
    const alert = await this.alertController.create({
      header: '🔒 Sesión Requerida',
      message: 'Debes iniciar sesión para acceder a esta sección',
      buttons: ['OK'],
      cssClass: 'auth-required-alert'
    });

    await alert.present();
  }
}

// ============================================
// GUARD INVERSO: Para Login y Registro
// Solo permite acceso si NO está logueado
// ============================================
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private loginService: Login,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    // Si está logueado, redirigir a inicio
    if (this.loginService.isLoggedIn()) {
      return this.router.createUrlTree(['/inicio']);
    }
    
    // Si no está logueado, permitir acceso al login/registro
    return true;
  }
}