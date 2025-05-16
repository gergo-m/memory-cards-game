const gameBoard = document.getElementById('game-board');
const allSymbols = [
    '🐵','🐶','🐺','🐱','🐯','🦊','🦝','🐸','🐭','🐹','🐰','🦁','🐻','🐨','🐼','🐷',
    '🐮','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋'
];

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

let timerInterval;
let secondsElapsed = 0;

let matchedPairs = 0;
let totalPairs = allSymbols.length;
let flips = 0;

const flipSound = new Audio('assets/sounds/flip.mp3');
const matchSound = new Audio('assets/sounds/match.mp3');
const noMatchSound = new Audio('assets/sounds/nomatch.mp3');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCard(symbol) {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardFront.textContent = symbol;

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.textContent = '?';

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.dataset.symbol = symbol;

    card.addEventListener('click', flipCard);

    return card;
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (flips === 0) startTimer();

    this.classList.add('flipped');
    flipSound.cloneNode().play();

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;
    flips++;
    document.getElementById('flips').textContent = `Flips: ${flips}`;

    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    const card1 = firstCard;
    const card2 = secondCard;

    setTimeout(() => {
        card1.classList.add('pair-found');
        card2.classList.add('pair-found');
        setTimeout(() => {
            matchSound.play();
        }, 100)
    }, 250);
    setTimeout(() => {
        card1.classList.remove('pair-found');
        card2.classList.remove('pair-found');
        matchedPairs++;
        if (matchedPairs === totalPairs) {
            stopTimer();
            const playerName = document.getElementById('player-name').value || 'Anonymous Player';
            saveResults(playerName, secondsElapsed, flips);
            setTimeout(() => {
                alert(`Congratulations, ${playerName}! You won the game in ${secondsElapsed} seconds with ${flips} flips.`);
            }, 500);
        }
        resetBoard();
        updateProgressBar();
    }, 1100);
}

function unflipCards() {
    setTimeout(() => {
        noMatchSound.play();
    }, 350);
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function startTimer() {
    secondsElapsed = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').textContent = `Time: ${secondsElapsed} sec`;
    }, 1000);
}

function updateProgressBar() {
    const progress = (matchedPairs / totalPairs) * 100;
    document.getElementById("progress-bar").style.width = `${progress}%`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function setupGame() {
    gameBoard.innerHTML = '';
    matchedPairs = 0;
    flips = 0;
    secondsElapsed = 0;
    document.getElementById('timer').textContent = 'Time: 0 sec';
    document.getElementById('flips').textContent = 'Flips: 0';
    gameBoard.style.setProperty('--grid-cols', gridSize);

    const numOfPairs = (gridSize * gridSize) / 2;
    totalPairs = numOfPairs;
    const symbols = shuffle(allSymbols).slice(0, numOfPairs);
    const cardsArray = [...symbols, ...symbols];

    const shuffledCards = shuffle(cardsArray.slice());
    shuffledCards.forEach(symbol => {
        const cardElement = createCard(symbol);
        gameBoard.appendChild(cardElement);
    });
    resetBoard();
    updateProgressBar();
}

function saveResults(name, time, flips) {
    const results = JSON.parse(localStorage.getItem('memoryGameResults')) || [];
    results.push({name, time, flips});
    localStorage.setItem('memoryGameResults', JSON.stringify(results));
    loadResults();
}

function loadResults() {
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    const results = JSON.parse(localStorage.getItem('memoryGameResults')) || [];

    results.sort((a, b) => (a.time + a.flips) - (b.time + b.flips));

    results.forEach(result => {
        const ratio = (result.time + result.flips);
        const li = document.createElement('li');
        li.textContent = `${result.name} (${ratio}) - ${result.flips} flips in ${result.time} sec`;
        resultsList.appendChild(li);
    });
}

window.onload = () => {
    setupGame();
    loadResults();
};
document.getElementById('new-game-btn').addEventListener('click', setupGame);
document.getElementById('help-btn').addEventListener('click', () => {
    alert('Rules of the memory card game:\n\n' +
        '- Click on the cards to flip them.\n' +
        '- Find all pairs while minimizing time and number of flips.\n' +
        '- Have fun!');
});


// ----- Background canvas ----
function drawGameBoardBackground() {
    const gameContainer = document.getElementById('game-container');
    const canvas = document.getElementById('bg-canvas');
    const board = document.getElementById('game-board');
    if (!gameContainer || !canvas || !board) return;

    let skyColor1, skyColor2, celestialColor, cloudColor, groundColor,
        treeTrunkColor, treeCrownColor;

    const isDark = document.body.classList.contains('dark-theme');

    if (isDark) {
        skyColor1 = "#23272f";
        skyColor2 = "#374151";
        celestialColor = "#f0e9c9";
        cloudColor = "rgba(180, 200, 255, 0.18)";
        groundColor = "#495a3c";
        treeTrunkColor = "#5a3f1b";
        treeCrownColor = "#274e13";
    } else {
        skyColor1 = "#aeefff";
        skyColor2 = "#e0f7fa";
        celestialColor = "#ffe066";
        cloudColor = "rgba(255, 255, 255, 0.8)";
        groundColor = "#a3d977";
        treeTrunkColor = "#8d5524";
        treeCrownColor = "#3e913b";
    }

    const rect = board.getBoundingClientRect();
    canvas.width = Math.round(board.offsetWidth * 1.2);
    canvas.height = Math.round(board.offsetHeight * 1.05);

    const ctx = canvas.getContext('2d');

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, skyColor1);
    sky.addColorStop(1, skyColor2);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function drawStars(ctx, width, height, starCount = 100) {
        ctx.fillStyle = "white";
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * (height / 2);
            const radius = Math.random() + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    const celestialX = canvas.width - 60;
    const celestialY = 60;
    const celestialRadius = 40;

    if (isDark) {
        drawStars(ctx, canvas.width, canvas.height, 70);

        ctx.beginPath();
        ctx.arc(celestialX, celestialY, celestialRadius, 0, 2 * Math.PI);
        ctx.fillStyle = celestialColor;
        ctx.fill();

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(celestialX + 15, celestialY - 10, celestialRadius * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
    } else {
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, celestialRadius, 0, 2 * Math.PI);
        ctx.fillStyle = celestialColor;
        ctx.fill();
    }

    function drawCloud(x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.arc(0, 0, 20, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(30, -10, 25, Math.PI, Math.PI * 1.85);
        ctx.arc(60, 0, 20, Math.PI * 1.37, Math.PI * 0.37, true);
        ctx.closePath();
        ctx.fillStyle = cloudColor;
        ctx.fill();
        ctx.restore();
    }
    drawCloud(60, 60, 1.1);
    drawCloud(canvas.width * 0.4, 40, 0.8);
    drawCloud(canvas.width * 0.7, 90, 1.2);

    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 60);
    ctx.quadraticCurveTo(canvas.width / 2, canvas.height - 20, canvas.width, canvas.height - 60);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = groundColor;
    ctx.fill();

    function drawTree(x, y, trunkH, crownR) {
        ctx.fillStyle = treeTrunkColor;
        ctx.fillRect(x - 5, y, 10, trunkH);
        ctx.beginPath();
        ctx.arc(x, y, crownR, 0, 2 * Math.PI);
        ctx.fillStyle = treeCrownColor;
        ctx.fill();
    }
    drawTree(90, canvas.height - 80, 30, 18);
    drawTree(canvas.width - 100, canvas.height - 90, 36, 22);
}

function updateBoardBackground() {
    setTimeout(drawGameBoardBackground, 100);
}
window.addEventListener("resize", updateBoardBackground);
document.getElementById("difficulty").addEventListener("change", updateBoardBackground);
window.addEventListener("DOMContentLoaded", updateBoardBackground);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBoardBackground);

// ----- Theme toggle -----
const themeToggle = document.getElementById("theme-toggle");
let currentTheme = localStorage.getItem('theme')
    ? localStorage.getItem('theme')
    : (window.matchMedia("(prefers-color-scheme: dark").matches ? "dark" : "light");

document.body.classList.add(currentTheme + "-theme");

function updateThemeButton() {
    themeToggle.textContent = "Switch to " + (document.body.classList.contains("dark-theme") ? "light" : "dark") + " theme";
}
themeToggle.addEventListener('click', function() {
    currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
    if (currentTheme === "dark") {
        document.body.classList.replace("dark-theme", "light-theme");
        currentTheme = "light";
    } else {
        document.body.classList.replace("light-theme", "dark-theme");
        currentTheme = "dark";
    }
    localStorage.setItem('theme', currentTheme);
    updateThemeButton()
    updateBoardBackground();
});

window.addEventListener('DOMContentLoaded', updateThemeButton);


// ----- Color toggle -----
const colorToggle = document.getElementById("color-toggle");
const cardColors = ["blue-cards", "green-cards", "orange-cards", "gray-cards"];
let colorIndex = 0;

const savedColor = localStorage.getItem("color");
if (savedColor && cardColors.includes(savedColor)) {
    document.body.classList.add(savedColor);
    colorIndex = cardColors.indexOf(savedColor);
} else {
    document.body.classList.add(cardColors[0]);
}

function updateColorButton() {
    const nextIndex = (colorIndex + 1) % cardColors.length;
    const names = ["Blue", "Green", "Orange", "Gray"];
    colorToggle.textContent = `Switch to ${names[nextIndex]} color`
}

colorToggle.addEventListener("click", function() {
    document.body.classList.remove(cardColors[colorIndex]);
    colorIndex = (colorIndex + 1) % cardColors.length;
    document.body.classList.add(cardColors[colorIndex]);
    localStorage.setItem("color", cardColors[colorIndex]);
    updateColorButton();
});

window.addEventListener('DOMContentLoaded', updateColorButton);


// ----- Mouse follow -----
document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    document.body.style.setProperty('--cursor-x', `${x}px`);
    document.body.style.setProperty('--cursor-y', `${y}px`);
});


// ----- Difficulty ----
let gridSize = 4;

document.getElementById("difficulty").addEventListener("change", (e) => {
    gridSize = parseInt(e.target.value);
    setupGame();
});