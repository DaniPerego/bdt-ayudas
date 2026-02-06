# 🏋️ Ejercicios de Musculación - Dataset Completo Local

## 📦 ¿Qué hay disponible?

El módulo de musculación ahora usa un **dataset completo local** con **873 ejercicios** del proyecto open-source [free-exercise-db](https://github.com/yuhonas/free-exercise-db).

### ✅ Ventajas del Dataset Local:

- **Sin necesidad de API Key** - No requiere configuración
- **Sin límites de requests** - Acceso ilimitado
- **Funciona offline** - No depende de internet
- **873 ejercicios** - Base de datos completa
- **Imágenes incluidas** - 2 imágenes por ejercicio
- **Múltiples categorías** - Fuerza, cardio, stretching, etc.
- **Cache inteligente** - Se guarda localmente en el navegador

## 📊 Contenido del Dataset

### Categorías disponibles:
- **Strength (581 ejercicios)** - Ejercicios de fuerza
- **Stretching (123 ejercicios)** - Estiramientos
- **Plyometrics (61 ejercicios)** - Ejercicios pliométricos
- **Powerlifting (38 ejercicios)** - Levantamiento de potencia
- **Olympic Weightlifting (35 ejercicios)** - Halterofilia
- **Strongman (21 ejercicios)** - Hombre fuerte
- **Cardio (14 ejercicios)** - Ejercicios cardiovasculares

### Equipamiento incluido:
- Body weight / Peso corporal
- Barbell / Barra
- Dumbbell / Mancuernas
- Cable / Polea
- Machine / Máquina
- Kettlebells
- Bands / Bandas
- Y muchos más...

### Músculos cubiertos:
- Abdominales, Pecho, Espalda
- Hombros, Brazos (bíceps, tríceps)
- Piernas (cuádriceps, isquiotibiales, glúteos, gemelos)
- Y más...

## 📂 Estructura del Dataset

El archivo `db/exercises.json` contiene:

```json
{
  "exercises": [
    {
      "id": "3_4_Sit-Up",
      "name": "3/4 Sit-Up",
      "category": "strength",
      "bodyPart": "waist",
      "equipment": "body only",
      "level": "beginner",
      "primaryMuscles": ["abdominals"],
      "secondaryMuscles": [],
      "instructions": [...],
      "images": [
        "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/3_4_Sit-Up/0.jpg",
        "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/3_4_Sit-Up/1.jpg"
      ]
    }
  ],
  "total": 873,
  "source": "free-exercise-db (GitHub)",
  "updated": "2026-02-06"
}
```

## 🚀 Cómo Usar

1. **Abrir** `musculacion.html` en tu navegador
2. **Navegar** - Los ejercicios se cargan automáticamente
3. **Filtrar** - Usa los filtros para encontrar ejercicios específicos
4. **Buscar** - Escribe en el buscador para encontrar por nombre

### Sistema de Cache:
- Los ejercicios se guardan en localStorage del navegador
- El cache dura 24 horas
- Puedes limpiarlo con el botón "Limpiar Cache"

## 🔄 Actualizar el Dataset

Si quieres actualizar a una versión más reciente del dataset:

```bash
# Descargar la última versión
curl -o db/exercises_raw.json https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json

# Procesarlo con el script Python (crear uno si es necesario)
python3 scripts/process_exercises.py
```

## 📖 Fuente Original

- **Repositorio**: [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- **Licencia**: Dominio Público
- **Última actualización**: 2026-02-06

---

## ℹ️ Información Adicional del Plan Original (Ya no necesario)

### ~~Plan BASIC (FREE) de RapidAPI~~ (OBSOLETO)
Ya no es necesario usar RapidAPI. El dataset completo está disponible localmente sin ninguna restricción.

---
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
