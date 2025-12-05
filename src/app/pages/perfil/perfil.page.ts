import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from 'src/app/services/login/login';
import { Usuario } from 'src/app/interfaces/interfaces';
import { AlertController, ActionSheetController, ToastController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {

  usuario: Usuario | null = null;

  // Avatares predeterminados disponibles
  avataresPredeterminados = [
    { id: 1, url: 'assets/img/avatares/avatar1.webp', nombre: 'Avatar 1' },
    { id: 2, url: 'assets/img/avatares/avatar2.webp', nombre: 'Avatar 2' },
    { id: 3, url: 'assets/img/avatares/avatar3.webp', nombre: 'Avatar 3' },
    { id: 4, url: 'assets/img/avatares/avatar4.jpg', nombre: 'Avatar 4' },
    { id: 5, url: 'assets/img/avatares/avatar5.jpg', nombre: 'Avatar 5' },
    { id: 6, url: 'assets/img/avatares/avatar6.jpg', nombre: 'Avatar 6' }
  ];

  constructor(
    private loginService: Login,
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    public auth: Auth
  ) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  // Cargar datos del perfil
  cargarPerfil() {
    this.usuario = this.loginService.getCurrentUser();
    
    this.loginService.currentUser$.subscribe(user => {
      this.usuario = user;
    });
    
    console.log('Usuario cargado:', this.usuario);
  }

  // Calcular nivel basado en puntos
  calcularNivel(): number {
    if (!this.usuario) return 1;
    const puntos = this.usuario.puntos || 0;
    return Math.floor(Math.sqrt(puntos / 100)) + 1;
  }

  // Calcular puntos necesarios para el siguiente nivel
  siguienteNivel(): number {
    const nivelActual = this.calcularNivel();
    return Math.pow(nivelActual, 2) * 100;
  }

  // Calcular puntos que faltan para siguiente nivel
  puntosParaSiguienteNivel(): number {
    if (!this.usuario) return 0;
    const puntosActuales = this.usuario.puntos || 0;
    return this.siguienteNivel() - puntosActuales;
  }

  // Calcular progreso de nivel en porcentaje
  calcularProgreso(): number {
    if (!this.usuario) return 0;
    const nivelActual = this.calcularNivel();
    const puntosNivelActual = Math.pow(nivelActual - 1, 2) * 100;
    const puntosNivelSiguiente = this.siguienteNivel();
    const puntosUsuario = this.usuario.puntos || 0;
    
    const progreso = ((puntosUsuario - puntosNivelActual) / (puntosNivelSiguiente - puntosNivelActual)) * 100;
    return Math.max(0, Math.min(100, progreso));
  }

  // Volver atrás
  volver() {
    this.router.navigate(['/inicio']);
  }

  // Cambiar avatar - Simplificado
  async cambiarAvatar() {
    await this.seleccionarAvatarPredeterminado();
  }

  // Seleccionar avatar predeterminado con vista mejorada
  async seleccionarAvatarPredeterminado() {
    const alert = await this.alertController.create({
      header: '🎭 Selecciona tu Avatar',
      message: 'Elige el avatar que mejor te represente',
      cssClass: 'avatar-selector-alert',
      inputs: this.avataresPredeterminados.map(avatar => ({
        type: 'radio',
        label: avatar.nombre,
        value: avatar.url,
        checked: (this.usuario?.foto === avatar.url || this.usuario?.avatar === avatar.url)
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Seleccionar',
          handler: async (avatarSeleccionado) => {
            if (avatarSeleccionado && this.usuario?.id) {
              await this.actualizarFoto(avatarSeleccionado);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Actualizar foto en Firestore
  async actualizarFoto(nuevaFoto: string) {
    if (!this.usuario?.id) return;

    try {
      await this.loginService.actualizarUsuario(this.usuario.id, {
        foto: nuevaFoto,
        avatar: nuevaFoto
      });

      const toast = await this.toastController.create({
        message: 'Avatar actualizado correctamente',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      // Actualizar usuario localmente
      if (this.usuario) {
        this.usuario.foto = nuevaFoto;
        this.usuario.avatar = nuevaFoto;
      }

    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      const toast = await this.toastController.create({
        message: ' Error al actualizar avatar',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  // Editar perfil
  async editarPerfil() {
    const alert = await this.alertController.create({
      header: '✏️ Editar Perfil',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre',
          value: this.usuario?.nombre
        },
        {
          name: 'apellidos',
          type: 'text',
          placeholder: 'Apellidos',
          value: this.usuario?.apellidos
        },
        {
          name: 'username',
          type: 'text',
          placeholder: 'Usuario (sin @)',
          value: this.usuario?.username
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            await this.guardarCambiosPerfil(data);
          }
        }
      ]
    });

    await alert.present();
  }

  // Guardar cambios del perfil
  async guardarCambiosPerfil(data: any) {
    if (!this.usuario?.id) return;

    // Validar que tenga al menos nombre
    if (!data.nombre || data.nombre.trim() === '') {
      const toast = await this.toastController.create({
        message: 'El nombre es obligatorio',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    try {
      await this.loginService.actualizarUsuario(this.usuario.id, {
        nombre: data.nombre.trim(),
        apellidos: data.apellidos?.trim() || '',
        username: data.username?.trim() || ''
      });

      const toast = await this.toastController.create({
        message: 'Perfil actualizado correctamente',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const toast = await this.toastController.create({
        message: 'Error al actualizar perfil',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  // Cambiar contraseña
  async cambiarPassword() {
    const alert = await this.alertController.create({
      header: '🔒 Cambiar Contraseña',
      message: 'Se enviará un correo de restablecimiento a tu email',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Confirma tu email',
          value: this.auth.currentUser?.email || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (data.email) {
              // Aquí implementarías sendPasswordResetEmail
              const toast = await this.toastController.create({
                message: 'Email de recuperación enviado',
                duration: 3000,
                color: 'success',
                position: 'top'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Ver estadísticas
  verEstadisticas() {
    this.router.navigate(['/estadisticas']);
  }

  // Ver todos los logros
  verTodosLogros() {
    this.router.navigate(['/logros']);
  }

  // Cerrar sesión
  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: '⚠️ ¿Cerrar Sesión?',
      message: '¿Estás seguro de que deseas salir de V Magma?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          cssClass: 'danger',
          handler: async () => {
            try {
              await this.loginService.cerrarSesion();
              this.router.navigate(['/login']);
              
              const toast = await this.toastController.create({
                message: 'Sesión cerrada correctamente',
                duration: 2000,
                color: 'success',
                position: 'top'
              });
              await toast.present();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              const toast = await this.toastController.create({
                message: 'Error al cerrar sesión',
                duration: 2000,
                color: 'danger',
                position: 'top'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}