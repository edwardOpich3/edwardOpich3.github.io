// emitter.js
// Used for particle effects!
// Written by Edward Opich
// Last modified 4/6/18

"use strict";
var app = app || {};

// TODO: Merge this into classes.js?
app.Emitter = (function(){
    //console.log("emitter.js module loaded");

    function Emitter(){
        // public
        this.numParticles = 25;
        this.useCircles = true;
        this.useSquares = false;
        this.xRange = 4;
        this.yRange = 4;
        this.minXspeed = -1;
        this.maxXspeed = 1;
        this.minYspeed = 2;
        this.maxYspeed = 4;
        this.startRadius = 4;
        this.expansionRate = 0.3 * 60;
        this.decayRate = 2.5 * 60;
        this.lifetime = 100;
        this.red = 0;
        this.green = 0;
        this.blue = 0;

        // private
        this._particles = undefined;
    }

    // public methods
    var p=Emitter.prototype;

    p.createParticles = function(emitterPoint){
        // initialize particle array
        this._particles = [];

        // create exhaust particles
        for(var i = 0; i < this.numParticles; i++){
            // create a particle object and add to array
            var p = {};
            this._particles.push(_initParticle(this, p, emitterPoint));
        }
    };

    p.clearParticles = function(){
        this._particles = [];
    };

    p.updateAndDraw = function(ctx, emitterPoint, dt){
        /* Move and draw particles */
        // Each frame, loop through particle array
        // Move each particle down screen, and slightly left or right
        // Make it bigger, and fade it out
        // Increase its age so we know when to recycle it

        if(this._particles == undefined){
            return;
        }

        for(var i = 0; i < this._particles.length; i++){
            var p = this._particles[i];

            p.age += this.decayRate * dt;
            p.r += this.expansionRate * dt;
            p.x += p.xSpeed * dt;
            p.y += p.ySpeed * dt;
            var alpha = 1 - p.age / this.lifetime;

            if(this.useSquares){
                // Fill a rectangle
                ctx.fillStyle = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + alpha + ")";
                ctx.fillRect(p.x, p.y, p.r, p.r);
                // note: this code is easily modified to draw images
            }

            if(this.useCircles){
                // Fill a circle
                ctx.fillStyle = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + alpha + ")";

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
            }

            // If the particle is too old, recycle it
            if(p.age >= this.lifetime && this.numParticles > 0){
                _initParticle(this, p, emitterPoint);
            }
        }
    };

    // private method
    function _initParticle(obj, p, emitterPoint){
        // Give it a random age when first created
        p.age = getRandom(0, obj.lifetime);

        p.x = emitterPoint.x + getRandom(-obj.xRange, obj.xRange);
        p.y = emitterPoint.y + getRandom(0, obj.yRange);
        p.r = getRandom(obj.startRadius / 2, obj.startRadius);
        p.xSpeed = getRandom(obj.minXspeed, obj.maxXspeed) * 60;
        p.ySpeed = getRandom(obj.minYspeed, obj.maxYspeed) * 60;
        return p;
    };

    return Emitter;
}());