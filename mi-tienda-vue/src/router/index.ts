import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Auth from '../features/auth/Auth.vue'
import ProductoLista from '../features/productos/ProductoLista.vue'
import { useAuthStore } from '../stores/auth'

// Tipado opcional para autocompletar propiedades en meta
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}


const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../features/auth/Auth.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name:'producto',
    component: () => import('../features/productos/ProductoLista.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

let sesionVerificada = false

router.beforeEach(async (to) => {
    const authStore = useAuthStore()

  // Valida el token contra la API una sola vez al cargar o recargar la app
  if (!sesionVerificada && authStore.token) {
    await authStore.restaurarSesion()
    sesionVerificada = true
  }

  // Ruta protegida y usuario sin sesión -> redirige al login
  if (to.meta.requiresAuth && !authStore.autenticado) {
    return {
      name: 'login',
     
    }
  }

  // Ruta de invitado (login/registro) y usuario ya autenticado -> redirige al dashboard
  if (to.meta.guestOnly && authStore.autenticado) {
    return { name: 'producto' }
  }

  return true

  })

export default router