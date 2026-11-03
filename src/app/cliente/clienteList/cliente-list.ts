import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { catchError, filter, of, startWith, Subject, switchMap } from 'rxjs';
import { Cliente } from '../../model/cliente';
import { ClienteService } from '../cliente.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  imports: [MatDialogModule],
  selector: 'app-confirm-delete-cliente-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title>Excluir cliente?</h2>
    <mat-dialog-content>
      Tem certeza que deseja excluir <strong>{{ cliente.nome }}</strong>? Essa ação não pode ser desfeita.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button class="confirm-dialog__cancel" type="button" mat-dialog-close [mat-dialog-close]="false">Cancelar</button>
      <button class="confirm-dialog__delete" type="button" [mat-dialog-close]="true">Excluir</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .confirm-dialog__cancel,
    .confirm-dialog__delete {
      min-height: 40px;
      padding: 0 16px;
      border: 1px solid #d4d4c5;
      border-radius: 8px;
      font: inherit;
      cursor: pointer;
    }
    .confirm-dialog__cancel { background: #fff; }
    .confirm-dialog__delete { color: #fff; background: #c62828; border-color: #c62828; }
  `],
})
class ConfirmDeleteClienteDialog {
  protected readonly cliente = inject<Cliente>(MAT_DIALOG_DATA);
}

@Component({
  imports: [MatTableModule, RouterLink],
  selector: 'app-cliente-list',
  styleUrl: './cliente-list.css',
  templateUrl: './cliente-list.html',
})
export class ClienteList {
  private readonly clienteService = inject(ClienteService);
  private readonly dialog = inject(MatDialog);
  private readonly refreshClientes = new Subject<void>();
  protected readonly displayedColumns = ['nome', 'email', 'telefone', 'endereco', 'acoes'];
  protected readonly errorMessage = signal('');
  protected readonly dataSource = new MatTableDataSource<Cliente>([]);
  protected readonly clientes = toSignal(
    this.refreshClientes.pipe(
      startWith(undefined),
      switchMap(() => {
        this.errorMessage.set('');
        return this.clienteService.getAllClientes().pipe(
          catchError(() => {
            this.errorMessage.set('Não foi possível carregar os clientes.');
            return of([] as Cliente[]);
          }),
        );
      }),
    ),
    { initialValue: [] as Cliente[] },
  );

  constructor() {
    this.dataSource.filterPredicate = (cliente, filter) =>
      [cliente.nome, cliente.email, cliente.telefone, cliente.endereco]
        .some((value) => this.normalizarTexto(value).includes(filter));

    effect(() => {
      this.dataSource.data = this.clientes();
    });
  }

  protected filtrarClientes(event: Event): void {
    const termo = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.normalizarTexto(termo.trim());
  }

  protected confirmarExclusao(cliente: Cliente): void {
    this.dialog.open(ConfirmDeleteClienteDialog, { data: cliente }).afterClosed().pipe(
      filter((confirmado) => confirmado === true),
      switchMap(() => this.clienteService.deleteCliente(cliente.id)),
    ).subscribe({
      next: () => this.refreshClientes.next(),
      error: () => this.errorMessage.set('Não foi possível excluir o cliente. Tente novamente.'),
    });
  }

  private normalizarTexto(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
}
