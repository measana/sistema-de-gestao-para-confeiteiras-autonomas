import { Injectable, signal } from '@angular/core';

export interface PerfilUsuario {
  id: number;
  usuario: string;
  nome: string;
  foto: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  readonly perfil = signal<PerfilUsuario>({
    id: Number(sessionStorage.getItem('usuarioId')) || 0,
    usuario: sessionStorage.getItem('usuario') || 'Usuário',
    nome: sessionStorage.getItem('nomePerfil') || sessionStorage.getItem('usuario') || 'Usuário',
    foto: sessionStorage.getItem('fotoPerfil') || '',
  });

  definirPerfil(perfil: PerfilUsuario): void {
    this.perfil.set(perfil);
    sessionStorage.setItem('usuarioId', String(perfil.id));
    sessionStorage.setItem('usuario', perfil.usuario);
    sessionStorage.setItem('nomePerfil', perfil.nome);
    sessionStorage.setItem('fotoPerfil', perfil.foto);
  }

  encerrarSessao(): void {
    this.perfil.set({ id: 0, usuario: 'Usuário', nome: 'Usuário', foto: '' });
    sessionStorage.removeItem('usuarioId');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('nomePerfil');
    sessionStorage.removeItem('fotoPerfil');
  }
}