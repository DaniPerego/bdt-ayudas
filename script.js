// Variables globales
let youtubePlayer = null;
let isYouTubeAPIReady = false;
let tabataInterval;
let tabataTime = 0;
let tabataRound = 0;
let tabataPhase = 'prepare';
let isTabataRunning = false;
let isSoundEnabled = true;

// Funcionalidad del menú desplegable
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('_toggle');
    const items = document.getElementById('_items');

    if (toggle && items) {
        toggle.addEventListener('click', () => {
            items.classList.toggle('open');
            toggle.classList.toggle('close');
        });
    }

    // Referencias a elementos del DOM para el cronómetro y tabata
    const stopwatchDisplay = document.getElementById('stopwatch');
    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const timerModeInputs = document.querySelectorAll('input[name="timer-mode"]');
    const soundToggle = document.getElementById('sound-toggle');
    const tabataStartButton = document.getElementById('tabata-start');
    const tabataResetButton = document.getElementById('tabata-reset');
    const tabataTimeElement = document.getElementById('tabata-time');
    const tabataRoundElement = document.getElementById('tabata-round');
    const tabataPhaseElement = document.getElementById('tabata-phase');
    const timerTabs = document.querySelectorAll('.timer-tab');
    const timerSections = document.querySelectorAll('.timer-section');

    // ----------- CRONÓMETRO MEJORADO -----------
    let stopwatchInterval = null;
    let isRunning = false;
    let isCountingUp = true;
    let startTime = 0;
    let elapsed = 0;

    function createBeep(frequency, volume, duration) {
        if (!isSoundEnabled) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
        }, duration * 1000);
    }

    // --- Fetch ejercicios ---
    fetch('videos-list.json')
        .then(res => {
            if (!res.ok) throw new Error('No se pudo cargar videos-list.json');
            return res.json();
        })
        .then(data => {
            videos = data;
            cargarEjercicios();
        })
        .catch(err => {
            const lista = document.getElementById('lista-ejercicios');
            if (lista) {
                lista.innerHTML = `<div style="color:var(--color-rojo);text-align:center;padding:2rem;">No se pudo cargar la lista de ejercicios.<br><small>${err.message}</small></div>`;
            }
            console.error('Error al cargar ejercicios:', err);
        });

    // --- CLAVE: Reemplazar nodos de sección por clones para limpiar listeners previos ---
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(seccion => {
        seccion.replaceWith(seccion.cloneNode(true));
    });
    const seccionesActualizadas = document.querySelectorAll('.seccion');
    seccionesActualizadas.forEach(seccion => {
        seccion.addEventListener('dragover', e => {
            e.preventDefault();
            seccion.classList.add('over');
        });
        seccion.addEventListener('dragleave', e => {
            seccion.classList.remove('over');
        });
            let dropActivo = false;
            seccion.addEventListener('drop', e => {
                if (dropActivo) return;
                dropActivo = true;
                setTimeout(() => { dropActivo = false; }, 100);
                e.preventDefault();
                seccion.classList.remove('over');
                // Lógica para agregar el ejercicio arrastrado
                const nombre = e.dataTransfer.getData('nombre');
                const videoUrl = e.dataTransfer.getData('video');
                if (!nombre || !videoUrl) return;
                const wrapper = document.createElement('div');
                wrapper.className = 'ejercicio-seleccionado';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '10px';
                wrapper.draggable = true;
                wrapper.id = 'ej-' + Math.random().toString(36).substr(2, 9);

                const nombreSpan = document.createElement('span');
                nombreSpan.className = 'ejercicio';
                nombreSpan.textContent = nombre;

                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1';
                input.value = '10';
                input.style.width = '60px';
                input.style.marginLeft = '8px';
                input.title = 'Cantidad de repeticiones';

                const iframe = document.createElement('iframe');
                iframe.width = '200';
                    // ...existing code...

    function stopStopwatch() {
        if (!isRunning) return;
        isRunning = false;
        if (startButton) startButton.textContent = 'Iniciar';
        clearInterval(stopwatchInterval);
    }

    function resetStopwatch() {
        stopStopwatch();
        elapsed = 0;
        if (isCountingUp) {
            updateStopwatchDisplay(0);
        } else {
            updateStopwatchDisplay(getSelectedTimeMs());
        }
    }

    // Event listeners para el cronómetro
    if (startButton) {
        startButton.addEventListener('click', function() {
            if (isRunning) {
                stopStopwatch();
            } else {
                startStopwatch();
            }
        });
    }
    if (resetButton) {
        resetButton.addEventListener('click', resetStopwatch);
    }
    timerModeInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            isCountingUp = e.target.value === 'up';
            resetStopwatch();
        });
    });
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        if (input) input.addEventListener('change', resetStopwatch);
    });

    // Inicializa el cronómetro en modo ascendente en 00:00:00.000
    resetStopwatch();

    // ----------- TABATA -----------
    function playCountdownBeep(time) {
        if (!isSoundEnabled) return;
        if (time <= 3 && time > 0) {
            createBeep(440, 0.1, 0.1);
        }
    }
    function playPhaseStartSound(phase) {
        if (!isSoundEnabled) return;
        if (phase === 'work') {
            createBeep(660, 0.2, 0.15);
        } else if (phase === 'rest') {
            createBeep(440, 0.2, 0.15);
        }
    }
    function updateTabataDisplay() {
        if (!tabataTimeElement || !tabataRoundElement) return;
        const minutes = Math.floor(tabataTime / 60);
        const seconds = tabataTime % 60;
        tabataTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        tabataRoundElement.textContent = `Ronda: ${tabataRound}/8`;
    }
    function startTabata() {
        if (!isTabataRunning) {
            isTabataRunning = true;
            if (tabataStartButton) tabataStartButton.textContent = 'Pausar';
            tabataTime = 10; // Tiempo de preparación
            tabataRound = 0;
            tabataPhase = 'prepare';

            updateTabataDisplay();
            if (tabataPhaseElement) {
                tabataPhaseElement.className = 'tabata-phase prepare';
                tabataPhaseElement.textContent = 'Preparados';
            }

            playStartSound();

            tabataInterval = setInterval(() => {
                if (tabataTime > 0) {
                    playCountdownBeep(tabataTime);
                    tabataTime--;
                    updateTabataDisplay();
                }

                if (tabataTime === 0) {
                    playEndSound();

                    switch (tabataPhase) {
                        case 'prepare':
                            tabataPhase = 'work';
                            tabataTime = 20;
                            tabataRound++;
                            if (tabataPhaseElement) {
                                tabataPhaseElement.className = 'tabata-phase work';
                                tabataPhaseElement.textContent = '¡Trabajo!';
                            }
                            playPhaseStartSound('work');
                            break;

                        case 'work':
                            if (tabataRound >= 8) {
                                stopTabata();
                                return;
                            }
                            tabataPhase = 'rest';
                            tabataTime = 10;
                            if (tabataPhaseElement) {
                                tabataPhaseElement.className = 'tabata-phase rest';
                                tabataPhaseElement.textContent = 'Descanso';
                            }
                            playPhaseStartSound('rest');
                            break;

                        case 'rest':
                            tabataPhase = 'work';
                            tabataTime = 20;
                            tabataRound++;
                            if (tabataPhaseElement) {
                                tabataPhaseElement.className = 'tabata-phase work';
                                tabataPhaseElement.textContent = '¡Trabajo!';
                            }
                            playPhaseStartSound('work');
                            break;
                    }
                    updateTabataDisplay();
                }
            }, 1000);
        } else {
            stopTabata();
        }
    }
    function stopTabata() {
        clearInterval(tabataInterval);
        isTabataRunning = false;
        if (tabataStartButton) tabataStartButton.textContent = 'Iniciar';
    }
    function resetTabata() {
        stopTabata();
        tabataTime = 0;
        tabataRound = 0;
        tabataPhase = 'prepare';
        updateTabataDisplay();
        if (tabataPhaseElement) {
            tabataPhaseElement.className = 'tabata-phase';
            tabataPhaseElement.textContent = 'Preparados';
        }
    }
    if (tabataStartButton) {
        tabataStartButton.addEventListener('click', startTabata);
    }
    if (tabataResetButton) {
        tabataResetButton.addEventListener('click', resetTabata);
    }

    // ----------- YOUTUBE EMBED -----------
    function createYouTubeEmbed(videoId) {
        const youtubePlayer = document.getElementById('youtube-player');
        if (!videoId || !youtubePlayer) return;
        youtubePlayer.innerHTML = `
            <iframe 
                width="100%" 
                height="80" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    }
    const playlistSelector = document.getElementById('playlist-selector');
    if (playlistSelector) {
        playlistSelector.addEventListener('change', (e) => {
            createYouTubeEmbed(e.target.value);
        });
    }

    // ----------- SONIDO -----------
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            soundToggle.querySelector('i').className = isSoundEnabled ? 'bi bi-volume-up-fill' : 'bi bi-volume-mute-fill';
        });
    }

    // ----------- CAMBIO DE PESTAÑAS -----------
    timerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            timerTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const timerType = tab.getAttribute('data-timer');
            timerSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${timerType}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });

    // ----------- CALCULADORA DE RM -----------
    const calculateButton = document.getElementById('calculate');
    const exerciseSelect = document.getElementById('exercise');
    const weightInput = document.getElementById('weight');
    const resultElement = document.getElementById('result');

    if (calculateButton && exerciseSelect && weightInput && resultElement) {
        calculateButton.addEventListener('click', function() {
            const weight = parseFloat(weightInput.value);
            const selectedExercise = exerciseSelect.value;

            if (isNaN(weight) || weight <= 0) {
                resultElement.innerHTML = '<div style="text-align:center;">Por favor, introduce un peso válido.</div>';
                return;
            }

            if (!selectedExercise) {
                resultElement.innerHTML = '<div style="text-align:center;">Por favor, selecciona un ejercicio.</div>';
                return;
            }

            let percentages = '';
            let percentage = 95;
            while (percentage >= 30) {
                percentages += `<div style="text-align:center;">${percentage}%: ${(weight * (percentage / 100)).toFixed(2)} kg</div>`;
                percentage -= 5;
            }

            resultElement.innerHTML = percentages;
        });
    }

    // ----------- INICIALIZACIONES -----------
    updateTabataDisplay();

    // ----------- EMOM -----------
    let emomInterval = null;
    let isEmomRunning = false;
    let emomTotalRounds = 0;
    let emomCurrentRound = 0;
    let emomTimePerRound = 0;
    let emomTimeLeft = 0;

    const emomMinutesInput = document.getElementById('emom-minutes');
    const emomSecondsInput = document.getElementById('emom-seconds');
    const emomTimeDisplay = document.getElementById('emom-time');
        // --- Listeners de drop en secciones SOLO UNA VEZ ---
        // Listeners de drop en secciones SOLO UNA VEZ y nunca se duplican
        const secciones = document.querySelectorAll('.seccion');
        secciones.forEach(seccion => {
            if (!seccion.dataset.dropListener) {
                seccion.addEventListener('dragover', e => {
                    e.preventDefault();
                    seccion.classList.add('over');
                });
                seccion.addEventListener('dragleave', e => {
                    seccion.classList.remove('over');
                });
                seccion.addEventListener('drop', e => {
                    e.preventDefault();
                    seccion.classList.remove('over');
                    // Evitar duplicados: solo agregar si no existe ya el ejercicio en la sección
                    const nombre = e.dataTransfer.getData('nombre');
                    const videoUrl = e.dataTransfer.getData('video');
                    if (!nombre || !videoUrl) return;
                    const yaExiste = Array.from(seccion.querySelectorAll('.ejercicio-seleccionado .ejercicio')).some(span => span.textContent === nombre);
                    if (yaExiste) return;
                    // Solo una declaración de 'wrapper'
                    let wrapper = document.createElement('div');
                    wrapper.className = 'ejercicio-seleccionado';
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.gap = '10px';
                    wrapper.draggable = true;
                    wrapper.id = 'ej-' + Math.random().toString(36).substr(2, 9);

                    const nombreSpan = document.createElement('span');
                    nombreSpan.className = 'ejercicio';
                    nombreSpan.textContent = nombre;

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '1';
                    input.value = '10';
                    input.style.width = '60px';
                    input.style.marginLeft = '8px';
                    input.title = 'Cantidad de repeticiones';

                    const iframe = document.createElement('iframe');
                    iframe.width = '200';
                    iframe.height = '120';
                    iframe.src = videoUrl; // SIEMPRE video.url
                    iframe.frameBorder = '0';
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                    iframe.setAttribute('allowfullscreen', '');

                    const btnEliminar = document.createElement('button');
                    btnEliminar.textContent = '✖';
                    btnEliminar.title = 'Eliminar ejercicio';
                    btnEliminar.style.marginLeft = '8px';
                    btnEliminar.style.background = 'transparent';
                    btnEliminar.style.color = 'var(--color-rojo)';
                    btnEliminar.style.border = 'none';
                    btnEliminar.style.fontSize = '1.2rem';
                    btnEliminar.style.cursor = 'pointer';
                    btnEliminar.onclick = () => { wrapper.remove(); };

                    wrapper.appendChild(nombreSpan);
                    wrapper.appendChild(input);
                    wrapper.appendChild(iframe);
                    wrapper.appendChild(btnEliminar);
                    seccion.appendChild(wrapper);
                });
                seccion.dataset.dropListener = 'true';
            }
        });
                const yaExiste = Array.from(seccion.querySelectorAll('.ejercicio-seleccionado .ejercicio')).some(span => span.textContent === nombre);
                if (yaExiste) return;
                const wrapper = document.createElement('div');
                wrapper.className = 'ejercicio-seleccionado';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '10px';
                wrapper.draggable = true;
                wrapper.id = 'ej-' + Math.random().toString(36).substr(2, 9);

                const nombreSpan = document.createElement('span');
                nombreSpan.className = 'ejercicio';
                nombreSpan.textContent = nombre;

                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1';
                input.value = '10';
                input.style.width = '60px';
                input.style.marginLeft = '8px';
                input.title = 'Cantidad de repeticiones';

                const iframe = document.createElement('iframe');
                iframe.width = '200';
                iframe.height = '120';
                iframe.src = videoUrl; // SIEMPRE video.url
                iframe.frameBorder = '0';
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');

                const btnEliminar = document.createElement('button');
                btnEliminar.textContent = '✖';
                btnEliminar.title = 'Eliminar ejercicio';
                btnEliminar.style.marginLeft = '8px';
                btnEliminar.style.background = 'transparent';
                btnEliminar.style.color = 'var(--color-rojo)';
                btnEliminar.style.border = 'none';
                btnEliminar.style.fontSize = '1.2rem';
                btnEliminar.style.cursor = 'pointer';
                btnEliminar.onclick = () => { wrapper.remove(); };

                wrapper.appendChild(nombreSpan);
                wrapper.appendChild(input);
                wrapper.appendChild(iframe);
                wrapper.appendChild(btnEliminar);
                seccion.appendChild(wrapper);
            });
        });
    function resetEmom() {
        stopEmom();
        emomCurrentRound = 0;
        emomTimeLeft = 0;
        updateEmomDisplay();
    }

    if (emomStartButton) {
        emomStartButton.addEventListener('click', function() {
            if (isEmomRunning) {
                stopEmom();
            } else {
                startEmom();
            }
        });
    }
    if (emomResetButton) {
        emomResetButton.addEventListener('click', resetEmom);
    }

    // ----------- AMRAP -----------
    let amrapInterval = null;
    let isAmrapRunning = false;
    let amrapTimeLeft = 0;

    const amrapMinutesInput = document.getElementById('amrap-minutes');
    const amrapTimeDisplay = document.getElementById('amrap-time');
    const amrapStartButton = document.getElementById('amrap-start');
    const amrapResetButton = document.getElementById('amrap-reset');

    function updateAmrapDisplay() {
        if (amrapTimeDisplay) amrapTimeDisplay.textContent = formatMMSS(amrapTimeLeft);
    }

    function startAmrap() {
        if (isAmrapRunning) return;
        isAmrapRunning = true;
        if (amrapStartButton) amrapStartButton.textContent = 'Pausar';

        const totalMinutes = parseInt(amrapMinutesInput.value) || 1;
        amrapTimeLeft = totalMinutes * 60;

        updateAmrapDisplay();
        playStartSound();

        amrapInterval = setInterval(() => {
            amrapTimeLeft--;
            updateAmrapDisplay();

            if (amrapTimeLeft === 0) {
                playEndSound();
                stopAmrap();
            }
        }, 1000);
    }

    function stopAmrap() {
        clearInterval(amrapInterval);
        isAmrapRunning = false;
        if (amrapStartButton) amrapStartButton.textContent = 'Iniciar';
    }

    function resetAmrap() {
        stopAmrap();
        amrapTimeLeft = 0;
        updateAmrapDisplay();
    }

    if (amrapStartButton) {
        amrapStartButton.addEventListener('click', function() {
            if (isAmrapRunning) {
                stopAmrap();
            } else {
                startAmrap();
            }
        });
    }
    if (amrapResetButton) {
        amrapResetButton.addEventListener('click', resetAmrap);
    }

    // ----------- CREACIÓN DE SELECTORES DE TIEMPO -----------
    function createTimePicker(containerId, opts = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Opciones por defecto
        const {
            showHours = true,
            showMinutes = true,
            showSeconds = true,
            hoursId = 'hours',
            minutesId = 'minutes',
            secondsId = 'seconds'
        } = opts;

        let html = '';

        if (showHours) {
            html += `<select id="${hoursId}" class="time-field">`;
            for (let i = 0; i < 24; i++) {
                html += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
            }
            html += `</select> : `;
        }
        if (showMinutes) {
            html += `<select id="${minutesId}" class="time-field">`;
            for (let i = 0; i < 60; i++) {
                html += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
            }
            html += `</select> : `;
        }
        if (showSeconds) {
            html += `<select id="${secondsId}" class="time-field">`;
            for (let i = 0; i < 60; i++) {
                html += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
            }
            html += `</select>`;
        }

        container.innerHTML = html.replace(/: $/, ''); // Quita el último ": " si no hay segundos
    }

    // Ejemplo de uso para el cronómetro principal:
    createTimePicker('for-time-picker', {
        hoursId: 'hours',
        minutesId: 'minutes',
        secondsId: 'seconds'
    });

    // Para EMOM (solo minutos y segundos, por ejemplo)
    createTimePicker('emom-time-picker', {
        showHours: false,
        showMinutes: true,
        showSeconds: true,
        minutesId: 'emom-minutes',
        secondsId: 'emom-seconds'
    });

    // Para AMRAP (solo minutos)
    createTimePicker('amrap-time-picker', {
        showHours: false,
        showMinutes: true,
        showSeconds: false,
        minutesId: 'amrap-minutes'
    });

    // ----------- BUSCADOR DE EJERCICIOS -----------
    // Para ejercicios (ajusta el selector según tu estructura)
    // --- Lógica para cargar y filtrar ejercicios con drag & drop ---
    let videos = [];
    fetch('videos-list.json')
        .then(res => res.json())
        .then(data => {
            videos = data;
            cargarEjercicios();
            activarDragDrop();
        });

    function cargarEjercicios(filtro = '') {
        const lista = document.getElementById('lista-ejercicios');
        if (!lista) return;
        lista.innerHTML = '';
        videos.forEach(video => {
            const nombreCorto = video.nombre.split(' - ')[0].trim();
            if (nombreCorto.toLowerCase().includes(filtro.toLowerCase())) {
                const div = document.createElement('div');
                div.className = 'ejercicio';
                div.draggable = true;
                div.textContent = nombreCorto;
                div.dataset.video = video.url;
                div.dataset.nombre = video.nombre;
                lista.appendChild(div);
            }
        });
        activarDragDrop();
    }

    function activarDragDrop() {
        const listaEjercicios = document.getElementById('lista-ejercicios');
        if (!listaEjercicios) return;
        // Elimina el listener anterior si existe
        if (listaEjercicios._dragListenerRef) {
            listaEjercicios.removeEventListener('dragstart', listaEjercicios._dragListenerRef);
        }
        // Define y agrega el nuevo listener
        listaEjercicios._dragListenerRef = function(e) {
            if (e.target.classList.contains('ejercicio')) {
                e.dataTransfer.setData('nombre', e.target.dataset.nombre);
                e.dataTransfer.setData('video', e.target.dataset.video);
            }
        };
        listaEjercicios.addEventListener('dragstart', listaEjercicios._dragListenerRef);
    }

    const buscadorEjercicios = document.getElementById('buscador-ejercicios');
    if (buscadorEjercicios) {
        buscadorEjercicios.addEventListener('input', function(e) {
            cargarEjercicios(e.target.value);
        });
    }

    // ----------- BUSCADOR DE DICCIONARIO -----------
    // Para diccionario
    const buscadorDiccionario = document.getElementById('buscador-diccionario');
    if (buscadorDiccionario) {
        buscadorDiccionario.addEventListener('input', function() {
            const filtro = this.value.toLowerCase();
            document.querySelectorAll('.diccionario-item').forEach(item => {
                const texto = item.textContent.toLowerCase();
                item.style.display = texto.includes(filtro) ? '' : 'none';
            });
        });
    }

    // ----------- CARRUSEL -----------
    const slides = document.querySelectorAll('.carrusel-slide');
    const prevBtn = document.getElementById('carrusel-prev');
    const nextBtn = document.getElementById('carrusel-next');
    let current = 0;

    function showSlide(idx) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === idx);
        });
    }

    function nextSlide() {
        current = (current + 1) % slides.length;
        showSlide(current);
    }

    function prevSlide() {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
    }

    // Auto-carrusel cada 6 segundos
    setInterval(nextSlide, 6000);

    const banners = document.querySelectorAll('.carrusel-banner');
    banners.forEach(function(banner) {
        const slides = banner.querySelectorAll('.carrusel-slide');
        const prevBtn = banner.querySelector('.carrusel-btn.prev');
        const nextBtn = banner.querySelector('.carrusel-btn.next');
        let current = 0;

        function showSlide(idx) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === idx);
            });
        }

        function nextSlide() {
            current = (current + 1) % slides.length;
            showSlide(current);
        }

        function prevSlide() {
            current = (current - 1 + slides.length) % slides.length;
            showSlide(current);
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', nextSlide);
            prevBtn.addEventListener('click', prevSlide);
        }

        // Auto-carrusel cada 2 segundos
        setInterval(nextSlide, 2000);
    });

// Reloj en tiempo real
function updateClock() {
    const clock = document.getElementById('clock');
    if (!clock) return;
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    clock.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// Reloj para el chat (esquina superior derecha)
function updateChatClock() {
    const el = document.getElementById('chat-clock');
    if (!el) return;
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
}
setInterval(updateChatClock, 1000);
updateChatClock();