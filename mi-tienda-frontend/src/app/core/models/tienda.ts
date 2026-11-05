export interface Categoria {
  id?: number;
  nombre: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  precio: string; // Symfony DECIMAL mapea como string
  descripcion?: string;
  categoria: Categoria;
}
