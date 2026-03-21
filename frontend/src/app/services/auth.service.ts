import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'USER' | 'ADMIN';

interface JwtPayload {
  role?: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizacion: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  usuario: {
    _id: string;
    name: string;
    email: string;
    organizacion: string;
    role: UserRole;
  };
}

export interface Usuario {
  _id: string;
  name: string;
  email: string;
  organizacion: any;
  role: UserRole;
}

export interface AdminResourceResponse {
  message: string;
  role: UserRole;
  userId: string;
}

const TOKEN_KEY = 'jwt_token';
const API_URL = 'http://localhost:1337';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Registra un nuevo usuario. NO genera token.
   * Si tiene éxito, redirige a /login.
   */
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${API_URL}/usuarios`, payload).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  /**
   * Refresca el token actual.
   */
  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${API_URL}/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap((res) => {
        this.saveToken(res.accessToken);
      })
    );
  }

  /**
   * Inicia sesión. Si tiene éxito, guarda el token y redirige a /home.
   */
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, payload, { withCredentials: true }).pipe(
      tap((res) => {
        this.saveToken(res.accessToken);
        this.router.navigate(['/home']);
      })
    );
  }

  /** Guarda el token en localStorage */
  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Petición protegida para probar el token (devuelve todos los usuarios).
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API_URL}/usuarios`);
  }

  /** Recurso crítico, solo accesible para rol ADMIN. */
  getAdminResource(): Observable<AdminResourceResponse> {
    return this.http.get<AdminResourceResponse>(`${API_URL}/auth/admin-resource`);
  }

  /** Obtiene el token del localStorage */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Comprueba si el usuario está autenticado */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  //Devuelve el rol del usuario leyendo el access token.
  getUserRole(): UserRole | null {
    const payload = this.decodeTokenPayload();
    return payload?.role ?? null;
  }

  hasRole(role: UserRole): boolean {
    return this.getUserRole() === role;
  }

  private decodeTokenPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  /** Cierra sesión eliminando el token */
  logout(): void {
    this.http.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        // noop
      },
      error: () => {
        // noop
      }
    });

    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
