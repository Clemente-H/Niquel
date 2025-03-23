# Project Management System - Frontend

Frontend para un sistema de gestión de proyectos con control de acceso basado en roles implementado en React con TypeScript.

## Características principales

- **Autenticación de usuario**: Sistema de login con email/contraseña
- **Gestión de usuarios**: Soporte para 3 roles diferentes (Admin, Manager, Regular)
- **Gestión de proyectos**: Seguimiento del estado de proyectos y cambios históricos
- **Asignación de usuarios**: Control de acceso a proyectos basado en asignaciones
- **Gestión de archivos**: Asociación de archivos con proyectos
- **Gestión de períodos**: Control de diferentes períodos de tiempo dentro de cada proyecto

## Estructura del proyecto

```
src/
├── assets/              # Recursos estáticos (imágenes, iconos, etc.)
├── components/          # Componentes reutilizables
│   ├── common/          # Componentes genéricos (botones, inputs, etc.)
│   ├── layout/          # Componentes de diseño (Sidebar, Header, Footer)
│   ├── projects/        # Componentes específicos de proyectos
│   ├── periods/         # Componentes específicos de períodos
│   ├── users/           # Componentes específicos de usuarios
│   └── visualizations/  # Componentes de visualización de datos
├── hooks/               # Hooks personalizados de React
├── pages/               # Componentes de páginas (uno por ruta)
│   ├── auth/            # Páginas de autenticación
│   ├── dashboard/       # Páginas de dashboard
│   ├── projects/        # Páginas de proyectos
│   └── admin/           # Páginas de administración
├── services/            # Llamadas a servicios API
│   ├── authService.ts
│   ├── projectService.ts
│   ├── userService.ts
│   └── apiClient.ts     # Cliente API base con interceptores
├── store/               # Gestión de estado
│   ├── slices/          # Slices de Redux o proveedores de contexto
│   │   ├── authSlice.ts
│   │   ├── projectsSlice.ts
│   │   └── usersSlice.ts
│   ├── hooks.ts         # Hooks personalizados para el store
│   └── index.ts         # Configuración del store
├── types/               # Definiciones de tipos de TypeScript
│   ├── project.types.ts
│   ├── user.types.ts
│   ├── auth.types.ts
│   └── period.types.ts
├── utils/               # Funciones de utilidad
│   ├── dateUtils.ts
│   ├── formatUtils.ts
│   └── validationUtils.ts
├── App.tsx              # Componente principal con enrutamiento
├── index.tsx            # Punto de entrada
└── routes.tsx           # Definiciones de rutas
```

## Estado actual del proyecto

### Fases completadas
- [x] Fase 0: Planificación y estructura inicial
- [x] Fase 1: Definición de la arquitectura del frontend
- [x] Fase 2: Creación de la estructura de carpetas y archivos base

### Fase actual
- [ ] Fase 3: Configuración de TypeScript e implementación de componentes base
  - [x] Definición de tipos para la aplicación
  - [ ] Implementación de componentes de layout
  - [ ] Implementación de componentes comunes reutilizables
  - [ ] Configuración del sistema de rutas con tipos

### Próximas fases
- [ ] Fase 4: Implementación de la gestión de estado
- [ ] Fase 5: Desarrollo de páginas principales
- [ ] Fase 6: Integración con el backend
- [ ] Fase 7: Autenticación y control de acceso basado en roles
- [ ] Fase 8: Pruebas, optimización y gestión de tipos

## Tecnologías utilizadas

- React 18 con TypeScript
- Vite como bundler
- TailwindCSS para estilos
- Context API / Redux para gestión de estado
- Axios para llamadas a la API
- React Router para enrutamiento

## Configuración e instalación

### Prerrequisitos
- Node.js 16+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd project-manager/frontend

# Instalar dependencias
npm install
# o
yarn install

# Iniciar servidor de desarrollo
npm run dev
# o
yarn dev
```

La aplicación estará disponible en: http://localhost:5173

## Convenciones de código

- Componentes en PascalCase
- Interfaces de TypeScript prefijadas con 'I' (ej. IUser)
- Hooks personalizados con prefijo "use"
- Archivos de contexto con sufijo "Context"
- Funciones de servicio en camelCase
- Uso de tipos explícitos para todas las propiedades de componentes

## Contribución

1. Crear una rama para la feature: `git checkout -b feature/nueva-funcionalidad`
2. Realizar cambios y commits: `git commit -m 'Añadir nueva funcionalidad'`
3. Enviar a la rama principal: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## Notas de desarrollo
- El frontend se está desarrollando con TypeScript para mejorar la seguridad de tipos y la mantenibilidad
- Se ha elegido Vite en lugar de Create React App para un mejor rendimiento en desarrollo
- Se utilizan componentes funcionales con hooks en toda la aplicación
- Todos los componentes tienen definiciones de tipos explícitas a través de interfaces