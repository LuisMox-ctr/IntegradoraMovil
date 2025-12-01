import { TestBed } from '@angular/core/testing';
import { ComunidadService } from './comunidad';
import { FirestoreWrapper } from 'src/app/wraper/firestore.wrapper';
import { of } from 'rxjs';
import { DocumentReference } from '@angular/fire/firestore';

describe('ComunidadService', () => {
  let service: ComunidadService;
  let w: jasmine.SpyObj<FirestoreWrapper>;

  // 🎯 HELPERS
  const mockRef = () => ({} as any);
  const mockSnap = (exists: boolean, data: any = null) => ({ 
    exists: () => exists, 
    id: 'id1', 
    data: () => data 
  });
  const setupBasic = () => {
    const ref = mockRef();
    w.collection.and.returnValue(ref);
    return ref;
  };

  beforeEach(() => {
    w = jasmine.createSpyObj('FirestoreWrapper', [
      'collection', 'collectionData', 'doc', 'getDoc', 
      'updateDoc', 'addDoc', 'arrayUnion', 'increment'
    ]);

    TestBed.configureTestingModule({
      providers: [ComunidadService, { provide: FirestoreWrapper, useValue: w }]
    });

    service = TestBed.inject(ComunidadService);
  });

  it(' Crea el servicio', () => expect(service).toBeTruthy());

  // ============================================
  // getRanking()
  // ============================================
  describe('getRanking()', () => {
    
    it(' Expande logros y asigna defaults', (done) => {
      const usuarios = [{ id: '1', nombre: 'U', logros: [{ id: 'l1' } as DocumentReference] }];
      setupBasic();
      w.collectionData.and.returnValue(of(usuarios));
      w.getDoc.and.returnValue(Promise.resolve(mockSnap(true, { titulo: 'M' })));

      service.getRanking().subscribe(res => {
        expect(res[0].puntos).toBe(0);
        expect(res[0].logrosCompletados).toBe(0);
        expect(res[0].logrosExpandidos?.length).toBe(1);
        done();
      });
    });

    it(' Maneja múltiples casos de logros', (done) => {
      const casos = [
        { usuario: { id: '1', logros: [{ id: 'l1' } as DocumentReference] }, snapExists: false, esperado: 0 },
        { usuario: { id: '2' }, snapExists: true, esperado: 0 },
        { usuario: { id: '3', logros: [] }, snapExists: true, esperado: 0 }
      ];
      
      setupBasic();
      w.collectionData.and.returnValue(of(casos.map(c => c.usuario)));
      w.getDoc.and.returnValue(Promise.resolve(mockSnap(casos[0].snapExists)));

      service.getRanking().subscribe(res => {
        res.forEach((u, i) => expect(u.logrosExpandidos?.length).toBe(casos[i].esperado));
        done();
      });
    });

    it(' Prioriza foto > avatar', (done) => {
      const usuarios = [
        { id: '1', foto: 'f.jpg', avatar: 'a.jpg' },
        { id: '2', avatar: 'a.jpg' }
      ];
      setupBasic();
      w.collectionData.and.returnValue(of(usuarios));

      service.getRanking().subscribe(res => {
        expect(res[0].avatar).toBe('f.jpg');
        expect(res[1].avatar).toBe('a.jpg');
        done();
      });
    });

    it(' Maneja errores', (done) => {
      const usuarios = [{ id: '1', logros: [{ id: 'l1' } as DocumentReference] }];
      setupBasic();
      w.collectionData.and.returnValue(of(usuarios));
      w.getDoc.and.returnValue(Promise.reject(new Error()));
      spyOn(console, 'error');

      service.getRanking().subscribe(res => {
        expect(res[0].logrosExpandidos).toEqual([]);
        done();
      });
    });
  });

  // ============================================
  // getActividad()
  // ============================================
  describe('getActividad()', () => {
    
    it(' Expande jugador (DocumentReference)', (done) => {
      const act = [{ id: '1', jugador: { path: 'u/1' } as DocumentReference, tipo: 'logro' as const, descripcion: '', tiempo: '' }];
      setupBasic();
      w.collectionData.and.returnValue(of(act));
      w.getDoc.and.returnValue(Promise.resolve(mockSnap(true, { nombre: 'Luis', foto: 'f.jpg' })));

      service.getActividad().subscribe(res => {
        expect(res[0].jugador).toBe('Luis');
        expect(res[0].avatar).toBe('f.jpg');
        expect(res[0].jugadorExpandido).toBeDefined();
        done();
      });
    });

    it(' NO expande jugador string', (done) => {
      const act = [{ id: '1', jugador: 'Luis', tipo: 'logro' as const, descripcion: '', tiempo: '', avatar: 'a.jpg' }];
      setupBasic();
      w.collectionData.and.returnValue(of(act));

      service.getActividad().subscribe(res => {
        expect(res[0].jugador).toBe('Luis');
        expect(w.getDoc).not.toHaveBeenCalled();
        done();
      });
    });

    it(' Usa nombre/avatar por defecto', (done) => {
      const act = [{ id: '1', jugador: { path: 'u/1' } as DocumentReference, tipo: 'logro' as const, descripcion: '', tiempo: '', avatar: 'd.jpg' }];
      setupBasic();
      w.collectionData.and.returnValue(of(act));
      w.getDoc.and.returnValue(Promise.resolve(mockSnap(true, {})));

      service.getActividad().subscribe(res => {
        expect(res[0].jugador).toBe('Usuario');
        expect(res[0].avatar).toBe('d.jpg');
        done();
      });
    });

    it(' Expande/maneja logros', (done) => {
      const casos = [
        { logro: { path: 'l/1' } as DocumentReference, snapExists: true, data: { titulo: 'M' } },
        { logro: { path: 'l/2' } as DocumentReference, snapExists: false, data: null },
        { logro: { titulo: 'M' } as any, snapExists: true, data: null }
      ];

      setupBasic();
      w.collectionData.and.returnValue(of(casos.map((c, i) => ({ 
        id: String(i), jugador: 'L', tipo: 'logro' as const, descripcion: '', tiempo: '', logro: c.logro 
      }))));
      w.getDoc.and.returnValues(
        Promise.resolve(mockSnap(casos[0].snapExists, casos[0].data)),
        Promise.resolve(mockSnap(casos[1].snapExists, casos[1].data))
      );

      service.getActividad().subscribe(res => {
        expect(res[0].logro).toEqual(jasmine.objectContaining({ titulo: 'M' }));
        expect(res[1].logro).toBeNull();
        expect(res[2].logro).toEqual(jasmine.objectContaining({ titulo: 'M' }));
        done();
      });
    });

    it(' Maneja errores', (done) => {
      const actJugador = [{ id: '1', jugador: { path: 'u/1' } as DocumentReference, tipo: 'logro' as const, descripcion: '', tiempo: '' }];
      const actLogro = [{ id: '2', jugador: 'Luis', tipo: 'logro' as const, descripcion: '', tiempo: '', logro: { path: 'l/1' } as DocumentReference }];
      
      setupBasic();
      spyOn(console, 'error');

      // Error al expandir jugador
      w.collectionData.and.returnValue(of(actJugador));
      w.getDoc.and.returnValue(Promise.reject(new Error('Error jugador')));

      service.getActividad().subscribe(() => {
        expect(console.error).toHaveBeenCalledWith('Error expandiendo jugador:', jasmine.any(Error));
      });

      // Error al expandir logro
      w.collectionData.and.returnValue(of(actLogro));
      w.getDoc.and.returnValue(Promise.reject(new Error('Error logro')));

      service.getActividad().subscribe(() => {
        expect(console.error).toHaveBeenCalledWith('Error expandiendo logro:', jasmine.any(Error));
        done();
      });
    });
  });

  // ============================================
  // getEventos()
  // ============================================
  describe('getEventos()', () => {
    it(' Retorna eventos', (done) => {
      setupBasic();
      w.collectionData.and.returnValue(of([{ id: '1', nombre: 'T', tipo: 'Torneo' as const, descripcion: '', fecha: '', recompensa: '', participantes: 10, icono: 'i' }]));
      service.getEventos().subscribe(res => {
        expect(res.length).toBe(1);
        done();
      });
    });
  });

  // ============================================
  // desbloquearLogro()
  // ============================================
  describe('desbloquearLogro()', () => {
    const setup = (logroEx: boolean, usuEx: boolean, yaDesb: boolean, puntos = 100) => {
      w.doc.and.returnValue(yaDesb ? { id: 'l1' } as any : mockRef());
      w.getDoc.and.returnValues(
        Promise.resolve(mockSnap(logroEx, { puntos })),
        Promise.resolve(mockSnap(usuEx, { logros: yaDesb ? [{ id: 'l1' }] : [] }))
      );
      w.updateDoc.and.returnValue(Promise.resolve());
      w.arrayUnion.and.returnValue({});
      w.increment.and.returnValue({});
      w.collection.and.returnValue(mockRef());
      w.addDoc.and.returnValue(Promise.resolve(mockRef()));
    };

    it(' Desbloquea exitosamente', async () => {
      setup(true, true, false, 250);
      spyOn(console, 'log');

      const res = await service.desbloquearLogro('u1', 'l1');

      expect(res.success).toBeTrue();
      expect(res.puntos).toBe(250);
    });

    it(' Maneja errores de existencia', async () => {
      setup(false, true, false);
      const r1 = await service.desbloquearLogro('u1', 'l1');
      expect(r1.mensaje).toBe('Logro no encontrado');

      setup(true, false, false);
      const r2 = await service.desbloquearLogro('u1', 'l1');
      expect(r2.mensaje).toBe('Usuario no encontrado');

      setup(true, true, true);
      const r3 = await service.desbloquearLogro('u1', 'l1');
      expect(r3.mensaje).toBe('Logro ya desbloqueado');
    });

    it(' Maneja puntos = 0 y usuario sin logros', async () => {
      w.doc.and.returnValue(mockRef());
      w.getDoc.and.returnValues(
        Promise.resolve(mockSnap(true, { puntos: 0 })),
        Promise.resolve(mockSnap(true, {}))
      );
      w.updateDoc.and.returnValue(Promise.resolve());
      w.arrayUnion.and.returnValue({});
      w.increment.and.returnValue({});
      w.collection.and.returnValue(mockRef());
      w.addDoc.and.returnValue(Promise.resolve(mockRef()));

      const res = await service.desbloquearLogro('u1', 'l1');

      expect(res.success).toBeTrue();
      expect(res.puntos).toBe(0);
    });

    it(' Maneja error en actividad y general', async () => {
      setup(true, true, false);
      w.addDoc.and.returnValue(Promise.reject(new Error()));
      spyOn(console, 'error');
      spyOn(console, 'log');

      const r1 = await service.desbloquearLogro('u1', 'l1');
      expect(r1.success).toBeTrue();

      w.doc.and.throwError('Error');
      const r2 = await service.desbloquearLogro('u1', 'l1');
      expect(r2.success).toBeFalse();
    });
  });

  // ============================================
  // sumarPuntos()
  // ============================================
  describe('sumarPuntos()', () => {
    it(' Suma puntos con/sin motivo', async () => {
      w.doc.and.returnValue(mockRef());
      w.increment.and.returnValue({});
      w.updateDoc.and.returnValue(Promise.resolve());
      spyOn(console, 'log');

      expect(await service.sumarPuntos('u1', 50, 'M')).toBeTrue();
      expect(await service.sumarPuntos('u1', 50)).toBeTrue();
    });

    it(' Maneja errores', async () => {
      w.doc.and.throwError('Error');
      spyOn(console, 'error');
      expect(await service.sumarPuntos('u1', 50)).toBeFalse();
    });
  });

  // ============================================
  // getLogrosDisponibles()
  // ============================================
  describe('getLogrosDisponibles()', () => {
    it(' Filtra desbloqueados y maneja sin logros', async () => {
      const logros = [{ id: 'l1' }, { id: 'l2' }];
      w.collection.and.returnValue(mockRef());
      w.collectionData.and.returnValue({ toPromise: () => Promise.resolve(logros) } as any);
      w.doc.and.returnValue(mockRef());
      
      w.getDoc.and.returnValue(Promise.resolve(mockSnap(true, { logros: [{ id: 'l1' }] })));
      expect((await service.getLogrosDisponibles('u1')).length).toBe(1);

      w.getDoc.and.returnValue(Promise.resolve(mockSnap(true, {})));
      expect((await service.getLogrosDisponibles('u1')).length).toBe(2);

      w.getDoc.and.returnValue(Promise.resolve(mockSnap(false)));
      expect(await service.getLogrosDisponibles('u999')).toEqual([]);
    });

    it(' Maneja errores', async () => {
      w.collection.and.throwError('Error');
      spyOn(console, 'error');
      expect(await service.getLogrosDisponibles('u1')).toEqual([]);
    });
  });

  // ============================================
  // getLogrosDesbloqueados()
  // ============================================
  describe('getLogrosDesbloqueados()', () => {
    it(' Expande y filtra logros', async () => {
      w.doc.and.returnValue(mockRef());
      
      w.getDoc.and.returnValues(
        Promise.resolve(mockSnap(true, { logros: [{ id: 'l1' }] })),
        Promise.resolve(mockSnap(true, { titulo: 'M' }))
      );
      expect((await service.getLogrosDesbloqueados('u1')).length).toBe(1);

      w.getDoc.and.returnValues(
        Promise.resolve(mockSnap(true, { logros: [{ id: 'l1' }] })),
        Promise.resolve(mockSnap(false))
      );
      expect((await service.getLogrosDesbloqueados('u1')).length).toBe(0);

      w.getDoc.and.returnValue(Promise.resolve(mockSnap(true, {})));
      expect(await service.getLogrosDesbloqueados('u1')).toEqual([]);

      w.getDoc.and.returnValue(Promise.resolve(mockSnap(false)));
      expect(await service.getLogrosDesbloqueados('u999')).toEqual([]);
    });

    it(' Maneja errores', async () => {
      w.doc.and.throwError('Error');
      spyOn(console, 'error');
      expect(await service.getLogrosDesbloqueados('u1')).toEqual([]);
    });
  });
});