import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Logro } from '../interfaces/interfaces';
import { FirestoreWrapper } from '../wraper/firestore.wrapper';

@Injectable({
  providedIn: 'root',
})
export class LogrosService {
  
  constructor(private firestoreWrapper: FirestoreWrapper) {}

  /**
   * Obtener todos los logros
   */
  getLogros(): Observable<Logro[]> {
    const logrosRef = this.firestoreWrapper.collection('logros');
    return this.firestoreWrapper.collectionData(logrosRef, { idField: 'id' }) as Observable<Logro[]>;
  }

  /**
   * Obtener un logro específico por ID
   */
  async getLogro(id: string): Promise<Logro | null> {
    try {
      const logroRef = this.firestoreWrapper.doc('logros', id);
      const logroSnap = await this.firestoreWrapper.getDoc(logroRef);
      
      if (logroSnap.exists()) {
        return { id: logroSnap.id, ...logroSnap.data() } as Logro;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener logro:', error);
      return null;
    }
  }
}