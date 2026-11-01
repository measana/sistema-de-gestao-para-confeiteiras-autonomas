import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginCredentials, LoginUser } from '../model/login';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly usersUrl = 'http://localhost:3000/usuarios';

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginUser[]> {
    const params = new HttpParams()
      .set('usuario', credentials.usuario.trim())
      .set('senha', credentials.senha);

    return this.http.get<LoginUser[]>(this.usersUrl, { params });
  }
}