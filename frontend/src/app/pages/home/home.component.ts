import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, Usuario, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tokenPreview = '';
  currentRole: UserRole | null = null;
  usuarios: Usuario[] = [];
  loadingUsuarios = false;
  errorUsuarios = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.authService.getToken() || '';
    // Ahora mostramos el token completo para poder ver los cambios de firma
    this.tokenPreview = token;
    this.currentRole = this.authService.getUserRole();
    console.log('Token actual:', token);
  }

  canAccessAdminResource(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  logout(): void {
    this.authService.logout();
  }

  cargarUsuarios(): void {
    this.loadingUsuarios = true;
    this.errorUsuarios = '';

    this.authService.getUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.loadingUsuarios = false;
      },
      error: (err: any) => {
        this.errorUsuarios = err.error?.message || 'Error al cargar usuarios';
        this.loadingUsuarios = false;
      }
    });
  }

  refreshToken(): void {
    this.authService.refreshToken().subscribe({
      next: (res: { accessToken: string }) => {
        const token = res.accessToken;
        this.tokenPreview = token; // Mostramos el token completo
        this.currentRole = this.authService.getUserRole();
        console.log('Nuevo Token refrescado:', token);
        alert('Token refrescado correctamente. Revisa la consola para comparar.');
      },
      error: (err: any) => {
        this.errorUsuarios = err.error?.message || 'Error al refrescar el token';
      }
    });
  }
}
