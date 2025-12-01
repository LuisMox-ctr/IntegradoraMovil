import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleComponent } from './detalle.component';
import { ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DetalleComponent', () => {
  let component: DetalleComponent;
  let fixture: ComponentFixture<DetalleComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [DetalleComponent],
      providers: [{ provide: ModalController, useValue: modalSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleComponent);
    component = fixture.componentInstance;
    modalCtrlSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    const personajesData = [
      { id: 'kenig', nombre: 'KENIG GALINDO', fuerza: 7, icono: 'search-outline' },
      { id: 'juan', nombre: 'JUAN CENA', fuerza: 10, icono: 'fitness-outline' },
      { id: 'siggy', nombre: 'SIGGY', fuerza: 8, icono: 'alert-circle-outline' },
      { id: 'mox', nombre: 'MOX', fuerza: 6, icono: 'medical-outline' }
    ];

    personajesData.forEach(({ id, nombre, fuerza, icono }) => {
      it(`should find and set personaje ${id}`, () => {
        component.id = id;
        component.ngOnInit();
        
        expect(component.personaje).toBeDefined();
        expect(component.personaje?.nombre).toBe(nombre);
        expect(component.personaje?.estadisticas.fuerza).toBe(fuerza);
        expect(component.personaje?.icono).toBe(icono);
      });
    });

    it('should set personaje to undefined for invalid id', () => {
      component.id = 'noexiste';
      component.ngOnInit();
      expect(component.personaje).toBeUndefined();
    });
  });

  describe('cerrarModal', () => {
    it('should call modalCtrl.dismiss()', () => {
      component.cerrarModal();
      expect(modalCtrlSpy.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStatColor', () => {
    const testCases = [
      { values: [8, 9, 10, 100], expected: 'success', description: 'values >= 8' },
      { values: [6, 7], expected: 'Warning', description: 'values 6-7' },
      { values: [0, 3, 5, -1], expected: 'danger', description: 'values < 6' }
    ];

    testCases.forEach(({ values, expected, description }) => {
      it(`should return "${expected}" for ${description}`, () => {
        values.forEach(value => {
          expect(component.getStatColor(value)).toBe(expected);
        });
      });
    });
  });

  describe('Integration', () => {
    it('should work end-to-end for kenig character', () => {
      component.id = 'kenig';
      component.ngOnInit();
      
      expect(component.personaje?.nombre).toBe('KENIG GALINDO');
      expect(component.getStatColor(component.personaje!.estadisticas.agilidad)).toBe('success');
      
      component.cerrarModal();
      expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
    });
  });
});