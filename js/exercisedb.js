// Exercise GIFs Integration - Dataset con GIFs desde GitHub
const EXERCISEDB_CSV_URL = 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/exercises.csv';
const EXERCISEDB_GIF_BASE = 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/';
const EXERCISEDB_CACHE_KEY = 'exercisedb-cache';
const EXERCISEDB_VERSION = 'v1.0-gifs';

let allExercises = [];
let filteredExercises = [];

function normalizeExercises(records) {
    return records.map(record => {
        const instructions = collectIndexedFields(record, 'instructions/');
        const secondaryMuscles = collectIndexedFields(record, 'secondaryMuscles/');
        const target = record.target || '';

        return {
            id: record.id,
            name: record.name,
            bodyPart: record.bodyPart,
            equipment: record.equipment,
            level: record.level || '',
            primaryMuscles: target ? [target] : [],
            secondaryMuscles,
            instructions,
            gifUrl: record.id ? `${EXERCISEDB_GIF_BASE}${record.id}.gif` : null
        };
    });
}

// Cargar ejercicios desde Exercise GIFs
async function loadExercises() {
    // Intentar usar caché primero
    const cachedExercises = CacheManager.get(EXERCISEDB_CACHE_KEY, EXERCISEDB_VERSION);
    if (cachedExercises) {
        allExercises = cachedExercises;
        filteredExercises = allExercises;
        displayExercises(filteredExercises);
        return;
    }

    try {
        const response = await fetch(EXERCISEDB_CSV_URL);
        if (!response.ok) throw new Error('Error al cargar ejercicios');
        
        const csvText = await response.text();
        const records = parseCsv(csvText);
        allExercises = normalizeExercises(records);
        filteredExercises = allExercises;
        
        // Guardar en caché
        CacheManager.set(EXERCISEDB_CACHE_KEY, allExercises, EXERCISEDB_VERSION);
        
        console.log(`✅ ${allExercises.length} ejercicios cargados desde Exercise GIFs`);
        displayExercises(filteredExercises);
    } catch (error) {
        console.error('Error cargando ejercicios:', error);
        document.getElementById('videos_ejercicios').innerHTML = 
            '<p class="error">Error al cargar la base de datos de ejercicios. Intenta recargar la página.</p>';
    }
}

// Mostrar ejercicios en la página
function displayExercises(exercises) {
    const container = document.getElementById('videos_ejercicios');
    
    if (exercises.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron ejercicios con ese criterio.</p>';
        return;
    }
    
    container.innerHTML = exercises.map(exercise => {
        const imageUrl = exercise.gifUrl 
            ? exercise.gifUrl
            : 'img/placeholder-exercise.jpg';
        
        const primaryMuscles = exercise.primaryMuscles ? exercise.primaryMuscles.join(', ') : 'N/A';
        const equipment = exercise.equipment || 'N/A';
        const level = exercise.level || 'N/A';
        
        return `
            <div class="exercise-card">
                <div class="exercise-image">
                    <img src="${imageUrl}" 
                         alt="${exercise.name}" 
                         loading="lazy"
                         onerror="handleImageError(this, '${exercise.name}')">
                    ${exercise.level ? `<span class="badge badge-${exercise.level}">${exercise.level}</span>` : ''}
                </div>
                <div class="exercise-info">
                    <h3>${exercise.name}</h3>
                    <div class="exercise-details">
                        <p><strong>Músculos:</strong> ${primaryMuscles}</p>
                        <p><strong>Equipo:</strong> ${equipment}</p>
                        <p><strong>Nivel:</strong> ${level}</p>
                    </div>
                    ${exercise.instructions ? `
                        <details class="exercise-instructions">
                            <summary>Ver instrucciones</summary>
                            <ol>
                                ${exercise.instructions.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </details>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Buscar ejercicios
function searchExercises(query) {
    if (!query || query.length < 2) {
        filteredExercises = allExercises;
    } else {
        const searchTerm = query.toLowerCase();
        filteredExercises = allExercises.filter(exercise => {
            return exercise.name.toLowerCase().includes(searchTerm) ||
                   (exercise.primaryMuscles && exercise.primaryMuscles.some(m => m.toLowerCase().includes(searchTerm))) ||
                   (exercise.equipment && exercise.equipment.toLowerCase().includes(searchTerm));
        });
    }
    displayExercises(filteredExercises);
}

// Filtrar por categoría
function filterByCategory(category, value) {
    if (!value || value === 'todos') {
        filteredExercises = allExercises;
    } else {
        filteredExercises = allExercises.filter(exercise => {
            if (category === 'level') return exercise.level === value;
            if (category === 'equipment') return exercise.equipment === value;
            if (category === 'muscle') return exercise.primaryMuscles && exercise.primaryMuscles.includes(value);
            return true;
        });
    }
    displayExercises(filteredExercises);
}

// Inicializar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    loadExercises();
    
    // Configurar buscador
    const searchInput = document.getElementById('buscador-ejercicios');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchExercises(e.target.value);
        });
    }
});
