// Configuración del juego
const GAME_CONFIG = {
    difficulties: {
        easy: { hearts: 8, timeBonus: 1.5 },
        medium: { hearts: 12, timeBonus: 1.2 },
        hard: { hearts: 16, timeBonus: 1.0 }
    },
    heartTypes: {
        visible: { opacity: 1, size: '2rem', probability: 0.4 },
        hidden: { opacity: 0.1, size: '2rem', probability: 0.4 },
        veryHidden: { opacity: 0.05, size: '1.5rem', probability: 0.2 }
    },
    // ---> AQUÍ ESTÁN LOS 3 MENSAJES DIFERENTES <---
    victoryMessages: {
        easy: "💌 Amor, quiero que sepas que te quiero mucho y que ❤️‍🔥 Te Amo ❤️‍🔥… Me encanta estar contigo, disfrutar cada momento a tu lado 🥰. Eres mi razón favorita para sonreír cada día 😊💖. Contigo todo es más bonito ✨: tus abrazos 🤗, tus besos 💋, tu cariño 💞, tu aprecio… me encanta todo eso 😍. Eres lo mejor que tengo y lo mejor que me ha pasado 🙌💝. Tenerte es un regalo de Dios 🙏💖. Eres el motivo de mis pensamientos 💭💘 porque siempre estoy pensando en ti, siempre, siempre… no lo dudes 💗. ¡Te Amo, mi vida! ❤️🌹",
        medium: "¡Felicidades mi Amorrr! 🥰 Encontraste todos los corazones… ¡Ganaste! 💖... así como hoy encontraste cada uno de esos corazones, un día encontraste el mío. Y así como ganaste aquí, yo gané cuando te encontré a ti, la persona más linda y especial del mundo que tengo en mi vida... Te Amo.",
        hard: "Vayaaa amorr, hasta que los encontraste... Mi vida hermosa 😍, quiero decirte que desde que llegaste a mi vida 🌅, desde que eres mía 💞 y solo de mi propiedad, hace ya 9 meses ⏳, aquel 16 de noviembre para ser exactos jajaja, entendí que nada de esto fue casualidad… Fue un regalo de Dios 🙏. Él fue quien te puso en mi camino 🚶‍♂️💖🚶‍♀️ y a mí en el tuyo. Gracias por ser esa persona que me hace sonreír todos los días, por tu amor 💓 y por todo lo que eres 🌹. Quiero que sigas a mi lado 💑, amor, y yo seguir en el tuyo… y asi para quedarme contigoooo. Te amo amor❤️🔥"
    }
};


// Estado del juego
let gameState = {
    currentScreen: 'start',
    difficulty: null,
    totalHearts: 0,
    foundHearts: 0,
    startTime: null,
    endTime: null,
    timerInterval: null, // Guardar referencia al intervalo del timer
    score: 0,
    hearts: []
};

// Referencias DOM
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    victory: document.getElementById('victory-screen')
};

const elements = {
    gameArea: document.getElementById('game-area'),
    foundCount: document.getElementById('found-count'),
    totalCount: document.getElementById('total-count'),
    timerDisplay: document.getElementById('timer-display'),
    progressFill: document.getElementById('progress-fill'),
    particlesContainer: document.getElementById('particles-container')
};

// Audio Context para efectos de sonido
let audioContext;
let soundEnabled = true;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    console.log('🎮 Minijuego "Encuentra los Corazones Ocultos" cargado 💕');
});

function initializeGame() {
    showScreen('start');
    initAudioContext();
}

function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
        console.log('Audio no disponible:', error);
        soundEnabled = false;
    }
}

// Event Listeners (Versión Limpia y Corregida)
function setupEventListeners() {
    // Botones de dificultad
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const difficulty = e.target.dataset.level;
            startGame(difficulty);
        });
    });

    // Controles del juego
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);

    // Controles de victoria
    document.getElementById('play-again-btn').addEventListener('click', () => startGame(gameState.difficulty));
    document.getElementById('menu-from-victory-btn').addEventListener('click', () => showScreen('start')); // <-- La línea clave

    // Área del juego
    elements.gameArea.addEventListener('click', handleGameAreaClick);
}


// Gestión de pantallas
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        gameState.currentScreen = screenName;
    }
}

// Inicio del juego
function startGame(difficulty) {
    // Limpiar timer anterior si existe
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.difficulty = difficulty;
    gameState.totalHearts = GAME_CONFIG.difficulties[difficulty].hearts;
    gameState.foundHearts = 0;
    gameState.startTime = Date.now();
    gameState.score = 0;
    gameState.hearts = [];

    updateUI();
    generateHearts();
    showScreen('game');
    startTimer();
    
    playSound('start');
}

// Generación de corazones
function generateHearts() {
    elements.gameArea.innerHTML = '';
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const hearts = [];

    for (let i = 0; i < gameState.totalHearts; i++) {
        const heart = createHeart(i, gameAreaRect);
        hearts.push(heart);
        elements.gameArea.appendChild(heart.element);
    }

    gameState.hearts = hearts;
}

function createHeart(index, gameAreaRect) {
    const heartElement = document.createElement('div');
    heartElement.className = 'heart';
    heartElement.innerHTML = getRandomHeartEmoji();
    heartElement.dataset.index = index;

    const rand = Math.random();
    let heartType = 'visible';
    
    if (rand < GAME_CONFIG.heartTypes.veryHidden.probability) {
        heartType = 'veryHidden';
    } else if (rand < GAME_CONFIG.heartTypes.veryHidden.probability + GAME_CONFIG.heartTypes.hidden.probability) {
        heartType = 'hidden';
    }

    heartElement.classList.add(heartType.replace(/([A-Z])/g, '-$1').toLowerCase());

    const position = getRandomPosition(gameAreaRect);
    heartElement.style.left = position.x + 'px';
    heartElement.style.top = position.y + 'px';

    const typeConfig = GAME_CONFIG.heartTypes[heartType];
    heartElement.style.opacity = typeConfig.opacity;
    heartElement.style.fontSize = typeConfig.size;

    heartElement.addEventListener('click', (e) => {
        e.stopPropagation();
        findHeart(index);
    });

    return {
        element: heartElement,
        type: heartType,
        found: false,
        position: position
    };
}

function getRandomHeartEmoji() {
    const heartEmojis = ['💖', '💕', '💗', '💝', '💘', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎'];
    return heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
}

function getRandomPosition(gameAreaRect) {
    const margin = 50;
    const x = Math.random() * (gameAreaRect.width - margin * 2) + margin;
    const y = Math.random() * (gameAreaRect.height - margin * 2) + margin;
    
    return { x, y };
}

// Lógica de encontrar corazones
function findHeart(index) {
    const heart = gameState.hearts[index];
    
    if (heart.found) return;

    heart.found = true;
    heart.element.classList.add('found');
    gameState.foundHearts++;

    const timeBonus = GAME_CONFIG.difficulties[gameState.difficulty].timeBonus;
    const typeMultiplier = getTypeMultiplier(heart.type);
    const points = Math.floor(100 * typeMultiplier * timeBonus);
    gameState.score += points;

    createHeartExplosion(heart.position.x, heart.position.y);
    createFloatingPoints(heart.position.x, heart.position.y, points);
    playSound('found');
    updateUI();

    if (gameState.foundHearts >= gameState.totalHearts) {
        setTimeout(endGame, 500);
    }
}

function getTypeMultiplier(type) {
    switch (type) {
        case 'visible': return 1;
        case 'hidden': return 1.5;
        case 'veryHidden': return 2;
        default: return 1;
    }
}

// Efectos visuales
function createHeartExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'heart-explosion';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'explosion-particle';
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        
        explosion.appendChild(particle);
    }

    elements.gameArea.appendChild(explosion);
    
    setTimeout(() => explosion.remove(), 1000);
}

function createFloatingPoints(x, y, points) {
    const pointsElement = document.createElement('div');
    pointsElement.textContent = '+' + points;
    pointsElement.style.cssText = `
        position: absolute; left: ${x}px; top: ${y}px;
        color: #FFD700; font-weight: bold; font-size: 1.2rem;
        pointer-events: none; z-index: 100;
    `;
    elements.gameArea.appendChild(pointsElement);

    pointsElement.animate([
        { transform: 'translateY(0) scale(1)', opacity: 1 },
        { transform: 'translateY(-50px) scale(1.2)', opacity: 0 }
    ], {
        duration: 1000,
        easing: 'ease-out'
    }).addEventListener('finish', () => pointsElement.remove());
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.backgroundColor = getRandomColor();
            elements.particlesContainer.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

function getRandomColor() {
    const colors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFD700', '#FF1493', '#DC143C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Gestión del tiempo
function startTimer() {
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsed = Date.now() - gameState.startTime;
    elements.timerDisplay.textContent = formatTime(elapsed);
}

function restartGame() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    startGame(gameState.difficulty);
}

// Final del juego
function endGame() {
    gameState.endTime = Date.now();
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    const totalTime = gameState.endTime - gameState.startTime;
    const timeInSeconds = totalTime / 1000;
    const timeBonus = Math.max(0, Math.floor((300 - timeInSeconds) * 10));
    gameState.score += timeBonus;

    updateVictoryScreen(totalTime);
    createConfetti();
    playSound('victory');
    showScreen('victory');
}

function updateVictoryScreen(totalTime) {
    document.getElementById('final-hearts').textContent = gameState.foundHearts;
    document.getElementById('final-time').textContent = formatTime(totalTime);
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('romantic-message').textContent = generatePersonalizedMessage();
}

// Elige el mensaje de victoria según la dificultad
function generatePersonalizedMessage() {
    // Simplemente devuelve el mensaje que corresponde a la dificultad jugada
    return GAME_CONFIG.victoryMessages[gameState.difficulty];
}

function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Actualización de UI
function updateUI() {
    elements.foundCount.textContent = gameState.foundHearts;
    elements.totalCount.textContent = gameState.totalHearts;
    
    const progress = (gameState.foundHearts / gameState.totalHearts) * 100;
    elements.progressFill.style.width = progress + '%';
}

// Manejo de clics en el área de juego
function handleGameAreaClick(e) {
    if (e.target === elements.gameArea) {
        createRippleEffect(e.offsetX, e.offsetY);
    }
}

function createRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute; left: ${x}px; top: ${y}px;
        width: 20px; height: 20px;
        border: 2px solid rgba(255, 105, 180, 0.6);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none; z-index: 10;
    `;
    elements.gameArea.appendChild(ripple);

    ripple.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 },
        { transform: 'translate(-50%, -50%) scale(3)', opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    }).addEventListener('finish', () => ripple.remove());
}

// Sistema de sonidos
function playSound(type) {
    if (!soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    switch (type) {
        case 'found':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;

        case 'victory':
            const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do alto
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
                    gain.gain.setValueAtTime(0, audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    osc.start(audioContext.currentTime);
                    osc.stop(audioContext.currentTime + 0.3);
                }, index * 150);
            });
            break;

        case 'start':
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundButton = document.getElementById('sound-toggle');
    
    soundButton.classList.toggle('muted', !soundEnabled);
    if (soundEnabled) {
        soundButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        if (!audioContext) initAudioContext();
    } else {
        soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

// Limpieza al cerrar
window.addEventListener('beforeunload', () => {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    if (audioContext) {
        audioContext.close();
    }
});
// --- Easter Egg "AMO A CHAY" con Alerta ---

// Array para almacenar las teclas presionadas
let konamiCode = []; 
// Secuencia de códigos de tecla para "AMO A CHAY" (A=65, M=77, O=79, Espacio=32, C=67, H=72, Y=89)
const konamiSequence = [65, 77, 79, 32, 65, 32, 67, 72, 65, 89]; 

// Escuchar los eventos del teclado en todo el documento
document.addEventListener('keydown', (e) => {
    // Añade el código de la tecla presionada al array
    konamiCode.push(e.keyCode);
    
    // Si el array es más largo que la secuencia, elimina el primer elemento
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    // Comprueba si el array actual coincide con la secuencia del Easter Egg
    if (konamiCode.length === konamiSequence.length && 
        konamiCode.every((code, index) => code === konamiSequence[index])) {
        
        // --- ALERTA AÑADIDA AQUÍ ---
        alert('💕YO IGUAL TE AMO MI VIDA💕\n\nAMOR tienes 8 segundos para ubicar los corazones.');
        
        console.log('🤫 ¡Easter Egg Activado! 🤫');

        // Muestra temporalmente todos los corazones no encontrados
        gameState.hearts.forEach(heart => {
            if (!heart.found) {
                // Aplica estilos para que el corazón sea muy visible
                heart.element.style.opacity = '1';
                heart.element.style.transform = 'scale(1.2)';
                heart.element.style.filter = 'drop-shadow(0 0 10px #FFD700)';
            }
        });
        
        // Después de 8 segundos, revierte los estilos a su estado original
        setTimeout(() => {
            gameState.hearts.forEach(heart => {
                if (!heart.found) {
                    // Restaura la opacidad y estilos originales del corazón
                    const typeConfig = GAME_CONFIG.heartTypes[heart.type];
                    heart.element.style.opacity = typeConfig.opacity;
                    heart.element.style.transform = '';
                    heart.element.style.filter = '';
                }
            });
            console.log('🤫 Easter Egg desactivado.');
        }, 8000); // 8000 milisegundos = 8 segundos
        
        // Resetea el array para poder activar el truco de nuevo
        konamiCode = []; 
    }
});


console.log('🎮 Juego cargado exitosamente');
