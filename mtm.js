/*
 * Man the Meat game
 *
 */




///// multi browser support hacks
const requestAnimationFrame =
        window.requestAnimationFrame||
        window.webkitRequestAnimationFrame||
        window.mozRequestAnimationFrame||
        window.oRequestAnimationFrame||
        window.msRequestAnimationFrame;

const cancelRAF =
        window.cancelAnimationFrame||
        window.webkitCancelAnimationFrame||
        window.mozCancelAnimationFrame||
        window.msCancelAnimationFrame ;
/////




////////// start of web audio

//------------------
// Sound identifiers
//------------------
var i = 0;
const SO_INTRO      = i++;
const SO_THEME      = i++;
const SO_MTM        = i++;
const SO_RAR        = i++;
const SO_MED        = i++;
const SO_WEL        = i++;
const SO_NIC        = i++;
const SO_DEL        = i++;
const SO_DIS        = i++;
const SO_SIZZLE     = i++;
const SO_FLIPON     = i++;
const SO_FLIPOFF    = i++;
const SO_EAT1       = i++;
const SO_EAT2       = i++;
const SO_EAT3       = i++;
const SO_ENTER      = i++;
const SO_EXIT       = i++;


const NUM_SOUNDS    = i;
const WA_MUSIC = 0;
const WA_SOUND = 1;

//------------------
// Global Variables
//------------------
let soundContext = null;
if(window.AudioContext) {
    soundContext = new AudioContext();
}


let soundVolume = null;
let musicVolume = null;
if(window.AudioContext) {
    soundVolume = soundContext.createGain();
    soundVolume.connect(soundContext.destination);
    musicVolume = soundContext.createGain();
    musicVolume.connect(soundContext.destination);
}


// The array of loaded sounds
let waSounds = [];

let waMuted = false;
const soundDir = "./res/";

let soundSystemAllowed = false;//sigh new browsers not letting sound start before user interaction make this even more complicated
function soundPermissionCheck(e) {
    if(!soundSystemAllowed && soundContext) {
        soundContext.resume();
        window.onmouseup = null;
        initGame();
    }
}

function LoadSounds()
{
    waSounds[SO_INTRO] = new WASound("Alpha_Brutal_-_02_-_Blue_Cats.ogg", WA_MUSIC);
    waSounds[SO_THEME] = new WASound("Alpha_Brutal_-_06_-_EPIC_SONG.ogg", WA_MUSIC);

    waSounds[SO_MTM] = new WASound("manthemeat.ogg", WA_SOUND);
    waSounds[SO_RAR] = new WASound("rare.mp3", WA_SOUND);
    waSounds[SO_MED] = new WASound("medium.mp3", WA_SOUND);
    waSounds[SO_WEL] = new WASound("welldone.mp3", WA_SOUND);
    waSounds[SO_NIC] = new WASound("nice.mp3", WA_SOUND);
    waSounds[SO_DEL] = new WASound("delicious.mp3", WA_SOUND);
    waSounds[SO_DIS] = new WASound("disgusting.mp3", WA_SOUND);

    waSounds[SO_FLIPON] = new WASound("flipon.ogg", WA_SOUND);
    waSounds[SO_FLIPOFF] = new WASound("flipoff.ogg", WA_SOUND);

    waSounds[SO_EAT1] = new WASound("eat.ogg", WA_SOUND);
    waSounds[SO_EAT2] = new WASound("eat.ogg", WA_SOUND);
    waSounds[SO_EAT3] = new WASound("eat.ogg", WA_SOUND);

    waSounds[SO_ENTER] = new WASound("enter.ogg", WA_SOUND);
    waSounds[SO_EXIT] = new WASound("exit.ogg", WA_SOUND);

    waSounds[SO_SIZZLE] = new WASound("sizzle.ogg", WA_SOUND);
    waSounds[SO_SIZZLE].loop = true;
    waSounds[SO_SIZZLE].loopStart = 8;
    waSounds[SO_SIZZLE].loopEnd = 16;
}


function PlayGameSound(nSound,when=0)
{
    if(waSounds && waSounds[nSound])
        waSounds[nSound].play(when);
}


function StopGameSound(nSound)
{
    if(waSounds && waSounds[nSound])
        waSounds[nSound].stop();
}


function UnloadSounds()
{
}


//WASound class
function WASound(filename, type)
{
    this.source = soundDir + filename;
    this.loadSoundFile(this.source);
    this.type = type;
    this.loop = false;
    this.loopStart = -1;
    this.loopEnd = -1;
};


WASound.prototype.play = function(when=0) {
    this.stop();//only one copy of a sound play at a time.
    this.s = soundContext.createBufferSource();
    this.s.buffer = this.buffer;


    if(this.type === WA_MUSIC) {
        this.s.connect(musicVolume);
        this.loop = true;
    } else {
        this.s.connect(soundVolume);
    }
   
     if(this.loop) {
        this.s.loop = true;
        if(this.loopStart != -1) this.s.loopStart = this.loopStart;
        if(this.loopEnd != -1) this.s.loopEnd = this.loopEnd;;
     }

    //is this clean up function even necessary?
    this.s.onended = function(){
        this.disconnect(0);
    };

    this.s.start(soundContext.currentTime + when);
}


WASound.prototype.stop = function() {
    if(this.s) this.s.stop();
}


let numLoadedSounds = 0;
WASound.prototype.loadSoundFile = function(url) {
    let object = this;
    let request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
        soundContext.decodeAudioData(
            request.response,
            function(buffer) {
                object.buffer = buffer;
                if (++numLoadedSounds >= NUM_SOUNDS){
                    if(soundSystemAllowed) {
                        initGame();
                    }else{
                        window.onmouseup = soundPermissionCheck;
                        initLoadedCanvas();
                    }
                }
            },
            function(error) {
                console.log("sound load error");
            }
        );
    }
    request.send();
}
////////// end of web audio




var i = 0;
//game states
const GS_INTRO              = i++;
const GS_START_SCREEN       = i++;
const GS_STAGE_START_SCREEN = i++;
const GS_RESTAURANT_OPEN    = i++;
const GS_STAGE_SCORE        = i++;
const GS_LOSE               = i++;
const GS_WIN                = i++;
const GS_HIGHSCORE          = i++;


const skinColors = [
    //"#00ff00",
    //http://www.collectedwebs.com/art/colors/skin_tones/
    "#FFDFC4","#F0D5BE","#EECEB3","#E1B899","#E5C298","#FFDCB2","#E5B887","#E5A073","#E79E6D","#DB9065","#CE967C","#C67856","#BA6C49","#A57257","#F0C8C9","#DDA8A0","#B97C6D","#A8756C","#AD6452","#5C3836","#CB8442","#BD723C","#704139","#A3866A","#870400","#710101","#430000","#5B0001","#302E2E","#201a1a",

    //https://www.pinterest.com/pin/443886107015923911/
    "#2d221e","#3c2e28","#4b3932","#5a453c","#695046","#785c50","#87675a","#967264","#a57e6e","#b48a78","#c39582","#d2a18c","#e1ac96","#f0b8a0","#ffc3aa","#ffceb4","#ffdabe","#ffe5c8",

    //Light Skin Color Color Palette http://www.color-hex.com/color-palette/37589
    "#f6e6d9","#ffd5be","#f6cfaf","#dbbb9a","#cea57b",

    //Reddish skin colors Color Palette http://www.color-hex.com/color-palette/37835
    "#ffddd6","#fdd6c8","#f5b0a0","#eca193","#de8a78",

    //Darker Skin Color Color Palette http://www.color-hex.com/color-palette/37587
    "#c5845c","#a37444","#60371a","#593b2b","#3c2e28",

    //Human Skins Color Palette http://www.color-hex.com/color-palette/47177
    "#ffd1ab","#dfa26f","#b3723d","#854917","#522500",

    //Tones Skin Tones Color Palette http://www.color-hex.com/color-palette/49264
    "#f2c48a","#e1a567","#d68f47","#b87734","#a16722",

    //"#0000ff"
];


// the complicated way.
class MTMStage {
    constructor(minScore, numCust, range, cookSpeed, hintT, sDelic, sNice, sClear, sPerfect) {
            this.minScore = minScore;       // minimum score needed to advance to next stage.
            this.numCust = numCust;         // number of customers to serve.
            this.range = range;             // how close to target doneness customers demand.
            this.cookSpeed = cookSpeed;
            this.hintT = hintT;             // time to show target doneness
            this.sDelic = sDelic;
            this.sNice = sNice;
            this.sClear = sClear;
            this.sPerfect = sPerfect;
            this.score = 0;
    }
}


// !!! needs balancing of doneness range
const stages = [
    new MTMStage(2000,   6, 125, 1,   30000,  800,  400, 1000, 2000),
    new MTMStage(6800,   9,  75, 1.75, 5000, 1800,  800, 5000, 7000),// perfect score might not be same as in game
    new MTMStage(24000, 12,  50, 2,    1000, 4000, 2000, 8000, 10000),
];


//SPRITE INDEX
let SP_MAN_NUM = 0;
const SP_MAN_WIDTH = 150;
const SP_MAN_HEIGHT = 175;
const SP_MAN_WALK_S = SP_MAN_NUM++;
const SP_MAN_WALK_R = SP_MAN_NUM++;
const SP_MAN_WALK_L = SP_MAN_NUM++;
const SP_MAN_SIT_D = SP_MAN_NUM++;
const SP_MAN_SIT_U = SP_MAN_NUM++;
const SP_MAN_EAT_D = SP_MAN_NUM++;
const SP_MAN_EAT_U = SP_MAN_NUM++;
const SP_MAN_NICE = SP_MAN_NUM++;
const SP_MAN_DELI = SP_MAN_NUM++;
const SP_MAN_DIS1 = SP_MAN_NUM++;
const SP_MAN_DIS2 = SP_MAN_NUM++;
const SP_MAN_DIS3 = SP_MAN_NUM++;
const SP_MAN_FORK = SP_MAN_NUM++;

let SP_CHEF_NUM = 0;
const SP_CHEF_WIDTH = 175;
const SP_CHEF_HEIGHT = 200;
const SP_CHEF_FRIDGE = SP_CHEF_NUM++;
const SP_CHEF_D = SP_CHEF_NUM++;
const SP_CHEF_H = SP_CHEF_NUM++;
const SP_CHEF_U = SP_CHEF_NUM++;
const SP_CHEF_FORK = SP_CHEF_NUM++;
const SP_CHEF_MEAT = SP_CHEF_NUM++;

let SP_HEAD_NUM = 0;
const SP_HEAD_WIDTH = 75;
const SP_HEAD_HEIGHT = 50;
const SP_HEAD_DELIC = SP_HEAD_NUM++;
const SP_HEAD_NICE = SP_HEAD_NUM++;
const SP_HEAD_DISG = SP_HEAD_NUM++;



//ACTOR STATE
var i = 0;
const AS_NONE = i++;// don't draw / doesn't exist
const AS_CHEF_WAIT = i++;// spatula down - waiting for customer
const AS_CHEF_PREP = i++;// fridge,meat throw,D
const AS_CHEF_GRILL = i++;// spatula down - grilling
const AS_CHEF_SERVE = i++;//D,H,U, cooked meat flying
const AS_CHEF_FORK = i++;//D,F

const AS_CUST_ENTER = i++;
const AS_CUST_EXIT = i++;
const AS_CUST_WAIT = i++;
const AS_CUST_ORDER = i++;
const AS_CUST_EAT = i++;
const AS_CUST_NICE = i++;
const AS_CUST_DELI = i++;
const AS_CUST_DISGUST = i++;

const AS_MEAT_GRILL = i++;
const AS_MEAT_SERVE = i++;
const AS_MEAT_EAT = i++;


//MEAT STATE
var i = 0;
const MEAT_RAW = i++;
const MEAT_RARE = i++;
const MEAT_MED = i++;
const MEAT_WELL = i++;
const MEAT_BURN = i++;



/////customer variables
let customerState = AS_NONE;
let customerActionTime = 0;
const customerEatTime = 1500;
const customerNiceTime = 1000;
const customerDeliTime = 1000;
const customerDisgustTime = 1000;
var customerDoneness = 0; // target doneness
/////
const forkFlightTime = 300;


/////chef variables
let chefState = AS_NONE;
let chefActionTime = 0;

const chefFridgeTime = 500;
const chefTossTime = 500;
const chefServeTime = 250;
const chefForkTime = 1000;
/////


///// meat variables
let meatState = 0;
let meatActionTime = 0;
const meatServeTime = 1000;
const meatWidth = 100;
const meatHeight = 25;
const meatThrowHeight = 125;
const meatThrowDelay = chefServeTime/3;
const meatEatTime = 1500;
/////



///// stage variables
let queueNum = 0; // number of customers left in the queue including current
let stageNumDelic = 0;
let stageNumNice = 0;
let stageNumDisg = 0;

let curStage = 0; // which stage is being played
let stageStartT = 0; // time current stage started

const stageStartScreenTime = 2000;
/////


let grillStartTime = 0;
/////global variables
let gameState = GS_INTRO;



let gameScore = 0; // total score


//graphics globals
let c = null;
let ctx = null;
let bg_c = null;
let bg_ctx = null;
let ms_c = null;
let ms_ctx = null;
let cs_c = null;
let cs_ctx = null;
let f_c = null;
let f_ctx = null;


const score_height = 75;


const introScrollTime = 7000;//7seconds
const stageScreenTime = 2000;


let custEnterStartTime = 0;
const custEnterDuration = 750;
const custExitDuration = 750;
const custIdleDuration = 1050;

let sceneStartTime = 0;
let sceneDone = false;

const flameWidth = 120;
const flameHeight = 25;

const fridgeLoc = 1100;
const tableLoc = 450;
const chairLoc = 30;
const chefLoc = fridgeLoc-290;

const stoveX = 800;
const stoveY = 720-score_height;

const stoveScale = 1.5;
const tableScale = 1.5;
const tableHeight = 92;
/////


window.onload = function(e) {
    // all other resources are loaded time to load sounds and then start game
    console.log("onload: enter")
    initLoadingCanvas();
    if(window.AudioContext) LoadSounds();
    console.log("onload: exit")
}



function initLoadingCanvas(){
    let c = document.getElementById("loading_canvas");
    c.width = 100;
    c.height = 100;
    let ctx = c.getContext("2d");

    ctx.fillStyle="#FFFFFF";
    let drawStr = "LOADING";
    ctx.font="14px Georgia";
    
    let textWidth = ctx.measureText(drawStr).width;
    let textHeight = parseInt(ctx.font);
    let centerx = c.width/2.0;
    let centery = c.height/2.0;
    ctx.fillText(drawStr, centerx - (textWidth/2.0), centery + (textHeight/2.0));


    c = document.getElementById("loading_canvas_bg");
    c.width = 100;
    c.height = 100;
    ctx = c.getContext("2d");

    ctx.strokeStyle="#FFFFFF";
    ctx.lineWidth=5;
    ctx.beginPath();
    ctx.arc(50,50,48,0,Math.PI*0.2,true);
    ctx.stroke();
    ctx.closePath();
}
function initLoadedCanvas(){
    let c = document.getElementById("loading_canvas");
    c.width = 100;
    c.height = 100;
    let ctx = c.getContext("2d");

    ctx.fillStyle="#FFFFFF";
    let drawStr = "LOADED"
    let drawStr2 = "click to";
    let drawStr3 = "start";
    ctx.font="14px Georgia";
    
    let textWidth = ctx.measureText(drawStr).width;
    let textHeight = parseInt(ctx.font);
    let centerx = c.width/2.0;
    let centery = c.height/2.0;
    ctx.fillText(drawStr, centerx - (textWidth/2.0), centery + (textHeight/2.0) - textHeight);

    textWidth = ctx.measureText(drawStr2).width;
    ctx.fillText(drawStr2, centerx - (textWidth/2.0), centery + (textHeight/2.0));

    textWidth = ctx.measureText(drawStr3).width;
    ctx.fillText(drawStr3, centerx - (textWidth/2.0), centery + (textHeight/2.0) + textHeight);


    c = document.getElementById("loading_canvas_bg");
    c.width = 100;
    c.height = 100;
    ctx = c.getContext("2d");

    ctx.strokeStyle="#FFFFFF";
    ctx.lineWidth=5;
    ctx.beginPath();
    ctx.arc(50,50,48,0,Math.PI*0.2,true);
    ctx.stroke();
    ctx.closePath();
}



function initGame() {// called by sound class when audio is loaded
    console.log("initGame: enter");
    loading_canvas_bg.className = "";
    loadingDiv.style.display = "none";
    

    skinColorS.max = skinColors.length;

    // need because default values are ingored by browser on refresh
    //volumeS.value = 50;
    //svolumeS.value = 75;
    flameCountK.value = 500;
    //flameCountK.value = 937 // a good high setting
    flamePropK.value = 900;

    setVolume();

    c = document.getElementById("mtm_canvas");
    bg_c = document.getElementById("mtm_canvas_bg");
    ms_c = document.createElement("canvas");
    cs_c = document.createElement("canvas");
    f_c = document.createElement("canvas");


    c.width  = 1280;// render resolution
    c.height = 720;
    bg_c.width  = 1280;
    bg_c.height = 720;
    ms_c.width  = SP_MAN_NUM * SP_MAN_WIDTH;
    ms_c.height = SP_MAN_HEIGHT;
    cs_c.width  = SP_CHEF_NUM * SP_CHEF_WIDTH;
    cs_c.height = SP_CHEF_HEIGHT;
    f_c.width  = flameWidth;
    f_c.height = flameHeight;

    ctx = c.getContext("2d");
    bg_ctx = bg_c.getContext("2d");
    ms_ctx = ms_c.getContext("2d");
    cs_ctx = cs_c.getContext("2d");
    f_ctx = f_c.getContext("2d");


    resizeGame();// set the canvas size to screen preserving the aspect ratio

    drawBackground();
    flame_init();
    loadSprites();

    document.body.onkeydown = keyDown;
    document.body.onkeyup = keyUp;
    c.onmousedown = mouseDown;
    c.onmouseup = mouseUp;

    startIntro();

    fpsStartTime = Date.now();
    requestAnimationFrame(animationLoop);

    console.log("initGame: exit");
}


const fps = 30;// target frame per second 
const interval = 1000/fps;
var now;
var then = Date.now();
var delta;
let fpsAvg = 0;
let fpsStartTime;
let fpsCount = 0;
function animationLoop() {
    requestAnimationFrame(animationLoop);
    now = Date.now();// all other animation functions should use this value
    delta = now - then;

    if(delta > interval) {// only draw if enough time has elapsed
        then = now - (delta % interval);
        
        if(now - fpsStartTime > 2000){
            fpsCount = 0;
            fpsStartTime = now;
        }else{
            fpsCount++;
            fpsAvg = (fpsCount / (now-fpsStartTime))*1000;
        }

        switch(gameState){
            case GS_INTRO:
                drawIntro();
                break;
            case GS_RESTAURANT_OPEN:
                clearCanvas();
                drawFlame();
                drawCustomer();
                drawCook();
                drawMeat();
                drawScoreBar();
                drawQueue();
                break;
            case GS_STAGE_START_SCREEN:
                drawStageScreen();
                break;
            case GS_STAGE_SCORE:
                drawStageScoreScreen();
                break;
            case GS_WIN:
                clearCanvas();
                drawWin();
                break;
            case GS_LOSE:
                clearCanvas();
                drawLose();
                break;
            case GS_HIGHSCORE:
                drawHighScore();
                break;
            default:
                break;
        }
    }
}



function clearCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}



function drawBackground() {  // so much ugly.  Should have made a pic
    bg_ctx.clearRect(0, 0, bg_ctx.canvas.width, bg_ctx.canvas.height);

    let x=0;
    let y=0;

    for(let j=0;j<14;j++)
        for(let i=0;i<9;i++) {
            //draw brick
            bg_ctx.fillStyle = "#c29d55";
            bg_ctx.fillRect(0+(i*160)-((j%2)*160/2),0+(j*50),160,50);
            bg_ctx.fillStyle = "#ffdfc2";
            bg_ctx.fillRect(3+(i*160)-((j%2)*160/2),2+(j*50),160-6,50-4);
            bg_ctx.fillStyle = "#ffcf70";
            bg_ctx.fillRect(3+(i*160)-((j%2)*160/2),4+(j*50),160-8,50-6);
        }

    //draw lower bar (customers)
    bg_ctx.fillStyle = "#332200";
    bg_ctx.fillRect(0,720-score_height,1280,score_height);
    bg_ctx.fillStyle = "#ff9933";
    bg_ctx.fillRect(0,720-score_height+5,1280,score_height-5);

    x=chairLoc;
    y=720-score_height;
    //draw chair
    bg_ctx.fillStyle = "#000000";
    bg_ctx.fillRect(x,y-200,40,200);
    bg_ctx.fillRect(x+40,y-65,100,40);
    bg_ctx.fillRect(x+100,y-45,40,45);

    bg_ctx.fillStyle = "#994d00";
    bg_ctx.fillRect(x+05,y-195,30,30);
    bg_ctx.fillRect(x+05,y-160,30,160);
    bg_ctx.fillRect(x+35,y-60,100,30);
    bg_ctx.fillRect(x+105,y-60,30,60);

    bg_ctx.fillStyle = "#ff9933";
    bg_ctx.fillRect(x+10,y-190,20,20);
    bg_ctx.fillRect(x+10,y-155,20,150);
    bg_ctx.fillRect(x+30,y-55,100,20);
    bg_ctx.fillRect(x+110,y-55,20,50);


    x=tableLoc;
    y=(720-score_height);
    /////draw table
    bg_ctx.fillStyle = "#000000";
    bg_ctx.fillRect(x-(75*tableScale),y-(92*tableScale),150*tableScale,7*tableScale);
    bg_ctx.fillRect(x-(80*tableScale),y-(85*tableScale),160*tableScale,16*tableScale);
    bg_ctx.fillRect(x-(13*tableScale),y-(70*tableScale),26*tableScale,41*tableScale);
    bg_ctx.fillRect(x-(30*tableScale),y-(30*tableScale),60*tableScale,16*tableScale);
    bg_ctx.fillRect(x-(50*tableScale),y-(15*tableScale),100*tableScale,15*tableScale);

    bg_ctx.fillStyle = "#fe9938";
    bg_ctx.fillRect(x-(75*tableScale),y-(80*tableScale),150*tableScale,11*tableScale);
    bg_ctx.fillRect(x-(8*tableScale),y-(65*tableScale),16*tableScale,36*tableScale);
    bg_ctx.fillRect(x-(25*tableScale),y-(25*tableScale),50*tableScale,11*tableScale);
    bg_ctx.fillRect(x-(45*tableScale),y-(10*tableScale),90*tableScale,10*tableScale);

    bg_ctx.fillStyle = "#a65b16";//dark highlight
    bg_ctx.fillRect(x+(70*tableScale),y-(80*tableScale),5*tableScale,11*tableScale);
    bg_ctx.fillRect(x+(3*tableScale),y-(65*tableScale),5*tableScale,36*tableScale);
    bg_ctx.fillRect(x+(20*tableScale),y-(25*tableScale),5*tableScale,11*tableScale);
    bg_ctx.fillRect(x+(40*tableScale),y-(10*tableScale),5*tableScale,10*tableScale);

    bg_ctx.fillStyle = "#f5de91";
    bg_ctx.fillRect(x-(75*tableScale),y-(80*tableScale),5*tableScale,11*tableScale);
    bg_ctx.fillRect(x-(8*tableScale),y-(65*tableScale),5*tableScale,36*tableScale);
    bg_ctx.fillRect(x-(25*tableScale),y-(25*tableScale),5*tableScale,11*tableScale);
    bg_ctx.fillRect(x-(45*tableScale),y-(10*tableScale),5*tableScale,10*tableScale);
    /////


    x = stoveX;
    y = stoveY;
    ///// lower stove
    //main body
    bg_ctx.fillStyle = "#000000";
    bg_ctx.fillRect(
                    x-((200*stoveScale)/2.0),
                    y-(80*stoveScale),
                    200*stoveScale,
                    80*stoveScale);
    bg_ctx.fillStyle = "#bfbfbf";
    bg_ctx.fillRect(
                    x-((190*stoveScale)/2.0),
                    y-(75*stoveScale),
                    190*stoveScale,
                    75*stoveScale);

    // angel highlight
    bg_ctx.beginPath(); // begin new path
    bg_ctx.strokeStyle="#0000FF";
    bg_ctx.lineWidth=5*stoveScale;
    bg_ctx.moveTo(x+((190*stoveScale)/2.0)-(2.5*stoveScale),(y-(35*stoveScale)));
    bg_ctx.lineTo(x+(50*stoveScale),y-(75*stoveScale)-(2.5*stoveScale));
    bg_ctx.stroke();
    bg_ctx.strokeStyle="#FFFFFF";
    bg_ctx.moveTo(x+((190*stoveScale)/2.0)-5,y-(55*stoveScale));
    bg_ctx.lineTo(x+(75*stoveScale)-5,y-(75*stoveScale)-2);
    bg_ctx.stroke();
    bg_ctx.fillStyle = "#000000";
    bg_ctx.fillRect(
                    x-((200*stoveScale)/2.0),
                    y-(80*stoveScale),
                    200*stoveScale,
                    5*stoveScale);


    // right highlight
    bg_ctx.fillStyle = "#a6a6a6";
    bg_ctx.fillRect(
                    x+((180*stoveScale)/2.0),
                    y-(75*stoveScale),
                    5*stoveScale,
                    75*stoveScale);


    // left highlight
    bg_ctx.fillStyle = "#e6e6e6";
    bg_ctx.fillRect(
                    x-((185*stoveScale)/2.0),
                    y-(75*stoveScale),
                    5*stoveScale,
                    75*stoveScale);
    /////
    
    
    /////mid stove
    //black
    bg_ctx.fillStyle = "#000000";
    bg_ctx.fillRect(x-((190/2.0))*stoveScale,y-(105*stoveScale),190*stoveScale,25*stoveScale);
    //left pilar
    bg_ctx.fillStyle = "#cccccc";
    bg_ctx.fillRect(x-(((190/2.0)-5)*stoveScale),y-(105*stoveScale),12*stoveScale,25*stoveScale);
    //right pilar
    bg_ctx.fillStyle = "#a6a6a6";
    bg_ctx.fillRect(x+(((190/2.0)-17)*stoveScale),y-(105*stoveScale),12*stoveScale,25*stoveScale);
    /////
    
    /////top stove
    //black
    bg_ctx.fillStyle = "#000000";
    bg_ctx.fillRect(x-((200/2.0)*stoveScale),y-(115*stoveScale),200*stoveScale,10*stoveScale);
    bg_ctx.fillRect(x-(((200/2.0)-5)*stoveScale),y-(125*stoveScale),190*stoveScale,10*stoveScale);

    bg_ctx.fillStyle = "#bfbfbf";
    bg_ctx.fillRect(x-(190/2.0)*stoveScale,y-(114*stoveScale),190*stoveScale,8*stoveScale);
    /////


    x=fridgeLoc;
    y=720-score_height;
    //////fridge
    bg_ctx.fillStyle = "#000000";
    bg_ctx.fillRect(x-(100),y-300,200,300);

    bg_ctx.fillStyle ="#bbbbbb";
    bg_ctx.fillRect(x-(95),y-295,190,130);
    bg_ctx.fillRect(x-(95),y-295+135,190,70);
    bg_ctx.fillRect(x-(95),y-295+135+75,190,85);

    bg_ctx.fillStyle ="#fafafa";// left highlight
    bg_ctx.fillRect(x-(95),y-295,5,130);
    bg_ctx.fillRect(x-(95),y-295+135,5,70);
    bg_ctx.fillRect(x-(95),y-295+135+75,5,85);

    bg_ctx.fillStyle ="#858585";//right highlight
    bg_ctx.fillRect(x+(90),y-295,5,130);
    bg_ctx.fillRect(x+(90),y-295+135,5,70);
    bg_ctx.fillRect(x+(90),y-295+135+75,5,85);
    /////
}



function drawMeat() {
    //cooked.value
    //0     raw
    //25    rare
    //50    med
    //75    well
    //100   burnt
    let x = 0;
    let y = 0;
    let z = 0;//sprite offset for eating

    let eT = now - meatActionTime;

    switch(meatState) {
        case AS_NONE:
            return;
            break;//never get here
        case AS_MEAT_GRILL:
            let cookTime = ((eT)/10) * stages[curStage].cookSpeed;//controls cooking

            if(cookTime > 1000) cookTime = 1000;
            if(cookTime < 0) cookTime = 0;
            cooked.value = cookTime;

            x = stoveX-(50*stoveScale);
            y = (720-score_height)-((125+25)*stoveScale);
            break;
        case AS_MEAT_SERVE:
            if(eT < meatThrowDelay) {
                x = stoveX-(50*stoveScale);
                y = (720-score_height)-((125+25)*stoveScale);
                break;
            }
            eT -= meatThrowDelay;// bug with time
            if(eT > meatServeTime){
                 eT = meatServeTime;// for drawing this frame only
                 startEat();
            }

            x=(tableLoc-50*stoveScale)*(eT/meatServeTime) + (stoveX-(50*stoveScale))*(1 - (eT/meatServeTime));

            let sy = ((125+25)*stoveScale +meatThrowHeight);
            let ty = tableHeight*tableScale + 25*stoveScale + meatThrowHeight;
            y = (720-score_height) - (ty*(eT/meatServeTime) + sy*(1 - (eT/meatServeTime)))  + meatThrowHeight*Math.pow( Math.abs((eT- (meatServeTime/2)))/(meatServeTime/2) ,2);
            break;
        case AS_MEAT_EAT:
            z = eT/meatEatTime;
            if(z<1/4)      z=0;
            else if(z<1/2) z=1/4;
            else if(z<3/4) z=1/2;
            else if(z<1)   z=3/4;
            else if(z>1) {
                z=1;
                meatState = AS_NONE;
            }
            z*=320;
            x=(tableLoc-(50*((320-z)/160))*stoveScale) + 50*stoveScale;
            y = (720-score_height) - tableHeight*tableScale - 25*stoveScale;

        default:
    }


    // set global alpha
    ctx.globalAlpha = 1.0;
    // draw crossfaded image for meat
    let img;
    if(cooked.value < 250) {
        img = document.getElementById("meat_raw");
        ctx.drawImage(img,z,0,320,55,x,y,100*stoveScale,25*stoveScale);
        ctx.globalAlpha = (cooked.value - 0) / 250.0;
        img = document.getElementById("meat_rare");
        ctx.drawImage(img,z,0,320,55,x,y,100*stoveScale,25*stoveScale);
    } else if(cooked.value < 500) {
        img = document.getElementById("meat_rare");
        ctx.drawImage(img,z,0,320,55,x,y,100*stoveScale,25*stoveScale);
        ctx.globalAlpha = (cooked.value - 250) / 250.0;
        img = document.getElementById("meat_med");
        ctx.drawImage(img,z,0,320,55,x,y,100*stoveScale,25*stoveScale);
    } else if(cooked.value < 750) {
        img = document.getElementById("meat_med");
        ctx.drawImage(img,z,0,320,55,x,y,100*stoveScale,25*stoveScale);
        ctx.globalAlpha = (cooked.value - 500) / 250.0;
        img = document.getElementById("meat_well");
        ctx.drawImage(img,z,0,320,55,x,y,100*stoveScale,25*stoveScale);
    } else {
        img = document.getElementById("meat_well");
        ctx.drawImage(img,z,0,320,55,x,y,100*stoveScale,25*stoveScale);
        ctx.globalAlpha = (cooked.value - 750) / 250.0;
        img = document.getElementById("meat_burnt");
        ctx.drawImage(img,z,0,320,55,x,y,100*stoveScale,25*stoveScale);
    }

    ctx.globalAlpha = 1.0;
}


// used flame effect tutorial from http://www.script-tutorials.com/html5-fire-effect/
let data_width;
let data_height;
let colors = [];
let out_data = [];
// new filled array function
function new_filled_array(len, val) {
    let rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
}


// prepare palette function
function prepare_palette() {
    for (let i = 0; i < 64; ++i) {
        colors[i + 0] = {r: 0, g: 0, b: i << 1, a: i};
        colors[i + 64] = {r: i << 3, g: 0, b: 128 - (i << 2), a: i+64};
        colors[i + 128] = {r: 255, g: i << 1, b: 0, a: i+128};
        colors[i + 192] = {r: 255, g: 255, b: i << 2, a: i+192};
    }
}


let flameCount = 0;
let flameProp = 0;

function flame_init() {
    img_data = ctx.createImageData(flameWidth, flameHeight);
    data_width = img_data.width,
    data_height = img_data.height,
    prepare_palette();
    // allocating array with zeros
    out_data = new_filled_array(data_width * data_height, 0)
}


function drawFlame(){
    let data_cnt = data_width * (data_height - 1);
    flameCount = flameCountK.value/1000.0;
    flameProp = Math.log(Number(flamePropK.value) + 1)/Math.log(1001.0);
    for (let i = 0; i < data_width; i++) {// for every bottom row in image
        out_data[data_cnt + i] = (flameCount > Math.random()) ? 255 : 0;// number of flame points
    }
    for (let y = 0; y < data_height; y++){
        for (let x = 0; x < data_width; x++){
            let s = data_cnt + x;
            //pixel is equal to itself + right + left + down
            let temp_data = (out_data[s] + out_data[s + 1] + out_data[s - 1] + out_data[s - data_width]) * flameProp;
            temp_data >>= 2;
            if (temp_data > 1){
                temp_data -= 1;
            }
            temp_data <<= 0;
            out_data[s - data_width] = temp_data;
            let id = s << 2;
            img_data.data[id + 0] = colors[temp_data].r; // red
            img_data.data[id + 1] = colors[temp_data].g; // green
            img_data.data[id + 2] = colors[temp_data].b / 1.5; // blue
            img_data.data[id + 3] = colors[temp_data].a; // alpha

        }
        data_cnt -= data_width;
    }

    f_ctx.clearRect(0,0,f_c.width,f_c.height)
    f_ctx.putImageData(img_data,0,0);

    ctx.drawImage(f_c,
                    0,
                    0,
                    flameWidth,
                    flameHeight,
                    stoveX - (150*stoveScale)/2,
                    720 - score_height - ((80*stoveScale)+(25*stoveScale)),
                    (150*stoveScale),
                    (25*stoveScale));
}



function startIntro() {
    console.log("startIntro");
    sceneStartTime = Date.now();
    sceneDone = false;
    gameState = GS_INTRO;

    //reset game state and variables
    curStage = 0;
    //clear stage scores
    for(st in stages) {
        stages[st].score = 0;
    }

    //sounds
    StopGameSound(SO_THEME);
    PlayGameSound(SO_INTRO);
}



function drawStageScreen() {
    let drawStr = "";
    let tsizew = 0;
    let tsizeh = 0;
    let centerx = 0;

    let eT = (now - sceneStartTime);

    if(eT < stageStartScreenTime){
        ctx.fillStyle = "#000000";//introBackgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font="25px ps2p";

        drawStr = "STAGE " + (curStage+1);
        tsizew = ctx.measureText(drawStr).width;
        tsizeh = parseInt(ctx.font);
        centerx = c.width/2.0;
        centery = c.height/2.0;
        ctx.fillText(drawStr,centerx - (tsizew/2.0), centery);
    } else {
        stageStartT = now;
        gameState = GS_RESTAURANT_OPEN;
        startCustEnter();
    }
}



function drawStageScoreScreen() {
    let drawStr = "";
    let tsizew = 0;
    let tsizeh = 0;
    let centerx = 0;

    let img = document.getElementById("head_sprite");

    let mscale = 2;
    let sx = 0;
    let sy = 0;
    let sw = SP_HEAD_WIDTH;
    let sh = SP_HEAD_HEIGHT;
    let tx = 200;
    let ty = 0;

    let rowY = 0;

    let eT = (now - sceneStartTime);

    ctx.fillStyle = "#000000";//introBackgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font="25px ps2p";

    drawStr = "STAGE " + (curStage+1);
    tsizew = ctx.measureText(drawStr).width;
    centerx = c.width/2.0;
    ctx.fillText(drawStr,centerx - (tsizew/2.0), 100);

    if(eT > 1000){
        //row 1
        rowY = 175

        // face
        sx = (SP_HEAD_DELIC * SP_HEAD_WIDTH);
        ty = rowY-75;//why is the 75 needed?
        ctx.drawImage(img,sx,0,SP_HEAD_WIDTH,SP_HEAD_HEIGHT,tx,ty,SP_HEAD_WIDTH*mscale,SP_HEAD_HEIGHT*mscale);

        // per customer
        ctx.font="40px Arial";
        drawStr = "" + stages[curStage].sDelic;
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx-150 - tsizew, rowY);

        // X
        ctx.font="30px Arial";
        drawStr = "X";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx-35, rowY);

        // num customer
        ctx.font="40px Arial";
        drawStr = "" + stageNumDelic;
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+50-tsizew, rowY);

        // =
        ctx.font="30px Arial";
        drawStr = "=";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+120, rowY);

        // total of type
        ctx.font="40px Arial";
        drawStr = stages[curStage].sDelic * stageNumDelic;
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+300-tsizew, rowY);
    }

    if(eT > 2000){
        //row 2
        rowY = 300

        // face
        sx = (SP_HEAD_NICE * SP_HEAD_WIDTH);
        ty = rowY-75;//why is the 75 needed?
        ctx.drawImage(img,sx,0,SP_HEAD_WIDTH,SP_HEAD_HEIGHT,tx,ty,SP_HEAD_WIDTH*mscale,SP_HEAD_HEIGHT*mscale);

        // per customer
        ctx.font="40px Arial";
        drawStr = "" + stages[curStage].sNice;
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx-150 - tsizew, rowY);

        // X
        ctx.font="30px Arial";
        drawStr = "X";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx-35, rowY);

        // num customer
        ctx.font="40px Arial";
        drawStr = "" + stageNumNice;
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+50-tsizew, rowY);

        // =
        ctx.font="30px Arial";
        drawStr = "=";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+120, rowY);

        // total of type
        ctx.font="40px Arial";
        drawStr = stages[curStage].sNice * stageNumNice;
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+300-tsizew, rowY);
    }

    if(eT > 3000){
        //row 3
        rowY = 425

        // face
        sx = (SP_HEAD_DISG * SP_HEAD_WIDTH);
        ty = rowY-75;//why is the 75 needed?
        ctx.drawImage(img,sx,0,SP_HEAD_WIDTH,SP_HEAD_HEIGHT,tx,ty,SP_HEAD_WIDTH*mscale,SP_HEAD_HEIGHT*mscale);

        // per customer
        ctx.font="40px Arial";
        drawStr = "0";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx-150 - tsizew, rowY);

        // X
        ctx.font="30px Arial";
        drawStr = "X";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx-35, rowY);

        // num customer
        ctx.font="40px Arial";
        drawStr = "" + stageNumDisg;
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+50-tsizew, rowY);

        // =
        ctx.font="30px Arial";
        drawStr = "=";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+120, rowY);

        // total of type
        ctx.font="40px Arial";
        drawStr = "0";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+300-tsizew, rowY);
    }


    if(eT > 4000){
        //Clear bonus
        rowY = 525

        // per customer
        ctx.font="30px Arial";
        drawStr = "CLEAR BONUS";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,tx+50, rowY);

        // =
        ctx.font="30px Arial";
        drawStr = "=";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+120, rowY);

        //
        ctx.font="40px Arial";
        drawStr = 0;
        if(stages[curStage].score >= stages[curStage].minScore)
                drawStr = stages[curStage].sClear;
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+300-tsizew, rowY);


        if(stageNumDisg === 0) {
            //Perfect bonus
            rowY = 562

            // per customer
            ctx.font="30px Arial";
            drawStr = "PERFECT BONUS";
            tsizew = ctx.measureText(drawStr).width;
            ctx.fillText(drawStr,tx+50, rowY);

            // =
            ctx.font="30px Arial";
            drawStr = "=";
            tsizew = ctx.measureText(drawStr).width;
            ctx.fillText(drawStr,centerx+120, rowY);

            //
            ctx.font="40px Arial";
            drawStr = stages[curStage].sPerfect;
            tsizew = ctx.measureText(drawStr).width;
            ctx.fillText(drawStr,centerx+300-tsizew, rowY);
        }
    }

    if(eT > 5000){
        //total
        rowY = 600

        // per customer
        ctx.font="30px Arial";
        drawStr = "TOTAL";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,tx+50, rowY);

        // =
        ctx.font="30px Arial";
        drawStr = "LB$";
        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+135-tsizew, rowY);

        // total of type
        ctx.font="40px Arial";
        drawStr = stages[curStage].score;

        if(stages[curStage].score >= stages[curStage].minScore)
                drawStr += stages[curStage].sClear;
        if(stageNumDisg === 0)
                drawStr += stages[curStage].sPerfect;

        tsizew = ctx.measureText(drawStr).width;
        ctx.fillText(drawStr,centerx+300-tsizew, rowY);

        // dividing line
        ctx.fillRect(150,rowY+15,c.width-300,2);

        ctx.font="25px Arial";
        drawStr = "PRESS 'SPACE'";
        tsizew = ctx.measureText(drawStr).width;
        tsizeh = parseInt(ctx.font);
        centerx = c.width/2.0;
        ctx.fillText(drawStr,centerx - (tsizew/2.0), 650);

        ctx.font="12px ps2p";
        drawStr = "(or mouse button)";
        tsizew = ctx.measureText(drawStr).width;
        tsizeh = parseInt(ctx.font);
        centerx = c.width/2.0;
        ctx.fillText(drawStr,centerx - (tsizew/2.0), 675);
    }
}



function drawIntro(){
    let scrollPos = 0;
    let scrollRate = c.height / introScrollTime;

    let drawStr = "";
    let tsizew = 0;
    let tsizeh = 0;
    let centerx = 0;
    
    let img;

    //note time bug on rollover
    if(introScrollTime + sceneStartTime > now) {
        scrollPos = c.height - (scrollRate * ((now-sceneStartTime)) );
    }else{
        sceneDone = true;
    }

    ctx.fillStyle = "#000000";//introBackgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#fa9d3b";
    ctx.font="70px ps2p";

    drawStr = "MAN THE MEAT";
    tsizew = ctx.measureText(drawStr).width;
    tsizeh = parseInt(ctx.font);
    centerx = c.width/2.0;
    ctx.fillText(drawStr,centerx - (tsizew/2.0),scrollPos+ tsizeh + 75);

    //draw chef
    let cscale = 2;
    let frame = SP_CHEF_D;
    if((now-sceneStartTime) % 2000 > 1000) frame = SP_CHEF_U
    ctx.drawImage(cs_c,
                frame * SP_CHEF_WIDTH,
                0,
                SP_CHEF_WIDTH,
                SP_CHEF_HEIGHT,
                750,
                scrollPos+150,
                SP_CHEF_WIDTH*cscale,
                SP_CHEF_HEIGHT*cscale);

    //meat cooked amount text
    ctx.fillStyle = "#ffffff";
    ctx.font="25px ps2p";

    //draw rare img
    img = document.getElementById("meat_rare");
    ctx.drawImage(img,0,0,320,55,250,scrollPos+225,100*stoveScale,25*stoveScale);

    drawStr = "RARE";
    ctx.fillText(drawStr,450, scrollPos+ 225+37);

    //draw medium img
    img = document.getElementById("meat_med");
    ctx.drawImage(img,0,0,320,55,250,scrollPos+300,100*stoveScale,25*stoveScale);

    drawStr = "MEDIUM";
    ctx.fillText(drawStr,450, scrollPos+ 300+37);

    //draw welldone img
    img = document.getElementById("meat_well");
    ctx.drawImage(img,0,0,320,55,250,scrollPos+375,100*stoveScale,25*stoveScale);

    drawStr = "WELLDONE";
    ctx.fillText(drawStr,450, scrollPos+ 375+37);

    drawStr = "HOLD 'SPACE': FRY";
    ctx.fillText(drawStr,450, scrollPos+ 525);
    ctx.font="15px ps2p";
    drawStr = "(or mouse button)";
    ctx.fillText(drawStr,540, scrollPos+ 550);
    ctx.font="25px ps2p";

    ctx.fillStyle = "#c63510";
    drawStr = "PRESS 'SPACE' TO START";
    tsizew = ctx.measureText(drawStr).width;
    tsizeh = parseInt(ctx.font);
    centerx = c.width/2.0;
    ctx.fillText(drawStr,centerx - (tsizew/2.0),scrollPos+ 650);

    ctx.font="15px ps2p";
    drawStr = "(or mouse button)";
    tsizew = ctx.measureText(drawStr).width;
    tsizeh = parseInt(ctx.font);
    centerx = c.width/2.0;
    ctx.fillText(drawStr,centerx - (tsizew/2.0),scrollPos+ 675);
}



function drawLose() {
    let drawStr = "";
    let tsizew = 0;
    let tsizeh = 0;
    let centerx = 0;

    let eT = (now - sceneStartTime);

    ctx.fillStyle = "#000000";//introBackgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font="25px ps2p";

    drawStr = "YOU LOSE";
    tsizew = ctx.measureText(drawStr).width;
    tsizeh = parseInt(ctx.font);
    centerx = c.width/2.0;
    centery = c.height/2.0;
    ctx.fillText(drawStr,centerx - (tsizew/2.0), centery);
}



function drawWin() {
    let drawStr = "";
    let tsizew = 0;
    let tsizeh = 0;
    let centerx = 0;

    let eT = (now - sceneStartTime);

    ctx.fillStyle = "#000000";//introBackgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font="25px ps2p";

    drawStr = "YOU WIN!!!";
    tsizew = ctx.measureText(drawStr).width;
    tsizeh = parseInt(ctx.font);
    centerx = c.width/2.0;
    centery = c.height/2.0;
    ctx.fillText(drawStr,centerx - (tsizew/2.0), centery);
}



function updateScore() {
    let score = stageNumDelic * stages[curStage].sDelic;
    score += stageNumNice * stages[curStage].sNice;

    stages[curStage].score = score;
}



function startStage() {
    console.log("startStage");

    //init stage variables
    queueNum = stages[curStage].numCust;

    stageNumDelic = 0;
    stageNumNice = 0;
    stageNumDisg = 0;

    sceneStartTime = Date.now();
    gameState = GS_STAGE_START_SCREEN;

    //sounds
    PlayGameSound(SO_THEME);
    StopGameSound(SO_INTRO);
}



function startCook() {
    console.log("startCook");
    gameState = GS_RESTAURANT_OPEN;
    chefState = AS_CHEF_PREP;
    chefActionTime = Date.now();
    PlayGameSound(SO_FLIPON, 0.3);
}



function startServe() {
    console.log("startServe");
    chefState = AS_CHEF_SERVE;
    meatState = AS_MEAT_SERVE;

    chefActionTime = Date.now();
    meatActionTime = chefActionTime;
    
    StopGameSound(SO_SIZZLE);
    PlayGameSound(SO_FLIPOFF, 0.1);
}



function startGrill(){
    console.log("startGrill");
    meatState = AS_MEAT_GRILL;
    chefState = AS_CHEF_GRILL;

    meatActionTime = Date.now();
    cooked.value = 0;
    
    PlayGameSound(SO_SIZZLE);
}



function drawCook() {
    let frame = SP_CHEF_D;// default action
    let cscale = 2.3;

    switch(chefState) {
        case AS_CHEF_PREP:
            if((now - chefActionTime) < chefFridgeTime){
                frame = SP_CHEF_FRIDGE;
            }else if((now - chefActionTime) < chefFridgeTime+chefTossTime) {
                frame = SP_CHEF_MEAT;
                //Draw second sprite of meat... or redo sprites to combine
                ctx.drawImage(cs_c,
                                frame * SP_CHEF_WIDTH,
                                0,
                                SP_CHEF_WIDTH,
                                SP_CHEF_HEIGHT,
                                chefLoc-50,
                                720 - score_height - (SP_CHEF_HEIGHT*cscale),
                                SP_CHEF_WIDTH*cscale,
                                SP_CHEF_HEIGHT*cscale);
                frame = SP_CHEF_U;
            }else{
                startGrill();
                frame = SP_CHEF_D;
            }
            break;
        case AS_CHEF_SERVE:
            if( 0/3 > (now - chefActionTime)/chefServeTime) {
                frame = SP_CHEF_D;
            }else if( 2/3 > (now - chefActionTime)/chefServeTime) {
                frame = SP_CHEF_H;
            }else if( 3/3 > (now - chefActionTime)/chefServeTime) {
                frame = SP_CHEF_U;
            }else{
                chefState = AS_CHEF_WAIT;
            }
            break;
        case AS_CHEF_WAIT:
        case AS_CHEF_GRILL:
            frame = SP_CHEF_D;
            break;
        case AS_CHEF_FORK:
            frame = SP_CHEF_FORK;
            break;
        default:
    }

    ctx.drawImage(cs_c,
                    frame * SP_CHEF_WIDTH,
                    0,
                    SP_CHEF_WIDTH,
                    SP_CHEF_HEIGHT,
                    chefLoc,
                    720 - score_height - (SP_CHEF_HEIGHT*cscale),
                    SP_CHEF_WIDTH*cscale,
                    SP_CHEF_HEIGHT*cscale);
}



function startCustEnter() {
    console.log("startCustEnter");
    customerActionTime = Date.now();
    gameState = GS_RESTAURANT_OPEN;
    customerState = AS_CUST_ENTER;
    // create customer
    randomColors();
    customerDoneness = Math.floor(Math.random() * 3)+1;// 1-3 for rare-done

    PlayGameSound(SO_ENTER);   
}



function startCustExit() {
    console.log("startCustExit");
    customerActionTime = Date.now();
    gameState = GS_RESTAURANT_OPEN;
    customerState = AS_CUST_EXIT;

    PlayGameSound(SO_EXIT);
}



function startEat() {
    console.log("startEat");
    customerActionTime = Date.now();
    meatActionTime = customerActionTime;
    gameState = GS_RESTAURANT_OPEN;
    customerState = AS_CUST_EAT;
    meatState = AS_MEAT_EAT;
    
    PlayGameSound(SO_EAT1, 1*(customerEatTime/6000));
    PlayGameSound(SO_EAT2, 3*(customerEatTime/6000));
    PlayGameSound(SO_EAT3, 5*(customerEatTime/6000));

}



function startNice() {
    console.log("startNice");
    customerActionTime = Date.now();
    gameState = GS_RESTAURANT_OPEN;
    customerState = AS_CUST_NICE;
    stageNumNice++;
    updateScore();
    PlayGameSound(SO_NIC);
}



function startDel() {
    console.log("startDel");
    customerActionTime = Date.now();
    gameState = GS_RESTAURANT_OPEN;
    customerState = AS_CUST_DELI;
    stageNumDelic++;
    updateScore();
    PlayGameSound(SO_DEL);
}



function startDis() {
    console.log("startDis");
    customerActionTime = Date.now();
    gameState = GS_RESTAURANT_OPEN;
    customerState = AS_CUST_DISGUST;
    stageNumDisg++;
    PlayGameSound(SO_DIS);
}



function drawCustomer(){
    let mscale = 2.3;
    let scrollAmount = SP_MAN_WIDTH*mscale + 35*mscale;
    let scrollPos = 0;
    let scrollRate = scrollAmount / custEnterDuration;
    let eT = (now - customerActionTime);
    
    let x;
    let y;
    let w;
    let h;

    let frame = SP_MAN_SIT_D;

    switch(customerState) {
        case AS_NONE:
            return;// don't draw
            break;
        case AS_CUST_ENTER:
            if(custEnterDuration + customerActionTime > now) {//walking
                scrollPos = scrollAmount - (scrollRate * ((now-customerActionTime)) );
                if( (2/7) > (now - customerActionTime)/custEnterDuration){
                    frame = SP_MAN_WALK_S;
                }else if( (4/7) > (now - customerActionTime)/custEnterDuration){
                    frame = SP_MAN_WALK_R;
                }else if( (6/7) > (now - customerActionTime)/custEnterDuration){
                    frame = SP_MAN_WALK_S;
                }else{
                    frame = SP_MAN_WALK_L;
                }
            }else{//done walking
                customerState = AS_CUST_WAIT;
            }
            break;
        case AS_CUST_EXIT:
            if(custExitDuration + customerActionTime > now) {//walking
                scrollPos = (scrollRate * ((now-customerActionTime)) );
                if( (6*(now - customerActionTime)) < custExitDuration){
                    frame = SP_MAN_WALK_S;
                }else if( (5*(now - customerActionTime)/2) < custExitDuration){
                    frame = SP_MAN_WALK_R;
                }else {
                    frame = SP_MAN_WALK_S;
                }

                ctx.scale(-1,1);
                ctx.translate(-SP_MAN_WIDTH*mscale,0)
                ctx.drawImage(ms_c,
                    frame * SP_MAN_WIDTH,
                    0,
                    SP_MAN_WIDTH,
                    SP_MAN_HEIGHT,
                    -(chairLoc-scrollPos),
                    720 - score_height - SP_MAN_HEIGHT*mscale,
                    SP_MAN_WIDTH*mscale,
                    SP_MAN_HEIGHT*mscale);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }else{//done walking
                customerState = AS_NONE;
                doneExit();
            }
            return;// skip other draw
            break;
        case AS_CUST_EAT:
            scrollPos = 35;//offset to put on chair
            if( 1/6 > (eT/ customerEatTime) ) frame = SP_MAN_EAT_D
            else if( 2/6 > (eT/ customerEatTime) ) frame = SP_MAN_EAT_U
            else if( 3/6 > (eT/ customerEatTime) ) frame = SP_MAN_EAT_D
            else if( 4/6 > (eT/ customerEatTime) ) frame = SP_MAN_EAT_U
            else if( 5/6 > (eT/ customerEatTime) ) frame = SP_MAN_EAT_D
            else if( 6/6 > (eT/ customerEatTime) ) frame = SP_MAN_EAT_U
            //original game had timing of customer and food not match up
            //else if( 7/8 > (eT/ customerEatTime) ) frame = SP_MAN_EAT_D
            //else if( 8/8 > (eT/ customerEatTime) ) frame = SP_MAN_EAT_U
            else doneEating();
            break;
        case AS_CUST_NICE:
            scrollPos = 35;//offset to put on chair
            x = 225;
            y = 200;
            w = 400;
            h = 115;
            
            //draw speach bubble
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineWidth = 7;
            ctx.fillStyle = "rgb(255, 255, 255)";
            roundRect(ctx, x, y, w, h, 50, true);

            ctx.fillStyle = "#000000";
            ctx.font="30px ps2p";
            drawStr = "NICE";
            ctx.fillText(drawStr,x+(w/2)-(ctx.measureText(drawStr).width/2),y+15+(h/2));

            frame = SP_MAN_NICE;
            if(eT - customerNiceTime > 1) startCustExit();
            break;
        case AS_CUST_DELI:
            scrollPos = 35;//offset to put on chair
            x = 225;
            y = 200;
            w = 400;
            h = 115;
            
            //draw speach bubble
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineWidth = 7;
            ctx.fillStyle = "rgb(255, 255, 255)";
            roundRect(ctx, x, y, w, h, 50, true);

            ctx.fillStyle = "#000000";
            ctx.font="30px ps2p";
            drawStr = "DELICIOUS!";
            ctx.fillText(drawStr,x+(w/2)-(ctx.measureText(drawStr).width/2),y+15+(h/2));

            frame = SP_MAN_DELI;
            if(eT - customerDeliTime > 1) startCustExit();
            break;
        case AS_CUST_DISGUST:
            scrollPos = 15;//offset to put on chair
            frame = SP_MAN_DIS1;

            if( 1/3 > (eT/ customerEatTime) ){
                 frame = SP_MAN_EAT_D;
                 scrollPos = 35;//offset to put on chair
            }else if( 2/3 > (eT/ customerDisgustTime) ) {
                 frame = SP_MAN_DIS1;
            }else if( 3/3 > (eT/ customerDisgustTime) ) {
                 frame = SP_MAN_DIS2;
            }else if( 1 > (eT/ (customerDisgustTime + forkFlightTime)) ) {
                //fork flying
                frame = SP_MAN_DIS3;
                let fTD = chefLoc-120;
                let fsx = 100;
                let p = (eT-customerDisgustTime)/forkFlightTime;

                let tx = fsx*(1-p) + fTD*p;
                let ty = 720 - score_height - SP_MAN_HEIGHT*mscale + 5*p;
                ctx.drawImage(ms_c,
                                SP_MAN_FORK * SP_MAN_WIDTH,
                                0,
                                SP_MAN_WIDTH,
                                SP_MAN_HEIGHT,
                                tx,
                                ty,
                                SP_MAN_WIDTH*mscale,
                                SP_MAN_HEIGHT*mscale);
            }else if( eT < customerDisgustTime+ forkFlightTime + chefForkTime ) {
                frame = SP_MAN_DIS3;
                chefState = AS_CHEF_FORK;
            }else {
                chefState = AS_CHEF_WAIT;
                frame = SP_MAN_DIS3;
                startCustExit();
            }
            break;
        case AS_CUST_WAIT:
            if(eT < 1000){// sound trigger.  Probably a terrible way to do this.
                switch(customerDoneness){
                    case MEAT_RARE:
                        PlayGameSound(SO_RAR);
                        break;
                    case MEAT_MED:
                        PlayGameSound(SO_MED);
                        break;
                    case MEAT_WELL:
                        PlayGameSound(SO_WEL);
                        break;
                    default:
                        break;
                }
            }
            if(stages[curStage].hintT > eT) {
                let x = 225;
                let y = 200;
                let w = 400;
                let h = 115;
                
                //draw speach bubble
                ctx.strokeStyle = "rgb(0, 0, 0)";
                ctx.lineWidth = 7;
                ctx.fillStyle = "rgb(255, 255, 255)";
                roundRect(ctx, x, y, w, h, 50, true);

                let img = null;
                switch(customerDoneness){
                    case MEAT_RARE:
                        img = document.getElementById("meat_rare");
                        break;
                    case MEAT_MED:
                        img = document.getElementById("meat_med");
                        break;
                    case MEAT_WELL:
                        img = document.getElementById("meat_well");
                        break;
                    default:
                        img = document.getElementById("meat_raw");
                        break;

                }
                ctx.drawImage(img,0,0,320,55,x+((w-(100*stoveScale))/2),y+((h-25*stoveScale)/2),100*stoveScale,25*stoveScale);
            }

            scrollPos = 35;//offset to put on chair
            if((now - customerActionTime)%custIdleDuration < custIdleDuration/2)
                frame = SP_MAN_SIT_U;
            else
                frame = SP_MAN_SIT_D;
            break;
        default:
            return;
    }

    ctx.drawImage(ms_c,
                    frame * SP_MAN_WIDTH,
                    0,
                    SP_MAN_WIDTH,
                    SP_MAN_HEIGHT,
                    (70-scrollPos),
                    720 - score_height - SP_MAN_HEIGHT*mscale,
                    SP_MAN_WIDTH*mscale,
                    SP_MAN_HEIGHT*mscale);
}



//the number of customers waiting.
function drawQueue() {
    let mscale = 0.75;

    let sx = (SP_HEAD_NICE * SP_HEAD_WIDTH);
    let sy = 0;
    let sw = SP_HEAD_WIDTH;
    let sh = SP_HEAD_HEIGHT;
    let yt = c.height - score_height + (score_height - (SP_HEAD_HEIGHT*mscale))/2;

    let img = document.getElementById("head_sprite");

    for(let i=0; i< queueNum; i++){
        ctx.drawImage(img,sx,0,SP_HEAD_WIDTH,SP_HEAD_HEIGHT,20+(i*SP_HEAD_WIDTH*mscale),yt,SP_HEAD_WIDTH*mscale,SP_HEAD_HEIGHT*mscale);
    }
}


function drawScoreBar() {
    // size without border
    let width = 700;
    let height = 25;

    // red is solid rectangle
    let x = (c.width - width)/2;
    let y = 100;
    let bSize = 4;// border size

    ctx.fillStyle = "#000000";
    ctx.fillRect(x-(bSize*2),y,width+(bSize*4),height);
    ctx.fillRect(x,y-(bSize*2),width,height+(bSize*4));
    ctx.fillRect(x-bSize,y-bSize,width+(bSize*2),height+(bSize*2));

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x-bSize,y,width+(bSize*2),height);
    ctx.fillRect(x,y-bSize,width,height+(bSize*2));

    ctx.fillStyle = "#000000";
    ctx.fillRect(x,y,width,height);

    let mark = stages[curStage].score/stages[curStage].minScore;
    if(mark > 1) mark = 1; // limit to bar length
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(x,y,width*mark,height);
}



function doneEating() {
    console.log("enter done");
    console.log(customerDoneness + " " + cooked.value);
    if(Math.abs(customerDoneness*250 - cooked.value) < stages[curStage].range /2){
        startDel();
    }else if(Math.abs(customerDoneness*250 - cooked.value) < stages[curStage].range){
        startNice();
    }else{
        startDis();
    }
}



function doneExit(){
    queueNum--;
    if(queueNum <=0) {
        startScore();
    }else{
        startCustEnter();
    }
}



function stageEnd() {
    curStage++;
    if(curStage >= 3) {
        startWin();
    } else {
        startStage();
    }
}



function startScore() {
    updateScore();//doubble check shouldn't be needed
    gameState = GS_STAGE_SCORE;
    sceneStartTime = Date.now();

    StopGameSound(SO_THEME);
    StopGameSound(SO_INTRO);
}



function startLose() {
    console.log("startLose");
    gameState = GS_LOSE;
    sceneStartTime = Date.now();

    StopGameSound(SO_THEME);
    StopGameSound(SO_INTRO);
}



function startWin() {
    console.log("startWin");
    gameState = GS_WIN;
    sceneStartTime = Date.now();

    StopGameSound(SO_THEME);
    StopGameSound(SO_INTRO);
}



// from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}



function setColors() {
    let manSpriteImgData = null;
    let img1 = document.getElementById("man_sprite");

    let cW = ms_c.width;
    let cH = ms_c.height;

    let skinC = skinColorS.value;
    let shirtC = shirtColorS.value;
    let pantsC = pantsColorS.value;


    skinC = hexToRgb(skinColors[Math.trunc((skinColors.length-1) * (skinColorS.value/skinColorS.max))]);

    ms_ctx.drawImage(img1,0,0);
    manSpriteImgData = ms_ctx.getImageData(0, 0, cW, cH);

    //look for skin red (170,0,0)
    //look for shirt blue (0,170,0)
    //look for pants green (0,0,170)
    for(let i=0;i<cW;i++)
        for(let j=0;j<cH;j+=1){
             if(manSpriteImgData.data[(cW*(j) + i)*4] === 170) {
                manSpriteImgData.data[((cW*(j) + i)*4) +0] = skinC.r;
                manSpriteImgData.data[((cW*(j) + i)*4) +1] = skinC.g;
                manSpriteImgData.data[((cW*(j) + i)*4) +2] = skinC.b;
            }else if(manSpriteImgData.data[((cW*(j) + i)*4)+1] === 170) {
                let color = shirtC;
                manSpriteImgData.data[((cW*(j) + i)*4) +0] = (color%16)*16;
                manSpriteImgData.data[((cW*(j) + i)*4) +1] = ((Math.floor(color/16))%16)*16;
                manSpriteImgData.data[((cW*(j) + i)*4) +2] = ((Math.floor(color/(16*16)))%16)*16;
            }else if(manSpriteImgData.data[((cW*(j) + i)*4)+2] === 170) {
                let color = pantsC;
                manSpriteImgData.data[((cW*(j) + i)*4) +0] = (color%16)*16;
                manSpriteImgData.data[((cW*(j) + i)*4) +1] = ((Math.floor(color/16))%16)*16;
                manSpriteImgData.data[((cW*(j) + i)*4) +2] = ((Math.floor(color/(16*16)))%16)*16;
            }
        }
    ms_ctx.putImageData(manSpriteImgData,0,0);
}



function randomColors() {
    skinColorS.value = Math.random()*skinColorS.max;
    shirtColorS.value = Math.random()*shirtColorS.max;
    pantsColorS.value = Math.random()*pantsColorS.max;
    setColors();
}



function loadSprites() {
    let img1 = document.getElementById("chef_sprite");
    cs_ctx.drawImage(img1,0,0);

    setColors();// calling set color reloads the customer sprites
}



function keyDown(e) {
    if(e.key != " ") return;// only space

    if(e.keyCode === 32 && e.target != c) {// prevent buttons being the target
        e.preventDefault();
    }

    if(e.key === " ")
        inputDown();
}



function keyUp(e) {
    if(e.keyCode === 32 && e.target != c) {// prevent buttons being the target
        e.preventDefault();
    }

    if(e.key === " ")
        inputUp();
}



function mouseDown(e) {
    if(e.button === 0)
        inputDown();
}



function mouseUp(e) {
    if(e.button === 0)
        inputUp();
}



function inputDown() {
    switch(gameState){
        case GS_RESTAURANT_OPEN:
            if((chefState === AS_NONE || chefState === AS_CHEF_WAIT) && customerState === AS_CUST_WAIT && meatState === AS_NONE)
                startCook();
            break;
        default:
            break;
    }
}



function inputUp() {
    switch(gameState){
        case GS_INTRO:
            PlayGameSound(SO_MTM);
            startStage();
            break;
        case GS_RESTAURANT_OPEN:
            if(chefState === AS_CHEF_GRILL)
                startServe();
            break;
        case GS_STAGE_SCORE:
            if(stages[curStage].score >= stages[curStage].minScore)
                stageEnd();
            else
                startLose();
            break;
        case GS_LOSE:
        case GS_WIN:
            startIntro();
            break;
        default:
            break;
    }
}



function toggleMute() {
    waMuted = !waMuted;
    if(waMuted) {
        musicVolume.gain.setValueAtTime(0,0)
        soundVolume.gain.setValueAtTime(0,0)
    }else{
        setVolume();
    }
}



function setVolume() {
    waMuted = false;
    let vol = parseInt(volumeS.value)/100;
    musicVolume.gain.setValueAtTime(vol * vol,0)

    vol = parseInt(svolumeS.value)/100;
    soundVolume.gain.setValueAtTime(vol * vol,0)
}



// modified from https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas#3368118
function roundRect(ctx, x, y, width, height, radius, fill) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

    ctx.lineTo(x + width/2, y + height);
    ctx.lineTo(x + width/2 - 70, y + height+60);
    ctx.lineTo(x + width/2 - 70, y + height);

    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
}



function resizeGame() {
    let gameArea = document.getElementById('canvasDiv');
    let widthToHeight = 16 / 9;
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight * .8;
    let newWidthToHeight = newWidth / newHeight;

    let reservedHeight = window.innerHeight * .2;

    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        gameArea.style.height = newHeight + 'px';
        gameArea.style.width = newWidth + 'px';
    } else {
        newHeight = newWidth / widthToHeight;
        gameArea.style.width = newWidth + 'px';
        gameArea.style.height = newHeight + 'px';
    }

    //gameArea.style.marginTop = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';
}



function showNotes() {
    containerDiv.style.visibility = "hidden";
    notesBtn.style.visibility = "hidden";
    notesDiv.style.visibility = "visible";
}



function showGame() {
    notesDiv.style.visibility = "hidden";
    notesBtn.style.visibility = "visible";
    containerDiv.style.visibility = "visible";
}



window.addEventListener('resize', resizeGame, false);
window.addEventListener('orientationchange', resizeGame, false);



