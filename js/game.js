const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d')
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;


// Step 1: Create an audio object
const backgroundMusic = new Audio('sounds/Sephirod - Last Christmas.mp3');

// Step 2: Set the audio to loop (optional)
backgroundMusic.loop = true;


const cursorImage = new Image();
    cursorImage.src = 'images/targeted.png'; // Replace with the path to your image


    let mouseX = 0;
    let mouseY = 0;

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

let score = 0;
let gameStartTime;
const gameDuration = 10000; // Game duration in milliseconds (e.g., 60,000 ms = 60 seconds)
let gameOver = false;
ctx.font = '50px Impact'


let timeToNextEnemy = 0;
let enemyInterval = 2000; //enemies start coming too slow, must solve that
let lastTime = 0;


let enemies = [];
class Enemy {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier
        this.height = this.spriteHeight * this.sizeModifier
        this.x = canvas.width + Math.random() * 100;  // Starting slightly off-screen to the right
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 2 + 1;  // Slower speed (1 to 3 units per frame)
        this.directionY = Math.random() * 2 - 1;  // Smaller vertical movement
        this.markedForDeletion = false;
        this.image = new Image();
        this.frame = 0;
        this.maxFrame = 0;
        this.timeSinceFlap = 0;
        this.timeInterval = Math.random() * 500 + 500;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
    

    }

    update(deltaTime) {

        console.log(`Enemy X Position: ${this.x}, Width: ${this.width}, DirectionX: ${this.directionX}`);


        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY *= -1;
        }
   
        this.x -= this.directionX; // Move left
        this.y += this.directionY; // Move vertically
        this.timeSinceFlap += deltaTime;


        if (this.timeSinceFlap > this.timeInterval) {
            this.frame = (this.frame + 1) % (this.maxFrame + 1);
            this.timeSinceFlap = 0;
        }
        if (this.x < 0 - this.width) {
            this.markedForDeletion = true;
          
        }
  
    }

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }

}
class Harry extends Enemy {
    constructor(enemy){
        super();
        this.enemy = enemy;
        this.image = document.getElementById('harry')
        
    }


}

class Marv extends Enemy {
    constructor(enemy){
        super();
        this.enemy = enemy;
        this.image = document.getElementById('marv')
    }


}

class Hans extends Enemy {
    constructor(enemy){
        super();
        this.enemy = enemy;
        this.image = document.getElementById('hans')
    }


}

class Boss extends Enemy {
    constructor(enemy){
        super();
        this.enemy = enemy;
        this.image = document.getElementById('boss')
    }


}


let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = '/images/boom.png'
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = '/sounds/boom.wav';
        this.timeSinceLastFrame = 0;
        this.timeInterval = 200;
        this.markedForDeletion = false;

    }

    update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime
        if (this.timeSinceLastFrame > this.timeInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.frame > 5) this.markedForDeletion = true;
        }
    }

        draw(){
            ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
        }
    
}

function drawScore() { 
    ctx.fillStyle = 'red';
    ctx.fillText('Score: ' + score, 55, 80)
}

function drawCountdownTimer(remainingTime) {
    ctx.fillStyle = 'black';
    ctx.font = '30px Impact';
    const seconds = Math.floor(remainingTime / 1000);
    const milliseconds = Math.floor(remainingTime % 1000 / 10);
    ctx.fillText(`Time Remaining: ${seconds}.${milliseconds} s`, 50, 50);
}


function drawGameOver(){
 
    ctx.fillStyle = 'black'
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2 );
    ctx.fillStyle = 'red'
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2+5, canvas.height/2+5 );
    console.log('game over ' + score);

     // Stop the background music
     backgroundMusic.pause();
     backgroundMusic.currentTime = 0; // Rewind the music to the start if you play it again later
}



window.addEventListener('click', function (e) {
    console.log(e.x, e.y)
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1) //detect collision by color
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    enemies.forEach(element => {
        if (element.randomColors[0] === pc[0] && element.randomColors[1] === pc[1] && element.randomColors[2] === pc[2]) {
            element.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(element.x, element.y, element.width))
            console.log(explosions);

        }
    })
})

function startGame() {
    gameStartTime = performance.now(); // Use performance.now() for high-resolution time
    playMusic(); // Start the music when the game starts//
    animate(0);
}


function playMusic() {
    backgroundMusic.play().catch(error => {
        console.error('Error playing the background music:', error);
    });
}



function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

      // Check if the game time is up
      const elapsedTime = timestamp - gameStartTime;
      if (elapsedTime > gameDuration) {
          gameOver = true;
           
      }
     

      const remainingTime = Math.max(0, gameDuration - elapsedTime);     // Calculate elapsed and remaining time
   

     

    timeToNextEnemy += deltaTime;
        if (timeToNextEnemy > enemyInterval) {
            enemies.push(new Enemy());
            enemies.push(new Marv());
            enemies.push(new Harry());
            enemies.push(new Hans());
            enemies.push(new Boss());
            timeToNextEnemy = 0;
        

            enemies.sort((a, b) => a.width - b.width);

     
    }


    drawScore();
    drawCountdownTimer(remainingTime); // Draw the countdown timer
    [...enemies, ...explosions].forEach(element => element.update(deltaTime));
    [...enemies, ...explosions].forEach(element => element.draw());
    enemies = enemies.filter(element => !element.markedForDeletion);
    explosions = explosions.filter(element => !element.markedForDeletion);

   // Draw the image at the mouse position
ctx.drawImage(cursorImage, mouseX - cursorImage.width / 2, mouseY - cursorImage.height / 2);

    if (!gameOver) {requestAnimationFrame(animate)}
    else {drawGameOver()}


}


animate(0);
startGame();