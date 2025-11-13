import { Component, OnInit } from '@angular/core';
import { Logro } from 'src/app/interfaces/interfaces';
import { LogrosService } from 'src/app/services/logros';

@Component({
  standalone: false,
  selector: 'app-logros',
  templateUrl: './logros.page.html',
  styleUrls: ['./logros.page.scss'],
})
export class LogrosPage implements OnInit {
  LogrosRecientes: Logro[] = [];

  constructor(private servicioLogros: LogrosService) { }

  ngOnInit() {
    this.servicioLogros.getLogros().subscribe({
      next: (respuesta: any) => {
        // Firebase devuelve un objeto, lo convertimos a array
        this.LogrosRecientes = Object.values(respuesta);
        console.log("Logros cargados:", this.LogrosRecientes);
      },
      error: (error) => {
        console.error("Error al cargar logros:", error);
      }
    });
  }

  // Calcular puntos totales
  calcularPuntosTotales(): number {
    return this.LogrosRecientes.reduce((total, logro) => total + logro.puntos, 0);
  }
}