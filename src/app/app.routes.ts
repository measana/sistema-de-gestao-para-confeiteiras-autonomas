import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Menu } from './menu/menu';

export const routes: Routes = [
	{ path: '', component: Login },
	{ path: 'menu', component: Menu },
];
