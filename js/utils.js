// 🛠️ Utilidades compartidas para parseo de CSV y manejo de ejercicios

/**
 * Parser CSV robusto que maneja comillas, saltos de línea y valores con comas
 */
function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                value += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            row.push(value);
            value = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && next === '\n') {
                i++;
            }
            row.push(value);
            value = '';
            if (row.length > 1 || row[0] !== '') {
                rows.push(row);
            }
            row = [];
            continue;
        }

        value += char;
    }

    if (value.length || row.length) {
        row.push(value);
        rows.push(row);
    }

    if (!rows.length) return [];

    const headers = rows[0].map(header => header.trim());
    return rows.slice(1).map(values => {
        const record = {};
        headers.forEach((header, index) => {
            record[header] = values[index] ? values[index].trim() : '';
        });
        return record;
    });
}

/**
 * Recolecta campos indexados del CSV (ej: instructions/0, instructions/1, etc.)
 */
function collectIndexedFields(record, prefix) {
    return Object.keys(record)
        .filter(key => key.startsWith(prefix) && record[key])
        .sort((a, b) => {
            const aNum = Number(a.slice(prefix.length));
            const bNum = Number(b.slice(prefix.length));
            return aNum - bNum;
        })
        .map(key => record[key]);
}

/**
 * Maneja el error al cargar imagen/GIF y muestra un fallback visual
 */
function handleImageError(imgElement, exerciseName) {
    console.warn(`⚠️ GIF no disponible para: ${exerciseName}`);
    
    const fallbackHTML = `
        <div class="gif-fallback">
            <div class="fallback-icon">🏋️</div>
            <div class="fallback-text">GIF no disponible</div>
            <div class="fallback-name">${exerciseName ? exerciseName.substring(0, 30) : 'Ejercicio'}</div>
        </div>
    `;
    
    if (imgElement && imgElement.parentElement) {
        imgElement.parentElement.innerHTML = fallbackHTML;
    }
}

/**
 * Sistema de caché con versionado para ejercicios
 */
const CacheManager = {
    get(key, version) {
        const cache = localStorage.getItem(key);
        if (!cache) return null;
        
        try {
            const data = JSON.parse(cache);
            const now = new Date().getTime();
            const oneDay = 24 * 60 * 60 * 1000;
            
            // Verificar versión del dataset
            if (!data.version || data.version !== version) {
                console.log(`⚠️ Caché obsoleto (versión diferente). Versión actual: ${version}`);
                localStorage.removeItem(key);
                return null;
            }
            
            // Verificar expiración (24 horas)
            if (now - data.timestamp < oneDay) {
                console.log(`✅ Usando caché (${data.data.length} items, v${version})`);
                return data.data;
            }
            
            console.log('⏰ Caché expirado (>24h)');
            return null;
        } catch (error) {
            console.error('❌ Error al leer caché:', error);
            localStorage.removeItem(key);
            return null;
        }
    },
    
    set(key, data, version) {
        const cacheData = {
            data: data,
            timestamp: new Date().getTime(),
            version: version
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
        console.log(`💾 Caché guardado (${data.length} items, v${version})`);
    },
    
    clear(key) {
        localStorage.removeItem(key);
        console.log(`🗑️ Caché limpiado: ${key}`);
    }
};

// Agregar estilos CSS para el fallback si no existen
if (!document.getElementById('gif-fallback-styles')) {
    const style = document.createElement('style');
    style.id = 'gif-fallback-styles';
    style.textContent = `
        .gif-fallback {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
            border-radius: 8px;
            height: 100%;
            min-height: 200px;
            text-align: center;
        }
        
        .fallback-icon {
            font-size: 64px;
            margin-bottom: 12px;
            opacity: 0.7;
        }
        
        .fallback-text {
            font-size: 14px;
            font-weight: 600;
            color: #666;
            margin-bottom: 8px;
        }
        
        .fallback-name {
            font-size: 12px;
            color: #999;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ Utilidades cargadas (parseCsv, collectIndexedFields, handleImageError, CacheManager)');
