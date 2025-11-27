// ============================================
// comunidad.page.spec.ts - OPTIMIZADO 100%
// ============================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ComunidadPage } from './comunidad.page';
import { ComunidadService } from 'src/app/services/comunidad';
import { Usuario, Actividad, Evento } from 'src/app/interfaces/interfaces';
import { Firestore } from '@angular/fire/firestore';

describe('ComunidadPage - Optimizado', () => {
  let component: ComunidadPage;
  let fixture: ComponentFixture<ComunidadPage>;
  let service: any;

  const mockRanking: Usuario[] = [
    { 
      id: '1', nombre: 'Luis', puntos: 100, logrosCompletados: 3, 
      avatar: 'img1.png', 
      logrosExpandidos: [{ titulo: 'Logro1', puntos: 50 }, { titulo: 'Logro2', puntos: 50 }] 
    },
    { id: '2', nombre: 'Ana García', puntos: 50, logrosCompletados: 1, avatar: 'ana-foto.png', logrosExpandidos: [] }
  ] as any;

  const mockActividad: Actividad[] = [
    {
      id: 'A1', jugador: 'Luis', tipo: 'logro', descripcion: 'Ganó logro', tiempo: 'hace 5 min',
      avatar: 'img1.png', logro: { id: 'L1', titulo: 'Maestro', icono: 'icon.png', categoria: 'X', puntos: 20, descripcion: '' }
    },
    {
      id: 'A2', jugador: 'Ana García', tipo: 'nivel', descripcion: 'Subió de nivel', tiempo: 'hace 10 min',
      avatar: 'ana-foto.png', jugadorExpandido: { nombre: 'Ana García', foto: 'ana-foto.png' }
    }
  ] as any;

  const mockEventos: Evento[] = [
    { id: 'E1', nombre: 'Copa', descripcion: 'Torneo', tipo: 'Torneo', fecha: 'hoy', recompensa: '100', participantes: 10, icono: 'event.png' }
  ];

  beforeEach(async () => {
    service = {
      getRanking: jasmine.createSpy().and.returnValue(of(mockRanking)),
      getActividad: jasmine.createSpy().and.returnValue(of(mockActividad)),
      getEventos: jasmine.createSpy().and.returnValue(of(mockEventos)),
      desbloquearLogro: jasmine.createSpy().and.returnValue(Promise.resolve({ 
        success: true, mensaje: '¡Logro desbloqueado! +100 puntos', puntos: 100
      }))
    };

    await TestBed.configureTestingModule({
      declarations: [ComunidadPage],
      providers: [
        { provide: ComunidadService, useValue: service },
        { provide: Firestore, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComunidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ========== BÁSICAS ==========
  it(' Debe crear con vista ranking e inicializar arrays vacíos', () => {
    const newComp = new ComunidadPage(service);
    expect(component).toBeTruthy();
    expect(component.vistaActual).toBe('ranking');
    expect(newComp.ranking).toEqual([]);
    expect(newComp.actividadReciente).toEqual([]);
    expect(newComp.eventos).toEqual([]);
  });

  it(' ngOnInit debe llamar cargarDatos', () => {
    spyOn(component, 'cargarDatos');
    component.ngOnInit();
    expect(component.cargarDatos).toHaveBeenCalled();
  });

  // ========== cargarDatos() ==========
  describe('cargarDatos()', () => {
    it(' Debe cargar ranking, actividad y eventos con console.logs', () => {
      const spy = spyOn(console, 'log');
      
      expect(component.ranking.length).toBe(2);
      expect(component.ranking[0].nombre).toBe('Luis');
      expect(component.actividadReciente.length).toBe(2);
      expect(component.eventos.length).toBe(1);
      
      component.cargarDatos();
      expect(spy).toHaveBeenCalledWith('Ranking cargado con logros:', jasmine.any(Array));
      expect(spy).toHaveBeenCalledWith(jasmine.stringContaining('tiene'), jasmine.any(Array));
      expect(spy).toHaveBeenCalledWith('Actividad cargada:', jasmine.any(Array));
      expect(spy).toHaveBeenCalledWith('Eventos cargados:', jasmine.any(Array));
    });

    it(' Debe manejar errores en ranking, actividad y eventos', () => {
      const errorSpy = spyOn(console, 'error');
      
      ['getRanking', 'getActividad', 'getEventos'].forEach(method => {
        service[method].and.returnValue(throwError(() => new Error(`Error ${method}`)));
        component.cargarDatos();
        expect(errorSpy).toHaveBeenCalledWith(jasmine.stringContaining('Error'), jasmine.any(Error));
      });
    });

    it(' Debe continuar si un servicio falla', () => {
      service.getRanking.and.returnValue(throwError(() => new Error('Error')));
      component.cargarDatos();
      expect(component.actividadReciente.length).toBe(2);
    });
  });

  // ========== cambiarVista() ==========
  it(' Debe cambiar entre vistas: ranking, actividad, eventos', () => {
    ['ranking', 'actividad', 'eventos'].forEach(vista => {
      component.cambiarVista(vista as any);
      expect(component.vistaActual).toBe(vista);
    });
  });

  // ========== getIconoActividad() ==========
  it(' Debe retornar iconos correctos por tipo', () => {
    const casos = [
      ['logro', 'trophy'], ['nivel', 'arrow-up-circle'], 
      ['evento', 'calendar'], ['social', 'people'],
      ['otro', 'information-circle'], ['', 'information-circle']
    ];
    casos.forEach(([tipo, icono]) => {
      expect(component.getIconoActividad(tipo)).toBe(icono);
    });
  });

  // ========== getLogrosUsuario() & contarLogrosReales() ==========
  it(' Debe obtener y contar logros expandidos', () => {
    expect(component.getLogrosUsuario(mockRanking[0]).length).toBe(2);
    expect(component.getLogrosUsuario(mockRanking[1]).length).toBe(0);
    expect(component.getLogrosUsuario({ nombre: 'Test' }).length).toBe(0);
    
    expect(component.contarLogrosReales(mockRanking[0])).toBe(2);
    expect(component.contarLogrosReales(mockRanking[1])).toBe(0);
    expect(component.contarLogrosReales({ logrosExpandidos: null })).toBe(0);
    expect(component.contarLogrosReales({})).toBe(0);
  });

  // ========== getLogroIcono() & getLogroTitulo() ==========
  it(' Debe obtener icono y título del logro', () => {
    expect(component.getLogroIcono(mockActividad[0])).toBe('icon.png');
    expect(component.getLogroIcono({ logro: null } as any)).toBe('');
    expect(component.getLogroIcono({ logro: {} } as any)).toBe('');
    
    expect(component.getLogroTitulo(mockActividad[0])).toBe('Maestro');
    expect(component.getLogroTitulo({ logro: null } as any)).toBe('Logro');
    expect(component.getLogroTitulo({ logro: {} } as any)).toBe('Logro');
  });

  // ========== tieneLogro() ==========
  it(' Debe verificar si actividad tiene logro', () => {
    expect(component.tieneLogro(mockActividad[0])).toBeTrue();
    expect(component.tieneLogro({ logro: null } as any)).toBeFalse();
    expect(component.tieneLogro({} as any)).toBeFalse();
    expect(component.tieneLogro({ logro: {} } as any)).toBeTrue();
  });

  // ========== getNombreJugador() ==========
  it(' Debe obtener nombre del jugador', () => {
    expect(component.getNombreJugador({ jugador: 'Luis' })).toBe('Luis');
    expect(component.getNombreJugador(mockActividad[1])).toBe('Ana García');
    expect(component.getNombreJugador({ jugador: {}, jugadorExpandido: {} })).toBe('Usuario');
    expect(component.getNombreJugador({ jugador: {} })).toBe('Usuario');
    expect(component.getNombreJugador({ jugador: { id: '123' } })).toBe('Usuario');
  });

  // ========== getAvatarJugador() ==========
  it(' Debe obtener avatar del jugador con prioridades', () => {
    expect(component.getAvatarJugador({ avatar: 'avatar.png' })).toBe('avatar.png');
    expect(component.getAvatarJugador(mockActividad[1])).toBe('ana-foto.png');
    expect(component.getAvatarJugador({ jugadorExpandido: { avatar: 'avatar-expandido.png' } })).toBe('avatar-expandido.png');
    expect(component.getAvatarJugador({})).toBe('assets/default-avatar.png');
    expect(component.getAvatarJugador({ avatar: null })).toBe('assets/default-avatar.png');
    expect(component.getAvatarJugador({ avatar: 'directo.png', jugadorExpandido: { foto: 'expandido.png' } })).toBe('directo.png');
  });

  // ========== probarDesbloqueo() ==========
  describe('probarDesbloqueo()', () => {
    it(' Debe desbloquear logro y mostrar mensaje', async () => {
      const alertSpy = spyOn(window, 'alert');
      await component.probarDesbloqueo();
      
      expect(service.desbloquearLogro).toHaveBeenCalledWith('2uNP9JjG40jJrgy3iraz', 'wsE5ACux4A1JzoVRpU5c');
      expect(alertSpy).toHaveBeenCalledWith('¡Logro desbloqueado! +100 puntos');
    });

    it(' Debe manejar respuestas exitosas y errores', async () => {
      const alertSpy = spyOn(window, 'alert');
      
      service.desbloquearLogro.and.returnValue(Promise.resolve({ success: true, mensaje: '¡Éxito!', puntos: 250 }));
      await component.probarDesbloqueo();
      expect(alertSpy).toHaveBeenCalledWith('¡Éxito!');
      
      service.desbloquearLogro.and.returnValue(Promise.resolve({ success: false, mensaje: 'Logro ya desbloqueado' }));
      await component.probarDesbloqueo();
      expect(alertSpy).toHaveBeenCalledWith('Logro ya desbloqueado');
    });
  });

  // ========== INTEGRACIÓN ==========
  it(' Integración: debe procesar usuarios, actividades y logros completos', () => {
    const usuario = mockRanking[0];
    expect(component.contarLogrosReales(usuario)).toBe(2);
    expect(component.getLogrosUsuario(usuario).length).toBe(2);
    
    const actividadLogro = mockActividad[0];
    expect(component.tieneLogro(actividadLogro)).toBeTrue();
    expect(component.getLogroTitulo(actividadLogro)).toBe('Maestro');
    expect(component.getLogroIcono(actividadLogro)).toBe('icon.png');
    
    const actividadExpandida = mockActividad[1];
    expect(component.getNombreJugador(actividadExpandida)).toBe('Ana García');
    expect(component.getAvatarJugador(actividadExpandida)).toBe('ana-foto.png');
    
    expect(component.ranking.length).toBeGreaterThan(0);
    expect(component.actividadReciente.length).toBeGreaterThan(0);
    expect(component.eventos.length).toBeGreaterThan(0);
  });
});