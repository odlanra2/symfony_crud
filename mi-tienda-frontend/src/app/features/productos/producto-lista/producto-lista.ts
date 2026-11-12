import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoDataService } from '../../../core/services/producto-data';
import { CategoriaDataService } from '../../../core/services/categoria-data';
import { Producto, Categoria } from '../../../core/models/tienda';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-lista.html',
  styleUrl: './producto-lista.css'
})
export class ProductoListaComponent implements OnInit {
  // Capa de Infraestructura (Servicios de datos)
  private productoDataService = inject(ProductoDataService);
  private categoriaDataService = inject(CategoriaDataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  // 1. Declaración de Estados usando Angular Signals
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  protected readonly errorConexion = signal('');

  // Signals para controlar la UI
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  idProductoEditando = signal<number | null>(null);
  // Modelo temporal para el formulario (lo mantenemos como objeto mutable enlazado a NgModel)
  nuevoProducto = {
    nombre: '',
    precio: '',
    descripcion: '',
    categoria_id: null as number | null
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargamos los productos y actualizamos la Signal con .set()
    this.productoDataService.findAll().subscribe({
      next: (res) =>{
          this.productos.set(res),
          this.errorConexion.set('');
      },
      error: (err) =>{
          console.error('Error al cargar productos:', err)
          this.errorConexion.set('Error al cargar productos');
      }
    });

    // Cargamos las categorías para el selector descolgable
    this.categoriaDataService.findAll().subscribe({
      next: (res) => this.categorias.set(res),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

    abrirModalNuevo(): void {
    this.isEditing.set(false);
    this.idProductoEditando.set(null);
    this.resetFormulario();
    this.isModalOpen.set(true);
  }

  abrirModalEditar(prod: Producto): void {
    this.isEditing.set(true);
    this.idProductoEditando.set(prod.id ?? null);

    // Mapeamos los datos del producto al formulario
    this.nuevoProducto = {
      nombre: prod.nombre,
      precio: prod.precio,
      descripcion: prod.descripcion || '',
      categoria_id: prod.categoria?.id ?? null
    };

    this.isModalOpen.set(true);
  }

  cerrarModal(): void {
    this.isModalOpen.set(false);
    this.resetFormulario();
  }

  guardarProducto(): void {
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.precio || !this.nuevoProducto.categoria_id) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    if (this.isEditing()) {
      // --- LÓGICA DE ACTUALIZACIÓN (PUT) ---
      const id = this.idProductoEditando();
      if (!id) return;

      this.productoDataService.update(id, this.nuevoProducto).subscribe({
        next: (productoActualizado) => {


          // 1. Buscamos el objeto de la categoría en nuestra signal local de categorías
         const categoriaCompleta = this.categorias().find(
               c => c.id === Number(this.nuevoProducto.categoria_id)
         );
          const productoEstructurado: Producto = {
        ...productoActualizado,
            nombre: this.nuevoProducto.nombre,
            precio: this.nuevoProducto.precio,
           descripcion: this.nuevoProducto.descripcion,
           categoria: categoriaCompleta || { nombre: 'Sin asignar' } // Forzamos el objeto completo para la vista
      };

          this.productos.update((lista) =>
            lista.map(p => p.id === id ? productoEstructurado : p)
          );
          this.cerrarModal();
        },
        error: (err) => alert('Error al actualizar: ' + (err.error?.message || err.message))
      });
    } else {
      // --- LÓGICA DE CREACIÓN (POST) ---
      this.productoDataService.create(this.nuevoProducto).subscribe({
        next: (productoGuardado) => {
          const categoriaCompleta = this.categorias().find(
            c => c.id === Number(this.nuevoProducto.categoria_id)
          );
          const jsonReal = typeof productoGuardado === 'string'
        ? JSON.parse(productoGuardado)
        : productoGuardado;

          console.log(productoGuardado)
          const nuevoProductoEstructurado: Producto = {
            id: jsonReal.id, // <-- Conservamos la ID obligatoria del servidor
            nombre: this.nuevoProducto.nombre,
            precio: this.nuevoProducto.precio,
            descripcion: this.nuevoProducto.descripcion,
            categoria: categoriaCompleta || { id: Number(this.nuevoProducto.categoria_id), nombre: 'Sin asignar' }
          };

          this.productos.update((listaActual) => [...listaActual, nuevoProductoEstructurado]);
          this.cerrarModal();
        },
        error: (err) => alert('Error al guardar: ' + (err.error?.message || err.message))
      });
    }
  }

  eliminarProducto(id: number | undefined): void {
    if (!id || !confirm('¿Estás seguro de eliminar este producto?')) return;

    this.productoDataService.delete(id).subscribe({
      next: () => {
        // Filtramos y actualizamos la Signal directamente en base al estado anterior
        this.productos.update((listaActual) => listaActual.filter(p => p.id !== id));
      },
      error: (err) => console.error('Error al eliminar producto:', err)
    });
  }

  private resetFormulario(): void {
    this.nuevoProducto = {
      nombre: '',
      precio: '',
      descripcion: '',
      categoria_id: null
    };
  }

  protected salir(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}
