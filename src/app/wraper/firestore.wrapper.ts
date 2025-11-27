import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  addDoc,
  DocumentReference,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

/**
 * Wrapper para Firestore que facilita el testing
 * Encapsula todas las funciones de Firestore en métodos mockeables
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreWrapper {
  
  constructor(private firestore: Firestore) {}

  // ============================================
  // MÉTODOS DE LECTURA
  // ============================================

  /**
   * Obtiene una referencia a una colección
   */
  collection(path: string): CollectionReference {
    return collection(this.firestore, path);
  }

  /**
   * Obtiene datos de una colección como Observable
   */
  collectionData(ref: CollectionReference, options?: { idField?: string }): Observable<any[]> {
    return collectionData(ref, options);
  }

  /**
   * Obtiene una referencia a un documento
   */
  doc(path: string, ...segments: string[]): DocumentReference {
    return doc(this.firestore, path, ...segments);
  }

  /**
   * Obtiene los datos de un documento
   */
  async getDoc(docRef: DocumentReference): Promise<any> {
    return getDoc(docRef);
  }

  // ============================================
  // MÉTODOS DE ESCRITURA
  // ============================================

  /**
   * Actualiza un documento
   */
  async updateDoc(docRef: DocumentReference, data: any): Promise<void> {
    return updateDoc(docRef, data);
  }

  /**
   * Agrega un documento a una colección
   */
  async addDoc(collectionRef: CollectionReference, data: any): Promise<DocumentReference> {
    return addDoc(collectionRef, data);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Crea una operación de arrayUnion para Firestore
   */
  arrayUnion(...elements: any[]): any {
    return arrayUnion(...elements);
  }

  /**
   * Crea una operación de increment para Firestore
   */
  increment(value: number): any {
    return increment(value);
  }
}