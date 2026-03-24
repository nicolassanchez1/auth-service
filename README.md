# 🔐 Auth Microservice - LinkTic Technical Test

Este repositorio contiene el microservicio de **Autenticación**, el proveedor de identidad y guardián de seguridad del ecosistema en la prueba técnica de LinkTic.

Desarrollado en **NestJS 11**, este servicio es el único responsable de validar credenciales, encriptar contraseñas y emitir los **JSON Web Tokens (JWT)** que el resto de los microservicios (y el API Gateway) utilizan para autorizar las operaciones críticas del sistema.

## 🏗️ Arquitectura y Rol

Dentro del patrón de microservicios, este componente opera en el puerto `:3002` (por defecto) y es completamente autónomo en el manejo de su base de datos de usuarios.

- **Endpoints (Públicos):** Permite el registro de nuevos clientes y el inicio de sesión.
- **Stateless Authentication:** En lugar de guardar sesiones en memoria, emite tokens firmados criptográficamente que contienen el `userId`, `email` y `name`, permitiendo que el sistema escale sin cuellos de botella.

## 🛡️ Características Principales

1. **Gestión de Identidad Segura:** Uso de `bcrypt` (10 salt rounds) para asegurar que las contraseñas jamás se almacenen en texto plano.
2. **Emisión de JWT:** Integración con `@nestjs/jwt` para firmar y emitir tokens de acceso estructurados.
3. **Manejo de Conflictos:** Detección activa de duplicidad de correos electrónicos (`ConflictException`) a nivel de servicio.
4. **Documentación Swagger:** Decoradores de `@nestjs/swagger` implementados para autogenerar la especificación de la API.

## ⚙️ Configuración del Entorno (.env)

Crea un archivo `.env` en la raíz de este microservicio. Las variables mínimas recomendadas son:

```env
DB_HOST=postgres://usuario:password@localhost:5432/products_db (Ejemplo)
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_D9qgUOu7Ndai
DB_NAME=neondb
PORT=3002
JWT_SECRET=secret-key
```

## 🚀 Despliegue y Ejecución

Opción A: Ejecución Local (Desarrollo)

- Prerrequisitos
- Node.js (v18+)
- PostgreSQL

Pasos para ejecutar localmente

1. Clonar el repositorio e instalar dependencias:

```bash
# 1. Clonar repositorio
git clone [https://github.com/nicolassanchez1/auth-service.git](https://github.com/nicolassanchez1/auth-service.git)

# 2. Instalar dependencias
npm install

# 3. Levantar el servicio en modo desarrollo
npm run start:dev
```

2. Explorar la Documentación de la API (Swagger):

- Una vez en ejecución, puedes explorar e interactuar con los endpoints usando la integración nativa de Swagger en la siguiente ruta:

* Products API Swagger: http://localhost:3002/api

Opción B: Usando Docker (Producción)

```bash
# 1. Construir la imagen
docker build -t auth-service .

# 2. Correr el contenedor
docker run -p 3002:3002 --env-file .env auth-service
```

## 🛣️ Enrutamiento y Endpoints

A continuación, se detallan las rutas expuestas por el `AuthController`. (Nota: Si consultas a través del API Gateway, la ruta base es `http://localhost:8080/auth).`

| Métodos | Endpoint       | Descripción                                                                                                    | Seguridad |
| :------ | :------------- | :------------------------------------------------------------------------------------------------------------- | :-------- |
| `POST`  | `/auth/signup` | ➔ **ORegistra un nuevo usuario, encripta su contraseña y devuelve un JWT de sesión junto con los datos base.** | Pública   |
| `POST`  | `/auth/login`  | ➔ **Valida las credenciales contra la base de datos y emite un nuevo JWT de acceso.**                          | Pública   |
