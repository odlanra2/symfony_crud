export interface Categoria {
  id?: number;
  nombre: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  precio: string;
  descripcion?: string;
  categoria: Categoria;
}