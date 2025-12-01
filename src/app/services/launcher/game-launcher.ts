import { Injectable } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root'
})
export class GameLauncherService {

  // URL Scheme personalizado de tu juego
  // Ejemplo: vmagmagame://
  private readonly GAME_URL_SCHEME = 'vmagmagame://';
  
  // URLs de descarga del juego
  private readonly PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tuapp.vmagma';
  private readonly APP_STORE_URL = 'https://apps.apple.com/app/idTUAPP';

  constructor(
    private platform: Platform,
    private alertController: AlertController
  ) {}

  /**
   * Intenta abrir el juego con parámetros específicos
   * @param action - Acción a realizar en el juego (adventure, event, etc)
   * @param params - Parámetros adicionales
   */
  async launchGame(action: string, params?: any): Promise<void> {
    try {
      // Construir la URL con parámetros
      const gameUrl = this.buildGameUrl(action, params);
      
      // Intentar abrir el juego
      await this.openGame(gameUrl);
      
    } catch (error) {
      console.error('Error al abrir el juego:', error);
      // Si falla, mostrar diálogo de instalación
      await this.showInstallDialog();
    }
  }

  /**
   * Lanzar aventura desde el inicio
   */
  async launchAdventure(adventureId?: string): Promise<void> {
    const params = adventureId ? { id: adventureId } : {};
    await this.launchGame('adventure', params);
  }

  /**
   * Unirse a un evento
   */
  async joinEvent(eventId: string): Promise<void> {
    await this.launchGame('event', { id: eventId });
  }

  /**
   * Construir URL del juego con parámetros
   */
  private buildGameUrl(action: string, params?: any): string {
    let url = `${this.GAME_URL_SCHEME}${action}`;
    
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Intentar abrir el juego
   */
  private async openGame(gameUrl: string): Promise<void> {
    console.log('🎮 Intentando abrir:', gameUrl);
    
    // En dispositivos móviles reales
    if (this.platform.is('capacitor')) {
      try {
        // Intentar abrir con el URL scheme
        await Browser.open({ 
          url: gameUrl,
          presentationStyle: 'fullscreen'
        });
        
        // Esperar un momento para ver si se abrió
        await this.waitForAppOpen();
        
      } catch (error) {
        console.error('El juego no está instalado:', error);
        throw new Error('Game not installed');
      }
    } else {
      // En navegador web (para pruebas)
      console.warn('🌐 Modo web: El juego se abriría en la app móvil');
      await this.showInstallDialog();
    }
  }

  /**
   * Esperar para verificar si la app se abrió
   */
  private async waitForAppOpen(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: Game not opened'));
      }, 2000);

      // Si la app se abrió, este listener se dispara
      const listener = await App.addListener('appStateChange', (state) => {
        if (!state.isActive) {
          clearTimeout(timeout);
          listener.remove();
          resolve();
        }
      });
    });
  }

  /**
   * Mostrar diálogo de instalación
   */
  private async showInstallDialog(): Promise<void> {
    const alert = await this.alertController.create({
      header: '🎮 Juego No Instalado',
      message: 'Para jugar V Magma necesitas tener instalado el juego. ¿Deseas descargarlo ahora?',
      cssClass: 'game-install-alert',
      buttons: [
        {
          text: 'Ahora no',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: '📱 Descargar',
          cssClass: 'primary',
          handler: () => {
            this.openDownloadPage();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Abrir página de descarga según la plataforma
   */
  private async openDownloadPage(): Promise<void> {
    let downloadUrl = '';

    if (this.platform.is('android')) {
      downloadUrl = this.PLAY_STORE_URL;
    } else if (this.platform.is('ios')) {
      downloadUrl = this.APP_STORE_URL;
    } else {
      // Navegador web - mostrar opciones
      await this.showDownloadOptions();
      return;
    }

    // Abrir la tienda correspondiente
    await Browser.open({ 
      url: downloadUrl,
      presentationStyle: 'fullscreen'
    });
  }

  /**
   * Mostrar opciones de descarga en web
   */
  private async showDownloadOptions(): Promise<void> {
    const alert = await this.alertController.create({
      header: '📲 Descargar V Magma',
      message: 'Elige tu plataforma:',
      buttons: [
        {
          text: 'Android',
          handler: async () => {
            await Browser.open({ url: this.PLAY_STORE_URL });
          }
        },
        {
          text: 'iOS',
          handler: async () => {
            await Browser.open({ url: this.APP_STORE_URL });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  /**
   * Verificar si el juego está instalado
   */
  async isGameInstalled(): Promise<boolean> {
    if (!this.platform.is('capacitor')) {
      return false;
    }

    try {
      const gameUrl = this.buildGameUrl('check', {});
      await Browser.open({ url: gameUrl });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtener información de URL schemes para configuración
   */
  getGameUrlScheme(): string {
    return this.GAME_URL_SCHEME;
  }
}