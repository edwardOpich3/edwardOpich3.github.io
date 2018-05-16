// game.js
// This file contains much of the game logic.
// Written by Edward Opich
// Last modified 4/5/18

"use strict";

var app = app || {};

app.game = (function(){
    var game = {};

    // Private variables

    // Public variables
    game.GAME_STATE = Object.freeze({
        TITLE: 0,
        GAMEPLAY: 1,
        INVENTORY: 2,
        GAME_OVER: 3,
        WIN: 4
    });

    game.gameState = game.GAME_STATE.TITLE;

    game.deltaTime = 0;
    game.lastTime = 0;

    game.player = undefined;
    game.level = undefined;

    // Public functions

    // Initialize game module!
    game.init = function(){
        // Init any special objects!
        /*this.player.init();
        this.level.init();*/
    };

    // Update objects
    game.update = function(){
        if(this.gameState == this.GAME_STATE.TITLE){
            if(app.userInput.mouseDown){
                this.gameState = this.GAME_STATE.GAMEPLAY;

                this.player.init();
                this.level.init();

                app.sound.BGM.play();
            }
        }
        else if(this.gameState == this.GAME_STATE.GAMEPLAY){
            // Update objects based on time and input!
            this.player.update();
        }
        else if(this.gameState == this.GAME_STATE.GAME_OVER){
            if(app.userInput.mouseDown){
                this.gameState = this.GAME_STATE.GAMEPLAY;

                this.player.init();
                this.level.init();

                app.sound.BGM.play();
            }
        }
        else if(this.gameState == this.GAME_STATE.WIN){
            if(app.userInput.mouseDown){
                this.gameState = this.GAME_STATE.TITLE;
            }
        }

        // Now that everything's been updated, add everything to the render queue!
        this.draw();

        // Update the delta-time!
        this.deltaTime = this.calculateDeltaTime();
    };

    // Private functions

    // Add all appropriate objects to the render queue!
    game.draw = function(){
        if(this.gameState == this.GAME_STATE.TITLE){
            app.main.graphics.addToRenderQueue({
                draw: function(ctx){
                    ctx.save();
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";

                    ctx.font = "80px Share Tech Mono, monospace";
                    ctx.fillText("The Trip of the Sentry", app.graphics.WIDTH / 2, 96);
                    
                    ctx.font = "32px Share Tech Mono, monospace";
                    //ctx.fillText("or,", app.graphics.WIDTH / 2, 160);

                    ctx.fillText("One day you were just guarding your post,", app.graphics.WIDTH / 2, 224);
                    ctx.fillText("a special chamber at the back of a temple.", app.graphics.WIDTH / 2, 260);
                    ctx.fillText("You made the mistake of taking a quick nap,", app.graphics.WIDTH / 2, 320);
                    ctx.fillText("and took a fall off what was left of the hallway.", app.graphics.WIDTH / 2, 356);
                    ctx.fillText("Now you get to travel the winding path back up.", app.graphics.WIDTH / 2, 416);
                    ctx.fillText("Oh, and it's laden with traps.", app.graphics.WIDTH / 2, 480);
                    ctx.fillText("Have fun!", app.graphics.WIDTH / 2, 544);

                    ctx.font = "64px Share Tech Mono, monospace";
                    ctx.fillText("Click the game to start!", app.graphics.WIDTH / 2, app.graphics.HEIGHT - 64);

                    ctx.restore();
                }
            });
        }
        else if(this.gameState == this.GAME_STATE.GAMEPLAY){
            app.main.graphics.addToRenderQueue({
                draw: function(ctx){
                    if(app.level.bg != undefined){
                        ctx.drawImage(app.level.bg, 0, 0);
                    }

                    if(app.level.overlay != undefined){
                        ctx.drawImage(app.level.overlay, 0, 0);
                    }
                }
            });

            app.main.graphics.addToRenderQueue(this.player);
            app.main.graphics.addToRenderQueue(this.level);
        }
        else if(this.gameState == this.GAME_STATE.GAME_OVER){
            app.main.graphics.addToRenderQueue({
                draw: function(ctx){
                    ctx.save();
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";

                    ctx.font = "128px Share Tech Mono, monospace";
                    ctx.fillText("Game Over!", app.graphics.WIDTH / 2, app.graphics.HEIGHT / 2);

                    //ctx.font = "32px Share Tech Mono, monospace";
                    //ctx.fillText("Looks like you won't be doing your job for a while.", app.graphics.WIDTH / 2, (app.graphics.HEIGHT / 2) + 64);
                    //ctx.fillText("Would've been nice if the ")

                    ctx.font = "64px Share Tech Mono, monospace";
                    ctx.fillText("Click the game to restart", app.graphics.WIDTH / 2, app.graphics.HEIGHT - 64);

                    ctx.restore();
                }
            });
        }
        else if(this.gameState == this.GAME_STATE.WIN){
            app.main.graphics.addToRenderQueue({
                draw: function(ctx){
                    ctx.save();
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";

                    ctx.font = "92px Share Tech Mono, monospace";
                    ctx.fillText("Congratulations!", app.graphics.WIDTH / 2, 128);

                    ctx.font = "32px Share Tech Mono, monospace";
                    ctx.fillText("You made it back to the temple in one piece!", app.graphics.WIDTH / 2, 256);
                    ctx.fillText("Now you can go back to doing your job!", app.graphics.WIDTH / 2, 320);
                    ctx.fillText("Though surely all of that jumping was quite tiring...", app.graphics.WIDTH / 2, 384);
                    ctx.fillText("Maybe you could use another nap? What could go wrong?", app.graphics.WIDTH / 2, 448);

                    ctx.fillText("Click the game to return to the menu", app.graphics.WIDTH / 2, app.graphics.HEIGHT - 64);

                    ctx.restore();
                }
            });
        }
    };

    game.calculateDeltaTime = function(){
        var now,fps;
        now = performance.now(); 
        fps = 1000 / (now - this.lastTime);
        fps = clamp(fps, 12, 60);
        this.lastTime = now; 
        return 1/fps;
    };

    // Return the ones that are public!
    return game;
}());