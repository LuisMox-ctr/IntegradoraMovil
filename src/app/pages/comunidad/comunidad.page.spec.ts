import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComunidadPage } from './comunidad.page';
import { ComunidadService } from 'src/app/services/comunidad/comunidad';
import { GameLauncherService } from 'src/app/services/launcher/game-launcher';
import { of, throwError } from 'rxjs';
import { Usuario, Actividad, Evento } from 'src/app/interfaces/interfaces';

describe('ComunidadPage - 100% Coverage', () => {
  let component: ComunidadPage;
  let fixture: ComponentFixture<ComunidadPage>;
  let comunidadServiceMock: any;
  let gameLauncherMock: any;

  // Datos de prueba
  const mockUsuarios: Usuario[] = [
    {
      id: '1',
      nombre: 'Usuario1',
      nivel: 10,
      puntos: 1000,
      foto: 'assets/user1.png',
      logrosExpandidos: [
        { id: 'l1', titulo: 'Logro 1', icono: 'trophy' },
        { id: 'l2', titulo: 'Logro 2', icono: 'star' }
      ]
    } as any,
    {
      id: '2',
      nombre: 'Usuario2',
      nivel: 8,
      puntos: 800,
      foto: 'assets/user2.png',
      logrosExpandidos: []
    } as any
  ];

  const mockActividades: Actividad[] = [
    {
      id: 'a1',
      tipo: 'logro',
      jugador: 'usuario1',
      jugadorExpandido: { nombre: 'Usuario1', foto: 'assets/user1.png', avatar: 'assets/avatar1.png' },
      descripcion: 'Desbloqueó un logro',
      fecha: new Date(),
      logro: { titulo: 'Logro Especial', icono: 'trophy' }
    } as any,
    {
      id: 'a2',
      tipo: 'nivel',
      jugador: 'Usuario2',
      avatar: 'assets/user2.png',
      descripcion: 'Subió de nivel',
      fecha: new Date()
    } as any,
    {
      id: 'a3',
      tipo: 'social',
      jugadorExpandido: { nombre: 'Usuario3' },
      descripcion: 'Hizo un amigo',
      fecha: new Date()
    } as any
  ];

  const mockEventos: Evento[] = [
    {
      id: 'evt1',
      nombre: 'Torneo Especial',
      descripcion: 'Torneo semanal',
      fecha: new Date(),
      participantes: 10,
      imagen: 'assets/event1.png'
    } as any,
    {
      id: 'evt2',
      nombre: 'Desafío Diario',
      descripcion: 'Desafío del día',
      fecha: new Date(),
      participantes: 5,
      imagen: 'assets/event2.png'
    } as any
  ];

  beforeEach(async () => {
    // Mock de ComunidadService
    comunidadServiceMock = {
      getRanking: jasmine.createSpy('getRanking').and.returnValue(of(mockUsuarios)),
      getActividad: jasmine.createSpy('getActividad').and.returnValue(of(mockActividades)),
      getEventos: jasmine.createSpy('getEventos').and.returnValue(of(mockEventos)),
      desbloquearLogro: jasmine.createSpy('desbloquearLogro').and.returnValue(
        Promise.resolve({ mensaje: 'Logro desbloqueado' })
      )
    };

    // Mock de GameLauncherService
    gameLauncherMock = {
      joinEvent: jasmine.createSpy('joinEvent').and.returnValue(Promise.resolve()),
      isGameInstalled: jasmine.createSpy('isGameInstalled').and.returnValue(Promise.resolve(true)),
      launchGame: jasmine.createSpy('launchGame').and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      declarations: [ComunidadPage],
      providers: [
        { provide: ComunidadService, useValue: comunidadServiceMock },
        { provide: GameLauncherService, useValue: gameLauncherMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComunidadPage);
    component = fixture.componentInstance;
  });

  // ========== BÁSICOS ==========
  it('✅ Debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('✅ Debe inicializar con vista "ranking" por defecto', () => {
    expect(component.vistaActual).toBe('ranking');
  });

  // ========== ngOnInit ==========
  describe('ngOnInit()', () => {
    it('✅ Debe cargar datos al inicializar', () => {
      spyOn(component, 'cargarDatos');
      
      component.ngOnInit();
      
      expect(component.cargarDatos).toHaveBeenCalled();
    });
  });

  // ========== cargarDatos() ==========
  describe('cargarDatos()', () => {
    it('✅ Debe cargar ranking exitosamente', () => {
      const consoleSpy = spyOn(console, 'log');
      
      component.cargarDatos();
      
      expect(comunidadServiceMock.getRanking).toHaveBeenCalled();
      expect(component.ranking).toEqual(mockUsuarios);
      expect(consoleSpy).toHaveBeenCalledWith('Ranking cargado con logros:', mockUsuarios);
    });

    it('✅ Debe cargar actividad exitosamente', () => {
      const consoleSpy = spyOn(console, 'log');
      
      component.cargarDatos();
      
      expect(comunidadServiceMock.getActividad).toHaveBeenCalled();
      expect(component.actividadReciente).toEqual(mockActividades);
      expect(consoleSpy).toHaveBeenCalledWith('Actividad cargada:', mockActividades);
    });

    it('✅ Debe cargar eventos exitosamente', () => {
      const consoleSpy = spyOn(console, 'log');
      
      component.cargarDatos();
      
      expect(comunidadServiceMock.getEventos).toHaveBeenCalled();
      expect(component.eventos).toEqual(mockEventos);
      expect(consoleSpy).toHaveBeenCalledWith('Eventos cargados:', mockEventos);
    });

    it('✅ Debe manejar error al cargar ranking', () => {
      const errorSpy = spyOn(console, 'error');
      comunidadServiceMock.getRanking.and.returnValue(throwError(() => new Error('Error ranking')));
      
      component.cargarDatos();
      
      expect(errorSpy).toHaveBeenCalledWith('Error al cargar ranking:', jasmine.any(Error));
    });

    it('✅ Debe manejar error al cargar actividad', () => {
      const errorSpy = spyOn(console, 'error');
      comunidadServiceMock.getActividad.and.returnValue(throwError(() => new Error('Error actividad')));
      
      component.cargarDatos();
      
      expect(errorSpy).toHaveBeenCalledWith('Error al cargar actividad:', jasmine.any(Error));
    });

    it('✅ Debe manejar error al cargar eventos', () => {
      const errorSpy = spyOn(console, 'error');
      comunidadServiceMock.getEventos.and.returnValue(throwError(() => new Error('Error eventos')));
      
      component.cargarDatos();
      
      expect(errorSpy).toHaveBeenCalledWith('Error al cargar eventos:', jasmine.any(Error));
    });

    it('✅ Debe procesar logros de cada usuario en el ranking', () => {
      const consoleSpy = spyOn(console, 'log');
      
      component.cargarDatos();
      
      // Verificar que se procesaron los logros de cada usuario
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('Usuario1 tiene 2 logros'),
        jasmine.any(Array)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('Usuario2 tiene 0 logros'),
        jasmine.any(Array)
      );
    });
  });

  // ========== cambiarVista() ==========
  describe('cambiarVista()', () => {
    it('✅ Debe cambiar a vista "ranking"', () => {
      component.vistaActual = 'actividad';
      
      component.cambiarVista('ranking');
      
      expect(component.vistaActual).toBe('ranking');
    });

    it('✅ Debe cambiar a vista "actividad"', () => {
      component.cambiarVista('actividad');
      
      expect(component.vistaActual).toBe('actividad');
    });

    it('✅ Debe cambiar a vista "eventos"', () => {
      component.cambiarVista('eventos');
      
      expect(component.vistaActual).toBe('eventos');
    });
  });

  // ========== getIconoActividad() ==========
  describe('getIconoActividad()', () => {
    it('✅ Debe retornar icono "trophy" para tipo "logro"', () => {
      expect(component.getIconoActividad('logro')).toBe('trophy');
    });

    it('✅ Debe retornar icono "arrow-up-circle" para tipo "nivel"', () => {
      expect(component.getIconoActividad('nivel')).toBe('arrow-up-circle');
    });

    it('✅ Debe retornar icono "calendar" para tipo "evento"', () => {
      expect(component.getIconoActividad('evento')).toBe('calendar');
    });

    it('✅ Debe retornar icono "people" para tipo "social"', () => {
      expect(component.getIconoActividad('social')).toBe('people');
    });

    it('✅ Debe retornar icono por defecto para tipo desconocido', () => {
      expect(component.getIconoActividad('desconocido')).toBe('information-circle');
    });
  });

  // ========== getLogrosUsuario() ==========
  describe('getLogrosUsuario()', () => {
    it('✅ Debe retornar logros expandidos del usuario', () => {
      const usuario = mockUsuarios[0];
      
      const logros = component.getLogrosUsuario(usuario);
      
      expect(logros).toBeDefined();
      expect(logros.length).toBe(2);
      expect(logros[0]).toEqual({ id: 'l1', titulo: 'Logro 1', icono: 'trophy' });
      expect(logros[1]).toEqual({ id: 'l2', titulo: 'Logro 2', icono: 'star' });
    });

    it('✅ Debe retornar array vacío si no hay logros', () => {
      const usuario = { nombre: 'Test' };
      
      const logros = component.getLogrosUsuario(usuario);
      
      expect(logros).toEqual([]);
    });
  });

  // ========== contarLogrosReales() ==========
  describe('contarLogrosReales()', () => {
    it('✅ Debe contar logros correctamente', () => {
      const usuario = mockUsuarios[0];
      
      const count = component.contarLogrosReales(usuario);
      
      expect(count).toBe(2);
    });

    it('✅ Debe retornar 0 si no hay logros', () => {
      const usuario = mockUsuarios[1];
      
      const count = component.contarLogrosReales(usuario);
      
      expect(count).toBe(0);
    });

    it('✅ Debe retornar 0 si logrosExpandidos es undefined', () => {
      const usuario = { nombre: 'Test' };
      
      const count = component.contarLogrosReales(usuario);
      
      expect(count).toBe(0);
    });
  });

  // ========== getLogroIcono() ==========
  describe('getLogroIcono()', () => {
    it('✅ Debe retornar icono del logro', () => {
      const actividad = mockActividades[0];
      
      const icono = component.getLogroIcono(actividad);
      
      expect(icono).toBe('trophy');
    });

    it('✅ Debe retornar string vacío si no hay logro', () => {
      const actividad = { tipo: 'nivel' } as Actividad;
      
      const icono = component.getLogroIcono(actividad);
      
      expect(icono).toBe('');
    });
  });

  // ========== getLogroTitulo() ==========
  describe('getLogroTitulo()', () => {
    it('✅ Debe retornar título del logro', () => {
      const actividad = mockActividades[0];
      
      const titulo = component.getLogroTitulo(actividad);
      
      expect(titulo).toBe('Logro Especial');
    });

    it('✅ Debe retornar "Logro" por defecto si no hay título', () => {
      const actividad = { tipo: 'nivel' } as Actividad;
      
      const titulo = component.getLogroTitulo(actividad);
      
      expect(titulo).toBe('Logro');
    });
  });

  // ========== tieneLogro() ==========
  describe('tieneLogro()', () => {
    it('✅ Debe retornar true si tiene logro', () => {
      const actividad = mockActividades[0];
      
      expect(component.tieneLogro(actividad)).toBeTrue();
    });

    it('✅ Debe retornar false si no tiene logro', () => {
      const actividad = mockActividades[1];
      
      expect(component.tieneLogro(actividad)).toBeFalse();
    });
  });

  // ========== getNombreJugador() ==========
  describe('getNombreJugador()', () => {
    it('✅ Debe retornar nombre si jugador es string', () => {
      const actividad = mockActividades[1];
      
      const nombre = component.getNombreJugador(actividad);
      
      expect(nombre).toBe('Usuario2');
    });

    it('✅ Debe retornar nombre de jugadorExpandido', () => {
      const actividad = mockActividades[0];
      
      const nombre = component.getNombreJugador(actividad);
      
      expect(nombre).toBe('Usuario1');
    });

    it('✅ Debe retornar "Usuario" por defecto', () => {
      const actividad = { tipo: 'evento' };
      
      const nombre = component.getNombreJugador(actividad);
      
      expect(nombre).toBe('Usuario');
    });

    it('✅ Debe retornar "Usuario" si jugadorExpandido no tiene nombre', () => {
      const actividad = { jugadorExpandido: {} };
      
      const nombre = component.getNombreJugador(actividad);
      
      expect(nombre).toBe('Usuario');
    });
  });

  // ========== getAvatarJugador() ==========
  describe('getAvatarJugador()', () => {
    it('✅ Debe retornar avatar directo si existe', () => {
      const actividad = mockActividades[1];
      
      const avatar = component.getAvatarJugador(actividad);
      
      expect(avatar).toBe('assets/user2.png');
    });

    it('✅ Debe retornar foto de jugadorExpandido', () => {
      const actividad = mockActividades[0];
      
      const avatar = component.getAvatarJugador(actividad);
      
      expect(avatar).toBe('assets/user1.png');
    });

    it('✅ Debe retornar avatar de jugadorExpandido si no tiene foto', () => {
      const actividad = {
        jugadorExpandido: { avatar: 'assets/avatar.png' }
      };
      
      const avatar = component.getAvatarJugador(actividad);
      
      expect(avatar).toBe('assets/avatar.png');
    });

    it('✅ Debe retornar avatar por defecto', () => {
      const actividad = { tipo: 'evento' };
      
      const avatar = component.getAvatarJugador(actividad);
      
      expect(avatar).toBe('assets/default-avatar.png');
    });
  });

  // ========== unirseEvento() ⭐ COBERTURA DE LÍNEAS ROJAS ==========
  describe('unirseEvento()', () => {
    it('✅ Debe unirse al evento exitosamente', async () => {
      const evento = mockEventos[0];
      const consoleSpy = spyOn(console, 'log');
      
      await component.unirseEvento(evento);
      
      expect(consoleSpy).toHaveBeenCalledWith('🎮 Uniéndose al evento:', 'Torneo Especial');
      expect(gameLauncherMock.joinEvent).toHaveBeenCalledWith('evt1');
    });

    it('✅ Debe manejar evento sin ID', async () => {
      const eventoSinId = { nombre: 'Test' } as any;
      const errorSpy = spyOn(console, 'error');
      
      await component.unirseEvento(eventoSinId);
      
      expect(errorSpy).toHaveBeenCalledWith('Evento sin ID válido:', eventoSinId);
      expect(gameLauncherMock.joinEvent).not.toHaveBeenCalled();
    });

    it('✅ Debe manejar evento null', async () => {
      const errorSpy = spyOn(console, 'error');
      
      await component.unirseEvento(null as any);
      
      expect(errorSpy).toHaveBeenCalledWith('Evento sin ID válido:', null);
      expect(gameLauncherMock.joinEvent).not.toHaveBeenCalled();
    });

    it('✅ Debe manejar error al unirse al evento', async () => {
      const evento = mockEventos[0];
      const error = new Error('Error al lanzar juego');
      gameLauncherMock.joinEvent.and.returnValue(Promise.reject(error));
      const errorSpy = spyOn(console, 'error');
      
      await component.unirseEvento(evento);
      
      expect(errorSpy).toHaveBeenCalledWith('Error al unirse al evento:', error);
    });
  });

  // ========== verificarJuego() ⭐ COBERTURA DE LÍNEAS ROJAS ==========
  describe('verificarJuego()', () => {
    it('✅ Debe verificar si el juego está instalado (true)', async () => {
      const consoleSpy = spyOn(console, 'log');
      gameLauncherMock.isGameInstalled.and.returnValue(Promise.resolve(true));
      
      const resultado = await component.verificarJuego();
      
      expect(gameLauncherMock.isGameInstalled).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('¿Juego instalado?', true);
      expect(resultado).toBeTrue();
    });

    it('✅ Debe verificar si el juego NO está instalado (false)', async () => {
      const consoleSpy = spyOn(console, 'log');
      gameLauncherMock.isGameInstalled.and.returnValue(Promise.resolve(false));
      
      const resultado = await component.verificarJuego();
      
      expect(gameLauncherMock.isGameInstalled).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('¿Juego instalado?', false);
      expect(resultado).toBeFalse();
    });
  });

  // ========== probarDesbloqueo() ==========
  describe('probarDesbloqueo()', () => {
    it('✅ Debe desbloquear logro y mostrar alert', async () => {
      spyOn(window, 'alert');
      
      await component.probarDesbloqueo();
      
      expect(comunidadServiceMock.desbloquearLogro).toHaveBeenCalledWith(
        '2uNP9JjG40jJrgy3iraz',
        'wsE5ACux4A1JzoVRpU5c'
      );
      expect(window.alert).toHaveBeenCalledWith('Logro desbloqueado');
    });

    it('✅ Debe manejar error al desbloquear logro', async () => {
      comunidadServiceMock.desbloquearLogro.and.returnValue(
        Promise.reject(new Error('Error'))
      );
      
      try {
        await component.probarDesbloqueo();
        fail('Debería haber lanzado un error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ========== INTEGRACIÓN ==========
  describe('🎯 Integración completa', () => {
    it('✅ Flujo completo: Cargar datos → Cambiar vista → Unirse a evento', async () => {
      // 1. Cargar datos
      component.cargarDatos();
      
      expect(component.ranking.length).toBe(2);
      expect(component.eventos.length).toBe(2);
      
      // 2. Cambiar a vista eventos
      component.cambiarVista('eventos');
      expect(component.vistaActual).toBe('eventos');
      
      // 3. Unirse a un evento
      await component.unirseEvento(component.eventos[0]);
      expect(gameLauncherMock.joinEvent).toHaveBeenCalledWith('evt1');
    });

    it('✅ Debe procesar correctamente actividades con diferentes formatos de jugador', () => {
      component.cargarDatos();
      
      // Actividad con jugadorExpandido
      const nombre1 = component.getNombreJugador(component.actividadReciente[0]);
      expect(nombre1).toBe('Usuario1');
      
      // Actividad con jugador string
      const nombre2 = component.getNombreJugador(component.actividadReciente[1]);
      expect(nombre2).toBe('Usuario2');
      
      // Actividad con jugadorExpandido sin foto
      const avatar3 = component.getAvatarJugador(component.actividadReciente[2]);
      expect(avatar3).toBe('assets/default-avatar.png');
    });
  });
});