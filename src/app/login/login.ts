import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginCredentials } from '../model/login';
import { LoginService } from './login.service';
import { PerfilService } from '../perfil/perfil.service';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly perfilService = inject(PerfilService);

  protected readonly credentials: LoginCredentials = {
    usuario: '',
    senha: '',
  };
  protected readonly passwordVisible = signal(false);
  protected readonly loginMessage = signal('');
  protected readonly isLoading = signal(false);

  constructor(
    private readonly loginService: LoginService,
    private readonly router: Router,
  ) {}

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected submitLogin(): void {
    this.loginMessage.set('');
    this.isLoading.set(true);

    this.loginService.login(this.credentials).subscribe({
      next: (users) => {
        this.isLoading.set(false);
        if (users.length > 0) {
          this.perfilService.definirPerfil({
            id: users[0].id,
            usuario: users[0].usuario,
            nome: users[0].nome || users[0].usuario,
            foto: users[0].foto || '',
          });
          this.router.navigateByUrl('/menu');
          return;
        }

        this.loginMessage.set('Usuário ou senha inválidos.');
      },
      error: () => {
        this.isLoading.set(false);
        this.loginMessage.set('Não foi possível conectar à API. Verifique se o JSON Server está rodando.');
      },
    });
  }

  protected requestPasswordReset(): void {
    this.loginMessage.set('A recuperação de senha ainda não está configurada.');
  }
}
