import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonPopover, AlertController } from '@ionic/angular';
import { Login } from 'src/app/services/login/login';
import { Usuario } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  standalone: false
})
export class UserMenuComponent implements OnInit {

  @ViewChild('popover') popover!: IonPopover;
  
  usuario: Usuario | null = null;
  isMenuOpen = false;

  // Avatares predeterminados
  avataresPredeterminados = [
    { id: 1, url: 'assets/img/avatares/avatar1.png', nombre: 'Guerrero' },
    { id: 2, url: 'assets/img/avatares/avatar2.png', nombre: 'Explorador' },
    { id: 3, url: 'assets/img/avatares/avatar3.png', nombre: 'Mago' },
    { id: 4, url: 'assets/img/avatares/avatar4.png', nombre: 'Asesino' },
    { id: 5, url: 'assets/img/avatares/avatar5.png', nombre: 'Cazador' },
    { id: 6, url: 'assets/img/avatares/avatar6.png', nombre: 'Paladín' }
  ];

  constructor(
    private loginService: Login,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Suscribirse a cambios del usuario
    this.loginService.currentUser$.subscribe(user => {
      this.usuario = user;
    });
  }

  // Abrir menú
  abrirMenu(event: Event) {
    this.isMenuOpen = true;
    if (this.popover) {
      this.popover.event = event;
    }
  }

  // Cerrar menú
  cerrarMenu() {
    this.isMenuOpen = false;
  }

  // Ir al perfil
  irAPerfil() {
    this.cerrarMenu();
    this.router.navigate(['/perfil']);
  }

  // Ir a logros
  irALogros() {
    this.cerrarMenu();
    this.router.navigate(['/logros']);
  }

  // Ir a estadísticas
  irAEstadisticas() {
    this.cerrarMenu();
    this.router.navigate(['/estadisticas']);
  }

  // Ir a configuración
  irAConfiguracion() {
    this.cerrarMenu();
    this.router.navigate(['/configuracion']);
  }

  // Ir a comunidad
  irAComunidad() {
    this.cerrarMenu();
    this.router.navigate(['/comunidad']);
  }

  // Cerrar sesión
  async cerrarSesion() {
    this.cerrarMenu();

    const alert = await this.alertController.create({
      header: '¿Cerrar Sesión?',
      message: '¿Estás seguro de que deseas salir de V Magma?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: async () => {
            try {
              await this.loginService.cerrarSesion();
              this.router.navigate(['/login']);
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Obtener URL del avatar
  getAvatarUrl(): string {
    return this.usuario?.foto || 
           this.usuario?.avatar || 
           'assets/img/avatares/default-avatar.png';
  }
}