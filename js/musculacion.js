// 🏋️ Dataset con GIFs desde GitHub (Exercise GIFs)
// Sin API key, cargado remoto
console.log('✅ Usando dataset con GIFs desde GitHub');

// Elementos del DOM
const ejerciciosContainer = document.getElementById('ejercicios-container');
const btnBuscar = document.getElementById('btn-buscar');
const buscadorInput = document.getElementById('buscador-ejercicios');
const filtroMusculo = document.getElementById('filtro-musculo');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroDificultad = document.getElementById('filtro-dificultad');
const loader = document.getElementById('loader');
const mensajeApi = document.getElementById('mensaje-api');
const contadorResultados = document.getElementById('contador-resultados');

// Cache de ejercicios para evitar múltiples llamadas
let ejerciciosCache = [];

// Versión del dataset para invalidar caché antiguo
const DATASET_VERSION = 'v3.0-gifs-csv';
const EJERCICIOS_CACHE_KEY = 'ejercicios-musculacion-cache';

const EXERCISE_GIFS_CSV_URL = 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/exercises.csv';
const EXERCISE_GIFS_BASE = 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/';

// No requiere autenticación
function verificarApiKey() {
    mensajeApi.style.display = 'none';
    return true;
}

// Función para cargar todos los ejercicios desde CSV remoto
async function cargarEjercicios() {
    if (!verificarApiKey()) return;

    // Intentar usar caché primero
    const ejerciciosCacheados = CacheManager.get(EJERCICIOS_CACHE_KEY, DATASET_VERSION);
    if (ejerciciosCacheados) {
        ejerciciosCache = ejerciciosCacheados;
        aplicarFiltros();
        return;
    }

    mostrarLoader(true);

    try {
        console.log('📂 Cargando ejercicios desde CSV remoto con GIFs...');
        
        // Cargar ejercicios desde el archivo CSV remoto
        const response = await fetch(EXERCISE_GIFS_CSV_URL);
        
        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo de ejercicios (HTTP ${response.status})`);
        }
        
        const csvText = await response.text();
        const ejerciciosBase = parseCsv(csvText);
        
        console.log(`📥 ${ejerciciosBase.length} ejercicios cargados del dataset`);
        console.log('📦 Dataset info: Exercise GIFs CSV');
        
        // Procesar ejercicios para formato compatible con la UI
        const ejerciciosProcesados = ejerciciosBase.map((ej) => {
            const instructions = collectIndexedFields(ej, 'instructions/');
            const secondaryMuscles = collectIndexedFields(ej, 'secondaryMuscles/');
            const target = ej.target || 'general';

            return {
                id: ej.id,
                name: ej.name,
                description: `Ejercicio de ${traducirParteDelCuerpo(ej.bodyPart)}`,
                category: ej.bodyPart || '',
                bodyPart: ej.bodyPart,
                equipment: ej.equipment,
                level: ej.level || null,
                target,
                muscles: target ? [target] : [],
                secondaryMuscles,
                instructions,
                gifUrl: ej.id ? `${EXERCISE_GIFS_BASE}${ej.id}.gif` : null,
                images: []
            };
        });
        
        console.log(`✅ ${ejerciciosProcesados.length} ejercicios procesados y listos`);
        console.log(`📊 Categorías: ${[...new Set(ejerciciosProcesados.map(e => e.category))].join(', ')}`);
        
        ejerciciosCache = ejerciciosProcesados;
        CacheManager.set(EJERCICIOS_CACHE_KEY, ejerciciosProcesados, DATASET_VERSION);
        aplicarFiltros();
    } catch (error) {
        console.error('❌ Error al cargar ejercicios:', error);
        mostrarError(error.message || 'No se pudieron cargar los ejercicios');
    } finally {
        mostrarLoader(false);
    }
}

// Función para aplicar filtros localmente
function aplicarFiltros() {
    const musculo = filtroMusculo.value.toLowerCase();
    const equipamiento = filtroTipo.value.toLowerCase();
    const parteDelCuerpo = filtroDificultad.value.toLowerCase();
    const nombre = buscadorInput.value.trim().toLowerCase();

    let ejerciciosFiltrados = ejerciciosCache;

    // Filtrar por músculo objetivo
    if (musculo) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => {
            const targetMatch = ej.target?.toLowerCase().includes(musculo);
            const musclesMatch = ej.muscles?.some(m => m.toLowerCase().includes(musculo));
            const secondaryMatch = ej.secondaryMuscles?.some(m => m.toLowerCase().includes(musculo));
            return targetMatch || musclesMatch || secondaryMatch;
        });
    }

    // Filtrar por equipamiento
    if (equipamiento) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => 
            ej.equipment && ej.equipment.toLowerCase().includes(equipamiento)
        );
    }

    // Filtrar por parte del cuerpo
    if (parteDelCuerpo) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => 
            (ej.bodyPart && ej.bodyPart.toLowerCase().includes(parteDelCuerpo)) ||
            (ej.category && ej.category.toLowerCase().includes(parteDelCuerpo))
        );
    }

    // Filtrar por nombre
    if (nombre) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => 
            ej.name && ej.name.toLowerCase().includes(nombre)
        );
    }

    mostrarEjercicios(ejerciciosFiltrados);
}

// Función para mostrar ejercicios en el DOM
function mostrarEjercicios(ejercicios) {
    ejerciciosContainer.innerHTML = '';

    if (ejercicios.length === 0) {
        ejerciciosContainer.innerHTML = `
            <div class="sin-resultados">
                <i class="bi bi-search"></i>
                <p>No se encontraron ejercicios con estos criterios.</p>
                <p>Intenta con otros filtros.</p>
            </div>
        `;
        contadorResultados.textContent = '';
        return;
    }

    // Mostrar contador
    contadorResultados.textContent = `${ejercicios.length} ejercicio${ejercicios.length !== 1 ? 's' : ''} encontrado${ejercicios.length !== 1 ? 's' : ''}`;

    ejercicios.forEach((ejercicio, index) => {
        const card = crearCardEjercicio(ejercicio, index);
        ejerciciosContainer.appendChild(card);
    });
}

// Función para crear una card de ejercicio
function crearCardEjercicio(ejercicio, index) {
    const card = document.createElement('div');
    card.className = 'ejercicio-card';
    card.style.animationDelay = `${index * 0.05}s`;

    // Color según parte del cuerpo
    const colorParteDelCuerpo = {
        'back': '#4CAF50',
        'cardio': '#2196F3',
        'chest': '#FF5722',
        'lower arms': '#9C27B0',
        'lower legs': '#FF9800',
        'neck': '#795548',
        'shoulders': '#E91E63',
        'upper arms': '#3F51B5',
        'upper legs': '#FFC107',
        'waist': '#00BCD4'
    };

    const color = colorParteDelCuerpo[ejercicio.bodyPart] || '#9E9E9E';
    
    // ExerciseDB proporciona la URL completa del GIF
    const gifUrl = ejercicio.gifUrl;
    
    // Debug: mostrar el primer ejercicio
    if (index === 0) {
        console.log('Primer ejercicio completo:', ejercicio);
        console.log('Nombre:', ejercicio.name);
        console.log('GIF URL:', gifUrl);
    }

    card.innerHTML = `
        <div class="ejercicio-gif-container">
            ${gifUrl ? 
                `<img src="${gifUrl}" 
                     alt="${ejercicio.name}" 
                     class="ejercicio-gif" 
                     loading="lazy"
                     onerror="handleImageError(this, '${ejercicio.name.replace(/'/g, "\\'")}')">` 
                : '<div class="gif-fallback"><div class="fallback-icon">🏋️</div><div class="fallback-text">GIF no disponible</div><div class="fallback-name">' + ejercicio.name.substring(0, 30) + '</div></div>'
            }
        </div>
        <div class="ejercicio-header">
            <h3 class="ejercicio-nombre">${ejercicio.name}</h3>
            <span class="ejercicio-badge" style="background-color: ${color}">
                ${traducirParteDelCuerpo(ejercicio.bodyPart || ejercicio.category)}
            </span>
        </div>
        <div class="ejercicio-body">
            <div class="ejercicio-info">
                ${ejercicio.target ? `
                <div class="info-item">
                    <i class="bi bi-bullseye"></i>
                    <span><strong>Músculo objetivo:</strong> ${traducirMusculo(ejercicio.target)}</span>
                </div>
                ` : ''}
                <div class="info-item">
                    <i class="bi bi-tools"></i>
                    <span><strong>Equipamiento:</strong> ${traducirEquipamiento(ejercicio.equipment || 'body weight')}</span>
                </div>
                ${ejercicio.secondaryMuscles && ejercicio.secondaryMuscles.length > 0 ? `
                <div class="info-item">
                    <i class="bi bi-diagram-3"></i>
                    <span><strong>Músculos secundarios:</strong> ${ejercicio.secondaryMuscles.map(m => traducirMusculo(m)).join(', ')}</span>
                </div>
                ` : ''}
            </div>
        </div>
        <button class="btn-favorito" onclick="toggleFavorito('${ejercicio.id}')" title="Agregar a favoritos">
            <i class="bi bi-heart${esFavorito(ejercicio.id) ? '-fill' : ''}"></i>
        </button>
    `;

    return card;
}

// Funciones de traducción
function traducirNombre(nombre) {
    // Capitalizar y mejorar el formato
    return nombre.split(' ').map(palabra => 
        palabra.charAt(0).toUpperCase() + palabra.slice(1)
    ).join(' ');
}

function traducirParteDelCuerpo(parte) {
    const traducciones = {
        'back': 'Espalda',
        'cardio': 'Cardio',
        'chest': 'Pecho',
        'lower arms': 'Antebrazos',
        'lower legs': 'Piernas Inferiores',
        'neck': 'Cuello',
        'shoulders': 'Hombros',
        'upper arms': 'Brazos',
        'upper legs': 'Piernas',
        'waist': 'Cintura/Abdomen'
    };
    return traducciones[parte] || parte;
}

function traducirMusculo(musculo) {
    const traducciones = {
        'abdominals': 'Abdominales',
        'abductors': 'Abductores',
        'abs': 'Abdominales',
        'adductors': 'Aductores',
        'biceps': 'Bíceps',
        'calves': 'Gemelos',
        'cardiovascular system': 'Sistema Cardiovascular',
        'chest': 'Pecho',
        'delts': 'Deltoides',
        'forearms': 'Antebrazos',
        'glutes': 'Glúteos',
        'hamstrings': 'Isquiotibiales',
        'lats': 'Dorsales',
        'levator scapulae': 'Elevador de la Escápula',
        'lower back': 'Espalda Baja',
        'middle back': 'Espalda Media',
        'neck': 'Cuello',
        'pectorals': 'Pectorales',
        'quadriceps': 'Cuádriceps',
        'quads': 'Cuádriceps',
        'serratus anterior': 'Serrato Anterior',
        'shoulders': 'Hombros',
        'spine': 'Columna',
        'traps': 'Trapecios',
        'triceps': 'Tríceps',
        'upper back': 'Espalda Alta'
    };
    return traducciones[musculo?.toLowerCase()] || musculo;
}

function traducirEquipamiento(equipamiento) {
    const traducciones = {
        'assisted': 'Asistido',
        'band': 'Banda Elástica',
        'bands': 'Bandas Elásticas',
        'barbell': 'Barra',
        'body only': 'Peso Corporal',
        'body weight': 'Peso Corporal',
        'bosu ball': 'Bosu Ball',
        'cable': 'Polea/Cable',
        'dumbbell': 'Mancuernas',
        'e-z curl bar': 'Barra Z',
        'elliptical machine': 'Elíptica',
        'exercise ball': 'Fitball',
        'ez barbell': 'Barra Z',
        'foam roll': 'Rodillo de Espuma',
        'hammer': 'Martillo',
        'kettlebells': 'Kettlebells',
        'kettlebell': 'Kettlebell',
        'leverage machine': 'Máquina de Palanca',
        'machine': 'Máquina',
        'medicine ball': 'Balón Medicinal',
        'none': 'Sin Equipamiento',
        'olympic barbell': 'Barra Olímpica',
        'other': 'Otro',
        'resistance band': 'Banda de Resistencia',
        'roller': 'Rodillo',
        'rope': 'Cuerda',
        'skierg machine': 'Máquina SkiErg',
        'sled machine': 'Máquina de Trineo',
        'smith machine': 'Máquina Smith',
        'stability ball': 'Fitball',
        'stationary bike': 'Bicicleta Estática',
        'stepmill machine': 'Máquina Step',
        'tire': 'Neumático',
        'trap bar': 'Barra Hexagonal',
        'upper body ergometer': 'Ergómetro de Tren Superior',
        'weighted': 'Con Peso',
        'wheel roller': 'Rueda Abdominal'
    };
    return traducciones[equipamiento?.toLowerCase()] || equipamiento;
}

// Mostrar/ocultar loader
function mostrarLoader(mostrar) {
    loader.style.display = mostrar ? 'flex' : 'none';
    ejerciciosContainer.style.display = mostrar ? 'none' : 'grid';
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    ejerciciosContainer.innerHTML = `
        <div class="mensaje-error">
            <i class="bi bi-exclamation-circle"></i>
            <h3>Error al cargar ejercicios</h3>
            <p>${mensaje}</p>
        </div>
    `;
    contadorResultados.textContent = '';
}

// Sistema de favoritos
function esFavorito(ejercicioId) {
    const favoritos = JSON.parse(localStorage.getItem('ejercicios-favoritos')) || [];
    return favoritos.includes(ejercicioId);
}

function toggleFavorito(ejercicioId) {
    let favoritos = JSON.parse(localStorage.getItem('ejercicios-favoritos')) || [];
    
    const index = favoritos.indexOf(ejercicioId);
    
    if (index > -1) {
        favoritos.splice(index, 1);
        mostrarNotificacion('Eliminado de favoritos');
    } else {
        favoritos.push(ejercicioId);
        mostrarNotificacion('Agregado a favoritos ❤️');
    }
    
    localStorage.setItem('ejercicios-favoritos', JSON.stringify(favoritos));
    
    // Recargar la vista para actualizar el ícono
    aplicarFiltros();
}

// Mostrar notificación temporal
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => notificacion.remove(), 300);
    }, 2000);
}

// Event Listeners
btnBuscar.addEventListener('click', aplicarFiltros);

// Buscar al presionar Enter
buscadorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        aplicarFiltros();
    }
});

// Aplicar filtros al cambiar selecciones
filtroMusculo.addEventListener('change', aplicarFiltros);
filtroTipo.addEventListener('change', aplicarFiltros);
filtroDificultad.addEventListener('change', aplicarFiltros);

// Botón para limpiar caché
const btnLimpiarCache = document.getElementById('btn-limpiar-cache');
if (btnLimpiarCache) {
    btnLimpiarCache.addEventListener('click', () => {
        CacheManager.clear(EJERCICIOS_CACHE_KEY);
        console.log('Caché limpiado');
        mostrarNotificacion('Caché limpiado. Recargando ejercicios...');
        cargarEjercicios();
    });
}

// Botón de diagnóstico
const btnDiagnostico = document.getElementById('btn-diagnostico');
if (btnDiagnostico) {
    btnDiagnostico.addEventListener('click', () => {
        console.log('=== DIAGNÓSTICO DE EJERCICIOS ===');
        console.log('Total ejercicios en caché:', ejerciciosCache.length);
        
        if (ejerciciosCache.length > 0) {
            const primerEjercicio = ejerciciosCache[0];
            console.log('Primer ejercicio:', primerEjercicio);
            console.log('Tiene gifUrl:', !!primerEjercicio.gifUrl);
            console.log('URL del GIF:', primerEjercicio.gifUrl || 'NO TIENE');
            console.log('BodyPart:', primerEjercicio.bodyPart);
            console.log('Target:', primerEjercicio.target);
            console.log('Equipment:', primerEjercicio.equipment);
            
            // Contar cuántos tienen GIF
            const conGif = ejerciciosCache.filter(ej => ej.gifUrl).length;
            const sinGif = ejerciciosCache.length - conGif;
            
            console.log(`Ejercicios CON GIF: ${conGif}`);
            console.log(`Ejercicios SIN GIF: ${sinGif}`);
            
            // Probar cargar un GIF de ejemplo
            if (primerEjercicio.gifUrl) {
                console.log('Intentando cargar GIF animado de prueba...');
                const img = new Image();
                img.onload = () => console.log('✅ GIF animado cargado correctamente');
                img.onerror = () => console.error('❌ Error al cargar GIF');
                img.src = primerEjercicio.gifUrl;
            }
        } else {
            console.log('No hay ejercicios cargados');
        }
        
        // Verificar caché
        const cache = localStorage.getItem(EJERCICIOS_CACHE_KEY);
        if (cache) {
            try {
                const data = JSON.parse(cache);
                console.log('Fecha del caché:', new Date(data.timestamp));
                console.log('Versión del caché:', data.version);
                console.log('Ejercicios en caché:', data.data.length);
            } catch (e) {
                console.error('Error al leer caché:', e);
            }
        } else {
            console.log('No hay caché guardado');
        }
        
        console.log('=== FIN DIAGNÓSTICO ===');
        alert('Diagnóstico completado. Revisa la consola del navegador (F12) para ver los resultados.');
    });
}

// Cargar ejercicios por defecto al iniciar
document.addEventListener('DOMContentLoaded', () => {
    if (verificarApiKey()) {
        cargarEjercicios();
    }
});
