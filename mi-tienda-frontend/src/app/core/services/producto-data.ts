import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/tienda';
import { API_URL} from '../api';

@Injectable({
  providedIn: 'root'
})
export class ProductoDataService {
  private http = inject(HttpClient);
  private apiUrl = API_URL + 'productos';

  findAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  findById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Usamos 'any' en el payload porque enviaremos { nombre, precio, descripcion, categoria_id }
  create(productoPayload: any): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, productoPayload);
  }

  update(id: number, productoPayload: any): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, productoPayload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
