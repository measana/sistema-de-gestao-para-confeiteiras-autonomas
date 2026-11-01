import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from '../../model/cliente';
import { ClienteService } from '../cliente.service';

@Component({
  imports: [FormsModule, NgxMaskDirective],
  selector: 'app-cliente-item',
  styleUrl: './cliente-item.css',
  templateUrl: './cliente-item.html',
})
export class ClienteItem {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  protected cliente: Cliente | null = null;
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.isLoading.set(false);
      this.errorMessage.set('ID de cliente inválido.');
      return;
    }

    this.clienteService.getClienteById(id).subscribe({
      next: (cliente) => {
        cliente.telefone = cliente.telefone.replace(/\D/g, '').slice(0, 11);
        this.cliente = cliente;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Não foi possível carregar o cliente.');
      },
    });
  }

  protected salvar(): void {
    if (!this.cliente) {
      return;
    }

    this.errorMessage.set('');
    this.isSaving.set(true);
    this.clienteService.updateCliente(this.cliente.id, this.cliente).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigateByUrl('/menu/clienteList');
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Não foi possível atualizar o cliente. Tente novamente.');
      },
    });
  }

  protected cancelar(): void {
    this.router.navigateByUrl('/menu/clienteList');
  }
}
