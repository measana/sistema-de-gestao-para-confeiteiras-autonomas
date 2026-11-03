import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Produto } from '../../model/produto';
import { ProdutoService } from '../produto.service';

@Component({
  selector: 'app-produto-item',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './produto-item.html',
  styleUrl: './produto-item.css',
})
export class ProdutoItem {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly produtoService = inject(ProdutoService);

  protected produto: Produto | null = null;
  protected errorMessage = '';
  protected isLoading = true;
  protected isSaving = false;

  constructor() {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id < 1) {
      this.isLoading = false;
      this.errorMessage = 'ID do produto inválido.';
      return;
    }

    this.produtoService.getProdutoById(id).subscribe({

      next: (produto) => {
        this.produto = produto;
        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Não foi possível carregar o produto.';
      }

    });
  }

  protected selecionarImagem(event: Event): void {

    const arquivo = (event.target as HTMLInputElement).files?.[0];

    if (!arquivo || !this.produto) return;

    if (!arquivo.type.startsWith('image/')) {
      this.errorMessage = 'Selecione uma imagem válida.';
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      this.errorMessage = 'A imagem deve ter no máximo 2 MB.';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.produto!.imagem = reader.result as string;
      this.errorMessage = '';
    };

    reader.readAsDataURL(arquivo);
  }

  protected salvar(): void {

    if (!this.produto) return;

    this.isSaving = true;
    this.errorMessage = '';

    this.produtoService.updateProduto(
      this.produto.id,
      this.produto
    ).subscribe({

      next: () => {
        this.isSaving = false;
        this.router.navigateByUrl('/menu/produtoList');
      },

      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Não foi possível atualizar o produto.';
      }

    });
  }

  protected cancelar(): void {
    this.router.navigateByUrl('/menu/produtoList');
  }
}