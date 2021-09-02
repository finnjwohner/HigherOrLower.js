const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')));

const players = new Map();
const game = {
    text: "The last number was <b>50/100</b>, guess for the next number!",
    lastNum : 50,
    guessable: true,
    timer: 10,
}


io.on('connection', socket => {
    playerArray = [];
    players.forEach(player => {
        playerArray.push(player);
    })
    socket.emit('initialSetup', playerArray)

    socket.on('join', playerName => {
        players.set(socket.id, {
            id: socket.id,
            username: playerName,
            guess: undefined,
        })

        socket.emit('sendGameState', game);
        io.emit('playerJoined', socket.id, playerName);
    })

    socket.on('disconnect', () => {
        if (players.has(socket.id)) {
            players.delete(socket.id);
            io.emit('playerLeft', socket.id);
        }
    })

    socket.on('changeGuess', guess => {
        if (game.guessable) {
            if (players.has(socket.id)) {
                const player = players.get(socket.id);
                player.guess = guess;
                players.set(socket.id, player);
                
                io.emit('playerGuessed', player);
            }
        }
    })
})

const initialiseGame = () => {
    // Choose random number out of 10
    game.lastNum = Math.floor(Math.random() * 100);

    gameNewGuess();
}

const gameNewGuess = () => {
    game.text = `The last number was <b>${game.lastNum}/100</b>, guess for the next number!`
    game.guessable = true;
    game.timer = 10;
    io.emit('sendGameState', game);

    const intervalId = setInterval(() => {
        game.timer--;
        if (game.timer == 0) {
            clearInterval(intervalId);
            gameEndGuess();
        }
    }, 1000)
}

const gameEndGuess = () => {
    let newNum = 0;
    do {
        newNum = Math.floor(Math.random() * 100);
    } while (game.lastNum == newNum);
    
    if (newNum > game.lastNum) { game.text = "Higher!"; }
    else { game.text = "Lower!"; }
    game.lastNum = newNum;
    game.text += ` The new number is <b>${newNum}/100</b>`;
    game.timer = 5;
    game.guessable = false;

    players.forEach(player => {
        player.guess = undefined;
    })

    io.emit('sendGameState', game);

    const intervalId = setInterval(() => {
        game.timer--;
        if (game.timer == 0) {
            clearInterval(intervalId);
            gameNewGuess();
        }
    }, 1000)
}

const port = process.env.PORT || 3000;
server.listen(port, '192.168.1.111', () => {
    console.log(`HigherOrLower server running on port ${port}`);
    initialiseGame();
});