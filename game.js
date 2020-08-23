const canvas = document.getElementById("gameWindow");
const context = canvas.getContext("2d");

// Global game vars
let gameState = 0;
let frames = 0;
var health = 3;

// Load sprites
const birdSprite = new Image();
birdSprite.src = "img/BirdHero.png";

const birdPale1 = new Image();
birdPale1.src = "img/BirdHeroPale1.png";

const birdPale2 = new Image();
birdPale2.src = "img/BirdHeroPale2.png";

const birdPale3 = new Image();
birdPale3.src = "img/BirdHeroPale3.png";

const birdHeros = [
    birdPale3,
    birdPale2,
    birdPale1,
    birdSprite
];

const columnSpriteUp = new Image();
columnSpriteUp.src = "img/ColSpriteUp.png";

const columnSpriteDown = new Image();
columnSpriteDown.src = "img/ColSpriteDown.png";

const grassSprite = new Image();
grassSprite.src = "img/foreground.png";

const skySprite = new Image();
skySprite.src = "img/SkyTileSprite.png";

const bulletSprite = new Image();
bulletSprite.src = "img/bullet.png";

// Game States
const gameStates = {
    start : 0,
    play : 1,
    columnHit: 2,
    over : 3
}

// Bird
const birdy = {
    animation : [
        {sX: 3, sY: 9},
        {sX: 40, sY: 9},
        {sX: 78, sY: 9}
    ],
    x: 50,
    y: 150,
    w: 33,
    h: 19,
    r: 12,

    index: 0,
    period: 10,

    gravity: 0.2,
    speed: 0,
    force: 4.5,

    draw : function(){
        if(gameState != gameStates.over){
            let p = this.animation[this.index];

            context.drawImage(birdHeros[health], p.sX, p.sY, this.w, this.h,
                this.x-this.w/2, this.y-this.h/2, this.w, this.h);
        }else{
            let p = this.animation[2];
            
            context.drawImage(birdHeros[health], p.sX, p.sY, this.w, this.h,
                this.x-this.w/2, this.y, this.w, this.h);
        }
        
    },

    update: function(){
        //animation
        // start scene -> flap slow, game scene -> flap fast
        this.period = gameState == gameStates.play ? 10 : 20;
        // choose animation sequence
        this.index += frames%this.period == 0 ? 1 : 0;
        // change animation index
        this.index = this.index%(this.animation.length-1);

        if(gameState != gameStates.start){

            if(columns.columnHit == 0){
                this.speed += this.gravity;
                this.y += this.speed;
            }
            else{
                this.speed = 0;
            }

            if (this.y + this.h/2 >= canvas.height - fg.h){
                this.y = canvas.height - fg.h - this.h/2;
                gameState = gameStates.over;
            }
        }
        else {
            this.y = 150;
        }
    },

    fly: function(){
        if(columns.columnHit == 0) this.speed -= this.force;
    },

    reset : function(){
        this.speed = 0;
        health = 3;
    }

}

// Background
const bg = {
    sX: 0,
    sY: 0,
    w: 640,
    h: 320,
    x: 0,
    y: 80,

    moveX: 2,

    draw : function(){
        context.drawImage(skySprite, this.sX, this.sY, this.w, this.h,
            this.x, this.y, this.w, this.h);
    }
}

// Foreground
const fg = {
    sX: 0,
    sY: 0,
    w: 640,
    h: 84,
    x: 0,
    y: canvas.height-84,

    moveX: 2,
    moveXSlow: 0.75,

    draw : function(){
        context.drawImage(grassSprite, this.sX, this.sY, this.w, this.h,
            this.x, this.y, this.w, this.h);
        
        context.drawImage(grassSprite, this.sX, this.sY, this.w, this.h, 
            this.x + this.w, this.y, this.w, this.h);
    },

    update : function(){
        if(gameState == gameStates.play){
            let move = columns.columnHit == 0 ? this.moveX : this.moveXSlow;
            this.x = (this.x - move) % (this.w/2);
        }
    }  
}

// Columns
const columns = {
    sX: 21,
    sY: 0,
    w: 57,
    h: 400,

    gap: 100,
    moveX: 2,
    moveXSlow: 0.75,
    moveY: 0,

    columnHit: 0,

    positions: [],

    draw : function(){
        for(let i=0; i<this.positions.length; i++){
            let c = this.positions[i];
            
            // top column
            context.drawImage(columnSpriteUp, this.sX, this.sY, this.w, this.h,
                c.x, c.y, this.w, this.h);
            
            // bottom column
            context.drawImage(columnSpriteDown, this.sX, this.sY, this.w, this.h,
                c.x, c.y+this.h+this.gap, this.w, this.h);
        }
    },

    update : function(){
        if(gameState != gameStates.play ) return;

        if(frames%150 == 0){
            //Each 150 frame there will a pair of column

            // This columns might be horizontally shifted
            let boolMove = Math.round(Math.random());

            // If there columns are shifthing decide the direction
            if(boolMove == 1) {
                this.moveY = Math.round(Math.random()) == 1 ? 0.35 : -0.35;
            }
            
            this.positions.push({
                x: canvas.width,
                y: -150 * (Math.random() +1),
                hit: 0,
                move: {
                    isMove: boolMove,
                    moveY: this.moveY
                }
            });
        }

        for(let i=0; i<this.positions.length; i++){
            let c = this.positions[i];

            if(this.columnHit == 1){
                if(birdy.w + birdy.x > c.x + this.w + 5){
                    this.columnHit = 0;
                    if(frames%23 == 0) health--;
                    if(health < 0){
                        health = 0;
                        gameState = gameStates.over;
                        return;
                    }
                }
                else {
                    c.x -= this.moveXSlow;
                }
            }
            else{

                if(birdy.w/2 + birdy.x >= c.x && birdy.x - birdy.w/2 <= c.x + this.w
                    && birdy.y + birdy.h/2 >= c.y && birdy.y - birdy.h/2 <= c.y + this.h){
                    if(health == 0){
                        gameState = gameStates.over;
                        return;
                    }
                    this.columnHit = 1;
                    c.hit = 1;
                }
    
                let bottomColY = c.y + this.h + this.gap;
                if(birdy.w/2 + birdy.x >= c.x && birdy.x - birdy.w/2 <= c.x + this.w
                    && birdy.y + birdy.h/2 >= bottomColY && birdy.y - birdy.h/2 <= bottomColY + this.h){
                    if(health == 0){
                        gameState = gameStates.over;
                        return;
                    }
                    this.columnHit = 1; 
                    c.hit = 1; 
                }

                if(health < 0) gameState = gameStates.over;
                
                if(c.move.isMove == 1) {
                    c.y += c.move.moveY;
                }
    
                c.x -= this.moveX;

            }

            if(c.x + this.w <= 0){
                this.positions.shift();
                if(c.hit == 0) score.value++;
            }
        }

    },

    reset : function(){
        this.positions = [];
        this.columnHit = 0;
    }
}

const bullet = {
    sX: 10,
    sY: 17,
    w: 40,
    h: 25,
    x: canvas.width,
    y: 150,

    moveX: 4,

    bullets: [],

    draw : function(){
        for(let i=0; i<this.bullets.length; i++){
            let b = this.bullets[i];

            context.drawImage(bulletSprite, this.sX, this.sY, this.w, this.h,
                b.x, b.y, this.w, this.h);
        }
    },

    update : function(){
        if(gameState != gameStates.play) return;
        
        if(frames%240 == 0){
            this.bullets.push({
                x: canvas.width,
                y: Math.floor(Math.random() * (fg.y - this.h/2)) + this.h/2
            });
        }
    
        for(let i=0; i<this.bullets.length; i++){
            let b = this.bullets[i];

            if(birdy.r + birdy.x >= b.x && birdy.x - birdy.r <= b.x + this.w
                && birdy.y + birdy.r >= b.y && birdy.y - birdy.r <= b.y + this.h){
                columns.hit = 0;
                gameState = gameStates.over;    
            }

            b.x -= this.moveX;

            if(b.x + this.w <= 0){
                this.bullets.shift();
            }

        }
        
    },

    reset : function(){
        this.bullets = [];
    }

}

const score = {
    value: 0,
    text: "Score: ",

    draw : function(){
        context.fillStyle = "#FFF";
        context.strokeStyle = "#000";

        context.lineWidth = 2;
        context.font = "28px Luckiest Guy";
        context.fillText(this.text + this.value, canvas.width/2-50, (fg.y + fg.h/2));
        context.strokeText(this.text + this.value, canvas.width/2-50, (fg.y + fg.h/2));
    },

    reset: function(){
        this.value = 0;
    }
}

const startScene = {
    x1: canvas.width/2-150,
    y1: 50,
    text1: "Advanced Flappy Bird",
    
    x2: canvas.width/2-75,
    y2: 85,
    text2: "Flap to Start",

    draw : function(){
        if(gameState == gameStates.start){
            context.fillStyle = "#FFF";
            context.strokeStyle = "#000";

            context.lineWidth = 2;
            context.font = "28px Luckiest Guy";
            context.fillText(this.text1, this.x1, this.y1);
            context.strokeText(this.text1, this.x1, this.y1);

            context.font = "25px Luckiest Guy";
            context.fillText(this.text2, this.x2, this.y2);
            context.strokeText(this.text2, this.x2, this.y2);
        }
    }
}

const healthState = {
    sX: 3, 
    sY: 9,
    w: 33,
    h: 19,
    x: canvas.width - 55,
    y: canvas.height - 30,

    draw : function(){
        context.drawImage(birdHeros[health], this.sX, this.sY, this.w, this.h,
            this.x, this.y, this.w, this.h);

        context.fillStyle = "#FFF";
        context.strokeStyle = "#000";

        context.lineWidth = 2;
        context.font = "28px Luckiest Guy";
        context.fillText(health, this.x + this.w + 5, canvas.height - 10);
        context.strokeText(health, this.x + this.w + 5, canvas.height - 10);
    }

}

const gameOverScene = {
    x: 60,
    y: 120,
    w: 200,
    h: 120,

    overText: "Game Over",
    tX: 85,
    ty: 150,

    sboxX: 125,
    sboxY: 180,
    sboxW: 75,
    sboxH: 35,

    startText: "Start",
    t2X: 128,
    t2Y: 205,


    draw : function(){
        if(gameState == gameStates.over){
            context.beginPath();
            context.strokeStyle = "white";
            context.lineWidth = 4;
            context.rect(this.x, this.y, this.w, this.h);
            context.stroke();

            context.fillStyle = "#FFF";
            context.strokeStyle = "#000";

            context.lineWidth = 2;
            context.font = "28px Luckiest Guy";
            context.fillText(this.overText, this.tX, this.ty);
            context.strokeText(this.overText, this.tX, this.ty);

            context.beginPath();
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.rect(this.sboxX, this.sboxY, this.sboxW, this.sboxH);
            context.stroke();

            context.fillStyle = "#FFF";
            context.strokeStyle = "#000";
            context.font = "25px Luckiest Guy";
            context.fillText(this.startText, this.t2X, this.t2Y);
            context.strokeText(this.startText, this.t2X, this.t2Y);
        }
        
    }
}

canvas.addEventListener("click", function(event){
    switch (gameState){
        case gameStates.start:
            health = 3;
            gameState = gameStates.play;
            break;
        case gameStates.play:
            birdy.fly();
            break;
        case gameStates.over:
            let box = canvas.getBoundingClientRect();
            let xClick = event.clientX - box.left;
            let yClick = event.clientY - box.top;

            if(xClick >= gameOverScene.sboxX && xClick <= gameOverScene.sboxX + gameOverScene.sboxW &&
                yClick >= gameOverScene.sboxY && yClick <= gameOverScene.sboxY + gameOverScene.sboxH){
                score.reset();
                bullet.reset();
                columns.reset();
                birdy.reset();
                gameState = gameStates.start;
            }
            break;
    }
});

// Draw frame
function draw(){
    context.fillStyle = "#a2bac3";
    context.fillRect(0, 0, canvas.width, canvas.height);

    bg.draw();
    columns.draw();
    fg.draw();
    bullet.draw();
    birdy.draw();
    score.draw();
    startScene.draw();
    healthState.draw();
    gameOverScene.draw();
}

// Update frame
function update(){
    fg.update();
    birdy.update();
    columns.update();
    bullet.update();
}

// Game Loop
function loop(){
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}

loop();