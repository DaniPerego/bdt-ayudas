/// Variables globales
let youtubePlayer = null;
let isYouTubeAPIReady = false;
let tabataInterval;
let tabataTime = 0;
let tabataRound = 0;
let tabataPhase = 'prepare';
let isTabataRunning = false;
let isSoundEnabled = true;
let videos = [];

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

    // --- Funciones de utilidad compartidas ---
    function formatMMSS(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function playStartSound() {
        if (!isSoundEnabled) return;
        createBeep(880, 0.3, 0.2);
    }

    function playEndSound() {
        if (!isSoundEnabled) return;
        createBeep(440, 0.3, 0.3);
        setTimeout(() => createBeep(440, 0.3, 0.3), 400);
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
                const nombre = e.dataTransfer.getData('nombre');
                const videoUrl = e.dataTransfer.getData('video');
                if (!nombre || !videoUrl) return;
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
                iframe.src = videoUrl;
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
    const emomRoundDisplay = document.getElementById('emom-round');
    const emomStartButton = document.getElementById('emom-start');
    const emomResetButton = document.getElementById('emom-reset');

    function updateEmomDisplay() {
        if (emomTimeDisplay) emomTimeDisplay.textContent = formatMMSS(emomTimeLeft);
        if (emomRoundDisplay) emomRoundDisplay.textContent = `Ronda: ${emomCurrentRound}`;
    }

    function startEmom() {
        if (isEmomRunning) return;
        isEmomRunning = true;
        if (emomStartButton) emomStartButton.textContent = 'Pausar';

        const minutes = parseInt(emomMinutesInput.value) || 10;
        const seconds = parseInt(emomSecondsInput.value) || 0;
        emomTimePerRound = minutes * 60 + seconds;
        emomTotalRounds = minutes; // Approximate rounds
        emomCurrentRound = 1;
        emomTimeLeft = emomTimePerRound;

        updateEmomDisplay();
        playStartSound();

        emomInterval = setInterval(() => {
            emomTimeLeft--;
            updateEmomDisplay();

            if (emomTimeLeft === 0) {
                playEndSound();
                emomCurrentRound++;
                emomTimeLeft = emomTimePerRound;
                updateEmomDisplay();
            }
        }, 1000);
    }

    function stopEmom() {
        clearInterval(emomInterval);
        isEmomRunning = false;
        if (emomStartButton) emomStartButton.textContent = 'Iniciar';
    }

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

    // ----------- DETENER TODOS LOS TIMERS -----------
    const allTimerStops = [stopStopwatch, stopTabata, stopAmrap, stopEmom];
    function stopAllTimers() {
        allTimerStops.forEach(fn => fn());
    }

    // ----------- INTERVALOS PERSONALIZADOS -----------
    let intervalTimer = null;
    let isIntervalRunning = false;
    let intervalTimeLeft = 0;
    let intervalCurrentRound = 0;
    let intervalPhase = 'work';

    const intervalWorkInput = document.getElementById('interval-work');
    const intervalRestInput = document.getElementById('interval-rest');
    const intervalRoundsInput = document.getElementById('interval-rounds');
    const intervalTimeDisplay = document.getElementById('interval-time');
    const intervalRoundDisplay = document.getElementById('interval-round');
    const intervalPhaseDisplay = document.getElementById('interval-phase');
    const intervalStartBtn = document.getElementById('interval-start');
    const intervalResetBtn = document.getElementById('interval-reset');

    function updateIntervalDisplay() {
        if (intervalTimeDisplay) intervalTimeDisplay.textContent = formatMMSS(intervalTimeLeft);
        const total = parseInt(intervalRoundsInput.value) || 8;
        if (intervalRoundDisplay) intervalRoundDisplay.textContent = `Ronda: ${intervalCurrentRound}/${total}`;
        if (intervalPhaseDisplay) {
            if (intervalCurrentRound === 0) {
                intervalPhaseDisplay.textContent = 'Preparados';
                intervalPhaseDisplay.className = 'tabata-phase';
            } else {
                intervalPhaseDisplay.textContent = intervalPhase === 'work' ? '¡Trabajo!' : 'Descanso';
                intervalPhaseDisplay.className = 'tabata-phase ' + intervalPhase;
            }
        }
    }

    function startIntervalTimer() {
        if (isIntervalRunning) { stopIntervalTimer(); return; }
        stopAllTimers();
        isIntervalRunning = true;
        intervalStartBtn.textContent = 'Pausar';

        const workTime = parseInt(intervalWorkInput.value) || 30;
        const restTime = parseInt(intervalRestInput.value) || 10;
        const totalRounds = parseInt(intervalRoundsInput.value) || 8;

        intervalCurrentRound = 1;
        intervalPhase = 'work';
        intervalTimeLeft = workTime;

        updateIntervalDisplay();
        playStartSound();

        intervalTimer = setInterval(() => {
            if (intervalTimeLeft > 0) {
                playCountdownBeep(intervalTimeLeft);
                intervalTimeLeft--;
                updateIntervalDisplay();
            }
            if (intervalTimeLeft === 0) {
                playEndSound();
                if (intervalPhase === 'work') {
                    if (intervalCurrentRound >= totalRounds) { stopIntervalTimer(); return; }
                    if (restTime > 0) {
                        intervalPhase = 'rest';
                        intervalTimeLeft = restTime;
                        playPhaseStartSound('rest');
                    } else {
                        intervalCurrentRound++;
                        intervalPhase = 'work';
                        intervalTimeLeft = workTime;
                        playPhaseStartSound('work');
                    }
                } else {
                    if (intervalCurrentRound >= totalRounds) { stopIntervalTimer(); return; }
                    intervalCurrentRound++;
                    intervalPhase = 'work';
                    intervalTimeLeft = workTime;
                    playPhaseStartSound('work');
                }
                updateIntervalDisplay();
            }
        }, 1000);
    }

    function stopIntervalTimer() {
        clearInterval(intervalTimer);
        isIntervalRunning = false;
        if (intervalStartBtn) intervalStartBtn.textContent = 'Iniciar';
    }

    function resetIntervalTimer() {
        stopIntervalTimer();
        intervalTimeLeft = 0;
        intervalCurrentRound = 0;
        intervalPhase = 'work';
        updateIntervalDisplay();
    }

    allTimerStops.push(stopIntervalTimer);
    if (intervalStartBtn) intervalStartBtn.addEventListener('click', startIntervalTimer);
    if (intervalResetBtn) intervalResetBtn.addEventListener('click', resetIntervalTimer);

    // ----------- DESCANSO PROGRAMADO -----------
    let restTimerInterval = null;
    let isRestTimerRunning = false;
    let restTimerTimeLeft = 0;

    const restTimerTimeDisplay = document.getElementById('rest-time');
    const restTimerPhaseDisplay = document.getElementById('rest-phase');
    const restTimerStartBtn = document.getElementById('rest-start');
    const restTimerResetBtn = document.getElementById('rest-reset');

    function updateRestTimerDisplay() {
        if (restTimerTimeDisplay) restTimerTimeDisplay.textContent = formatMMSS(restTimerTimeLeft);
    }

    function startRestTimer() {
        if (isRestTimerRunning) { stopRestTimer(); return; }
        stopAllTimers();
        isRestTimerRunning = true;
        restTimerStartBtn.textContent = 'Pausar';

        const min = parseInt(document.getElementById('rest-minutes').value) || 0;
        const sec = parseInt(document.getElementById('rest-seconds').value) || 0;
        restTimerTimeLeft = min * 60 + sec;

        if (restTimerTimeLeft <= 0) { stopRestTimer(); return; }

        updateRestTimerDisplay();
        if (restTimerPhaseDisplay) {
            restTimerPhaseDisplay.textContent = '¡Descanso!';
            restTimerPhaseDisplay.className = 'tabata-phase rest';
        }
        playStartSound();

        restTimerInterval = setInterval(() => {
            if (restTimerTimeLeft > 0) {
                playCountdownBeep(restTimerTimeLeft);
                restTimerTimeLeft--;
                updateRestTimerDisplay();
            }
            if (restTimerTimeLeft === 0) {
                playEndSound();
                stopRestTimer();
            }
        }, 1000);
    }

    function stopRestTimer() {
        clearInterval(restTimerInterval);
        isRestTimerRunning = false;
        if (restTimerStartBtn) restTimerStartBtn.textContent = 'Iniciar';
    }

    function resetRestTimer() {
        stopRestTimer();
        restTimerTimeLeft = 0;
        updateRestTimerDisplay();
        if (restTimerPhaseDisplay) {
            restTimerPhaseDisplay.textContent = 'Preparados';
            restTimerPhaseDisplay.className = 'tabata-phase';
        }
    }

    allTimerStops.push(stopRestTimer);
    if (restTimerStartBtn) restTimerStartBtn.addEventListener('click', startRestTimer);
    if (restTimerResetBtn) restTimerResetBtn.addEventListener('click', resetRestTimer);

    // ----------- TEMPO TRAINER -----------
    let tempoTimerInterval = null;
    let isTempoRunning = false;
    let tempoTimeLeft = 0;
    let tempoCurrentPhase = 0;
    let tempoCycleCount = 0;
    const tempoPhaseNames = ['Bajada', 'Pausa Baja', 'Subida', 'Pausa Alta'];

    const tempoPhase1Input = document.getElementById('tempo-phase1');
    const tempoPhase2Input = document.getElementById('tempo-phase2');
    const tempoPhase3Input = document.getElementById('tempo-phase3');
    const tempoPhase4Input = document.getElementById('tempo-phase4');
    const tempoTimeDisplay = document.getElementById('tempo-time');
    const tempoRoundDisplay = document.getElementById('tempo-round');
    const tempoPhaseDisplay = document.getElementById('tempo-phase');
    const tempoStartBtn = document.getElementById('tempo-start');
    const tempoResetBtn = document.getElementById('tempo-reset');

    function getTempoPhases() {
        return [
            parseInt(tempoPhase1Input.value) || 0,
            parseInt(tempoPhase2Input.value) || 0,
            parseInt(tempoPhase3Input.value) || 0,
            parseInt(tempoPhase4Input.value) || 0
        ];
    }

    function updateTempoDisplay() {
        if (tempoTimeDisplay) tempoTimeDisplay.textContent = formatMMSS(tempoTimeLeft);
        if (tempoRoundDisplay) tempoRoundDisplay.textContent = `Ciclo: ${tempoCycleCount}`;
        if (tempoPhaseDisplay) {
            if (!isTempoRunning && tempoCycleCount === 0) {
                tempoPhaseDisplay.textContent = 'Preparados';
                tempoPhaseDisplay.className = 'tabata-phase';
            } else {
                tempoPhaseDisplay.textContent = tempoPhaseNames[tempoCurrentPhase] || '';
                tempoPhaseDisplay.className = 'tabata-phase work';
            }
        }
    }

    function startTempoTimer() {
        if (isTempoRunning) { stopTempoTimer(); return; }
        stopAllTimers();
        isTempoRunning = true;
        tempoStartBtn.textContent = 'Pausar';

        const phases = getTempoPhases();
        tempoCycleCount = 1;
        tempoCurrentPhase = 0;
        while (tempoCurrentPhase < 4 && phases[tempoCurrentPhase] === 0) tempoCurrentPhase++;
        if (tempoCurrentPhase >= 4) { stopTempoTimer(); return; }
        tempoTimeLeft = phases[tempoCurrentPhase];

        updateTempoDisplay();
        playStartSound();

        tempoTimerInterval = setInterval(() => {
            if (tempoTimeLeft > 0) {
                playCountdownBeep(tempoTimeLeft);
                tempoTimeLeft--;
                updateTempoDisplay();
            }
            if (tempoTimeLeft === 0) {
                playEndSound();
                tempoCurrentPhase++;
                const p = getTempoPhases();
                while (tempoCurrentPhase < 4 && p[tempoCurrentPhase] === 0) tempoCurrentPhase++;
                if (tempoCurrentPhase >= 4) {
                    tempoCurrentPhase = 0;
                    tempoCycleCount++;
                    while (tempoCurrentPhase < 4 && p[tempoCurrentPhase] === 0) tempoCurrentPhase++;
                }
                if (tempoCurrentPhase < 4) tempoTimeLeft = p[tempoCurrentPhase];
                updateTempoDisplay();
            }
        }, 1000);
    }

    function stopTempoTimer() {
        clearInterval(tempoTimerInterval);
        isTempoRunning = false;
        if (tempoStartBtn) tempoStartBtn.textContent = 'Iniciar';
    }

    function resetTempoTimer() {
        stopTempoTimer();
        tempoTimeLeft = 0;
        tempoCurrentPhase = 0;
        tempoCycleCount = 0;
        updateTempoDisplay();
    }

    allTimerStops.push(stopTempoTimer);
    if (tempoStartBtn) tempoStartBtn.addEventListener('click', startTempoTimer);
    if (tempoResetBtn) tempoResetBtn.addEventListener('click', resetTempoTimer);

    // ----------- CUENTA REGRESIVA SIMPLE -----------
    let countdownTimerInterval = null;
    let isCountdownRunning = false;
    let countdownTimeLeft = 0;

    const countdownTimeDisplay = document.getElementById('countdown-time');
    const countdownStartBtn = document.getElementById('countdown-start');
    const countdownResetBtn = document.getElementById('countdown-reset');

    function updateCountdownDisplay() {
        if (countdownTimeDisplay) countdownTimeDisplay.textContent = formatMMSS(countdownTimeLeft);
    }

    function startCountdownTimer() {
        if (isCountdownRunning) { stopCountdownTimer(); return; }
        stopAllTimers();
        isCountdownRunning = true;
        countdownStartBtn.textContent = 'Pausar';

        const min = parseInt(document.getElementById('countdown-minutes').value) || 0;
        const sec = parseInt(document.getElementById('countdown-seconds').value) || 0;
        countdownTimeLeft = min * 60 + sec;

        if (countdownTimeLeft <= 0) { stopCountdownTimer(); return; }

        updateCountdownDisplay();
        playStartSound();

        countdownTimerInterval = setInterval(() => {
            if (countdownTimeLeft > 0) {
                playCountdownBeep(countdownTimeLeft);
                countdownTimeLeft--;
                updateCountdownDisplay();
            }
            if (countdownTimeLeft === 0) {
                playEndSound();
                stopCountdownTimer();
            }
        }, 1000);
    }

    function stopCountdownTimer() {
        clearInterval(countdownTimerInterval);
        isCountdownRunning = false;
        if (countdownStartBtn) countdownStartBtn.textContent = 'Iniciar';
    }

    function resetCountdownTimer() {
        stopCountdownTimer();
        countdownTimeLeft = 0;
        updateCountdownDisplay();
    }

    allTimerStops.push(stopCountdownTimer);
    if (countdownStartBtn) countdownStartBtn.addEventListener('click', startCountdownTimer);
    if (countdownResetBtn) countdownResetBtn.addEventListener('click', resetCountdownTimer);

    // ----------- POMODORO DE ENTRENAMIENTO -----------
    let pomodoroTimerInterval = null;
    let isPomodoroRunning = false;
    let pomodoroTimeLeft = 0;
    let pomodoroCurrentRound = 0;
    let pomodoroPhase = 'work';

    const pomodoroWorkInput = document.getElementById('pomodoro-work');
    const pomodoroRestInput = document.getElementById('pomodoro-rest');
    const pomodoroTimeDisplay = document.getElementById('pomodoro-time');
    const pomodoroRoundDisplay = document.getElementById('pomodoro-round');
    const pomodoroPhaseDisplay = document.getElementById('pomodoro-phase');
    const pomodoroStartBtn = document.getElementById('pomodoro-start');
    const pomodoroResetBtn = document.getElementById('pomodoro-reset');

    function updatePomodoroDisplay() {
        if (pomodoroTimeDisplay) pomodoroTimeDisplay.textContent = formatMMSS(pomodoroTimeLeft);
        if (pomodoroRoundDisplay) pomodoroRoundDisplay.textContent = `Ronda: ${pomodoroCurrentRound}`;
        if (pomodoroPhaseDisplay) {
            if (pomodoroCurrentRound === 0) {
                pomodoroPhaseDisplay.textContent = 'Preparados';
                pomodoroPhaseDisplay.className = 'tabata-phase';
            } else {
                pomodoroPhaseDisplay.textContent = pomodoroPhase === 'work' ? '¡Trabajo!' : 'Descanso';
                pomodoroPhaseDisplay.className = 'tabata-phase ' + pomodoroPhase;
            }
        }
    }

    function startPomodoroTimer() {
        if (isPomodoroRunning) { stopPomodoroTimer(); return; }
        stopAllTimers();
        isPomodoroRunning = true;
        pomodoroStartBtn.textContent = 'Pausar';

        const workTime = parseInt(pomodoroWorkInput.value) || 45;
        const restTime = parseInt(pomodoroRestInput.value) || 15;

        pomodoroCurrentRound = 1;
        pomodoroPhase = 'work';
        pomodoroTimeLeft = workTime;

        updatePomodoroDisplay();
        playStartSound();

        pomodoroTimerInterval = setInterval(() => {
            if (pomodoroTimeLeft > 0) {
                playCountdownBeep(pomodoroTimeLeft);
                pomodoroTimeLeft--;
                updatePomodoroDisplay();
            }
            if (pomodoroTimeLeft === 0) {
                playEndSound();
                if (pomodoroPhase === 'work') {
                    pomodoroPhase = 'rest';
                    pomodoroTimeLeft = restTime;
                    playPhaseStartSound('rest');
                } else {
                    pomodoroPhase = 'work';
                    pomodoroTimeLeft = workTime;
                    pomodoroCurrentRound++;
                    playPhaseStartSound('work');
                }
                updatePomodoroDisplay();
            }
        }, 1000);
    }

    function stopPomodoroTimer() {
        clearInterval(pomodoroTimerInterval);
        isPomodoroRunning = false;
        if (pomodoroStartBtn) pomodoroStartBtn.textContent = 'Iniciar';
    }

    function resetPomodoroTimer() {
        stopPomodoroTimer();
        pomodoroTimeLeft = 0;
        pomodoroCurrentRound = 0;
        pomodoroPhase = 'work';
        updatePomodoroDisplay();
    }

    allTimerStops.push(stopPomodoroTimer);
    if (pomodoroStartBtn) pomodoroStartBtn.addEventListener('click', startPomodoroTimer);
    if (pomodoroResetBtn) pomodoroResetBtn.addEventListener('click', resetPomodoroTimer);

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

    // Para Descanso Programado (minutos y segundos)
    createTimePicker('rest-time-picker', {
        showHours: false,
        showMinutes: true,
        showSeconds: true,
        minutesId: 'rest-minutes',
        secondsId: 'rest-seconds'
    });

    // Para Cuenta Regresiva (minutos y segundos)
    createTimePicker('countdown-time-picker', {
        showHours: false,
        showMinutes: true,
        showSeconds: true,
        minutesId: 'countdown-minutes',
        secondsId: 'countdown-seconds'
    });

    // ----------- BUSCADOR DE EJERCICIOS -----------
    // --- Lógica para cargar y filtrar ejercicios con drag & drop ---

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
}); // Cierre del DOMContentLoaded

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