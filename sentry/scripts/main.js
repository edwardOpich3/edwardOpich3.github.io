// main.js
// This file contains the outer-most structure of the application.
// Written by Edward Opich
// Last modified 4/6/18

"use strict";

var app = app || {};

app.main = {
    // Constants

    // Non-constants
    animationID: undefined,
    focused: false,

    // Modules
    userInput: undefined,
    classes: undefined,
    graphics: undefined,
    game: undefined,
    sound: undefined,

    // Functions
    init: function(){
        // Start the update loop!
        this.update();
    },

    update: function(){
        this.animationID = requestAnimationFrame(this.update.bind(this));

        this.game.update();
        this.userInput.update();

        this.graphics.draw();
    },

    unfocusGame: function(){
        if(this.focused){
            return;
        }

        this.focused = true;

        // Cancel the animation frame to stop the update loop
        cancelAnimationFrame(this.animationID);

        if(this.game.gameState == this.game.GAME_STATE.GAMEPLAY){
            this.sound.BGM.pause();
        }

        //console.log("game unfocused");
    },

    refocusGame: function(){
        if(!this.focused){
            return;
        }

        this.focused = false;

        // Resume update loop
        this.update();

        if(this.game.gameState == this.game.GAME_STATE.GAMEPLAY){
            this.sound.BGM.play();
        }

        //console.log("game refocused");
    },
};