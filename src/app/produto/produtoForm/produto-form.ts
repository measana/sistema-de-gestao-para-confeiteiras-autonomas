import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService } from '../produto.service';
import { Produto } from '../../model/produto';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css',
})
export class ProdutoForm implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Campos do formulário (signals aceitam [(ngModel)] direto no template).
  protected readonly nome = signal('');
  protected readonly categoria = signal('');
  protected readonly preco = signal<number | null>(null);
  protected readonly imagem = signal('');

  protected readonly produtoId = signal<number | null>(null);
  protected readonly isEdicao = computed(() => this.produtoId() !== null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly produtoNaoEncontrado = signal(false);

  // Registro original vindo da API. Guardamos para não perder campos que o
  // formulário não edita (ex.: "estoque"), já que o PUT substitui o registro todo.
  private original: Produto | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id === null) {
      return; // modo cadastro
    }

    const produtoId = Number(id);

    if (!Number.isInteger(produtoId) || produtoId < 1) {
      this.produtoNaoEncontrado.set(true);
      this.errorMessage.set('ID do produto inválido.');
      return;
    }

    this.produtoId.set(produtoId);
    this.isLoading.set(true);

    this.produtoService.getProdutoById(produtoId).subscribe({
      next: (produto) => {
        this.original = produto;
        this.nome.set(produto.nome);
        this.categoria.set(produto.categoria);
        this.preco.set(produto.preco);
        this.imagem.set(produto.imagem ?? '');
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.produtoNaoEncontrado.set(true);
        this.errorMessage.set('Não foi possível encontrar o produto.');
      },
    });
  }

  protected selecionarImagem(event: Event): void {
    const arquivo = (event.target as HTMLInputElement).files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      this.errorMessage.set('Selecione um arquivo de imagem válido.');
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      this.errorMessage.set('A imagem deve ter no máximo 2 MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.imagem.set(reader.result as string);
      this.errorMessage.set('');
    };

    reader.onerror = () => {
      this.errorMessage.set('Não foi possível ler a imagem selecionada.');
    };

    reader.readAsDataURL(arquivo);
  }

  protected salvar(): void {
    this.errorMessage.set('');
    this.isSaving.set(true);

    const dados = {
      nome: this.nome().trim(),
      categoria: this.categoria(),
      preco: Number(this.preco()),
      imagem: this.imagem(),
    };

    const id = this.produtoId();

    if (id !== null && this.original) {
      // Mantém os campos extras do registro (estoque, etc.) e sobrescreve só o editado.
      const produtoAtualizado: Produto = { ...this.original, ...dados, id };

      this.produtoService.updateProduto(id, produtoAtualizado).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigateByUrl('/menu/produtoList');
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMessage.set('Não foi possível atualizar o produto.');
        },
      });
      return;
    }

    this.produtoService.createProduto(dados).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigateByUrl('/menu/produtoList');
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Não foi possível cadastrar o produto.');
      },
    });
  }

  protected cancelar(): void {
    this.router.navigateByUrl('/menu/produtoList');
  }
}
