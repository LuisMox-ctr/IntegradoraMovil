import { Component, OnInit } from '@angular/core';
import { Login } from 'src/app/services/login/login';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.page.html',
  styleUrls: ['./inicio-sesion.page.scss'],
  standalone: false
})
export class InicioSesionPage implements OnInit {

  // Variables del formulario
  email: string = '';
  password: string = '';
  
  // Estados
  loading: boolean = false;
  error: string = '';
  showPassword: boolean = false;  // 👈 FALTABA ESTA PROPIEDAD

  constructor(
    private loginService: Login, 
    private router: Router,
    private alertController: AlertController  // 👈 AGREGADO para alertas
  ) {}

  ngOnInit() {
    // Verificar si ya hay sesión activa
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }

  // 👇 FALTABA ESTE MÉTODO
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Iniciar sesión (ya lo tenías, está bien)
  async iniciarSesion() {
    // Validaciones básicas
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.error = 'El formato del email no es válido';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const usuario = await this.loginService.autenticar(this.email, this.password);
      console.log('✅ Usuario logueado:', usuario);
      
      // Mostrar mensaje de bienvenida
      await this.mostrarBienvenida(usuario.nombre);
      
      // Redirigir a la página principal
      this.router.navigate(['/inicio']);
    } catch (error: any) {
      this.error = error.message;
      console.error('❌ Error:', error);
    } finally {
      this.loading = false;
    }
  }

  // 👇 FALTABA ESTE MÉTODO
  irARegistro() {
    this.router.navigate(['/registro']);
  }

  // 👇 FALTABA ESTE MÉTODO
  async recuperarPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Ingresa tu email para recibir instrucciones',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'correo@ejemplo.com',
          value: this.email
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (data.email) {
              this.enviarRecuperacion(data.email);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // 👇 MÉTODO AUXILIAR PARA RECUPERAR CONTRASEÑA
  async enviarRecuperacion(email: string) {
    // Aquí implementarías la lógica de Firebase para recuperar contraseña
    // import { sendPasswordResetEmail } from '@angular/fire/auth';
    // await sendPasswordResetEmail(auth, email);
    
    const alert = await this.alertController.create({
      header: 'Email Enviado',
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      buttons: ['OK']
    });

    await alert.present();
  }

  // 👇 MÉTODO PARA MOSTRAR BIENVENIDA
  async mostrarBienvenida(nombre: string) {
    const alert = await this.alertController.create({
      header: '¡Bienvenido!',
      message: `Hola ${nombre}, prepárate para sobrevivir en V Magma`,
      buttons: ['COMENZAR'],
      cssClass: 'welcome-alert'
    });

    await alert.present();
  }

  // 👇 VALIDAR FORMATO DE EMAIL
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}