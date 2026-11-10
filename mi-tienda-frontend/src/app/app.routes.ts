import { Routes } from '@angular/router';
import { ProductoListaComponent } from './features/productos/producto-lista/producto-lista';
import { authGuard, invitadoGuard } from './core/auth.guard';
export const routes: Routes = [

   {
    path: 'login',
    title: 'Iniciar sesión · Angular + Symfony',
    //canActivate: [invitadoGuard],
    loadComponent: () => import('./auth/login/login').then((archivo) => archivo.Login),
  },


  {
    path: '',
    title: 'Productos · Angular + Symfony',
    //canActivate: [authGuard],
    loadComponent: () => import('./features/productos/producto-lista/producto-lista').then((archivo) => archivo.ProductoListaComponent),
  },
  { path: '**', redirectTo: '' },
];
