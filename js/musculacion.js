// ⚠️ CONFIGURA TU API KEY DE RAPIDAPI AQUÍ ⚠️
// Obtén tu key gratis en https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
const API_KEY = 'd1588f2d0emsh136af77a92e63fep12efacjsn1d6bae24a51b';
const API_URL = 'https://exercisedb.p.rapidapi.com';
const API_VERSION = '/v2'; // Usar versión 2 para asegurar que incluya GIFs

console.log('API Key configurada:', API_KEY !== 'TU_RAPIDAPI_KEY_AQUI' ? 'Sí' : 'No');

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

// Verificar si la API key está configurada
function verificarApiKey() {
    if (!API_KEY || API_KEY.trim() === '' || API_KEY === 'TU_RAPIDAPI_KEY_AQUI') {
        console.warn('API Key no configurada correctamente');
        mensajeApi.style.display = 'block';
        ejerciciosContainer.style.display = 'none';
        return false;
    }
    console.log('API Key verificada correctamente');
    mensajeApi.style.display = 'none';
    return true;
}

// Sistema de caché para reducir llamadas a la API
function obtenerCacheEjercicios() {
    const cache = localStorage.getItem('ejercicios-cache');
    if (!cache) return null;
    
    try {
        const data = JSON.parse(cache);
        const ahora = new Date().getTime();
        const unDia = 24 * 60 * 60 * 1000; // 1 día en milisegundos
        
        // Verificar que los ejercicios tengan gifUrl
        if (data.ejercicios && data.ejercicios.length > 0) {
            const primerEjercicio = data.ejercicios[0];
            if (!primerEjercicio.gifUrl && !primerEjercicio.gif_url) {
                console.warn('Caché corrupto detectado (sin GIFs). Limpiando...');
                localStorage.removeItem('ejercicios-cache');
                return null;
            }
        }
        
        // Si el cache tiene menos de 1 día, usarlo
        if (ahora - data.timestamp < unDia) {
            console.log('Usando ejercicios del caché (' + data.ejercicios.length + ' ejercicios)');
            return data.ejercicios;
        }
        
        console.log('Caché expirado');
        return null;
    } catch (error) {
        console.error('Error al leer caché:', error);
        localStorage.removeItem('ejercicios-cache');
        return null;
    }
}

function guardarCacheEjercicios(ejercicios) {
    const data = {
        ejercicios: ejercicios,
        timestamp: new Date().getTime()
    };
    localStorage.setItem('ejercicios-cache', JSON.stringify(data));
    console.log('Ejercicios guardados en caché');
}

// Función para cargar todos los ejercicios
async function cargarEjercicios() {
    if (!verificarApiKey()) return;

    // Intentar usar caché primero
    const ejerciciosCacheados = obtenerCacheEjercicios();
    if (ejerciciosCacheados) {
        ejerciciosCache = ejerciciosCacheados;
        aplicarFiltros();
        return;
    }

    mostrarLoader(true);

    try {
        // Cargar todos los ejercicios (solo se hace una vez y se cachea)
        // Usamos offset y limit para paginar correctamente
        const response = await fetch(`${API_URL}/exercises?offset=0&limit=1324`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('API Key inválida. Verifica tu configuración en RapidAPI.');
            }
            throw new Error(`Error: ${response.status}`);
        }

        const ejercicios = await response.json();
        console.log('Ejercicios cargados:', ejercicios.length);
        console.log('Ejemplo de ejercicio completo:', JSON.stringify(ejercicios[0], null, 2));
        console.log('Propiedades del ejercicio:', Object.keys(ejercicios[0]));
        console.log('¿Tiene gifUrl?:', 'gifUrl' in ejercicios[0]);
        console.log('Valor de gifUrl:', ejercicios[0].gifUrl);
        ejerciciosCache = ejercicios;
        guardarCacheEjercicios(ejercicios);
        aplicarFiltros();
    } catch (error) {
        console.error('Error al cargar ejercicios:', error);
        mostrarError(error.message);
    } finally {
        mostrarLoader(false);
    }
}

// Función para aplicar filtros localmente (sin llamadas a la API)
function aplicarFiltros() {
    const musculo = filtroMusculo.value.toLowerCase();
    const equipamiento = filtroTipo.value.toLowerCase();
    const parteDelCuerpo = filtroDificultad.value.toLowerCase();
    const nombre = buscadorInput.value.trim().toLowerCase();

    let ejerciciosFiltrados = ejerciciosCache;

    // Filtrar por músculo objetivo
    if (musculo) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => 
            ej.target && ej.target.toLowerCase() === musculo
        );
    }

    // Filtrar por equipamiento
    if (equipamiento) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => 
            ej.equipment && ej.equipment.toLowerCase() === equipamiento
        );
    }

    // Filtrar por parte del cuerpo
    if (parteDelCuerpo) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => 
            ej.bodyPart && ej.bodyPart.toLowerCase() === parteDelCuerpo
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
    
    // Asegurar que la URL del GIF sea correcta
    let gifUrl = ejercicio.gifUrl || ejercicio.gif_url || null;
    
    // Verificar que la URL sea válida
    if (gifUrl && !gifUrl.startsWith('http')) {
        gifUrl = null;
    }
    
    // Debug: mostrar el primer ejercicio
    if (index === 0) {
        console.log('Primer ejercicio completo:', ejercicio);
        console.log('GIF URL del primero:', gifUrl);
    }
    
    // Si no hay GIF, registrar para depuración
    if (!gifUrl) {
        console.warn('Ejercicio sin GIF:', ejercicio.name, ejercicio.id);
    }

    card.innerHTML = `
        <div class="ejercicio-gif-container">
            ${gifUrl && gifUrl !== 'undefined' && gifUrl !== 'null' ? 
                `<img src="${gifUrl}" 
                     alt="${ejercicio.name}" 
                     class="ejercicio-gif" 
                     loading="lazy"
                     crossorigin="anonymous"
                     onerror="console.error('Error al cargar GIF:', '${gifUrl}'); this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23f0f0f0%27 width=%27200%27 height=%27200%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-size=%2716%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23666%27%3E⚠️ Error cargando GIF%3C/text%3E%3C/svg%3E';">` 
                : '<div style="padding: 20px; text-align: center; color: #999; background: #f5f5f5; border-radius: 8px;"><div style="font-size: 48px;">🏋️</div><small>GIF no disponible</small></div>'
            }
        </div>
        <div class="ejercicio-header">
            <h3 class="ejercicio-nombre">${traducirNombre(ejercicio.name)}</h3>
            <span class="ejercicio-badge" style="background-color: ${color}">
                ${traducirParteDelCuerpo(ejercicio.bodyPart)}
            </span>
        </div>
        <div class="ejercicio-body">
            <div class="ejercicio-info">
                <div class="info-item">
                    <i class="bi bi-bullseye"></i>
                    <span><strong>Músculo objetivo:</strong> ${traducirMusculo(ejercicio.target)}</span>
                </div>
                <div class="info-item">
                    <i class="bi bi-tools"></i>
                    <span><strong>Equipamiento:</strong> ${traducirEquipamiento(ejercicio.equipment)}</span>
                </div>
                ${ejercicio.secondaryMuscles && ejercicio.secondaryMuscles.length > 0 ? `
                <div class="info-item">
                    <i class="bi bi-diagram-3"></i>
                    <span><strong>Músculos secundarios:</strong> ${ejercicio.secondaryMuscles.map(m => traducirMusculo(m)).join(', ')}</span>
                </div>
                ` : ''}
            </div>
            ${ejercicio.instructions && ejercicio.instructions.length > 0 ? `
            <div class="ejercicio-instrucciones">
                <h4><i class="bi bi-clipboard-check"></i> Instrucciones:</h4>
                <ol>
                    ${ejercicio.instructions.map(inst => `<li>${inst}</li>`).join('')}
                </ol>
            </div>
            ` : ''}
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
        'abductors': 'Abductores',
        'abs': 'Abdominales',
        'adductors': 'Aductores',
        'biceps': 'Bíceps',
        'calves': 'Gemelos',
        'cardiovascular system': 'Sistema Cardiovascular',
        'delts': 'Deltoides',
        'forearms': 'Antebrazos',
        'glutes': 'Glúteos',
        'hamstrings': 'Isquiotibiales',
        'lats': 'Dorsales',
        'levator scapulae': 'Elevador de la Escápula',
        'pectorals': 'Pectorales',
        'quads': 'Cuádriceps',
        'serratus anterior': 'Serrato Anterior',
        'spine': 'Columna',
        'traps': 'Trapecios',
        'triceps': 'Tríceps',
        'upper back': 'Espalda Alta'
    };
    return traducciones[musculo] || musculo;
}

function traducirEquipamiento(equipamiento) {
    const traducciones = {
        'assisted': 'Asistido',
        'band': 'Banda Elástica',
        'barbell': 'Barra',
        'body weight': 'Peso Corporal',
        'bosu ball': 'Bosu Ball',
        'cable': 'Polea/Cable',
        'dumbbell': 'Mancuernas',
        'elliptical machine': 'Elíptica',
        'ez barbell': 'Barra Z',
        'hammer': 'Martillo',
        'kettlebell': 'Kettlebell',
        'leverage machine': 'Máquina de Palanca',
        'medicine ball': 'Balón Medicinal',
        'olympic barbell': 'Barra Olímpica',
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
    return traducciones[equipamiento] || equipamiento;
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
        localStorage.removeItem('ejercicios-cache');
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
            console.log('Tiene gif_url:', !!primerEjercicio.gif_url);
            console.log('URL del GIF:', primerEjercicio.gifUrl || primerEjercicio.gif_url || 'NO TIENE');
            
            // Contar cuántos tienen GIF
            const conGif = ejerciciosCache.filter(ej => ej.gifUrl || ej.gif_url).length;
            const sinGif = ejerciciosCache.length - conGif;
            
            console.log(`Ejercicios CON GIF: ${conGif}`);
            console.log(`Ejercicios SIN GIF: ${sinGif}`);
            
            // Probar cargar un GIF de ejemplo
            if (primerEjercicio.gifUrl) {
                console.log('Intentando cargar GIF de prueba...');
                const img = new Image();
                img.onload = () => console.log('✅ GIF de prueba cargado correctamente');
                img.onerror = () => console.error('❌ Error al cargar GIF de prueba');
                img.src = primerEjercicio.gifUrl;
            }
        } else {
            console.log('No hay ejercicios cargados');
        }
        
        // Verificar caché
        const cache = localStorage.getItem('ejercicios-cache');
        if (cache) {
            try {
                const data = JSON.parse(cache);
                console.log('Fecha del caché:', new Date(data.timestamp));
                console.log('Ejercicios en caché:', data.ejercicios.length);
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
