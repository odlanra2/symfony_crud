<script setup lang="ts">
import ProductoLista from './features/productos/ProductoLista.vue';
</script>

<template>
  <main>
    <!-- Renderizamos el componente del CRUD -->
    <ProductoLista />
  </main>
</template>

<style>
/* Estilos globales mínimos opcionales */
body {
  margin: 0;
  background-color: #fafafa;
  color: #333;
}
</style>
