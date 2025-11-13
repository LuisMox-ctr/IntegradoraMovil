import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ComunidadData } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ComunidadService {
  
  private firebaseUrl = 'https://integradora-f6599-default-rtdb.firebaseio.com';

  constructor(private http: HttpClient) {}

  // Obtener solo el ranking
  getRanking(): Observable<any> {
    return this.http.get<any>(`${this.firebaseUrl}/ranking.json`);
  }

  // Obtener solo actividad reciente
  getActividad(): Observable<any> {
    return this.http.get<any>(`${this.firebaseUrl}/actividadReciente.json`);
  }

  // Obtener solo eventos
  getEventos(): Observable<any> {
    return this.http.get<any>(`${this.firebaseUrl}/eventos.json`);
  }
}