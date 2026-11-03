import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Pedido } from '../model/pedido';
import { Cliente } from '../model/cliente';

import { PedidoService } from '../pedido/pedido.service';
import { ClienteService } from '../cliente/cliente.service';
import { ProdutoService } from '../produto/produto.service';

interface PedidoDashboard {
  id: number;
  clienteId: number;
  data: string;
  status: string;
  pagamento: string;
  total: number;
  produtos: {
    produtoId: number;
    nome: string;
    quantidade: number;
    preco: number;
  }[];
}

interface ClienteRecorrente {
  nome: string;
  quantidadePedidos: number;
  totalGasto: number;
}

interface ProdutoMaisPedido {
  nome: string;
  quantidade: number;
  totalVendido: number;
}

interface VendaMensal {
  mes: string;
  total: number;
  altura: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly clienteService = inject(ClienteService);
  private readonly produtoService = inject(ProdutoService);

  pedidos: PedidoDashboard[] = [];
  clientes: Cliente[] = [];

  totalPedidos = 0;
  totalClientes = 0;
  faturamento = 0;

  produtoDestaque = 'Nenhum produto';
  clientesRecorrentes: ClienteRecorrente[] = [];
  produtosMaisPedidos: ProdutoMaisPedido[] = [];
  pedidosRecentes: PedidoDashboard[] = [];
  vendasMensais: VendaMensal[] = [];

  carregando = signal(true);
  erro = signal('');

  ngOnInit(): void {
    this.carregarDashboard();
  }

  carregarDashboard(): void {
    this.carregando.set(true);
    this.erro.set('');

    console.log('Iniciando carregamento do dashboard...');

    forkJoin({
      pedidos: this.pedidoService.getAllPedidos(),
      clientes: this.clienteService.getAllClientes(),
      produtos: this.produtoService.getAllProdutos(),
    }).subscribe({
      next: ({ pedidos, clientes, produtos }) => {
        console.log('Pedidos recebidos:', pedidos);
        console.log('Clientes recebidos:', clientes);
        console.log('Produtos recebidos:', produtos);

        try {
          this.pedidos = pedidos as PedidoDashboard[];
          this.clientes = clientes;

          this.calcularIndicadores();

          console.log('Indicadores calculados!');
          console.log('Total de pedidos:', this.totalPedidos);
          console.log('Total de clientes:', this.totalClientes);
          console.log('Faturamento:', this.faturamento);
        } catch (erro) {
          console.error('Erro ao calcular indicadores:', erro);
          this.erro.set('Ocorreu um erro ao processar os dados.');
        } finally {
          this.carregando.set(false);
        }
      },

      error: (erro) => {
        console.error('Erro ao carregar dashboard:', erro);

        this.erro.set('Não foi possível carregar os dados do dashboard.');
        this.carregando.set(false);
      },
    });
  }

  private calcularIndicadores(): void {
    this.totalPedidos = this.pedidos.length;
    this.totalClientes = this.clientes.length;

    this.faturamento = this.pedidos.reduce((soma, pedido) => soma + Number(pedido.total || 0), 0);

    this.calcularProdutosMaisPedidos();
    this.calcularClientesRecorrentes();
    this.calcularVendasMensais();
    this.calcularPedidosRecentes();
  }

  private calcularProdutosMaisPedidos(): void {
    const produtos = new Map<string, ProdutoMaisPedido>();

    this.pedidos.forEach((pedido) => {
      (pedido.produtos || []).forEach((item) => {
        const nome = item.nome || `Produto ${item.produtoId}`;
        const atual = produtos.get(nome);

        if (atual) {
          atual.quantidade += Number(item.quantidade || 0);
          atual.totalVendido += Number(item.quantidade || 0) * Number(item.preco || 0);
        } else {
          produtos.set(nome, {
            nome,
            quantidade: Number(item.quantidade || 0),
            totalVendido: Number(item.quantidade || 0) * Number(item.preco || 0),
          });
        }
      });
    });

    this.produtosMaisPedidos = Array.from(produtos.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    this.produtoDestaque = this.produtosMaisPedidos[0]?.nome || 'Nenhum produto';
  }

  private calcularClientesRecorrentes(): void {
    const clientes = new Map<number, ClienteRecorrente>();

    this.pedidos.forEach((pedido) => {
      const cliente = this.clientes.find((c) => c.id === Number(pedido.clienteId));

      if (!cliente) return;

      const atual = clientes.get(cliente.id);

      if (atual) {
        atual.quantidadePedidos++;
        atual.totalGasto += Number(pedido.total || 0);
      } else {
        clientes.set(cliente.id, {
          nome: cliente.nome,
          quantidadePedidos: 1,
          totalGasto: Number(pedido.total || 0),
        });
      }
    });

    this.clientesRecorrentes = Array.from(clientes.values())
      .filter((cliente) => cliente.quantidadePedidos > 1)
      .sort((a, b) => b.quantidadePedidos - a.quantidadePedidos)
      .slice(0, 5);
  }

  private calcularVendasMensais(): void {
    const hoje = new Date();
    const meses: VendaMensal[] = [];

    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);

      meses.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
        total: 0,
        altura: 0,
      });
    }

    this.pedidos.forEach((pedido) => {
      const dataPedido = new Date(pedido.data);

      if (isNaN(dataPedido.getTime())) return;

      const mesPedido = meses.find((mes) => {
        const indice = meses.indexOf(mes);
        const dataReferencia = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + indice, 1);

        return (
          dataPedido.getMonth() === dataReferencia.getMonth() &&
          dataPedido.getFullYear() === dataReferencia.getFullYear()
        );
      });

      if (mesPedido) {
        mesPedido.total += Number(pedido.total || 0);
      }
    });

    const maiorVenda = Math.max(...meses.map((mes) => mes.total), 1);

    meses.forEach((mes) => {
      mes.altura = Math.max((mes.total / maiorVenda) * 100, 4);
    });

    this.vendasMensais = meses;
  }

  private calcularPedidosRecentes(): void {
    this.pedidosRecentes = [...this.pedidos]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }

  obterNomeCliente(clienteId: number): string {
    return (
      this.clientes.find((cliente) => cliente.id === Number(clienteId))?.nome ||
      'Cliente não encontrado'
    );
  }

  formatarMoeda(valor: number): string {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  formatarData(data: string): string {
    if (!data) return '-';

    const dataFormatada = new Date(data);

    if (isNaN(dataFormatada.getTime())) return data;

    return dataFormatada.toLocaleDateString('pt-BR');
  }

  traduzirStatus(status: string): string {
    const statusMap: Record<string, string> = {
      Pending: 'Pendente',
      Delivered: 'Entregue',
      Cancelled: 'Cancelado',
    };

    return statusMap[status] || status;
  }

  private tratarErro(erro: unknown): void {
    console.error('Erro ao carregar dashboard:', erro);
    this.erro.set('Não foi possível carregar os dados do dashboard.');
    this.carregando.set(false);
  }
}
