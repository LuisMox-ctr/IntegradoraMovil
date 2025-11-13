import { Component, OnInit } from '@angular/core';
import { ComunidadService } from 'src/app/services/comunidad';
import { Jugador, Actividad,Evento } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-comunidad',
  templateUrl: './comunidad.page.html',
  styleUrls: ['./comunidad.page.scss'],
  standalone: false
})
export class ComunidadPage implements OnInit {
  vistaActual: 'ranking' | 'actividad' | 'eventos' = 'ranking';

  ranking: Jugador[] = [];
  actividadReciente: Actividad[] = [];
  eventos: Evento[] = [];

  constructor(private comunidadService: ComunidadService) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargar ranking
    this.comunidadService.getRanking().subscribe({
      next: (respuesta: any) => {
        console.log("RANKING FIREBASE:", respuesta);
        this.ranking = Object.values(respuesta);
        console.log("Ranking procesado:", this.ranking);
      },
      error: (error) => {
        console.error('Error al cargar ranking:', error);
      }
    });

    // Cargar actividad reciente
    this.comunidadService.getActividad().subscribe({
      next: (respuesta: any) => {
        console.log("ACTIVIDAD FIREBASE:", respuesta);
        this.actividadReciente = Object.values(respuesta);
        console.log("Actividad procesada:", this.actividadReciente);
      },
      error: (error) => {
        console.error('Error al cargar actividad:', error);
      }
    });

    // Cargar eventos
    this.comunidadService.getEventos().subscribe({
      next: (respuesta: any) => {
        console.log("EVENTOS FIREBASE:", respuesta);
        this.eventos = Object.values(respuesta);
        console.log("Eventos procesados:", this.eventos);
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
      }
    });
  }

  cambiarVista(vista: 'ranking' | 'actividad' | 'eventos') {
    this.vistaActual = vista;
  }

  getIconoActividad(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'logro': 'trophy',
      'nivel': 'arrow-up-circle',
      'evento': 'calendar',
      'social': 'people'
    };
    return iconos[tipo] || 'information-circle';
  }
}