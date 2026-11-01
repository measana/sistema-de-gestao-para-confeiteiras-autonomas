import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Menu } from './menu/menu';
import { ClienteList } from './cliente/clienteList/cliente-list';
import { ClienteForm } from './cliente/clienteForm/clienteForm';
import { ClienteItem } from './cliente/clienteItem/cliente-item';

export const routes: Routes = [
	{ path: '', component: Login },
	{
		path: 'menu',
		component: Menu,
		children: [
			{ path: '', redirectTo: 'menu', pathMatch: 'full' },
			{ path: 'clienteList', component: ClienteList },
			{ path: 'clienteForm', component: ClienteForm },
			{ path: 'clienteItem/:id', component: ClienteItem },
		],
	},
];
