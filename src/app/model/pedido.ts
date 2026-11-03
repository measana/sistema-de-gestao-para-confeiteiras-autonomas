export interface Pedido {
  id: number;
  clienteId: number;
  data: string;
  status: string;
  produtos: {
    produtoId: number;
    nome: string;
    quantidade: number;
    preco: number;
  }[];
  pagamento: string;
  total: number;
}
