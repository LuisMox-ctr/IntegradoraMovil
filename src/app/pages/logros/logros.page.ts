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
  
  LogrosRecientes: Logro[] = [];  // ← Simplificado, solo usa Logro

  constructor(private servicioLogros: LogrosService) { }

  ngOnInit() {
    this.servicioLogros.getLogros().subscribe({
      next: (logros) => {
        this.LogrosRecientes = logros;
        console.log("Logros cargados:", logros);
      },
      error: (error) => {
        console.error("Error al cargar logros:", error);
      }
    });
  }

  calcularPuntosTotales(): number {
    return this.LogrosRecientes.reduce((total, logro) => total + logro.puntos, 0);
  }
}