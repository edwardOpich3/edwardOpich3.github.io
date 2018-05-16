// sound.js
// This file manages music and sound effects!
// Written by Edward Opich
// Modified 3/30/18
"use strict";

// If app exists use the existing copy
// Otherwise, create a new object
var app = app || {};

// define the .sound module and immediately invoke it in an IIFE
app.sound = (function(){
    var sound = {};
    
    sound.BGM = undefined;

    sound.SFX = {
        jump: undefined,
        shoot: undefined
    };

    sound.init = function(){
        this.BGM = document.querySelector("#bgAudio");
        this.BGM.volume = 1.00;

        this.SFX.jump = document.createElement("audio");
        this.SFX.jump.src = "media/Jump.wav";
        this.SFX.jump.volume = 0.5;

        this.SFX.shoot = document.createElement("audio");
        this.SFX.shoot.src = "media/Shoot.wav";
        this.SFX.shoot.volume = 0.5;
    }

    sound.playEffect = function(){
        var effectSound = document.createElement('audio');
        effectSound.volume = 0.3;
        effectSound.src = "media/" + effectSounds[currentEffect];
        effectSound.play();
        currentEffect += currentDirection;
        if(currentEffect == effectSounds.length || currentEffect == -1){
            currentDirection *= -1;
            currentEffect += currentDirection;
        }
    }

    return sound;
}());