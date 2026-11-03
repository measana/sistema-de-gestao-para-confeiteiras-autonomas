import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Menu } from './menu/menu';
//Clientes
import { ClienteList } from './cliente/clienteList/cliente-list';
import { ClienteForm } from './cliente/clienteForm/clienteForm';
import { ClienteItem } from './cliente/clienteItem/cliente-item';
//Produtos
import { ProdutoList } from './produto/produtoList/produto-list';
import { ProdutoForm } from './produto/produtoForm/produto-form';
import { ProdutoItem } from './produto/produtoItem/produto-item';
//Pedidos
import { PedidoForm } from './pedido/pedidoForm/pedido-form';
import { PedidoList } from './pedido/pedidoList/pedido-list';
import { PedidoItem } from './pedido/pedidoItem/pedido-item';
//Dashboard
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: 'menu',
    component: Menu,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      //Clientes
      { path: 'clienteList', component: ClienteList },
      { path: 'clienteForm', component: ClienteForm },
      { path: 'clienteItem/:id', component: ClienteItem },
      //Produtos
      { path: 'produtoList', component: ProdutoList },
      { path: 'produtoForm', component: ProdutoForm },
      { path: 'produtoForm/:id', component: ProdutoForm },
      { path: 'produtoItem/:id', component: ProdutoItem },
      //pedido
      { path: 'pedidoList', component: PedidoList },
      { path: 'pedidoForm', component: PedidoForm },
      { path: 'pedidoForm/:id', component: PedidoForm },
      { path: 'pedidoItem/:id', component: PedidoItem },
    ],
  },
];
