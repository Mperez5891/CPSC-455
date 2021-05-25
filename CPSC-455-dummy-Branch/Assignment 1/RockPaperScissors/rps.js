'use strict'

const express = require('express');
const app = express();
app.set('view engine', 'ejs'); // Instruct Express to use ejs

class RPS
{ 
    constructor(port)
    {
        app.listen(port);
        this.playerChoice = "";
        this.serverChoice = "";
        this.playerWins = 0;
        this.serverWins = 0;
        this.totalGames = 0;
    }

    setPlayerChoice(playerChoice){
        this.playerChoice = playerChoice;
    }

    setServerChoice(serverChoice){
        this.serverChoice = serverChoice;
    }

    getPlayerChoice(){return this.playerChoice;}
    getServerChoice(){return this.serverChoice;}
    getPlayerWins(){return this.playerWins;}
    getServerWins(){return this.serverWins;}
    getTotalGames(){return this.totalGames;}

    updateState(result)
    {
        if(result === 'W')
            this.playerWins++;
        else if(result === 'L')
            this.serverWins++;
     
        this.totalGames++;
    }

    playGame(serverChoice, playerChoice)
    {
    // check if draw
    if(serverChoice === playerChoice)
        return 'D';
    
    // W = win, L = loss, D = draw
    if(serverChoice === "Rock" && playerChoice === "Paper")
        return 'W';
    else if(serverChoice === "Paper" && playerChoice === "Rock")
        return 'L';
    else if(serverChoice === "Paper" && playerChoice === "Scissors")
        return 'W';
    else if(serverChoice === "Scissors" && playerChoice === "Paper")
        return 'L';
    else if(serverChoice === "Scissors" && playerChoice === "Rock")
        return 'W';
    else if(serverChoice === "Rock" && playerChoice === "Scissors")
        return 'L';
    else
        console.log("Error playing game.");
    }
}

app.get("/", function(req, resp){
    // open the html in this directory
    resp.sendFile(__dirname + "/index.html");
});

// process the form
app.get('/playGame', function(req,resp)
{
    // extract player choice
    game.setPlayerChoice(req.query.playerChoice);

    // pick servers choice
    let ranInt = Math.floor(Math.random() * 3);
    if(ranInt === 0)
        game.setServerChoice("Rock");
    else if(ranInt === 1)
        game.setServerChoice("Paper");
    else
        game.setServerChoice("Scissors");

    // play game
    let gameResult = game.playGame(game.getServerChoice(), game.getPlayerChoice());

    // update gamestate
    game.updateState(gameResult);
    
    // get result
    if(gameResult === 'D')
        gameResult = "It's a draw."
    else if(gameResult === 'W')
        gameResult = "You win!!!";
    else
        gameResult = "You lose...";

    // send the response
    resp.render("results", 
    {result: gameResult, playerChoice:game.getPlayerChoice(), 
        serverChoice:game.getServerChoice(), playerWins:game.getPlayerWins(), 
        serverWins:game.getServerWins(), totalGames:game.getTotalGames()});
});

// create game state obj
let game = new RPS(3000);

Object.defineProperty(game, "playerChoice", {configurable: false});