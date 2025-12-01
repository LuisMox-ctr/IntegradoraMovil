import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleHistoriaComponent } from './detalle-historia.component';
import { ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DetalleHistoriaComponent', () => {
  let component: DetalleHistoriaComponent;
  let fixture: ComponentFixture<DetalleHistoriaComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [DetalleHistoriaComponent],
      providers: [{ provide: ModalController, useValue: modalSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleHistoriaComponent);
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

  it('should call modalCtrl.dismiss() when cerrarModal is called', () => {
    component.cerrarModal();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledTimes(1);
  });
});