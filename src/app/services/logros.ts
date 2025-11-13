import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespDB } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class LogrosService {
  constructor (private http: HttpClient){}

  getLogros(){
    return this.http.get<RespDB>('https://integradora-f6599-default-rtdb.firebaseio.com/logros.json')
  }
  
}
