# Guía de Configuración de Producción: Base de Datos en Google Sheets

Para que la aplicación funcione con su persistencia oficial en la nube, es necesario configurar el libro de cálculo de Google Sheets que actuará como base de datos del sistema. Este archivo almacenará los metadatos de las operaciones, la base de instructores, disponibilidades e incidencias generadas en el sistema.

## Paso 1: Crear el Documento en Google Drive
1. Accede a la cuenta de Google (preferiblemente desde una de las cuentas corporativas principales).
2. Ve a [Google Drive](https://drive.google.com).
3. Haz clic en **Nuevo > Hojas de cálculo de Google > Hoja de cálculo en blanco**.
4. Nombra el archivo exactamente como: `Pronautic_DB_Produccion`.

## Paso 2: Crear las Pestañas (Estructura de Base de Datos)
En la parte inferior izquierda de la pantalla, renombra la pestaña "Hoja 1" y añade nuevas pestañas haciendo clic en el icono "+". Debes crear **exactamente** estas 4 pestañas respetando minúsculas y guiones bajos:

1. `eventos_metadata` *(Opcional: Añade columnas como eventId, notas, instructores, materiales, estado_dgmm)*
2. `instructores` *(Opcional: Añade columnas como dni, nombre, tipo, location, info, is_empleado, is_socio, titulaciones)*
3. `disponibilidades` *(Opcional: Añade columnas como fecha_inicio, fecha_fin, id_instructor, tipo, descripcion, nombre_instructor)*
4. `incidencias`

*Nota: La aplicación genera automáticamente las columnas al guardar datos por primera vez. Lo único estricto es que las 4 pestañas existan con esos nombres exactos.*

## Paso 3: Obtener el ID y conectarlo a la App
1. Observa la URL de tu hoja de cálculo. Tendrá este formato:
   `https://docs.google.com/spreadsheets/d/1Xy_ABCDEF_GHIJK_LMNOPQRSTUVWXYZ/edit#gid=0`
2. Copia la cadena larga que hay entre `/d/` y `/edit`. En el ejemplo anterior sería: `1Xy_ABCDEF_GHIJK_LMNOPQRSTUVWXYZ`.
3. Ve al código fuente del sistema Pronautic, busca o crea el archivo `.env.local` en la raíz del proyecto.
4. Añade la siguiente línea:
   ```env
   VITE_SHEETS_DB_ID="1mzhnYTsZRWe2TM1Lz7YuyOLaBo_L0r6cuef6GKNGe9Y"
   ```

## Paso 4: Configurar los Permisos de Acceso
El archivo debe estar accesible para las cuentas autorizadas del personal corporativo.

1. Haz clic en el botón superior derecho **Compartir**.
2. Añade como **Editores** (u Organizadores) a las siguientes direcciones oficiales:
   - `instructorspronautic@gmail.com`
   - `bopronautic@gmail.com`
3. Haz clic en **Enviar**.

## Paso 5: Verificar el Scope de Google Sheets en la Nube
La aplicación debe tener poder para leer y escribir en el Spreadsheet de los usuarios cuando se autentican. Para asegurar esto, el permiso de Google Sheets debe estar autorizado en tu configuración de Google Cloud.

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Asegúrate de estar en el proyecto asociado a tu autenticación de Pronautic (el que creaste para Firebase/Auth).
3. En el menú lateral, ve a **APIs & Services > OAuth consent screen (Pantalla de consentimiento de OAuth)**.
4. En el segundo paso de la configuración (Scopes/Permisos), haz clic en **Add or Remove Scopes**.
5. Busca y marca el scope:
   `https://www.googleapis.com/auth/spreadsheets`
6. Además, ve a **APIs & Services > Library**, busca "Google Sheets API" y pulsa en **Enable (Habilitar)** si no lo estuviera.
7. Guarda los cambios.

### 🎉 ¡Listo!
Con estos pasos completados, el sistema ya es capaz de usar `Pronautic_DB_Produccion` como motor persistente. Las asignaciones de barcos y aulas, junto al control de asistencia a instructores dejarán de guardarse sólo temporalmente en el navegador y permanecerán sólidas en producción.
