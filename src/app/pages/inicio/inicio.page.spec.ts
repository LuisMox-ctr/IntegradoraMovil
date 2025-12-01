import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioPage } from './inicio.page';
import { ModalController } from '@ionic/angular';
import { DetalleComponent } from 'src/app/componentes/detalle/detalle.component';
import { DetalleHistoriaComponent } from 'src/app/componentes/detalle-historia/detalle-historia.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('InicioPage', () => {
  let component: InicioPage;
  let fixture: ComponentFixture<InicioPage>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    const mockModal = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
    };

    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    modalSpy.create.and.returnValue(Promise.resolve(mockModal));

    await TestBed.configureTestingModule({
      declarations: [InicioPage],
      providers: [{ provide: ModalController, useValue: modalSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioPage);
    component = fixture.componentInstance;
    modalCtrlSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize on ngOnInit', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should have 4 personajes', () => {
    expect(component.personajes.length).toBe(4);
  });

  describe('Personajes data', () => {
    const expectedPersonajes = [
      { id: 'kenig', nombre: 'KENIG GALINDO', icono: 'search-outline' },
      { id: 'juan', nombre: 'JUAN CENA', icono: 'fitness-outline' },
      { id: 'siggy', nombre: 'SIGGY', icono: 'alert-circle-outline' },
      { id: 'mox', nombre: 'MOX', icono: 'medical-outline' }
    ];

    expectedPersonajes.forEach(({ id, nombre, icono }, index) => {
      it(`should have correct data for personaje ${id}`, () => {
        expect(component.personajes[index].id).toBe(id);
        expect(component.personajes[index].nombre).toBe(nombre);
        expect(component.personajes[index].icono).toBe(icono);
      });
    });
  });

  describe('verDetalle', () => {
    it('should create and present modal with DetalleComponent', async () => {
      const testId = 'kenig';
      
      await component.verDetalle(testId);

      expect(modalCtrlSpy.create).toHaveBeenCalledWith({
        component: DetalleComponent,
        componentProps: { id: testId }
      });

      const mockModal = await modalCtrlSpy.create.calls.mostRecent().returnValue;
      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should call verDetalle with different ids', async () => {
      const ids = ['kenig', 'juan', 'siggy', 'mox'];

      for (const id of ids) {
        await component.verDetalle(id);
        
        expect(modalCtrlSpy.create).toHaveBeenCalledWith({
          component: DetalleComponent,
          componentProps: { id }
        });
      }
    });
  });

  describe('verHistoria', () => {
    it('should create and present modal with DetalleHistoriaComponent', async () => {
      await component.verHistoria();

      expect(modalCtrlSpy.create).toHaveBeenCalledWith({
        component: DetalleHistoriaComponent
      });

      const mockModal = await modalCtrlSpy.create.calls.mostRecent().returnValue;
      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should call verHistoria multiple times', async () => {
      await component.verHistoria();
      await component.verHistoria();

      expect(modalCtrlSpy.create).toHaveBeenCalledTimes(2);
    });
  });
});