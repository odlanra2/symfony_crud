<script setup lang="ts">
import ProductoLista from './features/productos/ProductoLista.vue';
import Auth from './features/auth/Auth.vue';
</script>

<template>
  <main>
    <!-- Renderizamos el componente del CRUD -->
    <!-- <ProductoLista />-->
    <!--<Auth />-->
    <RouterView />
  </main>
</template>

