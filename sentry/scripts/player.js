// player.js
// Contains data having to do with the player; a sub-module of app.game
// Written by Edward Opich
// Last modified 4/6/18

"use strict";

var app = app || {};

app.player = (function(){
    var player = new app.classes.GameObject();

    // Player-specific definitions
    player.arm = undefined;
    player.grounded = false;
    player.aimVector = new app.classes.Vector2();

    player.emitter = new app.Emitter();
    player.emitter.position = new app.classes.Vector2();
    player.emitter.velocity = new app.classes.Vector2();
    player.emitter.movementSpeed = 10;

    player.init = function(){
        this.x = 160;
        this.y = app.graphics.HEIGHT / 2;

        this.velocity = new app.classes.Vector2();

        this.direction = 1;

        this.bbox.x = 0;
        this.bbox.y = 0;
        this.bbox.w = 17;
        this.bbox.h = 32;

        // Init the player's bullet / emitter!
        this.emitter.clearParticles();

        this.emitter.numParticles = 50;
        this.emitter.useCircles = false;
        this.emitter.useSquares = true;
        this.emitter.red = 255;
        this.emitter.green = 128;
        this.emitter.minYspeed = -1;
        this.emitter.maxYspeed = 1;
        this.emitter.position.x = this.x + this.bbox.x + (this.bbox.w / 2);
        this.emitter.position.y = this.y + this.bbox.y + (this.bbox.h / 2);

        this.load();
    };

    player.load = function(){
        var transfer = function(images){
            this.image = images[0];
            this.arm = images[1];
            //console.log("loaded player");
        };

        loadImagesWithCallback(["media/player.png", "media/arm.png"], transfer.bind(this));
    };

    player.unload = function(){
        // TODO: Figure out how to deallocate images and other data!
    };

    player.draw = function(ctx){
        if(this.image == undefined || this.active == false){
            return;
        }

        ctx.save();

        ctx.translate(this.x, this.y);
        if(this.direction < 0)
        {
            ctx.translate(this.bbox.w, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

        ctx.translate(9, 18);
        var angle = Math.atan2(this.aimVector.y, this.aimVector.x);
        ctx.rotate(angle);
        ctx.drawImage(this.arm, -2, -4, this.arm.width, this.arm.height);

        ctx.restore();

        this.emitter.updateAndDraw(ctx, this.emitter.position, app.game.deltaTime);
    };

    player.update = function(){
        if(this.image == undefined || this.active == false){
            return;
        }

        // User Input!
        if(app.userInput.keysDown[app.userInput.KEYBOARD.KEY_A]){
            this.acceleration.x -= 0.5;
        }
        if (app.userInput.keysDown[app.userInput.KEYBOARD.KEY_D]){
            this.acceleration.x += 0.5;
        }

        // Jump!
        if(app.userInput.keysPressed[app.userInput.KEYBOARD.KEY_W]){
            if(this.grounded){
                this.acceleration.y -= 16;

                app.sound.SFX.jump.play();
            }
        }

        // Update the aim vector!
        this.aimVector.x = app.userInput.mouse.x - (this.x + this.bbox.x + (this.bbox.w / 2));
        this.aimVector.y = app.userInput.mouse.y - (this.y + this.bbox.y + (this.bbox.h / 2))

        // Shoot!
        if(app.userInput.mouseDown){
            this.emitter.velocity.x = this.aimVector.x;
            this.emitter.velocity.y = this.aimVector.y;

            this.emitter.velocity.x /= (this.aimVector.magnitude() / this.emitter.movementSpeed);
            this.emitter.velocity.y /= (this.aimVector.magnitude() / this.emitter.movementSpeed);

            this.emitter.position.x = this.x + this.bbox.x + (this.bbox.w / 2);
            this.emitter.position.y = this.y + this.bbox.y + (this.bbox.h / 2);

            // TODO: Fix this (and the other related) hacky garbage!
            this.emitter.numParticles = 50;

            this.emitter.createParticles(this.emitter.position);

            app.sound.SFX.shoot.play();
        }

        // Mouselook!
        if(this.aimVector.x < 0){
            this.direction = -1;
            this.aimVector.x = -this.aimVector.x;
        }
        else{
            this.direction = 1;
        }

        // Calculate physics!

        // Apply gravity to our current acceleration
        this.acceleration.add(this.gravity);

        // Apply friction
        if(this.velocity.x > 0){
            this.velocity.x += this.friction;
            if(this.velocity.x < 0){
                this.velocity.x = 0;
            }
        }
        else if(this.velocity.x < 0){
            this.velocity.x -= this.friction;
            if(this.velocity.x > 0){
                this.velocity.x = 0;
            }
        }

        // Add acceleration to velocity
        this.velocity.add(this.acceleration);

        // Clamp our velocity to the max values!
        if(this.velocity.x > this.maxVelocity.x){
            this.velocity.x = this.maxVelocity.x;
        }
        else if(this.velocity.x < -this.maxVelocity.x){
            this.velocity.x = -this.maxVelocity.x;
        }
        if(this.velocity.y > this.maxVelocity.y){
            this.velocity.y = this.maxVelocity.y;
        }
        else if(this.velocity.y < -this.maxVelocity.y){
            this.velocity.y = -this.maxVelocity.y;
        }

        // Tile collision detection!
        this.grounded = false;
        if(app.level.loaded){

            // Which rows of tiles are located at the player's projected top and bottom?
            var topIndex = Math.floor((this.y + this.bbox.y + this.velocity.y) / 32) + 1;
            var bottomIndex = Math.floor((this.y + this.bbox.y + this.bbox.h + this.velocity.y) / 32) + 1;

            // Detect ceilings and floors!
            for(var i = Math.floor((this.x + this.bbox.x + this.velocity.x + 1) / 32) + 1;
            i < Math.floor((this.x + this.bbox.x + this.bbox.w + this.velocity.x - 1) / 32) + 2;
            i++){
                // Make sure we don't check out-of-bounds!
                if(i < 0){
                    continue;
                }
                else if(i >= app.level.tileLayout[0].length){
                    break;
                }

                // Ceilings
                if(this.velocity.y < 0 && topIndex >= 0 && topIndex < app.level.tileLayout.length){
                    if(app.level.tileLayout[topIndex][i] != 0){
                        this.velocity.y = 0;

                        if(this.acceleration.y < 0){
                            this.acceleration.y = 0;
                        }

                        this.y = (topIndex * 32) + (this.bbox.y);

                        // We hit a spike!
                        /*if(app.level.tileLayout[topIndex][i] == 2){
                            app.game.gameState = app.game.GAME_STATE.GAME_OVER;

                            app.sound.BGM.pause();
                            app.sound.BGM.currentTime = 0;

                            this.active = false;
                        }*/

                        if(app.level.tileLayout[topIndex][i] == 3){
                            app.game.gameState = app.game.GAME_STATE.WIN;

                            app.sound.BGM.pause();
                            app.sound.BGM.currentTime = 0;

                            this.active = false;
                        }
                    }
                }

                // Floors
                if(this.velocity.y > 0 && bottomIndex >= 0 && bottomIndex < app.level.tileLayout.length){
                    if(app.level.tileLayout[bottomIndex][i] != 0){
                        // We hit a spike!
                        if(app.level.tileLayout[bottomIndex][i] == 2){
                            app.game.gameState = app.game.GAME_STATE.GAME_OVER;

                            app.sound.BGM.pause();
                            app.sound.BGM.currentTime = 0;

                            this.active = false;
                        }

                        // We hit the goal!
                        else if(app.level.tileLayout[bottomIndex][i] == 3){
                            app.game.gameState = app.game.GAME_STATE.WIN;

                            app.sound.BGM.pause();
                            app.sound.BGM.currentTime = 0;

                            this.active = false;
                        }

                        this.velocity.y = 0;

                        if(this.acceleration.y > 0){
                            this.acceleration.y = 0;
                        }

                        this.y = ((bottomIndex - 1) * 32) - (this.bbox.y + this.bbox.h);

                        this.grounded = true;
                    }
                }
            }

            // Which columns of tiles are located at the player's projected left and right?
            var leftIndex = Math.floor((this.x + this.bbox.x + this.velocity.x) / 32) + 1;
            var rightIndex = Math.floor((this.x + this.bbox.x + this.bbox.w + this.velocity.x) / 32) + 1;

            // Detect walls!
            for(var i = Math.floor((this.y + this.bbox.y + this.velocity.y + 1) / 32) + 1;
            i < Math.floor((this.y + this.bbox.y + this.bbox.h + this.velocity.y - 1) / 32) + 2;
            i++){
                // Make sure we don't check out-of-bounds!
                if(i < 0){
                    continue;
                }
                else if(i >= app.level.tileLayout.length){
                    break;
                }

                // Left walls
                if(this.velocity.x < 0 && leftIndex >= 0 && leftIndex < app.level.tileLayout[0].length){
                    if(app.level.tileLayout[i][leftIndex] != 0){
                        this.velocity.x = 0;
                        
                        if(this.acceleration.x < 0){
                            this.acceleration.x = 0;
                        }

                        this.x = (leftIndex * 32) - (this.bbox.x);

                        // We hit a spike!
                        /*if(app.level.tileLayout[i][leftIndex] == 2){
                            app.game.gameState = app.game.GAME_STATE.GAME_OVER;

                            app.sound.BGM.pause();
                            app.sound.BGM.currentTime = 0;

                            this.active = false;
                        }*/

                        // We hit the goal!
                        if(app.level.tileLayout[i][leftIndex] == 3){
                            app.game.gameState = app.game.GAME_STATE.WIN;

                            app.sound.BGM.pause();
                            app.sound.BGM.currentTime = 0;

                            this.active = false;
                        }
                    }
                }

                // Right walls
                if(this.velocity.x > 0 && rightIndex >= 0 && rightIndex < app.level.tileLayout[0].length){
                    if(app.level.tileLayout[i][rightIndex] != 0){
                        this.velocity.x = 0;

                        if(this.acceleration.x > 0){
                            this.acceleration.x = 0;
                        }

                        this.x = ((rightIndex - 1) * 32) - (this.bbox.x + this.bbox.w);

                        // We hit a spike!
                        /*if(app.level.tileLayout[i][rightIndex] == 2){
                            app.game.gameState = app.game.GAME_STATE.GAME_OVER;

                            app.sound.BGM.pause();
                            app.sound.BGM.currentTime = 0;

                            this.active = false;
                        }*/

                        // We hit the goal!
                        if(app.level.tileLayout[i][rightIndex] == 3){
                            app.game.gameState = app.game.GAME_STATE.WIN;

                            app.sound.BGM.pause();
                            app.sound.BGM.currentTime = 0;

                            this.active = false;
                        }
                    }
                }
            }

            // Lastly, did our bullet hit anything?
            // TODO: Fix this hacky garbage!
            if(this.emitter.position.y < 0
                || this.emitter.position.y >= app.graphics.HEIGHT
                || this.emitter.position.x < 0
                || this.emitter.position.x >= app.graphics.WIDTH){
                    this.emitter.numParticles = 0;
                }

            else if(app.level.tileLayout[Math.floor(this.emitter.position.y / 32) + 1][Math.floor(this.emitter.position.x / 32) + 1] != 0){
                this.emitter.numParticles = 0;
            }
        }

        // Add our velocity to our position
        //this.velocity.x *= (app.game.deltaTime * 1);
        //this.velocity.y *= (app.game.deltaTime * 1);
        this.position.add(this.velocity);

        // Update our emitter's position!
        //this.emitter.velocity.x *= (app.game.deltaTime * 1);
        //this.emitter.velocity.y *= (app.game.deltaTime * 1);
        this.emitter.position.add(this.emitter.velocity);

        // Set our acceleration to 0!
        this.acceleration = new app.classes.Vector2();

        // Detect screen change!
        if(this.x + this.bbox.x + 1 >= app.graphics.WIDTH){
            this.x = 0 - (this.bbox.x + this.bbox.w - 1);

            //app.level.unload();

            app.level.col++;

            app.level.load();

            this.emitter.clearParticles();

            this.active = false;
        }

        else if(this.x + this.bbox.x + this.bbox.w - 1 < 0){
            this.x = app.graphics.WIDTH - (this.bbox.x + 1);

            //app.level.unload();

            app.level.col--;

            app.level.load();

            this.emitter.clearParticles();

            this.active = false;
        }

        if(this.y + this.bbox.y + 1 >= app.graphics.HEIGHT){
            this.y = 0 - (this.bbox.y + this.bbox.h - 1);

            //app.level.unload();

            app.level.row++;

            app.level.load();

            this.emitter.clearParticles();

            this.active = false;
        }

        else if(this.y + this.bbox.y + this.bbox.h - 1 < 0){
            this.y = app.graphics.HEIGHT - (this.bbox.y + 1);

            //app.level.unload();

            app.level.row--;

            app.level.load();

            this.emitter.clearParticles();

            this.active = false;
        }
    };

    return Object.seal(player);
}());