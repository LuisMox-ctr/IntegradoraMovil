import { Component, OnInit } from '@angular/core';
import { Login } from 'src/app/services/login/login';
import { Router, ActivatedRoute } from '@angular/router';
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
  showPassword: boolean = false;
  
  // URL de retorno (si intentó acceder a una página protegida)
  private returnUrl: string = '/inicio';

  constructor(
    private loginService: Login, 
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Verificar si ya hay sesión activa
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
      return;
    }

    // Obtener la URL de retorno si existe
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
        console.log('Redirigirá a:', this.returnUrl);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

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
      
      // Redirigir a la página que intentaba acceder o al inicio
      this.router.navigateByUrl(this.returnUrl);
      
    } catch (error: any) {
      this.error = error.message;
      console.error('❌ Error:', error);
    } finally {
      this.loading = false;
    }
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

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
          handler: async (data) => {
            if (data.email) {
              await this.enviarRecuperacion(data.email);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async enviarRecuperacion(email: string) {
    const alert = await this.alertController.create({
      header: 'Email Enviado',
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      buttons: ['OK']
    });

    await alert.present();
  }

  async mostrarBienvenida(nombre: string) {
    const alert = await this.alertController.create({
      header: '¡Bienvenido!',
      message: `Hola ${nombre}, prepárate para sobrevivir en V Magma`,
      buttons: ['COMENZAR'],
      cssClass: 'welcome-alert'
    });

    await alert.present();
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}