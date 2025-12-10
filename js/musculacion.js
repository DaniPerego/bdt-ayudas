// ⚠️ CONFIGURA TU API KEY AQUÍ ⚠️
const API_KEY = 'TU_API_KEY_AQUI'; // Obtén tu key gratis en https://api-ninjas.com/
const API_URL = 'https://api.api-ninjas.com/v1/exercises';

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
    if (!API_KEY || API_KEY === 'TU_API_KEY_AQUI') {
        mensajeApi.style.display = 'block';
        ejerciciosContainer.style.display = 'none';
        return false;
    }
    mensajeApi.style.display = 'none';
    return true;
}

// Función para buscar ejercicios
async function buscarEjercicios() {
    if (!verificarApiKey()) return;

    const musculo = filtroMusculo.value;
    const tipo = filtroTipo.value;
    const dificultad = filtroDificultad.value;
    const nombre = buscadorInput.value.trim();

    // Construir parámetros de búsqueda
    const params = new URLSearchParams();
    if (musculo) params.append('muscle', musculo);
    if (tipo) params.append('type', tipo);
    if (dificultad) params.append('difficulty', dificultad);
    if (nombre) params.append('name', nombre);

    // Si no hay parámetros, buscar ejercicios de fuerza por defecto
    if (!params.toString()) {
        params.append('type', 'strength');
    }

    mostrarLoader(true);

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('API Key inválida. Verifica tu configuración.');
            }
            throw new Error(`Error: ${response.status}`);
        }

        const ejercicios = await response.json();
        ejerciciosCache = ejercicios;
        mostrarEjercicios(ejercicios);
    } catch (error) {
        console.error('Error al buscar ejercicios:', error);
        mostrarError(error.message);
    } finally {
        mostrarLoader(false);
    }
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

    // Traducir dificultad
    const dificultadES = {
        'beginner': 'Principiante',
        'intermediate': 'Intermedio',
        'expert': 'Experto'
    };

    // Traducir tipo
    const tipoES = {
        'strength': 'Fuerza',
        'cardio': 'Cardio',
        'stretching': 'Estiramiento',
        'powerlifting': 'Powerlifting',
        'plyometrics': 'Pliométricos',
        'strongman': 'Strongman',
        'olympic_weightlifting': 'Halterofilia'
    };

    // Color según dificultad
    const colorDificultad = {
        'beginner': '#4CAF50',
        'intermediate': '#FF9800',
        'expert': '#F44336'
    };

    card.innerHTML = `
        <div class="ejercicio-header">
            <h3 class="ejercicio-nombre">${ejercicio.name}</h3>
            <span class="ejercicio-dificultad" style="background-color: ${colorDificultad[ejercicio.difficulty]}">
                ${dificultadES[ejercicio.difficulty] || ejercicio.difficulty}
            </span>
        </div>
        <div class="ejercicio-body">
            <div class="ejercicio-info">
                <div class="info-item">
                    <i class="bi bi-lightning-charge"></i>
                    <span><strong>Tipo:</strong> ${tipoES[ejercicio.type] || ejercicio.type}</span>
                </div>
                <div class="info-item">
                    <i class="bi bi-heart-pulse"></i>
                    <span><strong>Músculo:</strong> ${traducirMusculo(ejercicio.muscle)}</span>
                </div>
                <div class="info-item">
                    <i class="bi bi-tools"></i>
                    <span><strong>Equipamiento:</strong> ${traducirEquipamiento(ejercicio.equipment)}</span>
                </div>
            </div>
            <div class="ejercicio-instrucciones">
                <h4><i class="bi bi-clipboard-check"></i> Instrucciones:</h4>
                <p>${ejercicio.instructions}</p>
            </div>
        </div>
        <button class="btn-favorito" onclick="toggleFavorito(${index})" title="Agregar a favoritos">
            <i class="bi bi-heart"></i>
        </button>
    `;

    return card;
}

// Funciones de traducción
function traducirMusculo(musculo) {
    const traducciones = {
        'abdominals': 'Abdominales',
        'biceps': 'Bíceps',
        'triceps': 'Tríceps',
        'chest': 'Pecho',
        'lats': 'Dorsales',
        'quadriceps': 'Cuádriceps',
        'hamstrings': 'Isquiotibiales',
        'calves': 'Gemelos',
        'glutes': 'Glúteos',
        'shoulders': 'Hombros',
        'traps': 'Trapecios',
        'forearms': 'Antebrazos',
        'lower_back': 'Zona Lumbar',
        'middle_back': 'Zona Media de Espalda',
        'neck': 'Cuello',
        'abductors': 'Abductores',
        'adductors': 'Aductores'
    };
    return traducciones[musculo] || musculo;
}

function traducirEquipamiento(equipamiento) {
    const traducciones = {
        'barbell': 'Barra',
        'dumbbell': 'Mancuernas',
        'body_only': 'Solo Cuerpo',
        'cable': 'Polea/Cable',
        'machine': 'Máquina',
        'kettlebells': 'Kettlebells',
        'bands': 'Bandas',
        'medicine_ball': 'Balón Medicinal',
        'exercise_ball': 'Fitball',
        'foam_roll': 'Rodillo de Espuma',
        'e-z_curl_bar': 'Barra Z',
        'other': 'Otro'
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
function toggleFavorito(index) {
    const ejercicio = ejerciciosCache[index];
    let favoritos = JSON.parse(localStorage.getItem('ejercicios-favoritos')) || [];
    
    const indexFavorito = favoritos.findIndex(fav => fav.name === ejercicio.name);
    
    if (indexFavorito > -1) {
        favoritos.splice(indexFavorito, 1);
        mostrarNotificacion('Eliminado de favoritos');
    } else {
        favoritos.push(ejercicio);
        mostrarNotificacion('Agregado a favoritos ❤️');
    }
    
    localStorage.setItem('ejercicios-favoritos', JSON.stringify(favoritos));
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
btnBuscar.addEventListener('click', buscarEjercicios);

// Buscar al presionar Enter
buscadorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarEjercicios();
    }
});

// Buscar al cambiar filtros
filtroMusculo.addEventListener('change', buscarEjercicios);
filtroTipo.addEventListener('change', buscarEjercicios);
filtroDificultad.addEventListener('change', buscarEjercicios);

// Cargar ejercicios por defecto al iniciar
document.addEventListener('DOMContentLoaded', () => {
    if (verificarApiKey()) {
        buscarEjercicios();
    }
});
