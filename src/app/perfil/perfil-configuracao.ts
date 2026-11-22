import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../login/login.service';
import { PerfilService } from './perfil.service';

@Component({
  selector: 'app-perfil-configuracao',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil-configuracao.html',
  styleUrl: './perfil-configuracao.css',
})
export class PerfilConfiguracao {
  private readonly loginService = inject(LoginService);
  private readonly perfilService = inject(PerfilService);
  protected readonly perfil = this.perfilService.perfil;
  protected readonly nome = signal(this.perfil().nome);
  protected readonly foto = signal(this.perfil().foto);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.error.set('');
    this.message.set('');

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('Selecione um arquivo de imagem.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('A imagem deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.foto.set(String(reader.result));
    reader.onerror = () => this.error.set('Não foi possível carregar essa imagem.');
    reader.readAsDataURL(file);
  }

  protected save(): void {
    const nome = this.nome().trim();
    if (!nome) {
      this.error.set('Informe seu nome de perfil.');
      return;
    }
    if (!this.perfil().id) {
      this.error.set('Não foi possível identificar o usuário conectado. Entre novamente.');
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.error.set('');
    this.loginService.updateProfile(this.perfil().id, { nome, foto: this.foto() }).subscribe({
      next: (user) => {
        this.perfilService.definirPerfil({
          ...this.perfil(),
          nome: user.nome || nome,
          foto: user.foto || '',
        });
        this.nome.set(user.nome || nome);
        this.foto.set(user.foto || '');
        this.saving.set(false);
        this.message.set('Perfil atualizado com sucesso.');
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Não foi possível salvar as alterações. Tente novamente.');
      },
    });
  }
}