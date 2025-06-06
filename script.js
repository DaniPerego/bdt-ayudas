// Variables globales
let youtubePlayer = null;
let isYouTubeAPIReady = false;
let tabataInterval;
let tabataTime = 0;
let tabataRound = 0;
let tabataPhase = 'prepare';
let isRunning = false;
let isSoundEnabled = true;

// Funcionalidad del menú desplegable
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('_toggle');
    const items = document.getElementById('_items');

    toggle.addEventListener('click', () => {
        items.classList.toggle('open');
        toggle.classList.toggle('close');
    });

    // Variables globales
    let stopwatchInterval;
    let milliseconds = 0;
    let isRunning = false;
    let isSoundEnabled = true;
    let countdownTime = 0;
    let isCountingUp = true;

    // Variables para el temporizador Tabata
    let tabataInterval;
    let tabataTime = 0;
    let tabataRound = 0;
    let tabataPhase = 'prepare';
    let isTabataRunning = false;

    // Referencias a elementos del DOM
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

function updateStopwatch() {
    let elapsedTime;
    if (isCountingUp) {
        elapsedTime = Date.now() - startTime; // Calcular el tiempo transcurrido
    } else {
        elapsedTime = countdownTime - (Date.now() - startTime);
        if (elapsedTime < 0) {
            elapsedTime = 0;
            stopStopwatch();
            playTimerEndSound();
        }
    }

    const hours = Math.floor(elapsedTime / 3600000) || 0;
    const minutes = Math.floor((elapsedTime % 3600000) / 60000) || 0;
    const seconds = Math.floor((elapsedTime % 60000) / 1000) || 0;
    const ms = Math.floor(elapsedTime % 1000) || 0;

    stopwatchDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function toggleStopwatch() {
    if (!isRunning) {
        startTime = Date.now(); // Establecer el tiempo de inicio
        stopwatchInterval = setInterval(updateStopwatch, 10);
        startButton.textContent = 'Pausar';
        isRunning = true;
    } else {
        stopStopwatch();
    }
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
    startButton.textContent = 'Iniciar';
    isRunning = false;
}

function resetStopwatch() {
    stopStopwatch();
    if (isCountingUp) {
        milliseconds = 0;
    }
    updateStopwatch();
    stopwatchDisplay.textContent = "00:00:00.000";
}

    // Función para crear un beep
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

    // Función para reproducir sonido al final del temporizador
    function playTimerEndSound() {
        if (!isSoundEnabled) return;
        createBeep(880, 0.3, 0.2);
    }

    // Función para reproducir sonidos de cuenta regresiva
    function playCountdownBeep(time) {
        if (!isSoundEnabled) return;
        
        if (time <= 3 && time > 0) {
            createBeep(440, 0.1, 0.1);
        }
    }

    // Función para reproducir sonido al inicio de cada fase
    function playPhaseStartSound(phase) {
        if (!isSoundEnabled) return;
        
        if (phase === 'work') {
            createBeep(660, 0.2, 0.15);
        } else if (phase === 'rest') {
            createBeep(440, 0.2, 0.15);
        }
    }

    // Función para actualizar la visualización del Tabata
    function updateTabataDisplay() {
        const minutes = Math.floor(tabataTime / 60);
        const seconds = tabataTime % 60;
        tabataTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        tabataRoundElement.textContent = `Ronda: ${tabataRound}/8`;
    }

    // Función para iniciar/pausar el Tabata
    function startTabata() {
        if (!isTabataRunning) {
            isTabataRunning = true;
            tabataStartButton.textContent = 'Pausar';
            tabataTime = 10; // Tiempo de preparación
            tabataRound = 0;
            tabataPhase = 'prepare';
            
            updateTabataDisplay();
            tabataPhaseElement.className = 'tabata-phase prepare';
            tabataPhaseElement.textContent = 'Preparados';

            if (isSoundEnabled) {
                createBeep(700, 0.2, 0.15);
            }

            tabataInterval = setInterval(() => {
                if (tabataTime > 0) {
                    playCountdownBeep(tabataTime);
                    tabataTime--;
                    updateTabataDisplay();
                }

                if (tabataTime === 0) {
                    if (isSoundEnabled) {
                        playTimerEndSound();
                    }

                    switch (tabataPhase) {
                        case 'prepare':
                            tabataPhase = 'work';
                            tabataTime = 20;
                            tabataRound++;
                            tabataPhaseElement.className = 'tabata-phase work';
                            tabataPhaseElement.textContent = '¡Trabajo!';
                            playPhaseStartSound('work');
                            break;
                            
                        case 'work':
                            if (tabataRound >= 8) {
                                stopTabata();
                                return;
                            }
                            tabataPhase = 'rest';
                            tabataTime = 10;
                            tabataPhaseElement.className = 'tabata-phase rest';
                            tabataPhaseElement.textContent = 'Descanso';
                            playPhaseStartSound('rest');
                            break;
                            
                        case 'rest':
                            tabataPhase = 'work';
                            tabataTime = 20;
                            tabataRound++;
                            tabataPhaseElement.className = 'tabata-phase work';
                            tabataPhaseElement.textContent = '¡Trabajo!';
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

    // Función para detener el Tabata
    function stopTabata() {
        clearInterval(tabataInterval);
        isTabataRunning = false;
        tabataStartButton.textContent = 'Iniciar';
    }

    // Función para resetear el Tabata
    function resetTabata() {
        stopTabata();
        tabataTime = 0;
        tabataRound = 0;
        tabataPhase = 'prepare';
        updateTabataDisplay();
        tabataPhaseElement.className = 'tabata-phase';
        tabataPhaseElement.textContent = 'Preparados';
    }

    // Función para crear el reproductor de YouTube
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

    // Event Listeners
    if (startButton) {
        startButton.addEventListener('click', toggleStopwatch);
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetStopwatch);
    }

    if (tabataStartButton) {
        tabataStartButton.addEventListener('click', startTabata);
    }

    if (tabataResetButton) {
        tabataResetButton.addEventListener('click', resetTabata);
    }

    // Event listener para el selector de playlist
    const playlistSelector = document.getElementById('playlist-selector');
    if (playlistSelector) {
        playlistSelector.addEventListener('change', (e) => {
            createYouTubeEmbed(e.target.value);
        });
    }

    // Event listeners para los campos de entrada del temporizador
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        if (input) {
            input.addEventListener('change', () => {
                const hours = parseInt(hoursInput.value) || 0;
                const minutes = parseInt(minutesInput.value) || 0;
                const seconds = parseInt(secondsInput.value) || 0;
                countdownTime = (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
                if (!isRunning) {
                    milliseconds = countdownTime;
                    updateStopwatch();
                }
            });
        }
    });

    // Event listener para el cambio de modo del temporizador
    timerModeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            isCountingUp = e.target.value === 'up';
            if (!isRunning) {
                milliseconds = isCountingUp ? 0 : countdownTime;
                updateStopwatch();
            }
        });
    });

    // Event listener para el botón de sonido
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            soundToggle.querySelector('i').className = isSoundEnabled ? 'bi bi-volume-up-fill' : 'bi bi-volume-mute-fill';
        });
    }

    // Cambio de pestañas
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

    // Inicializar visualizaciones
    updateStopwatch();
    updateTabataDisplay();
}); 

document.addEventListener('DOMContentLoaded', function() {
    // Función para calcular la repetición máxima
    const calculateButton = document.getElementById('calculate');
    const exerciseSelect = document.getElementById('exercise');
    const weightInput = document.getElementById('weight');
    const resultElement = document.getElementById('result');

    if (!calculateButton || !exerciseSelect || !weightInput || !resultElement) {
        console.error('Uno o más elementos necesarios para la calculadora de RM no se encontraron en el DOM.');
        return;
    }

    calculateButton.addEventListener('click', calculateRM);

    function calculateRM() {
        const weight = parseFloat(weightInput.value);
        const selectedExercise = exerciseSelect.value;

        if (isNaN(weight) || weight <= 0) {
            resultElement.textContent = 'Por favor, introduce un peso válido.';
            return;
        }

        if (!selectedExercise) {
            resultElement.textContent = 'Por favor, selecciona un ejercicio.';
            return;
        }

        let percentages = '';
        let percentage = 95;
        while (percentage >= 30) {
            percentages += `${percentage}%: ${(weight * (percentage / 100)).toFixed(2)} kg\n`;
            percentage -= 5;
        }

        resultElement.textContent = percentages;
    }
});