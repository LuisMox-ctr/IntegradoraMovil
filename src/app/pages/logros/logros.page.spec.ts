import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LogrosPage } from './logros.page';
import { LogrosService } from 'src/app/services/logros/logros'; // ✅ Ruta corregida
import { Firestore } from '@angular/fire/firestore';
import { Logro } from 'src/app/interfaces/interfaces';

describe('LogrosPage - 100% Cobertura', () => {
  let component: LogrosPage;
  let fixture: ComponentFixture<LogrosPage>;
  let logrosServiceMock: any;

  const mockLogros: Logro[] = [
    { id: '1', titulo: 'Maestro', descripcion: '', puntos: 100, icono: 'i1.png', categoria: 'A' },
    { id: '2', titulo: 'Experto', descripcion: '', puntos: 50, icono: 'i2.png', categoria: 'B' }
  ];

  beforeEach(async () => {
    logrosServiceMock = {
      getLogros: jasmine.createSpy('getLogros').and.returnValue(of(mockLogros))
    };

    await TestBed.configureTestingModule({
      declarations: [LogrosPage],
      providers: [
        { provide: LogrosService, useValue: logrosServiceMock },
        { provide: Firestore, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('✅ Debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('✅ Debe inicializar con array vacío', () => {
    const newComponent = new LogrosPage(logrosServiceMock);
    expect(newComponent.LogrosRecientes).toEqual([]);
  });

  it('✅ Debe cargar los logros al iniciar y mostrar console.log', () => {
    const consoleSpy = spyOn(console, 'log');
    
    component.ngOnInit();
    
    expect(logrosServiceMock.getLogros).toHaveBeenCalled();
    expect(component.LogrosRecientes.length).toBe(2);
    expect(component.LogrosRecientes[0].titulo).toBe('Maestro');
    expect(consoleSpy).toHaveBeenCalledWith('Logros cargados:', mockLogros);
  });

  it('✅ Debe manejar error al cargar logros', () => {
    const errorSpy = spyOn(console, 'error');
    const errorMessage = 'Error de red';
    
    logrosServiceMock.getLogros.and.returnValue(
      throwError(() => new Error(errorMessage))
    );
    
    component.ngOnInit();
    
    expect(errorSpy).toHaveBeenCalledWith(
      'Error al cargar logros:', 
      jasmine.any(Error)
    );
  });

  it('✅ Debe calcular correctamente los puntos totales', () => {
    component.LogrosRecientes = mockLogros;
    expect(component.calcularPuntosTotales()).toBe(150);
  });

  it('✅ Debe retornar 0 si no hay logros', () => {
    component.LogrosRecientes = [];
    expect(component.calcularPuntosTotales()).toBe(0);
  });

  it('✅ Debe calcular puntos con un solo logro', () => {
    component.LogrosRecientes = [mockLogros[0]];
    expect(component.calcularPuntosTotales()).toBe(100);
  });
});