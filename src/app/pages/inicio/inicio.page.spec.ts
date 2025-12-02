import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioPage } from './inicio.page';
import { ModalController } from '@ionic/angular';
import { GameLauncherService } from 'src/app/services/launcher/game-launcher';
import { DetalleComponent } from 'src/app/componentes/detalle/detalle.component';
import { DetalleHistoriaComponent } from 'src/app/componentes/detalle-historia/detalle-historia.component';

describe('InicioPage - 100% Coverage', () => {
  let component: InicioPage;
  let fixture: ComponentFixture<InicioPage>;
  let modalCtrlMock: any;
  let gameLauncherMock: any;
  let modalMock: any;

  beforeEach(async () => {
    // Mock del modal
    modalMock = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
    };

    // Mock de ModalController
    modalCtrlMock = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve(modalMock))
    };

    // Mock de GameLauncherService
    gameLauncherMock = {
      launchAdventure: jasmine.createSpy('launchAdventure').and.returnValue(Promise.resolve()),
      launchGame: jasmine.createSpy('launchGame').and.returnValue(Promise.resolve()),
      joinEvent: jasmine.createSpy('joinEvent').and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      declarations: [InicioPage],
      providers: [
        { provide: ModalController, useValue: modalCtrlMock },
        { provide: GameLauncherService, useValue: gameLauncherMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ========== BÁSICOS ==========
  it('✅ Debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('✅ Debe tener 4 personajes definidos', () => {
    expect(component.personajes.length).toBe(4);
  });

  it('✅ Debe tener personajes con estructura correcta', () => {
    const personaje = component.personajes[0];
    
    expect(personaje.id).toBeDefined();
    expect(personaje.nombre).toBeDefined();
    expect(personaje.rol).toBeDefined();
    expect(personaje.motivacion).toBeDefined();
    expect(personaje.estilo).toBeDefined();
    expect(personaje.icono).toBeDefined();
  });

  // ========== ngOnInit ==========
  describe('ngOnInit()', () => {
    it('✅ Debe ejecutarse sin errores', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  // ========== Datos de personajes ==========
  describe('Personajes', () => {
    it('✅ Debe tener a KENIG GALINDO como primer personaje', () => {
      const kenig = component.personajes[0];
      
      expect(kenig.id).toBe('kenig');
      expect(kenig.nombre).toBe('KENIG GALINDO');
      expect(kenig.rol).toBe('El Protagonista');
      expect(kenig.motivacion).toBe('Descubrir qué pasó con su raza');
      expect(kenig.estilo).toBe('Acción / Investigación');
      expect(kenig.icono).toBe('search-outline');
    });

    it('✅ Debe tener a JUAN CENA como segundo personaje', () => {
      const juan = component.personajes[1];
      
      expect(juan.id).toBe('juan');
      expect(juan.nombre).toBe('JUAN CENA');
      expect(juan.rol).toBe('El Luchador');
      expect(juan.motivacion).toBe('Encontrar los secretos del desastre');
      expect(juan.estilo).toBe('Fuerza / Decisiones Rápidas');
      expect(juan.icono).toBe('fitness-outline');
    });

    it('✅ Debe tener a SIGGY como tercer personaje', () => {
      const siggy = component.personajes[2];
      
      expect(siggy.id).toBe('siggy');
      expect(siggy.nombre).toBe('SIGGY');
      expect(siggy.rol).toBe('El Prisionero Fugado');
      expect(siggy.motivacion).toBe('Escapar de su pasado oscuro');
      expect(siggy.estilo).toBe('Supervivencia / Agresividad');
      expect(siggy.icono).toBe('alert-circle-outline');
    });

    it('✅ Debe tener a MOX como cuarto personaje', () => {
      const mox = component.personajes[3];
      
      expect(mox.id).toBe('mox');
      expect(mox.nombre).toBe('MOX');
      expect(mox.rol).toBe('El Simpson');
      expect(mox.motivacion).toBe('Salvar a todos los sobrevivientes');
      expect(mox.estilo).toBe('Tanque / Sacrificio');
      expect(mox.icono).toBe('medical-outline');
    });
  });

  // ========== comenzarAventura() ⭐ LÍNEA ROJA CUBIERTA ==========
  describe('comenzarAventura()', () => {
    it('✅ Debe lanzar la aventura del juego', async () => {
      await component.comenzarAventura();
      
      expect(gameLauncherMock.launchAdventure).toHaveBeenCalled();
    });

    it('✅ Debe manejar errores al lanzar aventura', async () => {
      const error = new Error('Error al lanzar juego');
      gameLauncherMock.launchAdventure.and.returnValue(Promise.reject(error));
      
      try {
        await component.comenzarAventura();
        fail('Debería haber lanzado un error');
      } catch (e) {
        expect(e).toEqual(error);
      }
    });

    it('✅ Debe llamar launchAdventure sin parámetros', async () => {
      await component.comenzarAventura();
      
      expect(gameLauncherMock.launchAdventure).toHaveBeenCalledWith();
    });
  });

  // ========== verDetalle() ==========
  describe('verDetalle()', () => {
    it('✅ Debe abrir modal de detalle con ID de personaje', async () => {
      const personajeId = 'kenig';
      
      await component.verDetalle(personajeId);
      
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetalleComponent,
        componentProps: { id: personajeId }
      });
      expect(modalMock.present).toHaveBeenCalled();
    });

    it('✅ Debe abrir modal para cada personaje', async () => {
      // Probar con kenig
      await component.verDetalle('kenig');
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetalleComponent,
        componentProps: { id: 'kenig' }
      });

      // Resetear spy
      modalCtrlMock.create.calls.reset();

      // Probar con juan
      await component.verDetalle('juan');
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetalleComponent,
        componentProps: { id: 'juan' }
      });
    });

    it('✅ Debe presentar el modal después de crearlo', async () => {
      await component.verDetalle('siggy');
      
      expect(modalMock.present).toHaveBeenCalled();
    });

    it('✅ Debe manejar error al crear modal', async () => {
      modalCtrlMock.create.and.returnValue(Promise.reject(new Error('Error modal')));
      
      try {
        await component.verDetalle('mox');
        fail('Debería haber lanzado un error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ========== verHistoria() ==========
  describe('verHistoria()', () => {
    it('✅ Debe abrir modal de historia', async () => {
      await component.verHistoria();
      
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetalleHistoriaComponent
      });
      expect(modalMock.present).toHaveBeenCalled();
    });

    it('✅ Debe crear modal sin componentProps', async () => {
      await component.verHistoria();
      
      const createCallArgs = modalCtrlMock.create.calls.mostRecent().args[0];
      expect(createCallArgs.componentProps).toBeUndefined();
    });

    it('✅ Debe presentar el modal de historia', async () => {
      await component.verHistoria();
      
      expect(modalMock.present).toHaveBeenCalled();
    });

    it('✅ Debe manejar error al abrir modal de historia', async () => {
      modalCtrlMock.create.and.returnValue(Promise.reject(new Error('Error historia')));
      
      try {
        await component.verHistoria();
        fail('Debería haber lanzado un error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ========== INTEGRACIÓN ==========
  describe('🎯 Integración completa', () => {
    it('✅ Flujo completo: Ver detalle de personaje → Comenzar aventura', async () => {
      // 1. Ver detalle de un personaje
      await component.verDetalle('kenig');
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetalleComponent,
        componentProps: { id: 'kenig' }
      });
      
      // 2. Comenzar aventura
      await component.comenzarAventura();
      expect(gameLauncherMock.launchAdventure).toHaveBeenCalled();
    });

    it('✅ Flujo completo: Ver historia → Comenzar aventura', async () => {
      // 1. Ver historia
      await component.verHistoria();
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetalleHistoriaComponent
      });
      
      // 2. Comenzar aventura
      await component.comenzarAventura();
      expect(gameLauncherMock.launchAdventure).toHaveBeenCalled();
    });

    it('✅ Debe poder ver detalles de múltiples personajes en secuencia', async () => {
      // Ver detalles de todos los personajes
      for (const personaje of component.personajes) {
        modalCtrlMock.create.calls.reset();
        modalMock.present.calls.reset();
        
        await component.verDetalle(personaje.id);
        
        expect(modalCtrlMock.create).toHaveBeenCalledWith({
          component: DetalleComponent,
          componentProps: { id: personaje.id }
        });
        expect(modalMock.present).toHaveBeenCalled();
      }
    });

    it('✅ Debe manejar múltiples llamadas a comenzarAventura', async () => {
      await component.comenzarAventura();
      await component.comenzarAventura();
      await component.comenzarAventura();
      
      expect(gameLauncherMock.launchAdventure).toHaveBeenCalledTimes(3);
    });
  });

  // ========== EDGE CASES ==========
  describe('⚠️ Casos extremos', () => {
    it('✅ Debe manejar ID de personaje vacío', async () => {
      await component.verDetalle('');
      
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetalleComponent,
        componentProps: { id: '' }
      });
    });

    it('✅ Debe manejar ID de personaje inexistente', async () => {
      await component.verDetalle('personaje-inexistente');
      
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetalleComponent,
        componentProps: { id: 'personaje-inexistente' }
      });
      expect(modalMock.present).toHaveBeenCalled();
    });

    it('✅ Debe funcionar si se llama a verHistoria múltiples veces', async () => {
      await component.verHistoria();
      
      modalCtrlMock.create.calls.reset();
      modalMock.present.calls.reset();
      
      await component.verHistoria();
      
      expect(modalCtrlMock.create).toHaveBeenCalledTimes(1);
      expect(modalMock.present).toHaveBeenCalledTimes(1);
    });
  });

  // ========== VALIDACIÓN DE ESTRUCTURA ==========
  describe('📋 Validación de estructura de datos', () => {
    it('✅ Todos los personajes deben tener IDs únicos', () => {
      const ids = component.personajes.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('✅ Todos los personajes deben tener iconos de Ionic válidos', () => {
      const iconosValidos = component.personajes.every(p => 
        p.icono && p.icono.includes('-outline')
      );
      
      expect(iconosValidos).toBeTrue();
    });

    it('✅ Todos los personajes deben tener nombres en mayúsculas', () => {
      const nombresMayusculas = component.personajes.every(p => 
        p.nombre === p.nombre.toUpperCase()
      );
      
      expect(nombresMayusculas).toBeTrue();
    });

    it('✅ Todos los roles deben comenzar con "El"', () => {
      const rolesValidos = component.personajes.every(p => 
        p.rol.startsWith('El ')
      );
      
      expect(rolesValidos).toBeTrue();
    });
  });
});