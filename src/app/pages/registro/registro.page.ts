import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from 'src/app/services/login/login';
import { AlertController } from '@ionic/angular';

interface PasswordStrength {
  percentage: number;
  text: string;
  color: string;
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false
})
export class RegistroPage implements OnInit {
  
  // Variables del formulario
  nombre: string = '';
  apellidos: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  // Estados
  loading: boolean = false;
  error: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  aceptaTerminos: boolean = false;
  
  // Fortaleza de contraseña
  passwordStrength: PasswordStrength = {
    percentage: 0,
    text: '',
    color: '#999'
  };

  constructor(
    private loginService: Login,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Si ya hay sesión activa, redirigir
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }

  // Detectar cambios en la contraseña para calcular fortaleza
  ngDoCheck() {
    this.calcularFortalezaPassword();
  }

  // Toggle para mostrar/ocultar contraseña
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Toggle para mostrar/ocultar confirmación
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Calcular fortaleza de contraseña
  calcularFortalezaPassword() {
    if (!this.password) {
      this.passwordStrength = { percentage: 0, text: '', color: '#999' };
      return;
    }

    let strength = 0;
    
    // Longitud
    if (this.password.length >= 6) strength += 20;
    if (this.password.length >= 8) strength += 15;
    if (this.password.length >= 12) strength += 15;
    
    // Contiene números
    if (/\d/.test(this.password)) strength += 15;
    
    // Contiene minúsculas
    if (/[a-z]/.test(this.password)) strength += 15;
    
    // Contiene mayúsculas
    if (/[A-Z]/.test(this.password)) strength += 10;
    
    // Contiene símbolos
    if (/[^A-Za-z0-9]/.test(this.password)) strength += 10;

    // Determinar color y texto
    if (strength < 40) {
      this.passwordStrength = {
        percentage: strength,
        text: 'Débil',
        color: '#ff3333'
      };
    } else if (strength < 70) {
      this.passwordStrength = {
        percentage: strength,
        text: 'Media',
        color: '#ffaa00'
      };
    } else {
      this.passwordStrength = {
        percentage: strength,
        text: 'Fuerte',
        color: '#00ff00'
      };
    }
  }

  // Validar formulario
  validarFormulario(): boolean {
    return !!(
      this.nombre &&
      this.email &&
      this.password &&
      this.confirmPassword &&
      this.aceptaTerminos &&
      this.password.length >= 6
    );
  }

  // Registrar usuario
  async registrar() {
    this.error = '';

    // Validaciones
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.error = 'El formato del email no es válido';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (!this.aceptaTerminos) {
      this.error = 'Debes aceptar los términos y condiciones';
      return;
    }

    this.loading = true;

    try {
      // Registrar en Firebase
      const usuario = await this.loginService.registrar(
        this.email,
        this.password,
        this.nombre,
        this.apellidos,
        this.username
      );

      console.log('✅ Usuario registrado:', usuario);

      // Mostrar mensaje de bienvenida
      await this.mostrarBienvenida(usuario.nombre);

      // Redirigir al inicio
      this.router.navigate(['/inicio']);

    } catch (error: any) {
      this.error = error.message;
      console.error(' Error al registrar:', error);
    } finally {
      this.loading = false;
    }
  }

  // Volver a login
  volver() {
    this.router.navigate(['/login']);
  }

  // Ir a login
  irALogin() {
    this.router.navigate(['/login']);
  }

  // Ver términos y condiciones
  async verTerminos() {
    const alert = await this.alertController.create({
      header: 'Términos y Condiciones',
       message: `
1. ACEPTACIÓN DE TÉRMINOS
Al crear una cuenta, aceptas nuestros términos de uso.

2. USO DE DATOS
Tu información será utilizada únicamente para mejorar tu experiencia de juego.

3. COMPORTAMIENTO
Debes mantener un comportamiento respetuoso con otros jugadores.

4. PRIVACIDAD
Tus datos están protegidos según nuestras políticas de privacidad.

5. PROPIEDAD INTELECTUAL
Todo el contenido del juego es propiedad de V Magma.

6. MODIFICACIONES
Nos reservamos el derecho de modificar estos términos.

7. CONTACTO
soporte@vmagma.com
    `,
      buttons: ['Cerrar'],
      cssClass: 'terms-alert'
    });

    await alert.present();
  }

  // Mostrar mensaje de bienvenida
  async mostrarBienvenida(nombre: string) {
    const alert = await this.alertController.create({
      header: '¡Bienvenido a V Magma!',
      message: `
          Hola ${nombre}.
          Tu cuenta ha sido creada exitosamente.
      `,
      buttons: [
        {
          text: 'COMENZAR',
          cssClass: 'welcome-button'
        }
      ],
      cssClass: 'welcome-alert'
    });

    await alert.present();
  }

  // Validar formato de email
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}