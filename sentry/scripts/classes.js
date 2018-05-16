// classes.js
// This file contains various useful classes.
// Written by Edward Opich
// Last modified 3/30/18

"use strict";

var app = app || {};

app.classes = (function(){
    // Define your useful classes here!

    // Vector2 class
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
    var Vector2 = function(x = 0, y = 0){
        this.x = x;
        this.y = y;

        this.add = function(other){
            this.x += other.x;
            this.y += other.y;

            return this;
        };

        this.magnitude = function(){
            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        };
    }

    // 2D Bounding Box class
    var BBox = function(origin = new Vector2(), size = new Vector2(1, 1)){
        this.origin = origin;
        this.size = size;

        // Getters and Setters, mostly for syntactic sugar here
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
        // https://stackoverflow.com/questions/5222209/getter-setter-in-constructor
        Object.defineProperties(this, {
            "x": {
                "get": function() { return this.origin.x; },
                "set": function(value) { this.origin.x = value; }
            },

            "y": {
                "get": function() { return this.origin.y; },
                "set": function(value) { this.origin.y = value; }
            },

            "w": {
                "get": function() { return this.size.x; },
                "set": function(value) { this.size.x = value; }
            },

            "h": {
                "get": function() { return this.size.y; },
                "set": function(value) { this.size.y = value; }
            }
        });
    };

    // Game Object class
    var GameObject = function(image = undefined, bbox = new BBox()){
        this.position = new Vector2();
        this.direction = 1; // Greater than 0 is right, less than 0 is left

        this.bbox = bbox;   // BBox origin is relative to object position
        this.image = image;

        this.velocity = new Vector2();
        this.acceleration = new Vector2();

        this.maxVelocity = new Vector2(6, 16);

        this.gravity = new Vector2(0, 1);
        this.friction = -0.3;

        this.active = true;

        this.init = function(){};
        this.update = function(){};
        this.draw = function(){};
        this.load = function(){};

        this.unload = function(){};

        Object.defineProperties(this, {
            "x": {
                "get": function() { return this.position.x; },
                "set": function(value) { this.position.x = value; }
            },

            "y": {
                "get": function() { return this.position.y; },
                "set": function(value) { this.position.y = value; }
            }
        });
    };

    // Return the ones you want publicly accessible!
    return{
        Vector2: Vector2,
        BBox: BBox,
        GameObject: GameObject
    };
}());