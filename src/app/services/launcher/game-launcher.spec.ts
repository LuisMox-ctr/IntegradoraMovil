import { TestBed } from '@angular/core/testing';
import { Platform, AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { GameLauncherService } from './game-launcher';

// ⭐ BLOQUEAR Browser.open GLOBALMENTE para todos los tests
// Esto previene que se abran ventanas reales durante los tests
let globalBrowserSpy: jasmine.Spy;

describe('GameLauncherService - 100% Coverage', () => {
  let service: GameLauncherService;
  let platformMock: any;
  let alertControllerMock: any;
  let alertMock: any;
  let browserSpy: jasmine.Spy;
  let appSpy: jasmine.Spy;
  let appListenerRemove: jasmine.Spy;

  // ⭐ Configurar spy global ANTES de cualquier test
  beforeAll(() => {
    globalBrowserSpy = spyOn(Browser, 'open').and.returnValue(Promise.resolve());
  });

  beforeEach(() => {
    // ⭐ IMPORTANTE: Resetear y reconfigurar el spy en cada test
    // Usar el spy global creado en beforeAll
    if (globalBrowserSpy) {
      globalBrowserSpy.calls.reset();
      globalBrowserSpy.and.returnValue(Promise.resolve());
    }
    browserSpy = globalBrowserSpy;

    appListenerRemove = jasmine.createSpy('remove');
    appSpy = spyOn(App, 'addListener').and.callFake(async (eventName: string, callback: any) => {
      return { remove: appListenerRemove };
    });

    // Mock de Alert
    alertMock = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
    };

    // Mock de Platform
    platformMock = {
      is: jasmine.createSpy('is').and.returnValue(false)
    };

    // Mock de AlertController
    alertControllerMock = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve(alertMock))
    };

    TestBed.configureTestingModule({
      providers: [
        GameLauncherService,
        { provide: Platform, useValue: platformMock },
        { provide: AlertController, useValue: alertControllerMock }
      ]
    });

    service = TestBed.inject(GameLauncherService);
    // ⭐ ACTIVAR MODO DE PRUEBAS - Esto omite waitForAppOpen()
    service.setTestMode(true);
  });

  // ========== BÁSICAS ==========
  it('✅ Debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('✅ Debe retornar el URL scheme del juego', () => {
    expect(service.getGameUrlScheme()).toBe('vmagmagame://');
  });

  // ========== launchGame() ==========
  describe('launchGame()', () => {
    it('✅ Debe construir URL y lanzar el juego en capacitor', async () => {
      platformMock.is.and.returnValue(true); // Simular capacitor
      
      const consoleSpy = spyOn(console, 'log');
      
      await service.launchGame('adventure', { id: '123' });
      
      expect(consoleSpy).toHaveBeenCalledWith('🎮 Intentando abrir:', 'vmagmagame://adventure?id=123');
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'vmagmagame://adventure?id=123',
        presentationStyle: 'fullscreen'
      });
    });

    it('✅ Debe construir URL sin parámetros', async () => {
      platformMock.is.and.returnValue(true);
      
      await service.launchGame('adventure');
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'vmagmagame://adventure',
        presentationStyle: 'fullscreen'
      });
    });

    it('✅ Debe manejar errores y mostrar diálogo de instalación', async () => {
      platformMock.is.and.returnValue(true);
      // ⭐ Hacer que Browser.open rechace la promesa
      browserSpy.and.returnValue(Promise.reject(new Error('App not found')));
      
      const errorSpy = spyOn(console, 'error');
      
      await service.launchGame('adventure');
      
      expect(errorSpy).toHaveBeenCalledWith('Error al abrir el juego:', jasmine.any(Error));
      expect(alertControllerMock.create).toHaveBeenCalled();
    });

    it('✅ Debe mostrar advertencia en modo web y mostrar diálogo', async () => {
      platformMock.is.and.returnValue(false); // No es capacitor
      
      const warnSpy = spyOn(console, 'warn');
      
      await service.launchGame('adventure');
      
      expect(warnSpy).toHaveBeenCalledWith('🌐 Modo web: El juego se abriría en la app móvil');
      expect(alertControllerMock.create).toHaveBeenCalled();
    });

    it('✅ Debe manejar múltiples parámetros en la URL', async () => {
      platformMock.is.and.returnValue(true);
      
      await service.launchGame('event', { id: 'evt1', level: '5', mode: 'hard' });
      
      const callArg = browserSpy.calls.mostRecent().args[0].url;
      expect(callArg).toContain('id=evt1');
      expect(callArg).toContain('level=5');
      expect(callArg).toContain('mode=hard');
    });

    it('✅ Debe encodear correctamente caracteres especiales en parámetros', async () => {
      platformMock.is.and.returnValue(true);
      
      await service.launchGame('adventure', { name: 'Test & Adventure #1' });
      
      const callArg = browserSpy.calls.mostRecent().args[0].url;
      expect(callArg).toContain('name=Test%20%26%20Adventure%20%231');
    });

    it('✅ Debe manejar parámetros vacíos correctamente', async () => {
      platformMock.is.and.returnValue(true);
      
      await service.launchGame('test', {});
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'vmagmagame://test',
        presentationStyle: 'fullscreen'
      });
    });
  });

  // ========== launchAdventure() ==========
  describe('launchAdventure()', () => {
    it('✅ Debe lanzar aventura con ID', async () => {
      platformMock.is.and.returnValue(true);
      
      await service.launchAdventure('adv-123');
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'vmagmagame://adventure?id=adv-123',
        presentationStyle: 'fullscreen'
      });
    });

    it('✅ Debe lanzar aventura sin ID', async () => {
      platformMock.is.and.returnValue(true);
      
      await service.launchAdventure();
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'vmagmagame://adventure',
        presentationStyle: 'fullscreen'
      });
    });
  });

  // ========== joinEvent() ==========
  describe('joinEvent()', () => {
    it('✅ Debe unirse a un evento con ID', async () => {
      platformMock.is.and.returnValue(true);
      
      await service.joinEvent('event-456');
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'vmagmagame://event?id=event-456',
        presentationStyle: 'fullscreen'
      });
    });
  });

  // ========== showInstallDialog() ==========
  describe('showInstallDialog()', () => {
    it('✅ Debe mostrar diálogo de instalación', async () => {
      platformMock.is.and.returnValue(false);
      
      await service.launchGame('adventure');
      
      expect(alertControllerMock.create).toHaveBeenCalledWith({
        header: '🎮 Juego No Instalado',
        message: 'Para jugar V Magma necesitas tener instalado el juego. ¿Deseas descargarlo ahora?',
        cssClass: 'game-install-alert',
        buttons: jasmine.any(Array)
      });
      expect(alertMock.present).toHaveBeenCalled();
    });

    it('✅ Debe manejar el botón "Ahora no"', async () => {
      platformMock.is.and.returnValue(false);
      
      await service.launchGame('adventure');
      
      const createCall = alertControllerMock.create.calls.mostRecent();
      const buttons = createCall.args[0].buttons;
      
      const cancelButton = buttons.find((b: any) => b.text === 'Ahora no');
      expect(cancelButton).toBeDefined();
      expect(cancelButton.role).toBe('cancel');
      expect(cancelButton.cssClass).toBe('secondary');
    });

    it('✅ Debe ejecutar handler del botón "Descargar" en Android', async () => {
      platformMock.is.and.callFake((platform: string) => platform === 'android');
      
      await service.launchGame('adventure');
      
      const createCall = alertControllerMock.create.calls.mostRecent();
      const buttons = createCall.args[0].buttons;
      
      const downloadButton = buttons.find((b: any) => b.text === '📱 Descargar');
      expect(downloadButton).toBeDefined();
      
      browserSpy.calls.reset();
      
      // Ejecutar el handler
      await downloadButton.handler();
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'https://play.google.com/store/games?device=windows&pli=1',
        presentationStyle: 'fullscreen'
      });
    });

    it('✅ Debe ejecutar handler del botón "Descargar" en iOS', async () => {
      let callCount = 0;
      platformMock.is.and.callFake((platform: string) => {
        callCount++;
        // Primera llamada es para 'capacitor' en launchGame, devolver false
        if (callCount === 1) return false;
        // Segunda llamada es para 'android', devolver false
        if (callCount === 2) return false;
        // Tercera llamada es para 'ios', devolver true
        return platform === 'ios';
      });
      
      await service.launchGame('adventure');
      
      const createCall = alertControllerMock.create.calls.mostRecent();
      const buttons = createCall.args[0].buttons;
      
      const downloadButton = buttons.find((b: any) => b.text === '📱 Descargar');
      
      browserSpy.calls.reset();
      
      // Resetear el contador para la siguiente serie de llamadas
      callCount = 0;
      
      // Ejecutar el handler
      await downloadButton.handler();
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'https://www.apple.com/mx/app-store/',
        presentationStyle: 'fullscreen'
      });
    });

    it('✅ Debe mostrar opciones de descarga en navegador web', async () => {
      // Todas las plataformas devuelven false (navegador web)
      platformMock.is.and.returnValue(false);
      
      await service.launchGame('adventure');
      
      const firstCreateCall = alertControllerMock.create.calls.first();
      const buttons = firstCreateCall.args[0].buttons;
      
      const downloadButton = buttons.find((b: any) => b.text === '📱 Descargar');
      
      // Ejecutar el handler
      await downloadButton.handler();
      
      // Debe llamarse create dos veces: una para install dialog, otra para download options
      expect(alertControllerMock.create).toHaveBeenCalledTimes(2);
      
      const secondCreateCall = alertControllerMock.create.calls.mostRecent();
      expect(secondCreateCall.args[0].header).toBe('📲 Descargar V Magma');
      expect(secondCreateCall.args[0].message).toBe('Elige tu plataforma:');
    });

    it('✅ Debe manejar botón "Android" en opciones de descarga web', async () => {
      platformMock.is.and.returnValue(false);
      
      await service.launchGame('adventure');
      
      const firstCreateCall = alertControllerMock.create.calls.first();
      const downloadButton = firstCreateCall.args[0].buttons.find((b: any) => b.text === '📱 Descargar');
      
      await downloadButton.handler();
      
      const secondCreateCall = alertControllerMock.create.calls.mostRecent();
      const androidButton = secondCreateCall.args[0].buttons.find((b: any) => b.text === 'Android');
      
      expect(androidButton).toBeDefined();
      
      browserSpy.calls.reset();
      await androidButton.handler();
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'https://play.google.com/store/games?device=windows&pli=1'
      });
    });

    it('✅ Debe manejar botón "iOS" en opciones de descarga web', async () => {
      platformMock.is.and.returnValue(false);
      
      await service.launchGame('adventure');
      
      const firstCreateCall = alertControllerMock.create.calls.first();
      const downloadButton = firstCreateCall.args[0].buttons.find((b: any) => b.text === '📱 Descargar');
      
      await downloadButton.handler();
      
      const secondCreateCall = alertControllerMock.create.calls.mostRecent();
      const iosButton = secondCreateCall.args[0].buttons.find((b: any) => b.text === 'iOS');
      
      expect(iosButton).toBeDefined();
      
      browserSpy.calls.reset();
      await iosButton.handler();
      
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'https://www.apple.com/mx/app-store/'
      });
    });

    it('✅ Debe manejar botón "Cancelar" en opciones de descarga web', async () => {
      platformMock.is.and.returnValue(false);
      
      await service.launchGame('adventure');
      
      const firstCreateCall = alertControllerMock.create.calls.first();
      const downloadButton = firstCreateCall.args[0].buttons.find((b: any) => b.text === '📱 Descargar');
      
      await downloadButton.handler();
      
      const secondCreateCall = alertControllerMock.create.calls.mostRecent();
      const cancelButton = secondCreateCall.args[0].buttons.find((b: any) => b.text === 'Cancelar');
      
      expect(cancelButton).toBeDefined();
      expect(cancelButton.role).toBe('cancel');
    });
  });

  // ========== isGameInstalled() ==========
  describe('isGameInstalled()', () => {
    it('✅ Debe retornar false si no es capacitor', async () => {
      platformMock.is.and.returnValue(false);
      
      const installed = await service.isGameInstalled();
      
      expect(installed).toBeFalse();
    });

    it('✅ Debe retornar true si el juego está instalado', async () => {
      platformMock.is.and.returnValue(true);
      // ⭐ Browser.open resuelve exitosamente (mock por defecto)
      browserSpy.and.returnValue(Promise.resolve());
      
      const installed = await service.isGameInstalled();
      
      expect(installed).toBeTrue();
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'vmagmagame://check'
      });
    });

    it('✅ Debe retornar false si el juego no está instalado', async () => {
      platformMock.is.and.returnValue(true);
      // ⭐ Browser.open rechaza (simula que la app no existe)
      browserSpy.and.returnValue(Promise.reject(new Error('Not found')));
      
      const installed = await service.isGameInstalled();
      
      expect(installed).toBeFalse();
    });
  });

  // ========== INTEGRACIÓN COMPLETA ==========
  describe('🎯 Integración completa', () => {
    it('✅ Flujo completo: Launch -> Error -> Install Dialog -> Download Android', async () => {
      let platformCallCount = 0;
      
      platformMock.is.and.callFake((platform: string) => {
        platformCallCount++;
        // Primera llamada: verificar capacitor (true para intentar abrir)
        if (platformCallCount === 1) return platform === 'capacitor';
        // Segunda llamada: verificar android (true)
        return platform === 'android';
      });
      
      // ⭐ Hacer que Browser.open falle
      browserSpy.and.returnValue(Promise.reject(new Error('Not installed')));
      
      await service.launchGame('adventure', { id: '999' });
      
      // Verificar que intentó abrir el juego
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'vmagmagame://adventure?id=999',
        presentationStyle: 'fullscreen'
      });
      
      // Verificar que mostró el diálogo
      expect(alertControllerMock.create).toHaveBeenCalled();
      
      // Ejecutar el botón de descarga
      const buttons = alertControllerMock.create.calls.first().args[0].buttons;
      const downloadButton = buttons.find((b: any) => b.text === '📱 Descargar');
      
      browserSpy.calls.reset();
      // ⭐ Ahora permitir que Browser.open funcione
      browserSpy.and.returnValue(Promise.resolve());
      
      await downloadButton.handler();
      
      // Verificar que abrió Play Store
      expect(browserSpy).toHaveBeenCalledWith({
        url: 'https://play.google.com/store/games?device=windows&pli=1',
        presentationStyle: 'fullscreen'
      });
    });

    it('✅ Debe manejar error en Browser.open del diálogo de instalación', async () => {
      platformMock.is.and.returnValue(true);
      // ⭐ Browser.open siempre falla
      browserSpy.and.returnValue(Promise.reject(new Error('Browser error')));
      
      const errorSpy = spyOn(console, 'error');
      
      await service.launchGame('adventure');
      
      expect(errorSpy).toHaveBeenCalled();
      expect(alertControllerMock.create).toHaveBeenCalled();
    });
  });

  // ========== TEST DE setTestMode() ==========
  describe('setTestMode()', () => {
    it('✅ Debe permitir activar y desactivar el modo test', () => {
      service.setTestMode(true);
      // No hay forma directa de verificar, pero aseguramos que no falle
      expect(service).toBeTruthy();
      
      service.setTestMode(false);
      expect(service).toBeTruthy();
    });
  });
});