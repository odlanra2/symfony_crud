<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ProductoDataService } from '../../core/services/producto-data';
import { CategoriaDataService } from '../../core/services/categoria-data';
import type { Producto, Categoria } from '../../core/models/tienda.interface';

// 1. Estados Reactivos (Equivalente exacto a Signals)
const productos = ref<Producto[]>([]);
const categorias = ref<Categoria[]>([]);

// Control de UI del Modal
const isModalOpen = ref(false);
const isEditing = ref(false);
const idProductoEditando = ref<number | null>(null);

// Formulario temporal reactivo
const nuevoProducto = ref({
  nombre: '',
  precio: '',
  descripcion: '',
  categoria_id: null as number | null
});

// Al montar el componente (Equivalente a ngOnInit)
onMounted(async () => {
  try {
    productos.value = await ProductoDataService.findAll();
    categorias.value = await CategoriaDataService.findAll();
  } catch (err) {
    console.error('Error al inicializar datos:', err);
  }
});

const abrirModalNuevo = () => {
  isEditing.value = false;
  idProductoEditando.value = null;
  resetFormulario();
  isModalOpen.value = true;
};

const abrirModalEditar = (prod: Producto) => {
  isEditing.value = true;
  idProductoEditando.value = prod.id ?? null;
  nuevoProducto.value = {
    nombre: prod.nombre,
    precio: prod.precio,
    descripcion: prod.descripcion || '',
    categoria_id: prod.categoria?.id ?? null
  };
  isModalOpen.value = true;
};

const cerrarModal = () => {
  isModalOpen.value = false;
  resetFormulario();
};

const guardarProducto = async () => {
  if (!nuevoProducto.value.nombre.trim() || !nuevoProducto.value.precio || !nuevoProducto.value.categoria_id) {
    alert('Por favor completa los campos obligatorios');
    return;
  }

  try {
    const categoriaCompleta = categorias.value.find(c => c.id === Number(nuevoProducto.value.categoria_id));

    if (isEditing.value && idProductoEditando.value) {
      // --- ACTUALIZACIÓN (PUT) ---
      const respuesta = await ProductoDataService.update(idProductoEditando.value, nuevoProducto.value);
      const jsonReal = typeof respuesta === 'string' ? JSON.parse(respuesta) : respuesta;

      const productoEstructurado: Producto = {
        id: idProductoEditando.value,
        nombre: nuevoProducto.value.nombre,
        precio: nuevoProducto.value.precio,
        descripcion: nuevoProducto.value.descripcion,
        categoria: categoriaCompleta || { id: Number(nuevoProducto.value.categoria_id), nombre: 'Sin asignar' }
      };

      // Mutación inmutable del arreglo (Equivalente al .update de Angular Signal)
      productos.value = productos.value.map(p => p.id === idProductoEditando.value ? productoEstructurado : p);
    } else {
      // --- CREACIÓN (POST) ---
      const respuesta = await ProductoDataService.create(nuevoProducto.value);
      const jsonReal = typeof respuesta === 'string' ? JSON.parse(respuesta) : respuesta;

      const nuevoProductoEstructurado: Producto = {
        id: jsonReal.id,
        nombre: nuevoProducto.value.nombre,
        precio: nuevoProducto.value.precio,
        descripcion: nuevoProducto.value.descripcion,
        categoria: categoriaCompleta || { id: Number(nuevoProducto.value.categoria_id), nombre: 'Sin asignar' }
      };

      productos.value.push(nuevoProductoEstructurado);
    }
    cerrarModal();
  } catch (err: any) {
    alert('Error al procesar: ' + (err.response?.data?.message || err.message));
  }
};

const eliminarProducto = async (id: number | undefined) => {
  if (!id || !confirm('¿Estás seguro de eliminar este producto?')) return;
  try {
    await ProductoDataService.delete(id);
    productos.value = productos.value.filter(p => p.id !== id);
  } catch (err) {
    console.error(err);
  }
};

const resetFormulario = () => {
  nuevoProducto.value = { nombre: '', precio: '', descripcion: '', categoria_id: null };
};
</script>

<template>
  <div class="container" style="padding: 20px; font-family: sans-serif;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Gestión de Existencias (Vue 3 + Composition API)</h2>
      <button @click="abrirModalNuevo" style="background: #28a745; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
        + Añadir Producto
      </button>
    </div>

    <!-- TABLA DE LISTADO -->
    <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead style="background: #e9ecef;">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <!-- Bucle v-for con condicional integrado -->
        <tr v-for="prod in productos" :key="prod.id">
          <td>{{ prod.id }}</td>
          <td><strong>{{ prod.nombre }}</strong></td>
          <td>{{ prod.descripcion || 'Sin descripción' }}</td>
          <td>${{ Number(prod.precio).toFixed(2) }}</td>
          <td>
            <span v-if="prod.categoria" style="background: #42b883; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.85em;">
              {{ prod.categoria.nombre }}
            </span>
            <span v-else style="color: gray;">Sin asignar</span>
          </td>
          <td>
            <button @click="abrirModalEditar(prod)" style="background: #ffc107; color: black; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
              Editar
            </button>
            <button @click="eliminarProducto(prod.id)" style="background: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
              Eliminar
            </button>
          </td>
        </tr>
        <tr v-if="productos.length === 0">
          <td colspan="6" style="text-align: center; color: gray; padding: 20px;">
            No hay productos registrados en PostgreSQL.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL DINÁMICO (v-if) -->
    <div v-if="isModalOpen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div style="background: white; padding: 25px; border-radius: 8px; width: 450px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        <h3 style="margin-top: 0;">{{ isEditing ? 'Modificar Producto' : 'Agregar Nuevo Producto' }}</h3>
        
        <form @submit.prevent="guardarProducto">
          <div style="margin-bottom: 10px;">
            <label>Nombre *:</label><br>
            <input type="text" v-model="nuevoProducto.nombre" required style="width: 100%; padding: 8px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 10px;">
            <label>Precio * ($):</label><br>
            <input type="number" step="0.01" v-model="nuevoProducto.precio" required style="width: 100%; padding: 8px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 10px;">
            <label>Descripción:</label><br>
            <textarea v-model="nuevoProducto.descripcion" style="width: 100%; padding: 8px; box-sizing: border-box; height: 60px;"></textarea>
          </div>
          <div style="margin-bottom: 20px;">
            <label>Categoría *:</label><br>
            <select v-model="nuevoProducto.categoria_id" required style="width: 100%; padding: 8px; box-sizing: border-box;">
              <option :value="null" disabled>-- Selecciona una categoría --</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" @click="cerrarModal" style="background: #6c757d; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
            <button type="submit" style="background: #42b883; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer;">
              {{ isEditing ? 'Guardar Cambios' : 'Registrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
