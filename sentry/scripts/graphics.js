// graphics.js
// This file contains functions and variables relating to graphics.
// Written by Edward Opich
// Last modified 3/29/18

"use strict";

var app = app || {};

app.graphics = (function(){
    var graphics = {};

    // Private variables
    graphics.WIDTH = 0;
    graphics.HEIGHT = 0;
    graphics.buffer = undefined;
    graphics.bufferCtx = undefined;
    graphics.renderQueue = [];

    // Public variables
    graphics.canvas = undefined;
    graphics.ctx = undefined;


    // Public functions

    // Initialize the graphics module
    graphics.init = function(){
        //debugger;
        this.WIDTH = 1024;
        this.HEIGHT = 768;

        this.canvas = document.querySelector("canvas");
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.ctx = this.canvas.getContext("2d");
        //this.ctx.imageSmoothingEnabled = false;

        document.querySelector("#instructions").style.width = this.WIDTH + "px";

        this.buffer = document.createElement("canvas");
        this.buffer.width = this.WIDTH;
        this.buffer.height = this.HEIGHT;
        this.bufferCtx = this.buffer.getContext("2d");
        this.bufferCtx.imageSmoothingEnabled = false;
        //this.bufferCtx.globalCompositeOperation = "destination-over";
    };

    // Draw everything in the render queue
    graphics.draw = function(clear){
        // Clear the frame!
        this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.bufferCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        // Draw everything in the render queue, in order!
        while(this.renderQueue.length > 0){
            this.drawFromRenderQueue();
        }

        // Flip the buffer
        this.ctx.drawImage(this.buffer, 0, 0);
    };

    // Add a new object to the render queue
    graphics.addToRenderQueue = function(myObj){
        this.renderQueue.push(myObj);
    };

    // Private functions

    // Draw an object in the render queue
    graphics.drawFromRenderQueue = function(){
        var myObj = this.renderQueue.shift();
        //this.bufferCtx.drawImage(myObj.image, myObj.x, myObj.y, parseInt(myObj.image.width * myObj.sx), parseInt(myObj.image.height * myObj.sy));
        myObj.draw(this.bufferCtx);
    }

    // Return anything you want publicly accessible!
    return graphics;
}());