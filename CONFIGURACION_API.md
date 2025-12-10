# 🏋️ Configuración de API Ninjas para Ejercicios de Musculación

## 📋 Guía Rápida de Configuración

### Paso 1: Crear Cuenta en API Ninjas

1. Ve a [https://api-ninjas.com/](https://api-ninjas.com/)
2. Haz clic en **"Sign Up"** (Registrarse)
3. Completa el formulario con tu email y contraseña
4. Verifica tu email

### Paso 2: Obtener tu API Key

1. Inicia sesión en [https://api-ninjas.com/](https://api-ninjas.com/)
2. Ve a tu **Dashboard** (Panel de control)
3. Encontrarás tu **API Key** en la parte superior
4. Haz clic en **"Copy"** para copiar tu key

### Paso 3: Configurar la API Key en el Proyecto

1. Abre el archivo `/workspaces/bdt-ayudas/js/musculacion.js`
2. En la **línea 2**, reemplaza `'TU_API_KEY_AQUI'` con tu API key:

```javascript
const API_KEY = 'tu_api_key_real_aqui';
```

**Ejemplo:**
```javascript
const API_KEY = 'abc123xyz456def789ghi012jkl345mno678';
```

### Paso 4: Probar la Integración

1. Abre `musculacion.html` en tu navegador
2. Si todo está correcto, verás ejercicios cargados automáticamente
3. Prueba los filtros y el buscador

---

## ℹ️ Información del Plan Gratuito

### ✅ Límites del Plan Free:
- **50,000 requests por mes**
- Se resetea el día 1 de cada mes
- No requiere tarjeta de crédito
- Acceso a toda la API de ejercicios

### 📊 Monitorear Uso:
- Ve a tu Dashboard en API Ninjas
- Verás el contador de requests utilizados
- Se muestra el límite restante

---

## 🎯 Características de la Página

### Filtros Disponibles:
- **Músculo objetivo**: Abdominales, Bíceps, Tríceps, Pecho, etc.
- **Tipo de ejercicio**: Fuerza, Cardio, Estiramiento, etc.
- **Dificultad**: Principiante, Intermedio, Experto
- **Búsqueda por nombre**: Busca ejercicios específicos

### Información de Cada Ejercicio:
- ✓ Nombre del ejercicio
- ✓ Nivel de dificultad
- ✓ Tipo de entrenamiento
- ✓ Músculo trabajado
- ✓ Equipamiento necesario
- ✓ Instrucciones detalladas

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

**Base URL:** `https://api.api-ninjas.com/v1/exercises`

**Parámetros disponibles:**
- `name`: Nombre del ejercicio
- `type`: Tipo de ejercicio
- `muscle`: Grupo muscular
- `difficulty`: Nivel de dificultad

**Ejemplo de request:**
```
GET https://api.api-ninjas.com/v1/exercises?muscle=biceps&difficulty=beginner
Headers: X-Api-Key: tu_api_key
```

---

## 💡 Tips y Recomendaciones

1. **No compartas tu API key públicamente**
2. **Guarda tu key en un lugar seguro**
3. **Monitorea tu uso mensual** en el dashboard
4. Para producción, considera usar **variables de entorno**
5. Los ejercicios se cargan en inglés pero están traducidos en la interfaz

---

## 🆘 Soporte

**Documentación oficial:** [https://api-ninjas.com/api/exercises](https://api-ninjas.com/api/exercises)

**Contacto API Ninjas:** [support@api-ninjas.com](mailto:support@api-ninjas.com)

---

✅ **¡Listo! Ahora tienes una biblioteca completa de ejercicios de musculación en tu web.**
