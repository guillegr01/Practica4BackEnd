# Practica 4 Back-End

- Se desarrollará una API para gestionar proyectos, tareas y usuarios. Esta API permitirá a los usuarios registrarse, crear proyectos, asignar tareas, y registrar avances en estas tareas.



## Modelos de Datos

### Usuario

#### Atributos:
- id (ObjectId): Identificador único del usuario.
- name (string): Nombre del usuario, obligatorio.
- email (string): Correo electrónico único del usuario, obligatorio.
- created_at (Date): Fecha de creación del usuario, por defecto la fecha actual.

### Proyecto

#### Atributos:
- id (ObjectId): Identificador único del proyecto.
- name (string): Nombre del proyecto, obligatorio.
- description (string): Descripción del proyecto, opcional.
- start_date (Date): Fecha de inicio del proyecto, obligatoria.
- end_date (Date): Fecha de finalización del proyecto, opcional.
- user_id (ObjectId): Identificador del usuario propietario del proyecto, obligatorio.

### Tarea

#### Atributos:
- id (ObjectId): Identificador único de la tarea.
- title (string): Título de la tarea, obligatorio.
- description (string): Descripción detallada de la tarea, opcional.
- status (string): Estado de la tarea, valores posibles: pending, in_progress, completed. Por defecto: pending.
- created_at (Date): Fecha de creación de la tarea, por defecto la fecha actual.
- due_date (Date): Fecha de vencimiento de la tarea, opcional.
- project_id (ObjectId): Identificador del proyecto al que pertenece la tarea, obligatorio.


## Relaciones entre los Modelos

- Un usuario puede tener varios proyectos asignados.
- Relación de uno a muchos entre Usuario y Proyecto (un usuario puede ser propietario de muchos proyectos).
- Un proyecto pertenece a un único usuario, pero puede contener varias tareas.
- Relación de uno a muchos entre Proyecto y Tarea (un proyecto puede incluir muchas tareas).
- Una tarea pertenece a un único proyecto.
- Relación de uno a uno entre Tarea y Proyecto (una tarea está siempre vinculada a un solo proyecto).




## Rutas de la API
### Usuarios
- GET /users
Devuelve la lista de todos los usuarios registrados.

Ejemplo de respuesta:
[
  {
    "id": "645df1a9d90d59c3c5f9b2a4",
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "created_at": "2024-01-15T14:34:00.000Z"
  },
  {
    "id": "645df1b0d90d59c3c5f9b2b0",
    "name": "Ana García",
    "email": "ana.garcia@email.com",
    "created_at": "2024-01-16T10:20:00.000Z"
  }
]
 
- POST /users
Crea un nuevo usuario.

Body esperado:
{
  "name": "Luis Martínez",
  "email": "luis.martinez@email.com"
}
Ejemplo de respuesta:
{
  "id": "645df1c7d90d59c3c5f9b2c8",
  "name": "Luis Martínez",
  "email": "luis.martinez@email.com",
  "created_at": "2024-01-17T12:00:00.000Z"
}

- DELETE /users
Elimina un usuario específico. Requiere el parámetro id en la query string.

Ejemplo de uso: /users?id=645df1a9d90d59c3c5f9b2a4

Ejemplo de respuesta:
{
  "message": "User deleted successfully."
}
### Proyectos
- GET /projects
Devuelve la lista de todos los proyectos registrados.

Ejemplo de respuesta:
[
  {
    "id": "645df2b4d90d59c3c5f9b2b5",
    "name": "Gestión de Inventarios",
    "description": "Sistema para gestionar inventarios",
    "start_date": "2024-02-01T00:00:00.000Z",
    "end_date": null,
    "user_id": "645df1a9d90d59c3c5f9b2a4"
  }
]

- POST /projects
Crea un nuevo proyecto.

Body esperado:
{
  "name": "Gestión de Ventas",
  "description": "Sistema para gestionar ventas",
  "start_date": "2024-03-01",
  "user_id": "645df1b0d90d59c3c5f9b2b0"
}

Ejemplo de respuesta:
{
  "id": "645df2d7d90d59c3c5f9b2d8",
  "name": "Gestión de Ventas",
  "description": "Sistema para gestionar ventas",
  "start_date": "2024-03-01T00:00:00.000Z",
  "end_date": null,
  "user_id": "645df1b0d90d59c3c5f9b2b0"
}

- DELETE /projects
Elimina un proyecto específico. Requiere el parámetro id en la query string.

Ejemplo de uso: /projects?id=645df2b4d90d59c3c5f9b2b5

Ejemplo de respuesta:
{
  "message": "Project deleted successfully."
}

### Tareas

- GET /tasks
Devuelve la lista de todas las tareas registradas.

Ejemplo de respuesta:
[
  {
    "id": "645df3c5d90d59c3c5f9b3c6",
    "title": "Diseñar base de datos",
    "description": "Diseñar las tablas y relaciones para el sistema",
    "status": "pending",
    "created_at": "2024-01-15T14:45:00.000Z",
    "due_date": "2024-02-01T00:00:00.000Z",
    "project_id": "645df2b4d90d59c3c5f9b2b5"
  }
]

- POST /tasks
Crea una nueva tarea.

Body esperado:
{
  "title": "Crear API REST",
  "description": "Desarrollar la API para el sistema",
  "status": "pending",
  "due_date": "2024-02-15",
  "project_id": "645df2b4d90d59c3c5f9b2b5"
}
Ejemplo de respuesta:
{
  "id": "645df4a8d90d59c3c5f9b4a9",
  "title": "Crear API REST",
  "description": "Desarrollar la API para el sistema",
  "status": "pending",
  "created_at": "2024-01-17T12:30:00.000Z",
  "due_date": "2024-02-15T00:00:00.000Z",
  "project_id": "645df2b4d90d59c3c5f9b2b5"
}
DELETE /tasks
Elimina una tarea específica. Requiere el parámetro id en la query string.
Ejemplo de uso: /tasks?id=645df3c5d90d59c3c5f9b3c6
Ejemplo de respuesta:
{
  "message": "Task deleted successfully."
}
## 4. Mover Tarea entre Proyectos
POST /tasks/move
Mueve una tarea de un proyecto a otro. Los parámetros task_id, destination_project_id y, opcionalmente, origin_project_id deben enviarse en el cuerpo de la solicitud.
Body esperado:
{
  "task_id": "645df3c5d90d59c3c5f9b3c6",
  "destination_project_id": "645df2d7d90d59c3c5f9b2d8",
  "origin_project_id": "645df2b4d90d59c3c5f9b2b5"
}
 
El parámetro task_id es obligatorio y representa la tarea a mover.
El parámetro destination_project_id es obligatorio y representa el proyecto de destino.
El parámetro origin_project_id es opcional; si se omite, se asumirá que la tarea no está asociada a ningún proyecto de origen.
Ejemplo de respuesta:
{
  "message": "Task moved successfully.",
  "task": {
    "id": "645df3c5d90d59c3c5f9b3c6",
    "title": "Diseñar base de datos",
    "project_id": "645df2d7d90d59c3c5f9b2d8"
  }
}
## 5. Ver Tareas por Proyecto
GET /tasks/by-project
Devuelve todas las tareas asociadas a un proyecto. Requiere el parámetro project_id en la query string.
Ejemplo de uso:
/tasks/by-project?project_id=645df2b4d90d59c3c5f9b2b5
Ejemplo de respuesta:
[
  {
    "id": "645df3c5d90d59c3c5f9b3c6",
    "title": "Diseñar base de datos",
    "description": "Diseñar las tablas y relaciones para el sistema",
    "status": "pending",
    "created_at": "2024-01-15T14:45:00.000Z",
    "due_date": "2024-02-01T00:00:00.000Z"
  },
  {
    "id": "645df4a8d90d59c3c5f9b4a9",
    "title": "Crear API REST",
    "description": "Desarrollar la API para el sistema",
    "status": "in_progress",
    "created_at": "2024-01-17T12:30:00.000Z",
    "due_date": "2024-02-15T00:00:00.000Z"
  }
]
 
## 6. Ver Proyectos por Usuario
GET /projects/by-user
Devuelve todos los proyectos asociados a un usuario. Requiere el parámetro user_id en la query string.
Ejemplo de uso:
/projects/by-user?user_id=645df1a9d90d59c3c5f9b2a4
Ejemplo de respuesta:
[
  {
    "id": "645df2b4d90d59c3c5f9b2b5",
    "name": "Gestión de Inventarios",
    "description": "Sistema para gestionar inventarios",
    "start_date": "2024-02-01T00:00:00.000Z",
    "end_date": null
  },
  {
    "id": "645df2d7d90d59c3c5f9b2d8",
    "name": "Gestión de Ventas",
    "description": "Sistema para gestionar ventas",
    "start_date": "2024-03-01T00:00:00.000Z",
    "end_date": null
  }
]


Criterios de Evaluación
Manejo de Errores
La API debe devolver un JSON consistente en caso de errores 4xx (errores del cliente) o 5xx (errores del servidor). Esto incluye un código de estado HTTP y un mensaje descriptivo para facilitar el diagnóstico.
Ejemplo de respuesta para error 4xx (cliente):
Error 404 - Recurso no encontrado
{
  "error": true,
  "status": 404,
  "message": "The requested resource was not found."
}
 
Ejemplo de respuesta para error 5xx (servidor):
Error 500 - Error interno del servidor
{
  "error": true,
  "status": 500,
  "message": "An internal server error occurred. Please try again later."
}




Entrega
Se deberá entregar un enlace a Deno Deploy https://deno.com/deploy
Ese enlace deberá ser funcional
En caso de no mandarlo la práctica puntuará directamente con un 0
Se deberá mandar también el enlace al repositorio
Se debera mandar tambien el archivo adjunto al entregar
