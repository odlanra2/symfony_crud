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
  
  <div class="app-shell">
     <header class="topbar">
      <div class="marca">
        <span class="marca__logo" aria-hidden="true">V</span>
        <div>
          <h1>Productos</h1>
          <p>CRUD conectado a la API Symfony · Vue 3 + Vite</p>
        </div>
      </div>

      <span class="chip-api">API · /api/productos</span>
    </header>
  </div> 
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
<style scoped>
.app-shell {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 30px 24px 54px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}

.marca {
  display: flex;
  align-items: center;
  gap: 14px;
}

.marca__logo {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--acento), var(--acento-oscuro));
  color: #fff;
  font-weight: 800;
  font-size: 22px;
  box-shadow: 0 10px 22px rgba(66, 184, 131, 0.32);
}

.marca h1 {
  font-size: 25px;
  letter-spacing: -0.4px;
}

.marca p {
  font-size: 13.5px;
  color: var(--texto-suave);
  margin-top: 2px;
}

.chip-api {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--texto-suave);
  background: #fff;
  border: 1px solid var(--borde);
  border-radius: 999px;
  padding: 7px 13px;
}

.chip-api::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--acento);
  box-shadow: 0 0 0 3px var(--acento-suave);
}

.alerta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
}

.alerta--error {
  background: var(--peligro-suave);
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alerta code {
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1px 6px;
  font-size: 12.5px;
}

.alerta__texto {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.panel--tabla {
  position: relative;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-bottom: 1px solid var(--borde);
}

.buscador {
  position: relative;
  flex: 1 1 240px;
  min-width: 200px;
}

.buscador svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.buscador .input {
  padding-left: 38px;
}

.toolbar .select {
  width: auto;
  min-width: 130px;
}

.btn--dir {
  min-width: 46px;
}

.barra-carga {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
}

.barra-carga--activa {
  opacity: 1;
}

.barra-carga::after {
  content: '';
  display: block;
  width: 40%;
  height: 100%;
  background: var(--acento);
  border-radius: 999px;
  animation: barra 1s ease-in-out infinite;
}

@keyframes barra {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}

.paginacion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-top: 1px solid var(--borde);
}

.paginacion__info {
  font-size: 13.5px;
  color: var(--texto-suave);
}

.paginacion__info strong {
  color: var(--texto);
}

.paginacion__controles {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pagina {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border-radius: 9px;
  border: 1px solid var(--borde);
  background: #fff;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--texto-suave);
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.pagina:hover {
  border-color: #cbd5e1;
  color: var(--texto);
}

.pagina--activa {
  background: var(--acento);
  border-color: var(--acento);
  color: #fff;
}

.pagina--activa:hover {
  color: #fff;
}

.pie {
  text-align: center;
  font-size: 12.5px;
  color: var(--texto-suave);
}

@media (max-width: 720px) {
  .app-shell {
    padding: 20px 14px 42px;
  }

  .marca h1 {
    font-size: 22px;
  }

  .toolbar .select {
    flex: 1 1 140px;
  }

  .paginacion {
    justify-content: center;
  }
}
</style>


