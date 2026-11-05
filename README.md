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

npm create vue@latest mi-tienda-vue
