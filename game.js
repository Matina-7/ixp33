const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Images
const catImg = new Image();
catImg.src = 'assets/images/image1.png';
const monsterImg = new Image();
monsterImg.src = 'assets/images/image2.png';
const coinImg = new Image();
coinImg.src = 'assets/images/image3.png';

// Game variables
let keys = {};
let coinsCollected = 0;
const totalCoins = 7;

let cat = {
    x: 50,
    y: 300,
    width: 50,
    height: 50,
    vy: 0,
    speed: 3,
    jumpForce: 10,
    onGround: true,
    doubleJumpUsed: false
};

let gravity = 0.5;

// Background scroll
let bgOffset = 0;

// Platforms, monsters, coins
let platforms = [];
let monsters = [];
let coins = [];

// Map generation
const mapLength = 2000; // long map in pixels

// Generate platforms (8)
platforms = [
    {x:150,y:250,width:60,height:10},
    {x:300,y:220,width:60,height:10},
    {x:450,y:250,width:60,height:10},
    {x:600,y:200,width:60,height:10},
    {x:750,y:250,width:60,height:10},
    {x:900,y:230,width:60,height:10},
    {x:1050,y:250,width:60,height:10},
    {x:1200,y:220,width:60,height:10}
];

// Generate monsters (7)
monsters = [
    {x:400,y:320,width:50,height:50},
    {x:600,y:320,width:50,height:50},
    {x:800,y:320,width:50,height:50},
    {x:1000,y:320,width:50,height:50},
    {x:1200,y:320,width:50,height:50},
    {x:1400,y:320,width:50,height:50},
    {x:1600,y:320,width:50,height:50}
];

// Generate coins (10)
coins = [
    {x:200,y:200,width:30,height:30,collected:false},
    {x:350,y:150,width:30,height:30,collected:false},
    {x:500,y:220,width:30,height:30,collected:false},
    {x:650,y:180,width:30,height:30,collected:false},
    {x:800,y:200,width:30,height:30,collected:false},
    {x:950,y:150,width:30,height:30,collected:false},
    {x:1100,y:220,width:30,height:30,collected:false},
    {x:1250,y:180,width:30,height:30,collected:false},
    {x:1400,y:200,width:30,height:30,collected:false},
    {x:1550,y:150,width:30,height:30,collected:false}
];

// Keyboard input
document.addEventListener('keydown', e=>{keys[e.key.toLowerCase()]=true;});
document.addEventListener('keyup', e=>{keys[e.key.toLowerCase()]=false;});

// Narrative points
let narrativePoints = [{x:400,triggered:false},{x:1000,triggered:false},{x:1500,triggered:false}];

let animationFrame;
function update(){
    // Horizontal movement
    if(keys['a']) cat.x -= cat.speed;
    if(keys['d']) cat.x += cat.speed;

    // Jump
    if(keys['w']){
        if(cat.onGround){
            cat.vy = -cat.jumpForce;
            cat.onGround = false;
        } else if(!cat.doubleJumpUsed){
            cat.vy = -cat.jumpForce;
            cat.doubleJumpUsed = true;
        }
    }

    // Gravity
    cat.vy += gravity;
    cat.y += cat.vy;

    // Ground collision
    if(cat.y + cat.height >= canvasHeight){
        cat.y = canvasHeight - cat.height;
        cat.vy = 0;
        cat.onGround = true;
        cat.doubleJumpUsed = false;
    }

    // Platform collision
    platforms.forEach(p=>{
        if(cat.x + cat.width > p.x && cat.x < p.x + p.width &&
           cat.y + cat.height > p.y && cat.y + cat.height < p.y + p.height + 10 && cat.vy>=0){
            cat.y = p.y - cat.height;
            cat.vy = 0;
            cat.onGround = true;
            cat.doubleJumpUsed = false;
        }
    });

    // Coin collection
    coins.forEach(c=>{
        if(!c.collected && cat.x+cat.width>c.x && cat.x<c.x+c.width &&
           cat.y+cat.height>c.y && cat.y<c.y+c.height){
            c.collected = true;
            coinsCollected++;
            document.getElementById('coins').innerText = `Coins: ${coinsCollected} / 7`;
        }
    });

    // Monster collision → restart
    monsters.forEach(m=>{
        if(cat.x + cat.width > m.x && cat.x < m.x + m.width &&
           cat.y + cat.height > m.y && cat.y < m.y + m.height){
            alert('Hit a monster! Restarting...');
            location.reload();
        }
    });

    // Check win
    if(coinsCollected>=7 && cat.x>mapLength-200){
        alert('You win! Thanks for playing!');
        location.reload();
    }

    // Scroll background
    bgOffset -= cat.speed;
    if(bgOffset <= -canvasWidth) bgOffset = 0;

    // Check narrative
    checkNarrative();
}

function draw(){
    ctx.clearRect(0,0,canvasWidth,canvasHeight);

    // Background red bricks
    for(let i=0;i<=canvasWidth/50+2;i++){
        for(let j=0;j<=canvasHeight/50;j++){
            ctx.fillStyle="#c0392b";
            ctx.fillRect(i*50+bgOffset,j*50,48,48);
        }
    }

    // Platforms
    ctx.fillStyle="#8e44ad";
    platforms.forEach(p=>ctx.fillRect(p.x-bgOffset,p.y,p.width,p.height));

    // Monsters
    monsters.forEach(m=>ctx.drawImage(monsterImg,m.x-bgOffset,m.y,m.width,m.height));

    // Coins
    coins.forEach(c=>{if(!c.collected) ctx.drawImage(coinImg,c.x-bgOffset,c.y,c.width,c.height);});

    // Cat
    ctx.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);
}

function gameLoop(){
    update();
    draw();
    animationFrame = requestAnimationFrame(gameLoop);
}
gameLoop();

// Narrative interaction
function checkNarrative(){
    narrativePoints.forEach(p=>{
        if(!p.triggered && cat.x > p.x){
            p.triggered = true;
            showDialog();
        }
    });
}

function showDialog(){
    cancelAnimationFrame(animationFrame); // pause
    const dialogBox = document.getElementById('dialogBox');
    const dialogText = document.getElementById('dialogText');
    const optionsDiv = document.getElementById('options');

    dialogText.innerText = "You found a box! Which item will you use?";
    optionsDiv.innerHTML = `
        <button onclick="applyItem('spring')">Spring (+Jump)</button>
        <button onclick="applyItem('fish')">Fish (+Speed)</button>
        <button onclick="applyItem('balloon')">Balloon (slow fall)</button>
    `;
    dialogBox.style.display = 'block';
}

function applyItem(item){
    const dialogBox = document.getElementById('dialogBox');
    dialogBox.style.display = 'none';

    if(item==='spring'){
        cat.jumpForce *= 1.8;
        setTimeout(()=>{cat.jumpForce/=1.8},5000);
    } else if(item==='fish'){
        cat.speed *= 1.4;
        setTimeout(()=>{cat.speed/=1.4},5000);
    } else if(item==='balloon'){
        gravity = 0.2;
        setTimeout(()=>{gravity=0.5},5000);
    }

    gameLoop(); // resume
}
