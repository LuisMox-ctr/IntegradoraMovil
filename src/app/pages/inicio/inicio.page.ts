import { Component, OnInit } from '@angular/core';


interface Personaje {
  id: string;
  nombre: string;
  rol: string;
  motivacion: string;
  estilo: string;
  icono: string;
}

@Component({
  standalone: false,
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  personajes: Personaje[] = [
    {
      id: 'kenig',
      nombre: 'KENIG GALINDO',
      rol: 'El Protagonista',
      motivacion: 'Descubrir qué pasó con su raza',
      estilo: 'Acción / Investigación',
      icono: 'search-outline'
    },
    {
      id: 'juan',
      nombre: 'JUAN CENA',
      rol: 'El Luchador',
      motivacion: 'Encontrar los secretos del desastre',
      estilo: 'Fuerza / Decisiones Rápidas',
      icono: 'fitness-outline'
    },
    {
      id: 'siggy',
      nombre: 'SIGGY',
      rol: 'El Prisionero Fugado',
      motivacion: 'Escapar de su pasado oscuro',
      estilo: 'Supervivencia / Agresividad',
      icono: 'alert-circle-outline'
    },
    {
      id: 'mox',
      nombre: 'MOX',
      rol: 'El Simpson',
      motivacion: 'Salvar a todos los sobrevivientes',
      estilo: 'Tanque / Sacrificio',
      icono: 'medical-outline'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
