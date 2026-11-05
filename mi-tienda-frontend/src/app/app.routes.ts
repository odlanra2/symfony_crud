import { Routes } from '@angular/router';
import { ProductoListaComponent } from './features/productos/producto-lista/producto-lista';

export const routes: Routes = [

  {
    path: '',
    title: 'Productos · Angular + Symfony',
    loadComponent: () => import('./features/productos/producto-lista/producto-lista').then((archivo) => archivo.ProductoListaComponent),
  },
  { path: '**', redirectTo: '' },
];
