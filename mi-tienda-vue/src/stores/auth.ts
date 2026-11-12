import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../core/authApi'
import {
    getSession, 
    getToken, 
    type User, 
    saveSession, 
    type Credentials, 
    CleanSession, saveToken, 
    type RegistroPayload
    } from '../core/sesion'
import { TOKEN_KEY, USER_KEY } from '../core/api'

export const useAuthStore = defineStore('auth', ()=>{
    const token = ref<string | null>(getToken())
    const user = ref<User | null>(getSession())
    const cargando = ref<boolean>(false)
    const error = ref<string | null>(null)
    const erroresCampo = ref<Record<string, string>>({})
    const aviso = ref<string | null>('')

    const autenticado = computed(() => Boolean(token.value))
    const nombreVisible = computed(() =>  user.value?.email || 'Usuario')

    const inicial = computed(() => nombreVisible.value.charAt(0).toUpperCase())

   async function iniciarSesion(credenciales: Credentials) {
          cargando.value = true
          error.value = ''
          erroresCampo.value = {}
          aviso.value = ''

          try {
          const { token: nuevoToken } = await authApi.login(credenciales)

         // Guardamos el token antes de pedir /me para que el interceptor lo envíe.
         token.value = nuevoToken
         saveToken(nuevoToken)
         const datosUsuario = await authApi.me()
         saveSession(nuevoToken, datosUsuario)
        } catch (fallo) {
          CleanSession()
          error.value =  'Error desconocido'
           erroresCampo.value = {}
           throw fallo
        } finally {
            cargando.value = false
        }

    }

   async function registrar(payload: RegistroPayload) {
        cargando.value = true
        error.value = ''
        erroresCampo.value = {}
        aviso.value = ''

        try {
        const { user, token: nuevoToken } = await authApi.register(payload)

        saveToken(nuevoToken)
        saveSession(nuevoToken, user)
        } catch (fallo) {
        error.value = 'Error desconocido'
        erroresCampo.value = {}
        throw fallo
        } finally {
        cargando.value = false
        }
   }


  /** Valida el token guardado al recargar la página. */
  async function restaurarSesion() {
    if (!token.value) return

    try {
      const datosUsuario = await authApi.me()
      saveSession(token.value, datosUsuario)
    } catch (fallo) {
       // Si la API está caída no cerramos la sesión; solo si el token ya no vale.
       CleanSession()
    }
  }

  function cerrarSesion(motivo = '') {
    CleanSession()
  }

   
  return {
    token,
    user,
    cargando,
    error,
    erroresCampo,
    aviso,
    autenticado,
    nombreVisible,
    inicial,
    iniciarSesion,
    registrar,
    restaurarSesion,
    cerrarSesion,
  }

})