import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Produto } from '../../model/produto';
import { ProdutoService } from '../produto.service';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './produto-list.html',
  styleUrl: './produto-list.css',
})
export class ProdutoList {
  private readonly produtoService = inject(ProdutoService);

  // Signals: no Angular 22 o padrão é OnPush + zoneless, então o que chega
  // de forma assíncrona (HTTP) precisa estar em signal para a tela atualizar.
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly termoBusca = signal('');
  protected readonly errorMessage = signal('');

  protected readonly produtosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();

    return this.produtos().filter(
      (produto) =>
        (produto.nome ?? '').toLowerCase().includes(termo) ||
        (produto.categoria ?? '').toLowerCase().includes(termo),
    );
  });

  constructor() {
    this.carregarProdutos();
  }

  protected carregarProdutos(): void {
    this.produtoService.getAllProdutos().subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
        this.errorMessage.set('');
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os produtos.');
      },
    });
  }

  protected confirmarExclusao(produto: Produto): void {
    const confirmado = window.confirm(`Deseja excluir o produto ${produto.nome}?`);

    if (!confirmado) {
      return;
    }

    this.produtoService.deleteProduto(produto.id).subscribe({
      next: () => this.carregarProdutos(),
      error: () => {
        this.errorMessage.set('Não foi possível excluir o produto.');
      },
    });
  }
}
