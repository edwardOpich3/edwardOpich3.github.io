// loader.js
// This file handles window events, such as onload.
// Written by Edward Opich
// Last modified 3/26/18

"use strict";

var app = app || {};

window.onload = function(){
    // Hook up secondary modules to the main module
    app.main.userInput = app.userInput;
    app.main.classes = app.classes;
    app.main.graphics = app.graphics;
    app.main.sound = app.sound;

    app.main.game = app.game;
    app.main.game.player = app.player;
    app.main.game.level = app.level;

    // Initialize any secondary modules!
    app.graphics.init();
    app.userInput.init();
    app.sound.init();
    app.game.init();

    // Initialize the main app!
    app.main.init();
};

// When the window is focused
window.onfocus = function(){
    app.main.refocusGame();
};

// When the window is unfocused
window.onblur = function(){
    app.main.unfocusGame();
};