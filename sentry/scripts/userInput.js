// userInput.js
// This file contains variables and functions related to user input.
// Written by Edward Opich
// Last modified 4/3/18

"use strict";

var app = app || {};

app.userInput = (function(){

    var userInput = {};

    userInput.KEYBOARD = Object.freeze({
        KEY_LEFT: 37, 
		KEY_UP: 38, 
		KEY_RIGHT: 39, 
		KEY_DOWN: 40,
        KEY_ENTER: 13,
        KEY_Z: 90,

        KEY_W: 87,
        KEY_A: 65,
        KEY_S: 83,
        KEY_D: 68
    });

    // Keys that were down this frame
    userInput.keysDown = [];

    // Keys that were *pressed* this frame
    userInput.keysPressed = [];

    userInput.mouseDown = false;
    userInput.mouse = undefined;

    userInput.init = function(){
        app.graphics.canvas.addEventListener("mousedown", function(e){
            userInput.mouseDown = true;
            userInput.mouse = getMouse(e);
        });

        app.graphics.canvas.addEventListener("mousemove", function(e){
            userInput.mouse = getMouse(e);
        })
    };

    userInput.update = function(){
        for(var i = 0; i < this.keysPressed.length; i++){
            this.keysPressed[i] = false;
        }

        this.mouseDown = false;
    };

    // Event Listeners!
    // https://developer.mozilla.org/en-US/docs/Web/Events/keydown
    window.addEventListener("keydown", function(e){
        if(!e.repeat){
            userInput.keysDown[e.keyCode] = true;
            userInput.keysPressed[e.keyCode] = true;
        }
    });

    window.addEventListener("keyup", function(e){
        userInput.keysDown[e.keyCode] = false;
    });

    // Return the stuff you want publicly accessible!
    return userInput;
}());