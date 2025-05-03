const gameBoard = document.getElementById('game-board');
const cardSymbols = ['🐵', '🐶', '🐺', '🐱', '🐯', '🦊', '🦝', '🐸']
const cardsArray = [...cardSymbols, ...cardSymbols];

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

let timerInterval;
let secondsElapsed = 0;

let matchedPairs = 0;
const totalPairs = cardSymbols.length;
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
    flipSound.play();

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

function stopTimer() {
    clearInterval(timerInterval);
}

function setupGame() {
    gameBoard.innerHTML = '';
    matchedPairs = 0;
    const shuffledCards = shuffle(cardsArray.slice());
    shuffledCards.forEach(symbol => {
        const cardElement = createCard(symbol);
        gameBoard.appendChild(cardElement);
    });
    resetBoard();
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
});

window.addEventListener('DOMContentLoaded', updateThemeButton);
