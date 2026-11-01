import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../model/cliente';

@Injectable({ providedIn: 'root' })
export class ClienteService {
    private readonly apiUrl = 'http://localhost:3000/clientes';
  
    constructor(private readonly http: HttpClient) {}
  
    getAllClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  createCliente(cliente: Omit<Cliente, 'id'>): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
