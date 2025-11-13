import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespDB } from '../interfaces/interfaces';

import { Firestore, collection, collectionData, doc,
docData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class LogrosService {
  constructor (private http: HttpClient,
    private firestore:Firestore
  ){}

  getLogros(){
    //return this.http.get<RespDB>('https://integradora-f6599-default-rtdb.firebaseio.com/logros.json')
    const logrosRef=collection(this.firestore,'logros');
    return collectionData(logrosRef,{idField:'id'});
  }
  
}
