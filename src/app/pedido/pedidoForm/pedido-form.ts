import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Cliente } from '../../model/cliente';
import { Produto } from '../../model/produto';
import { Pedido } from '../../model/pedido';

import { ClienteService } from '../../cliente/cliente.service';
import { ProdutoService } from '../../produto/produto.service';
import { PedidoService } from '../pedido.service';

type ItemCarrinho = Pedido['produtos'][number];

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './pedido-form.html',
  styleUrl: './pedido-form.css',
})
export class PedidoForm implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly produtoService = inject(ProdutoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly produtos = signal<Produto[]>([]);

  protected readonly clienteSelecionado = signal<number | null>(null);
  protected readonly produtoBusca = signal('');
  protected readonly pagamento = signal('');
  protected readonly carrinho = signal<ItemCarrinho[]>([]);
  protected readonly isSaving = signal(false);

  protected readonly produtosFiltrados = computed(() => {
    const busca = this.produtoBusca().trim().toLowerCase();
    return this.produtos().filter((produto) => (produto.nome ?? '').toLowerCase().includes(busca));
  });

  protected readonly total = computed(() =>
    this.carrinho().reduce((soma, item) => soma + item.preco * item.quantidade, 0),
  );

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarProdutos();
  }

  private carregarClientes(): void {
    this.clienteService.getAllClientes().subscribe({
      next: (dados) => this.clientes.set(dados),
      error: (erro) => console.error('Erro ao carregar clientes:', erro),
    });
  }

  private carregarProdutos(): void {
    this.produtoService.getAllProdutos().subscribe({
      next: (dados) => this.produtos.set(dados),
      error: (erro) => console.error('Erro ao carregar produtos:', erro),
    });
  }

  protected adicionarProduto(produto: Produto): void {
    this.carrinho.update((itens) => {
      if (itens.some((item) => item.produtoId === produto.id)) {
        return itens.map((item) =>
          item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        );
      }

      return [
        ...itens,
        { produtoId: produto.id, nome: produto.nome, quantidade: 1, preco: produto.preco },
      ];
    });
  }

  protected aumentarQuantidade(produtoId: number): void {
    this.carrinho.update((itens) =>
      itens.map((item) =>
        item.produtoId === produtoId ? { ...item, quantidade: item.quantidade + 1 } : item,
      ),
    );
  }

  protected diminuirQuantidade(produtoId: number): void {
    this.carrinho.update((itens) =>
      itens
        .map((item) =>
          item.produtoId === produtoId ? { ...item, quantidade: item.quantidade - 1 } : item,
        )
        .filter((item) => item.quantidade > 0),
    );
  }

  protected removerProduto(produtoId: number): void {
    this.carrinho.update((itens) => itens.filter((item) => item.produtoId !== produtoId));
  }

  protected salvarPedido(): void {
    const clienteId = this.clienteSelecionado();

    if (clienteId === null) {
      alert('Selecione um cliente.');
      return;
    }

    if (this.carrinho().length === 0) {
      alert('Adicione pelo menos um produto ao pedido.');
      return;
    }

    if (!this.pagamento()) {
      alert('Selecione uma forma de pagamento.');
      return;
    }

    const novoPedido: Omit<Pedido, 'id'> = {
      clienteId,
      data: new Date().toISOString(),
      status: 'Pending',
      produtos: this.carrinho(),
      pagamento: this.pagamento(),
      total: this.total(),
    };

    this.isSaving.set(true);

    this.pedidoService.createPedido(novoPedido).subscribe({
      next: () => {
        this.isSaving.set(false);
        alert('Pedido cadastrado com sucesso!');
        this.router.navigate(['/menu/pedidoList']);
      },
      error: (erro) => {
        this.isSaving.set(false);
        console.error('Erro ao cadastrar pedido:', erro);
        alert('Não foi possível cadastrar o pedido.');
      },
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/menu/pedidoList']);
  }
}
