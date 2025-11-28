import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

interface PersonajeDetalle {
  id: string;
  nombre: string;
  rol: string;
  motivacion: string;
  estilo: string;
  icono: string;
  historia: string;
  habilidades: string[];
  estadisticas: {
    fuerza: number;
    agilidad: number;
    inteligencia: number;
    resistencia: number;
  };
  imagen?: string;
}

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss'],
  standalone: false,
})
export class DetalleComponent  implements OnInit {
  @Input() id!:string;

  personaje?: PersonajeDetalle

  private personajes: PersonajeDetalle[] = [
    {
      id: 'kenig',
      nombre: 'KENIG GALINDO',
      rol: 'El Protagonista',
      motivacion: 'Descubrir qué pasó con su raza',
      estilo: 'Acción / Investigación',
      icono: 'search-outline',
      historia: 'Kenig despertó en medio del caos sin recuerdos claros. Su única pista es una marca en su brazo que lo conecta con el experimento fallido. Determinado a encontrar respuestas, se adentra en las ruinas de V Magma.',
      habilidades: [
        'Análisis de entorno',
        'Sigilo avanzado',
        'Combate cuerpo a cuerpo',
        'Hackeo básico'
      ],
      estadisticas: {
        fuerza: 7,
        agilidad: 8,
        inteligencia: 9,
        resistencia: 6
      },
      imagen: 'assets/personajes/kenig.png'
    },
    {
      id: 'juan',
      nombre: 'JUAN CENA',
      rol: 'El Luchador',
      motivacion: 'Encontrar los secretos del desastre',
      estilo: 'Fuerza / Decisiones Rápidas',
      icono: 'fitness-outline',
      historia: 'Ex luchador profesional atrapado en la ciudad durante el desastre. Su fuerza bruta y determinación lo convirtieron en un líder natural entre los supervivientes. Busca proteger a los inocentes mientras descubre la verdad.',
      habilidades: [
        'Fuerza sobrehumana',
        'Resistencia al dolor',
        'Liderazgo',
        'Combate brutal'
      ],
      estadisticas: {
        fuerza: 10,
        agilidad: 6,
        inteligencia: 5,
        resistencia: 9
      },
      imagen: 'assets/personajes/juan.png'
    },
    {
      id: 'siggy',
      nombre: 'SIGGY',
      rol: 'El Prisionero Fugado',
      motivacion: 'Escapar de su pasado oscuro',
      estilo: 'Supervivencia / Agresividad',
      icono: 'alert-circle-outline',
      historia: 'Escapó de una prisión de máxima seguridad durante el caos. Siggy tiene un pasado violento pero una oportunidad de redención. Sus instintos de supervivencia son incomparables, aunque sus métodos son cuestionables.',
      habilidades: [
        'Supervivencia extrema',
        'Fabricación de armas',
        'Intimidación',
        'Combate sucio'
      ],
      estadisticas: {
        fuerza: 8,
        agilidad: 7,
        inteligencia: 6,
        resistencia: 8
      },
      imagen: 'assets/personajes/siggy.png'
    },
    {
      id: 'mox',
      nombre: 'MOX',
      rol: 'El Simpson',
      motivacion: 'Salvar a todos los sobrevivientes',
      estilo: 'Tanque / Sacrificio',
      icono: 'medical-outline',
      historia: 'Paramédico que se encontraba en servicio cuando ocurrió el desastre. Mox se niega a abandonar a nadie, sin importar el costo personal. Su armadura improvisada y su corazón noble lo hacen el escudo del equipo.',
      habilidades: [
        'Primeros auxilios',
        'Defensa avanzada',
        'Inspirar aliados',
        'Resistencia extrema'
      ],
      estadisticas: {
        fuerza: 6,
        agilidad: 5,
        inteligencia: 8,
        resistencia: 10
      },
      imagen: 'assets/personajes/mox.png'
    }
  ];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.personaje = this.personajes.find(p => p.id=== this.id);
  }

  cerrarModal(){
    this.modalCtrl.dismiss();
  }

  getStatColor(value: number): string{
    if (value >=8) return 'success';
    if (value >=6) return 'Warning';
    return 'danger';
  }

}
