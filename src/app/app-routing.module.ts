import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LogrosPage } from './pages/logros/logros.page';
import { AuthGuardComponent, NoAuthGuard } from './componentes/auth-guard/auth-guard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/inicio-sesion/inicio-sesion.module').then( m => m.InicioSesionPageModule),
    canActivate: [NoAuthGuard]
  },
    {
    path: 'inicio-sesion',
    loadChildren: () => import('./pages/inicio-sesion/inicio-sesion.module').then( m => m.InicioSesionPageModule),
    canActivate: [NoAuthGuard]
  },
    {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule),
    canActivate: [NoAuthGuard]
  },
   {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule),
    canActivate: [AuthGuardComponent]

  },
  {
    path: 'logros',
    loadChildren: () => import('./pages/logros/logros.module').then( m => m.LogrosPageModule),
    component: LogrosPage,
    canActivate: [AuthGuardComponent]
  },

  {
    path: 'comunidad',
    loadChildren: () => import('./pages/comunidad/comunidad.module').then( m => m.ComunidadPageModule),
    canActivate: [AuthGuardComponent]
  },
  /* {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full'
  },*/

  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule),
    canActivate: [AuthGuardComponent]
  },
  {
    path: 'nosotros',
    loadChildren: () => import('./pages/nosotros/nosotros.module').then( m => m.NosotrosPageModule),
    canActivate: [AuthGuardComponent]
  },


];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
