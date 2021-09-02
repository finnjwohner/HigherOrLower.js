const socket = io();

const timerText = document.querySelector('h4');
const mainText = document.querySelector('h1');
const noGuessDiv = document.querySelector('.not-guessed');
const higherDiv = document.querySelector('.higher');
const lowerDiv = document.querySelector('.lower');

let guess = undefined;
let timer = 10;
let intervalId = undefined;

socket.on('initialSetup', playerArray => {
    playerArray.forEach(player => {
        const playerP = document.createElement('p');
        playerP.innerHTML = player.username;
        playerP.id = `player-${player.id}`;
        playerP.classList.add('player');

        changePlayerGuess(playerP, player.guess)
    })
})

socket.on('playerLeft', playerId => {
    const playerP = document.getElementById(`player-${playerId}`).remove();
})

socket.on('playerJoined', (playerId, playerName) => {
    const playerP = document.createElement('p');
    playerP.innerHTML = playerName;
    playerP.id = `player-${playerId}`;
    noGuessDiv.appendChild(playerP);
})

socket.on('playerGuessed', player => {
    const playerP = document.getElementById(`player-${player.id}`);
    changePlayerGuess(playerP, player.guess);

    if (player.id == socket.id) {
        const guessh3 = document.querySelector('h3');
        switch(player.guess) {
            case 'higher':
                guessh3.innerHTML = 'Current Guess: Higher';
                guess = 'Higher';
                break;
            case 'lower':
                guessh3.innerHTML = 'Current Guess: Lower';
                guess = 'Lower';
                break;
            default:
                guessh3.innerHTML = 'You Haven\'t Guessed!';
                guess = undefined;
                break;
        }
    }
})

socket.on('sendGameState', game => {
    clearInterval(intervalId);
    mainText.innerHTML = game.text;

    timer = game.timer;
    timerText.innerHTML = timer;

    intervalId = setInterval(() => {
        timer--;
        timerText.innerHTML = timer;

        if (timer <= 0) { clearInterval(intervalId); }
    }, 1000)

    if(game.guessable) {
        guess = undefined;
        document.querySelector('h3').innerHTML = 'You Haven\'t Guessed!';
        document.querySelectorAll('p').forEach(playerP => {
            noGuessDiv.appendChild(playerP);
        })
    }
    else {
        if (guess == undefined) {
            document.querySelector('h3').innerHTML = `You didn't make a guess.`;
        }
        else {
            document.querySelector('h3').innerHTML = `Your guess was ${guess}!`;
        }
    }
})

document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.querySelector('input[type="text"]').value;
    socket.emit('join', username);
    document.querySelector('form').style.display = 'none';
    document.querySelector('section').style.display = 'block';
})

const changeGuess = guess => {
    socket.emit('changeGuess', guess);
}

const changePlayerGuess = (playerP, playerGuess) => {
    switch(playerGuess) {
        case undefined:
            noGuessDiv.appendChild(playerP);
            break;
        case 'higher':
            higherDiv.appendChild(playerP);
            break;
        case 'lower':
            lowerDiv.appendChild(playerP);
            break;
        default:
            console.error('This shouldn\'t happen. Line 24 guess.js');
            break;
    }
}