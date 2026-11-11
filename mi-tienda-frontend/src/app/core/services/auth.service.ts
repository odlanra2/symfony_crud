import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

import { API_URL } from '../api';
import {
  Credentials,
  getToken,
  getSession,
  User,
  saveToken,
  ResponseToken,
  CleanSession,
  saveSession,
  RegistroPayload,
  RespuestaRegistro
} from '../session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _token = signal<string | null>(getToken());
  private readonly _usuario = signal<User | null>(getSession());
  private readonly _aviso = signal('');

  readonly token = this._token.asReadonly();

  readonly usuario = this._usuario.asReadonly();
  readonly aviso = this._aviso.asReadonly();
  readonly autenticado = computed(() => this._token() !== null);
  readonly nombreVisible = computed(
    () =>  this._usuario()?.email || 'Usuario',
  );

  readonly inicial = computed(() => this.nombreVisible().charAt(0).toUpperCase());

  iniciarSesion(credenciales: Credentials): Observable<any> {
    return this.http.post<ResponseToken>(`${API_URL}/login_check`, credenciales).pipe(
      switchMap(({ token }) => {
        // El token debe estar guardado antes de pedir /me para que el interceptor lo envíe.
        saveToken(token);
        this._token.set(token);
        console.log('Token guardado:', token);
        return  this.obtenerUsuario().pipe(tap((usuario) => this.establecerSesion(token, usuario)));
      }),
      catchError((error: HttpErrorResponse) => {
        this.cerrarSesion();
        return throwError(() => error);
      }),
    );
  }

  registrar(payload: RegistroPayload): Observable<User> {
    return this.http.post<RespuestaRegistro>(`${API_URL}/register`, payload).pipe(
      tap(({ user, token }) => this.establecerSesion(token, user)),
      map(({ user }) => user),
    );
  }

  cerrarSesion(motivo = ''): void {
    CleanSession();
    this._token.set(null);
    this._usuario.set(null);
    this._aviso.set(motivo);
  }

  private establecerSesion(token: string, usuario: User): void {
    saveSession(token, usuario);
    this._token.set(token);
    this._usuario.set(usuario);
    this._aviso.set('');
  }

 obtenerUsuario(): Observable<User> {
    return this.http.get<User>(`${API_URL}/me`);
  }


  /** Valida el token guardado al arrancar la aplicación. */
  restaurarSesion(): Observable<User | null> {
    const token = this._token();
    if (!token) return of(null);

    return this.obtenerUsuario().pipe(
      tap((usuario) => this.establecerSesion(token, usuario)),
      catchError((error: HttpErrorResponse) => {
        // Si la API está caída no cerramos la sesión; solo si el token ya no vale.
        if (error.status === 401) this.cerrarSesion();
        return of(null);
      }),
    );
  }

}
