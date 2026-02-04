// 🏋️ Usando GIFs públicos de ExerciseDB CDN (Sin API, sin login, sin límites)
// CDN público con GIFs animados reales de ejercicios
console.log('✅ Usando ExerciseDB CDN público - GIFs animados reales');

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

// No requiere autenticación
function verificarApiKey() {
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
        console.log('Cargando ejercicios con GIFs públicos...');
        
        // Lista de ejercicios con GIFs públicos de ExerciseDB (CDN público)
        const ejerciciosBase = [
            // Pecho
            { name: 'Push Ups', gifUrl: 'https://v2.exercisedb.io/image/4mh9C9F7TLWwKY', bodyPart: 'chest', target: 'pectorals', equipment: 'body weight' },
            { name: 'Bench Press', gifUrl: 'https://v2.exercisedb.io/image/VUtlGbHXn6IgsH', bodyPart: 'chest', target: 'pectorals', equipment: 'barbell' },
            { name: 'Dumbbell Flyes', gifUrl: 'https://v2.exercisedb.io/image/naCfx5WmBGXOT0', bodyPart: 'chest', target: 'pectorals', equipment: 'dumbbell' },
            { name: 'Incline Press', gifUrl: 'https://v2.exercisedb.io/image/Zqhz-Pg6KxoEDz', bodyPart: 'chest', target: 'pectorals', equipment: 'barbell' },
            
            // Espalda
            { name: 'Pull Ups', gifUrl: 'https://v2.exercisedb.io/image/Rp7VPJKynsH4uV', bodyPart: 'back', target: 'lats', equipment: 'body weight' },
            { name: 'Bent Over Row', gifUrl: 'https://v2.exercisedb.io/image/8pRRXC8KaD-RUp', bodyPart: 'back', target: 'lats', equipment: 'barbell' },
            { name: 'Deadlift', gifUrl: 'https://v2.exercisedb.io/image/L8-knc1vwZu5Kx', bodyPart: 'back', target: 'spine', equipment: 'barbell' },
            { name: 'Lat Pulldown', gifUrl: 'https://v2.exercisedb.io/image/8j1Bp5B5PGwQhN', bodyPart: 'back', target: 'lats', equipment: 'cable' },
            
            // Piernas
            { name: 'Squats', gifUrl: 'https://v2.exercisedb.io/image/S1TJEy-u6ELb6Z', bodyPart: 'upper legs', target: 'quads', equipment: 'barbell' },
            { name: 'Lunges', gifUrl: 'https://v2.exercisedb.io/image/e7dA1fLtVLixzg', bodyPart: 'upper legs', target: 'quads', equipment: 'body weight' },
            { name: 'Leg Press', gifUrl: 'https://v2.exercisedb.io/image/nIxtSXZvA8v2pV', bodyPart: 'upper legs', target: 'quads', equipment: 'leverage machine' },
            { name: 'Leg Curl', gifUrl: 'https://v2.exercisedb.io/image/rtQ4Y3YIVf3vmy', bodyPart: 'upper legs', target: 'hamstrings', equipment: 'leverage machine' },
            { name: 'Calf Raises', gifUrl: 'https://v2.exercisedb.io/image/5avV7Zai9nP7gF', bodyPart: 'lower legs', target: 'calves', equipment: 'body weight' },
            
            // Hombros
            { name: 'Shoulder Press', gifUrl: 'https://v2.exercisedb.io/image/QYk0iQJ1Nh9fny', bodyPart: 'shoulders', target: 'delts', equipment: 'dumbbell' },
            { name: 'Lateral Raises', gifUrl: 'https://v2.exercisedb.io/image/tXGJLFQ0Zv2Tm5', bodyPart: 'shoulders', target: 'delts', equipment: 'dumbbell' },
            { name: 'Front Raises', gifUrl: 'https://v2.exercisedb.io/image/zv0u3kMdVgLQBB', bodyPart: 'shoulders', target: 'delts', equipment: 'dumbbell' },
            
            // Brazos
            { name: 'Bicep Curls', gifUrl: 'https://v2.exercisedb.io/image/2gvTP6rqNUwJy5', bodyPart: 'upper arms', target: 'biceps', equipment: 'dumbbell' },
            { name: 'Hammer Curls', gifUrl: 'https://v2.exercisedb.io/image/O0TI2qzUbMa3cY', bodyPart: 'upper arms', target: 'biceps', equipment: 'dumbbell' },
            { name: 'Tricep Dips', gifUrl: 'https://v2.exercisedb.io/image/aN2aXQhbUFD9cp', bodyPart: 'upper arms', target: 'triceps', equipment: 'body weight' },
            { name: 'Skull Crushers', gifUrl: 'https://v2.exercisedb.io/image/E1Hd0kZQZFCfxI', bodyPart: 'upper arms', target: 'triceps', equipment: 'barbell' },
            { name: 'Tricep Extensions', gifUrl: 'https://v2.exercisedb.io/image/mWq02y39NbD-xN', bodyPart: 'upper arms', target: 'triceps', equipment: 'dumbbell' },
            
            // Core/Abdomen
            { name: 'Crunches', gifUrl: 'https://v2.exercisedb.io/image/bj4AwLpXNH5agq', bodyPart: 'waist', target: 'abs', equipment: 'body weight' },
            { name: 'Plank', gifUrl: 'https://v2.exercisedb.io/image/OW6v7o1XpD9kBx', bodyPart: 'waist', target: 'abs', equipment: 'body weight' },
            { name: 'Russian Twists', gifUrl: 'https://v2.exercisedb.io/image/qyxfhZPbZFNDe5', bodyPart: 'waist', target: 'abs', equipment: 'body weight' },
            { name: 'Leg Raises', gifUrl: 'https://v2.exercisedb.io/image/XGlpXWdFnBk7F0', bodyPart: 'waist', target: 'abs', equipment: 'body weight' },
            { name: 'Mountain Climbers', gifUrl: 'https://v2.exercisedb.io/image/3zXKWnwb3CnGjT', bodyPart: 'waist', target: 'abs', equipment: 'body weight' },
            
            // Cardio
            { name: 'Burpees', gifUrl: 'https://v2.exercisedb.io/image/SuILD-U8GQF1s1', bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'body weight' },
            { name: 'Jumping Jacks', gifUrl: 'https://v2.exercisedb.io/image/W8i5LVMRaJkpGE', bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'body weight' },
            { name: 'Jump Rope', gifUrl: 'https://v2.exercisedb.io/image/d4-b39E4qy2QWw', bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'rope' },
            { name: 'High Knees', gifUrl: 'https://v2.exercisedb.io/image/YxNRZzPbvz1MXB', bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'body weight' },
        ];
        
        // Procesar ejercicios
        const ejerciciosProcesados = ejerciciosBase.map((ej, index) => ({
            id: `ex-${index + 1}`,
            name: ej.name,
            description: `Ejercicio de ${traducirParteDelCuerpo(ej.bodyPart)}`,
            category: ej.bodyPart,
            equipment: ej.equipment,
            muscles: [ej.target],
            secondaryMuscles: [],
            gifUrl: ej.gifUrl,
            bodyPart: ej.bodyPart,
            target: ej.target
        }));
        
        console.log(`✅ ${ejerciciosProcesados.length} ejercicios cargados con GIFs`);
        
        ejerciciosCache = ejerciciosProcesados;
        guardarCacheEjercicios(ejerciciosProcesados);
        aplicarFiltros();
    } catch (error) {
        console.error('Error al cargar ejercicios:', error);
        mostrarError(error.message);
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
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => 
            ej.target?.toLowerCase().includes(musculo) ||
            ej.secondaryMuscles?.some(m => m.toLowerCase().includes(musculo))
        );
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
                     onerror="console.error('Error al cargar imagen:', '${gifUrl}'); this.onerror=null; this.parentElement.innerHTML='<div style=\\'padding: 40px; text-align: center; color: #999; background: #f5f5f5; border-radius: 8px;\\'><div style=\\'font-size: 48px;\\'>🏋️</div><small>Imagen no disponible</small></div>';">` 
                : '<div style="padding: 40px; text-align: center; color: #999; background: #f5f5f5; border-radius: 8px; height: 100%;"><div style="font-size: 48px;">🏋️</div><small>Sin imagen</small></div>'
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
