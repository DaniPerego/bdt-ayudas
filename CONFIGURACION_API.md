# 🏋️ Configuración de ExerciseDB API para Ejercicios de Musculación

## 📋 Guía Rápida de Configuración

### Paso 1: Crear Cuenta en RapidAPI

1. Ve a [https://rapidapi.com/](https://rapidapi.com/)
2. Haz clic en **"Sign Up"** (Registrarse)
3. Puedes registrarte con Google, GitHub o email
4. Verifica tu email si es necesario

### Paso 2: Suscribirse a ExerciseDB (GRATIS)

1. Ve a [https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
2. Haz clic en **"Subscribe to Test"**
3. Selecciona el plan **"BASIC (FREE)"** - 0€/mes
4. Haz clic en **"Subscribe"**

### Paso 3: Obtener tu API Key

1. Una vez suscrito, verás la sección **"Code Snippets"** en la parte derecha
2. Busca el header **"X-RapidAPI-Key"**
3. Copia el valor (algo como: `abc123def456...`)

### Paso 4: Configurar la API Key en el Proyecto

1. Abre el archivo `/workspaces/bdt-ayudas/js/musculacion.js`
2. En la **línea 3**, reemplaza `'TU_RAPIDAPI_KEY_AQUI'` con tu API key:

```javascript
const API_KEY = 'tu_rapidapi_key_aqui';
```

**Ejemplo:**
```javascript
const API_KEY = 'abc123xyz456def789ghi012jkl345mno678pqr';
```

### Paso 4: Probar la Integración

1. Abre `musculacion.html` en tu navegador
2. Si todo está correcto, verás ejercicios cargados automáticamente
3. Prueba los filtros y el buscador

---

## ℹ️ Información del Plan Gratuito

### ✅ Límites del Plan BASIC (FREE):
- **30 requests por día**
- Se resetea cada 24 horas
- No requiere tarjeta de crédito
- Acceso a más de 1,300 ejercicios con GIFs animados

### 💾 Sistema de Caché Inteligente:
- Los ejercicios se descargan **una sola vez**
- Se guardan en el navegador por **24 horas**
- Esto significa: **solo 1 request al día** en uso normal
- Los filtros funcionan **sin consumir requests** adicionales

### 📊 Monitorear Uso:
- Ve a tu Dashboard en RapidAPI
- Sección "My Apps"
- Verás las estadísticas de uso de ExerciseDB

---

## 🎯 Características de la Página

### Filtros Disponibles:
- **Músculo objetivo**: Abdominales, Bíceps, Pectorales, Dorsales, Cuádriceps, etc.
- **Equipamiento**: Peso corporal, Barra, Mancuernas, Kettlebell, Bandas, etc.
- **Parte del cuerpo**: Espalda, Pecho, Brazos, Piernas, Abdomen, etc.
- **Búsqueda por nombre**: Busca ejercicios específicos (en inglés)

### Información de Cada Ejercicio:
- 🎬 **GIF animado** mostrando la ejecución correcta
- ✓ Nombre del ejercicio
- ✓ Parte del cuerpo trabajada
- ✓ Músculo objetivo principal
- ✓ Músculos secundarios
- ✓ Equipamiento necesario
- ✓ Instrucciones paso a paso

### Funcionalidades Extra:
- 💾 Sistema de favoritos (guardado en localStorage)
- 🔍 Búsqueda en tiempo real
- 📱 Diseño responsive (móvil y desktop)
- ⚡ Carga rápida con animaciones

---

## 🔧 Solución de Problemas

### Error: "API Key inválida"
- Verifica que copiaste la key completa
- Asegúrate de no tener espacios extras
- La key debe estar entre comillas simples

### No se cargan ejercicios
- Verifica tu conexión a internet
- Revisa la consola del navegador (F12) para errores
- Confirma que configuraste la API key

### Límite de requests alcanzado
- Espera al próximo mes para que se resetee
- Crea una nueva cuenta si es urgente
- Considera cachear ejercicios en localStorage

---

## 📁 Archivos del Proyecto

```
/workspaces/bdt-ayudas/
├── musculacion.html           # Página principal
├── js/
│   └── musculacion.js         # Lógica y llamadas a la API
└── css/
    └── musculacion.css        # Estilos de la página
```

---

## 🌐 Endpoints de la API Utilizados

**Base URL:** `https://exercisedb.p.rapidapi.com`

**Endpoint principal:**
```
GET /exercises?limit=1300
```

**Headers requeridos:**
```
X-RapidAPI-Key: tu_api_key
X-RapidAPI-Host: exercisedb.p.rapidapi.com
```

**Respuesta incluye:**
- `name`: Nombre del ejercicio
- `gifUrl`: URL del GIF animado
- `target`: Músculo objetivo
- `bodyPart`: Parte del cuerpo
- `equipment`: Equipamiento
- `secondaryMuscles`: Músculos secundarios
- `instructions`: Array de instrucciones paso a paso

---

## 💡 Tips y Recomendaciones

1. **No compartas tu API key públicamente**
2. **Guarda tu key en un lugar seguro**
3. **El caché se guarda automáticamente** - solo gastarás 1 request al día
4. **Los GIFs se cargan de forma optimizada** con lazy loading
5. Para producción, considera usar **variables de entorno**
6. Los nombres están en inglés pero con traducciones en la interfaz
7. **Limpia el caché** si quieres forzar una actualización (F12 > Application > Local Storage)

---

## 🆘 Soporte

**Documentación oficial:** [https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)

**RapidAPI Support:** [https://rapidapi.com/contact](https://rapidapi.com/contact)

---

✅ **¡Listo! Ahora tienes una biblioteca completa de ejercicios de musculación en tu web.**
