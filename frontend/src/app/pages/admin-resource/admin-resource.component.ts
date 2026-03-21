import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, AdminResourceResponse } from '../../services/auth.service';

@Component({
  selector: 'app-admin-resource',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-resource.component.html',
  styleUrls: ['./admin-resource.component.css']
})
export class AdminResourceComponent {
  loading = false;
  message = '';
  role = '';
  userId = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  loadProtectedResource(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.getAdminResource().subscribe({
      next: (response: AdminResourceResponse) => {
        this.message = response.message;
        this.role = response.role;
        this.userId = response.userId;
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'No se pudo cargar el recurso protegido';
        this.loading = false;
      }
    });
  }
}
