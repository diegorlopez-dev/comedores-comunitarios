# 🍽️ Red Solidaria — Comedores Comunitarios

Trabajo Integrador Final — Programación con IA · UTN.BA  
**Alumno:** Diego Rodrigo López  
**Materia:** Programación con Inteligencia Artificial

---

## 🔗 Links

- **Aplicación en producción:** *(agregar link de Vercel al deployar)*
- **Repositorio:** https://github.com/diegorlopez-dev/comedores-comunitarios

---

## 📌 Descripción

Red Solidaria es una plataforma web que conecta comedores comunitarios con voluntarios dispuestos a colaborar. Los referentes de comedores pueden registrar su comedor y publicar los cupos de habilidades que necesitan cubrir (cocineros, acompañantes, transportistas, etc.). Los voluntarios pueden explorar la red, ver qué comedores necesitan ayuda y postularse directamente desde la app.

---

## 🚀 Funcionalidades

| Funcionalidad | Estado |
|---|---|
| Registro y Login con Supabase Auth | ✅ |
| Toggle de visibilidad de contraseña | ✅ |
| Confirmación de contraseña en registro | ✅ |
| Dashboard diferenciado por rol (Voluntario / Referente) | ✅ |
| Listado y búsqueda de comedores | ✅ |
| Registro de nuevo comedor con cupos de habilidades | ✅ |
| Postulación de voluntarios a cupos | ✅ |
| Navegación mobile-first con indicador de ruta activa | ✅ |
| Header reactivo al estado de sesión | ✅ |
| Base de datos relacional en Supabase (PostgreSQL) | ✅ |

---

## 🗃️ Base de Datos

El esquema completo se encuentra en [`database/schema.sql`](./database/schema.sql).  
Los datos de prueba están en [`database/mock_data.sql`](./database/mock_data.sql).

### Diagrama de entidades principales

```
usuario ──< comedor (referente)
usuario ──< colaboracion (voluntario)
comedor ──< requerimiento_comedor
requerimiento_comedor ──< colaboracion
habilidad ──< requerimiento_comedor
rol ──── usuario
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth) |
| Iconos | Lucide React |
| Ruteo | React Router v6 |
| Deploy | Vercel |

---

## ⚙️ Instalación local

```bash
git clone https://github.com/diegorlopez-dev/comedores-comunitarios.git
cd comedores-comunitarios
npm install
```

Crear un archivo `.env.local` con las credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://yboypxshvvxsqfteumhi.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
```

```bash
npm run dev
```

---

## 🔐 Log de Seguridad

| Aspecto | Implementación |
|---|---|
| Autenticación | Supabase Auth con JWT. Las sesiones se gestionan del lado del servidor. |
| Credenciales | Las claves de Supabase se leen desde variables de entorno (`.env.local`), nunca hardcodeadas. El archivo `.env.local` está en `.gitignore`. |
| Row Level Security | Las políticas RLS de Supabase garantizan que cada usuario solo puede modificar sus propios registros. |
| Contraseña | Toggle de visibilidad, campo de confirmación obligatorio y validación mínima de 6 caracteres. |
| Roles | La lógica de roles se verifica del lado del servidor mediante `JOIN` con la tabla `rol`; el frontend solo renderiza según lo que devuelve Supabase. |
| XSS | React escapa automáticamente todos los valores dinámicos del DOM. |

---

## 🎨 Evaluación UX — Heurísticas de Nielsen

| # | Heurística | Implementación |
|---|---|---|
| 1 | Visibilidad del estado del sistema | Indicadores de carga ("Guardando..."), mensajes de éxito y error en todos los formularios. |
| 2 | Correspondencia con el mundo real | Lenguaje natural ("Anotarme", "Cerrar Sesión"), iconos universales (lupa, tenedor). |
| 3 | Control y libertad del usuario | Botón "Cerrar Sesión" visible, navegación libre entre secciones. |
| 4 | Consistencia y estándares | Paleta de colores unificada (verde), tipografía y espaciado consistentes en toda la app. |
| 5 | Prevención de errores | Campos `required`, validación de contraseñas, mínimo de caracteres, confirmación obligatoria. |
| 6 | Reconocimiento antes que recuerdo | Barra de navegación inferior siempre visible, indicador de sección activa. |
| 7 | Flexibilidad y eficiencia | Búsqueda por nombre y barrio, filtros dinámicos en tiempo real. |
| 8 | Diseño estético y minimalista | Interfaz limpia, cards con jerarquía visual clara, sin elementos innecesarios. |
| 9 | Ayuda para reconocer errores | Mensajes de error descriptivos en rojo, mensajes de éxito en verde con retroalimentación inmediata. |
| 10 | Ayuda y documentación | README completo, código comentado y estructura de archivos intuitiva. |

---

## 🤖 Reflexión sobre el uso de IA en el desarrollo

Este proyecto fue desarrollado con asistencia de **Google Antigravity (AGY)**, un agente de programación basado en Gemini. El agente actuó como pair programmer, asistiendo en:

- **Diseño de arquitectura:** Definición del esquema de base de datos relacional y flujos de autenticación.
- **Generación de código:** Componentes React como `Perfil.tsx`, `GestionComedor.tsx` y `PostulacionVoluntario.tsx` fueron generados por modelos de lenguaje externos (Llama 3.3 70B via HuggingFace), revisados y corregidos por el agente orquestador.
- **Debugging:** Identificación y corrección de errores como triggers de Supabase fallidos, nombres de columnas incorrectos y problemas de autenticación en el cliente.
- **Optimización de tokens:** Se implementó un sistema multi-worker (MultiMCP) para delegar tareas de generación pesada a modelos externos gratuitos, reduciendo el consumo del orquestador principal.

La responsabilidad de las decisiones de diseño, estructura y lógica de negocio recayó sobre el alumno.

---

## 🔭 Visión a Futuro

- **Mapa Interactivo:** Visualización geográfica de comedores con Leaflet + OpenStreetMap.
- **Sistema de Donaciones:** Integración con MercadoPago para donaciones directas a cada comedor (con validación de identidad del referente).
- **Notificaciones:** Alertas por email al referente cuando un voluntario se postula.
- **Panel de Administración:** Vista para aprobar o rechazar postulaciones de voluntarios.
