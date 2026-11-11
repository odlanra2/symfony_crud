import { Routes } from '@angular/router';
import { ProductoListaComponent } from './features/productos/producto-lista/producto-lista';
import { authGuard, invitadoGuard } from './core/auth.guard';
import { Login } from './auth/login/login';
export const routes: Routes = [
    //lazy loading de componentes, para que no se carguen todos los componentes al inicio, sino que se carguen cuando se necesiten
   {
    path: 'login',
    title: 'Iniciar sesión · Angular + Symfony',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./auth/login/login').then((archivo) => archivo.Login),
  },

   /*{
    path: 'login',
    component: Login
  },*/


  {
    path: '',
    title: 'Productos · Angular + Symfony',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/producto-lista/producto-lista').then((archivo) => archivo.ProductoListaComponent),
  },
  { path: '**', redirectTo: '' },
];
