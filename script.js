//Game constants
const cardImages = [];
const values = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "jack", "queen", "king", "ace"
];
const suits = ["clubs", "diamonds", "hearts", "spades"];

for (const suit of suits)
{
    for(const value of values)
    {
        cardImages.push(`${value}_of_${suit}.png`);
    }
}

//Game variables
var gameRunning = false;
var startChips = 500;
var betChips = 50;
var remainingCards = [];
var bgCard = "Black";
var totalChips = 0;

// DOM Elements
//Main Menu Buttons
const playBtn = document.getElementById("play");
const rulesBtn = document.querySelectorAll("#rules");
const configBtn = document.querySelectorAll("#config");
//Pages
const gamePage = document.querySelector(".game");
const rulesPage = document.querySelector(".rules");
const configPage = document.querySelector(".config");
//Sound Effects and Music
const bgMusic = document.getElementById("bgMusic");
const seClick = document.getElementById("seClick");
const seChips = document.getElementById("seChips");
const seFlip = document.getElementById("seFlip");
const seWin = document.getElementById("seWin");
//Changeable values on screen
const sTotalChips = document.getElementById("totalChips");
const sBettedChips = document.getElementById("bettedChips");
//Gameplay buttons
const stand = document.getElementById("stand");
const hit = document.getElementById("hit");
const double = document.getElementById("double");
//Other buttons
const closeBtn = document.querySelectorAll("#closeBtn");

//Menu Click Event Listeners
playBtn.addEventListener("click", () => {
    gamePage.style.width = "100%";
    seClick.play();
    bgMusic.play();
});

rulesBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        rulesPage.style.width = "100%";
        seClick.play();
    });
});

configBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        configPage.style.width = "100%";
        seClick.play();
    });
});

closeBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        btn.parentElement.style.width = "0";
        seClick.play();
        if(btn.parentElement.classList.contains("game"))
        {
            bgMusic.pause();
        }
    });
});