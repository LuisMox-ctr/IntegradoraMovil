import { TestBed } from '@angular/core/testing';
import { LogrosService } from './logros';
import { FirestoreWrapper } from 'src/app/wraper/firestore.wrapper';
import { of, throwError } from 'rxjs';

describe('LogrosService', () => {
  let service: LogrosService;
  let wrapper: jasmine.SpyObj<FirestoreWrapper>;

  beforeEach(() => {
    wrapper = jasmine.createSpyObj('FirestoreWrapper', ['collection', 'collectionData', 'doc', 'getDoc']);

    TestBed.configureTestingModule({
      providers: [
        LogrosService,
        { provide: FirestoreWrapper, useValue: wrapper }
      ]
    });

    service = TestBed.inject(LogrosService);
  });

  it(' Debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  // ============================================
  // getLogros()
  // ============================================
  describe('getLogros()', () => {
    
    it(' Debe retornar logros', (done) => {
      const logros = [
        { id: '1', titulo: 'L1', puntos: 100, categoria: 'T', descripcion: 'D', icono: 'i1' },
        { id: '2', titulo: 'L2', puntos: 200, categoria: 'T', descripcion: 'D', icono: 'i2' }
      ];

      const ref = {} as any;
      wrapper.collection.and.returnValue(ref);
      wrapper.collectionData.and.returnValue(of(logros));

      service.getLogros().subscribe(res => {
        expect(wrapper.collection).toHaveBeenCalledWith('logros');
        expect(res.length).toBe(2);
        expect(res[0].titulo).toBe('L1');
        done();
      });
    });

    it(' Debe retornar array vacío', (done) => {
      wrapper.collection.and.returnValue({} as any);
      wrapper.collectionData.and.returnValue(of([]));

      service.getLogros().subscribe(res => {
        expect(res.length).toBe(0);
        done();
      });
    });

    it(' Debe manejar errores', (done) => {
      wrapper.collection.and.returnValue({} as any);
      wrapper.collectionData.and.returnValue(throwError(() => new Error('Error de red')));

      service.getLogros().subscribe({
        next: () => fail('No debería ejecutarse'),
        error: (err) => {
          expect(err.message).toBe('Error de red');
          done();
        }
      });
    });
  });

  // ============================================
  // getLogro(id)
  // ============================================
  describe('getLogro(id)', () => {

    it(' Debe retornar un logro por ID', async () => {
      const docRef = {} as any;
      const snapshot = {
        exists: () => true,
        id: '1',
        data: () => ({ titulo: 'Explorador', puntos: 100, categoria: 'T', descripcion: 'D', icono: 'i' })
      };

      wrapper.doc.and.returnValue(docRef);
      wrapper.getDoc.and.returnValue(Promise.resolve(snapshot));

      const res = await service.getLogro('1');

      expect(wrapper.doc).toHaveBeenCalledWith('logros', '1');
      expect(res?.id).toBe('1');
      expect(res?.titulo).toBe('Explorador');
    });

    it(' Debe retornar null si no existe', async () => {
      wrapper.doc.and.returnValue({} as any);
      wrapper.getDoc.and.returnValue(Promise.resolve({ exists: () => false }));

      const res = await service.getLogro('999');

      expect(res).toBeNull();
    });

    it(' Debe manejar errores', async () => {
      wrapper.doc.and.returnValue({} as any);
      wrapper.getDoc.and.returnValue(Promise.reject(new Error('Error')));
      spyOn(console, 'error');

      const res = await service.getLogro('error-id');

      expect(res).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
});