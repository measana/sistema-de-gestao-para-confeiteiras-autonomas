import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Pedido } from '../../model/pedido';
import { Cliente } from '../../model/cliente';

import { PedidoService } from '../pedido.service';
import { ClienteService } from '../../cliente/cliente.service';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './pedido-list.html',
  styleUrl: './pedido-list.css',
})
export class PedidoList implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly clienteService = inject(ClienteService);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly errorMessage = signal('');

  protected readonly pesquisa = signal('');
  protected readonly statusFiltro = signal('');
  protected readonly dataFiltro = signal('');

  private readonly nomesClientes = computed(
    () => new Map(this.clientes().map((cliente) => [cliente.id, cliente.nome])),
  );

  protected readonly pedidosFiltrados = computed(() => {
    const pesquisa = this.pesquisa().trim();
    const status = this.statusFiltro();
    const data = this.dataFiltro();

    return this.pedidos().filter((pedido) => {
      const correspondePesquisa = pedido.id.toString().includes(pesquisa);
      const correspondeStatus = !status || pedido.status === status;
      const correspondeData = !data || this.dataLocal(pedido.data) === data;

      return correspondePesquisa && correspondeStatus && correspondeData;
    });
  });

  ngOnInit(): void {
    this.carregarPedidos();
    this.carregarClientes();
  }

  protected carregarPedidos(): void {
    this.pedidoService.getAllPedidos().subscribe({
      next: (dados) => {
        this.pedidos.set(dados);
        this.errorMessage.set('');
      },
      error: (erro) => {
        console.error('Erro ao carregar pedidos:', erro);
        this.errorMessage.set('Não foi possível carregar os pedidos.');
      },
    });
  }

  protected carregarClientes(): void {
    this.clienteService.getAllClientes().subscribe({
      next: (dados) => this.clientes.set(dados),
      error: (erro) => console.error('Erro ao carregar clientes:', erro),
    });
  }

  protected nomeCliente(clienteId: number): string {
    return this.nomesClientes().get(clienteId) ?? 'Cliente não encontrado';
  }

  protected limparFiltros(): void {
    this.pesquisa.set('');
    this.statusFiltro.set('');
    this.dataFiltro.set('');
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

  private dataLocal(iso: string): string {
    const d = new Date(iso);
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}
