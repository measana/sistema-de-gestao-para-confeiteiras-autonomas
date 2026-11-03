import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { Router } from '@angular/router';
import { Cliente } from '../../model/cliente';
import { ClienteService } from '../cliente.service';

@Component({
  standalone: true,
  imports: [FormsModule, NgxMaskDirective],
  selector: 'app-cliente-form',
  styleUrl: './clienteForm.css',
  templateUrl: './clienteForm.html',
})
export class ClienteForm {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  protected readonly cliente: Omit<Cliente, 'id'> = {
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
  };
  protected readonly errorMessage = signal('');
  protected readonly isSaving = signal(false);

  protected salvar(): void {
    this.errorMessage.set('');
    this.isSaving.set(true);

    this.clienteService.createCliente(this.cliente).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigateByUrl('/menu/clienteList');
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Não foi possível salvar o cliente. Tente novamente.');
      },
    });
  }

  protected cancelar(): void {
    this.router.navigateByUrl('/menu/clienteList');
  }
}