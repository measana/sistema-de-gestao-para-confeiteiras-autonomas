import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Pedido } from '../../model/pedido';

import { PedidoService } from '../pedido.service';
import { ClienteService } from '../../cliente/cliente.service';

@Component({
  selector: 'app-pedido-item',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './pedido-item.html',
  styleUrl: './pedido-item.css',
})
export class PedidoItem implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pedidoService = inject(PedidoService);
  private readonly clienteService = inject(ClienteService);

  // Signals: a resposta HTTP chega depois da 1ª renderização e precisa atualizar a tela.
  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly nomeCliente = signal('Carregando cliente...');
  protected readonly carregando = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id < 1) {
      this.carregando.set(false);
      alert('Identificador do pedido inválido.');
      this.voltar();
      return;
    }

    this.carregarPedido(id);
  }

  private carregarPedido(id: number): void {
    this.pedidoService.getPedidoById(id).subscribe({
      next: (dados) => {
        this.pedido.set(dados);
        this.carregando.set(false);
        this.carregarCliente(dados.clienteId);
      },
      error: (erro) => {
        console.error('Erro ao carregar pedido:', erro);
        this.carregando.set(false);
        alert('Não foi possível encontrar o pedido.');
        this.voltar();
      },
    });
  }

  private carregarCliente(clienteId: number): void {
    this.clienteService.getClienteById(clienteId).subscribe({
      next: (cliente) => this.nomeCliente.set(cliente.nome),
      error: (erro) => {
        console.error('Erro ao carregar cliente:', erro);
        this.nomeCliente.set('Cliente não encontrado');
      },
    });
  }

  protected traduzirStatus(status: string): string {
    switch (status) {
      case 'Pending':
        return 'Pendente';
      case 'Delivered':
        return 'Entregue';
      case 'Cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  protected cancelarPedido(): void {
    const pedido = this.pedido();

    if (!pedido) {
      return;
    }

    if (pedido.status === 'Cancelled') {
      alert('Este pedido já está cancelado.');
      return;
    }

    if (!confirm('Tem certeza de que deseja cancelar este pedido?')) {
      return;
    }

    const pedidoAtualizado: Pedido = { ...pedido, status: 'Cancelled' };

    this.pedidoService.updatePedido(pedido.id, pedidoAtualizado).subscribe({
      next: (dados) => {
        this.pedido.set(dados);
        alert('Pedido cancelado com sucesso!');
      },
      error: (erro) => {
        console.error('Erro ao cancelar pedido:', erro);
        alert('Não foi possível cancelar o pedido.');
      },
    });
  }

  protected imprimirPedido(): void {
    window.print();
  }

  protected voltar(): void {
    this.router.navigate(['/menu/pedidoList']);
  }
}
