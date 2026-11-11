# 🛒 CRUD de Tienda - Arquitectura Limpia (Symfony 6.4 + Angular 21 + PostgreSQL)

Este proyecto consiste en una aplicación web Full-Stack estructurada en capas independientes. Contiene un backend API REST fuertemente tipado mediante Inversión de Control (Interfaces) y un frontend moderno y reactivo basado en Angular Signals.

---

## 🏛️ Estructura del Espacio de Trabajo
```text
symfony/ (Raíz del Repositorio Global)
├── mi_crud/               <-- Backend (API REST en Symfony 6.4)
└── mi-tienda-frontend/    <-- Frontend (Single Page Application en Angular)
```

---

## 🖥️ BACKEND: Symfony 6.4 & PostgreSQL (`mi_crud/`)

El backend fue inicializado originalmente usando la estructura mínima (*Skeleton*). Añadimos manualmente las librerías necesarias para la persistencia, conversión de datos a JSON y protección del navegador.

### 📦 Librerías e Infraestructura Instaladas
Todos los paquetes se instalaron de forma individual mediante **Composer** en entornos Windows/PowerShell:

1. **Doctrine ORM & Driver PostgreSQL:**
   ```powershell
   composer require symfony/orm-pack
   ```
2. **Symfony Maker Bundle (Asistente de Código - Solo Desarrollo):**
   ```powershell
   composer require --dev symfony/maker-bundle
   ```
3. **Componente Serializer (Mapeo de Entidades a JSON):**
   ```powershell
   composer require symfony/serializer
   ```
4. **Cargadores auxiliares de Propiedades (Requisito para Desnormalización):**
   ```powershell
   composer require symfony/property-access symfony/property-info
   ```
5. **Nelmio CORS Bundle (Cabeceras de seguridad para comunicar con Angular):**
   ```powershell
   composer require nelmio/cors-bundle
   ```

### 🛠️ Comandos de Consola Utilizados en el Desarrollo

* **Crear Base de Datos (PostgreSQL):**
  ```powershell
  php bin/console doctrine:database:create
  ```
* **Crear Entidades de forma Interactiva (`Categoria` / `Producto`):**
  ```powershell
  php bin/console make:entity Categoria
  php bin/console make:entity Producto
  ```
* **Crear un Controlador API:**
  ```powershell
  php bin/console make:controller Api/CategoriaController
  ```
* **Generar archivo de Migración SQL:**
  ```powershell
  php bin/console make:migration
  ```
* **Aplicar Migraciones a la Base de Datos física:**
  ```powershell
  php bin/console doctrine:migrations:migrate
  ```
* **Inspeccionar y verificar las rutas del API:**
  ```powershell
  php bin/console debug:router
  ```
* **Encender Servidor Local de la API (Puerto 8000):**
  ```powershell
  php -S 127.0.0.1:8000 -t public/
  ```

---

## 🎨 FRONTEND: Angular 21 & Signals (`mi-tienda-frontend/`)

El cliente web implementa la misma filosofía en capas, abstrayendo los componentes visuales del origen de datos mediante repositorios de infraestructura HTTP. Gestiona todo su estado reactivo a través de Angular Signals nativos.

### 🚀 Inicialización e Instalaciones

1. **Instalación Global de Angular CLI:**
   ```powershell
   npm install -g @angular/cli
   ```
2. **Creación del Proyecto (Single Page Application pura sin SSR):**
   ```powershell
   ng new mi-tienda-frontend --ssr=false --style=css
   ```

### 🛠️ Comandos del CLI para Generar Capas Desacopladas

* **Generar Interfaces de Dominio (Estructuras de Datos estrictas):**
  ```powershell
  ng g interface core/models/tienda
  ```
* **Generar Servicios de Infraestructura (Repositorios HTTP / Data Services):**
  ```powershell
  ng g service core/services/categoria-data
  ng g service core/services/producto-data
  ```
* **Generar Componente de la Capa de Presentación (Vistas):**
  ```powershell
  ng g component features/productos/producto-lista
  ```
* **Encender Servidor de Desarrollo de Angular (Puerto 4200):**
  ```powershell
  ng serve
  ```

---

## 💡 Patrones de Diseño Implementados Relevantes

* **Inversión de Dependencias (SOLID):** Los controladores de Symfony dependen estrictamente de interfaces (`Contract/`), desacoplándose de la clase física de servicio.
* **Prevención de N+1 (Eager Loading):** En el repositorio de Doctrine se diseñó el método personalizado `findAllWithCategoria()` aplicando `innerJoin` y `addSelect`, reduciendo decenas de peticiones redundantes a PostgreSQL a **una única consulta SQL**.
* **Angular Signals:** Gestión fina de la UI mediante reactividad nativa con funciones operacionales `.set()` y `.update()`, logrando mutaciones en tiempo real en las tablas tras operaciones `POST`, `PUT` o `DELETE`.
* **Capa de Excepciones Global:** Implementación de un `ExceptionSubscriber` en Symfony que intercepta automáticamente cualquier fallo físico del servidor de PostgreSQL, respondiendo con un JSON controlado `503 Service Unavailable` sin filtrar credenciales del sistema.


---

## 🔒 MÓDULO DE AUTENTICACIÓN: API REST con JWT

Implementamos un sistema de seguridad sin estado (*stateless*) basado en **JSON Web Tokens (JWT)**. La API firma un token seguro al iniciar sesión y restringe las operaciones de escritura (`POST`, `PUT`, `DELETE`) en los controladores si no se envía la cabecera correspondiente.

### 📦 Paquetes de Seguridad Instalados
```powershell
composer require symfony/security-bundle
composer require lexik/jwt-authentication-bundle
```

### 🗝️ Solución de Criptografía para Entornos Windows
Debido a incompatibilidades del comando nativo con las librerías nativas de OpenSSL en entornos de desarrollo Windows, se generó el par de llaves criptográficas de forma manual utilizando las herramientas aisladas de Git:
```powershell
# 1. Crear el directorio de seguridad
mkdir config/jwt

# 2. Generar llave privada (firma del token en el login)
& "C:\Program Files\Git\usr\bin\openssl.exe" genrsa -out config/jwt/private.pem -aes256 4096

# 3. Generar llave pública (verificación del token en rutas protegidas)
& "C:\Program Files\Git\usr\bin\openssl.exe" rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem
```

Y se enlazaron en las variables de entorno globales del archivo **`.env`**:
```text
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=tu_clave_secreta_ingresada_en_consola
```

### 🧱 Configuración del Muro de Contención (`security.yaml`)
Se estructuró el archivo `config/packages/security.yaml` para habilitar el validador JSON, proteger los endpoints y mapear los campos para evitar la discrepancia por defecto de nombres de usuario:

*   **Creación de la clase de usuario e inyección del encriptador:** Realizado mediante el comando interactivo `php bin/console make:user` para forzar contraseñas cifradas con algoritmos de hashing dinámicos (`auto`/`Bcrypt`/`Argon2id`).
*   **Mapeo Estricto de JSON (`username_path`):** Se configuró el validador interno `JsonLoginAuthenticator` para escuchar el campo `"email"` nativo enviado por el frontend en lugar de exigir la palabra `"username"` por defecto de Symfony.
*   **Políticas de Firewall Aplicadas:**
    *   `POST /api/register` ➔ **Acceso Público** (Creación de cuentas).
    *   `POST /api/login_check` ➔ **Acceso Público** (Interceptado por el bundle para devolver el Token).
    *   `GET /api/productos` y `GET /api/categorias` ➔ **Acceso Público** (Catálogo visible).
    *   `POST`, `PUT`, `PATCH`, `DELETE` en productos/categorías ➔ **Bloqueo Estricto** (Solo usuarios autenticados con cabecera `Authorization: Bearer <token>`).

### 🛠️ Comandos de Consola Utilizados en este Módulo
*   **Generar estructura base de la Entidad de Seguridad:** `php bin/console make:user`
*   **Crear el Controlador de Registro:** `php bin/console make:controller Api/AuthController`
*   **Migrar la tabla de usuarios a PostgreSQL:**
    ```powershell
    php bin/console make:migration
    php bin/console doctrine:migrations:migrate
    ```


npm create vue@latest mi-tienda-vue

consultas
return $this->createQueryBuilder('p') // 'p' es el alias para la tabla Producto
        ->andWhere('p.nombre LIKE :nombre')
        ->andWhere('p.precio >= :precio')
        ->setParameter('nombre', '%' . $nombre . '%') // Parámetro seguro
        ->setParameter('precio', $precioMinimo)       // Parámetro seguro
        ->orderBy('p.precio', 'ASC')
        ->getQuery()
        ->getResult(); // Retorna un array de Objetos Producto

 $em = $this->getEntityManager();
    
    $query = $em->createQuery(
        'SELECT p 
         FROM App\Entity\Producto p 
         WHERE p.categoria = :catId 
         ORDER BY p.nombre ASC'
    )->setParameter('catId', $categoriaId);

    return $query->getResult();

    $productos = $this->productoRepository->findBy(
    ['categoria' => 1, 'nombre' => 'Teclado'], // El WHERE (categoria_id = 1 AND nombre = 'Teclado')
    ['precio' => 'DESC'],                     // El ORDER BY
    10,                                       // El LIMIT
    0                                         // El OFFSET
);

$conn = $this->getEntityManager()->getConnection();

    // Escribes SQL real con la sintaxis exacta de PostgreSQL
    $sql = 'SELECT * FROM producto p WHERE p.precio > :precio ORDER BY p.precio DESC';
    
    $resultSet = $conn->executeQuery($sql, ['precio' => $precio]);

    return $resultSet->fetchAllAssociative(); // Retorna arrays, NO objetos


    $em = $this->getEntityManager();
    $rsm = new ResultSetMappingBuilder($em);
    $rsm->addRootEntityFromClassMetadata('App\Entity\Producto', 'p');

    $sql = 'SELECT * FROM producto p WHERE p.descripcion IS NOT NULL';
    $query = $em->createNativeQuery($sql, $rsm);

    return $query->getResult(); // Retorna objetos Producto mapeados



    <?php

namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/login_check', name: 'api_login_check', methods: ['POST'])]
    public function loginCheck(
        Request $request, 
        EntityManagerInterface $em, 
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        // 1. Decodificamos el JSON que viene del Frontend
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse([
                'success' => false, 
                'message' => 'Credenciales incompletas'
            ], Response::HTTP_BAD_REQUEST);
        }

        // 2. Buscamos al usuario de forma manual en PostgreSQL usando Doctrine
        $userRepository = $em->getRepository(User::class);
        /** @var User|null $user */
        $user = $userRepository->findOneBy(['email' => $data['email']]);

        // 3. Si el usuario no existe, rechazamos
        if (!$user) {
            return new JsonResponse([
                'success' => false, 
                'message' => 'El usuario no existe'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // 4. Verificamos que el usuario esté activo en el sistema
        // Nota: asumo que tienes el método getActivo() o similar en tu entidad
        if (method_exists($user, 'getActivo') && !$user->getActivo()) {
            return new JsonResponse([
                'success' => false, 
                'message' => 'La cuenta de usuario está inactiva'
            ], Response::HTTP_FORBIDDEN);
        }

        // 5. Validamos la contraseña usando el Hasher seguro de Symfony
        if (!$passwordHasher->isPasswordValid($user, $data['password'])) {
            return new JsonResponse([
                'success' => false, 
                'message' => 'Contraseña incorrecta'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // 6. ¡Éxito! Generamos un Token criptográfico aleatorio y seguro de 64 caracteres
        $token = bin2hex(random_bytes(32));
        
        // 7. Establecemos la fecha de expiración (24 horas a partir de ahora)
        $expiration = new \DateTime();
        $expiration->modify('+24 hours');

        // 8. Guardamos físicamente los datos del Token en la tabla de PostgreSQL
        $user->setApiToken($token);
        $user->setTokenExpiresAt($expiration);
        
        $em->flush();

        // 9. Respondemos al Frontend el objeto limpio idéntico a tu arquitectura monolítica
        return new JsonResponse([
            'success' => true,
            'mensaje' => 'Usuario logueado exitosamente',
            'token'   => $token,
            'usuario' => [
                'id'        => $user->getId(),
                'nombreusu' => method_exists($user, 'getNombreusu') ? $user->getNombreusu() : $user->getEmail(),
                'email'     => $user->getEmail(),
                'perfil'    => method_exists($user, 'getPerfil') ? $user->getPerfil() : 'USER'
            ]
        ], Response::HTTP_OK);
    }
}
Interceptor de Autenticación

La aplicación utiliza un HTTP Interceptor de Angular para gestionar la autenticación basada en JWT. Una vez iniciado sesión, el token recibido desde la API se almacena localmente y el interceptor lo añade automáticamente en la cabecera Authorization de todas las peticiones protegidas.

Esto evita tener que enviar el token manualmente en cada solicitud y centraliza la gestión de la seguridad de la aplicación.

Plain Text
Authorization: Bearer <jwt-token>
 

Además, el interceptor controla las respuestas 401 Unauthorized, cerrando la sesión y redirigiendo al usuario a la pantalla de inicio de sesión cuando el token es inválido o ha expirado.

Ventajas:

Envío automático del token JWT.
Código más limpio y reutilizable.
Gestión centralizada de la autenticación.
Manejo automático de sesiones expiradas.
