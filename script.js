//TODO: 
// Make a condition in flipCard() so it only counts the cards when necessary
// Move the game buttons to the blank space in the left
// Animate and use the sound effects for the chips
// How to play section
// Config section

//Game constants
const cardImages = [];
const values = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "jack", "queen", "king", "ace"
];
const specials = ["jack", "queen", "king"];
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
var totalChips = 500;
var betChips = 50;
var betted = 0;
var remainingCards = [];
var bgCard = "Black";
var points = [0, 0];

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
const screenVariables = [
    document.getElementById("totalChips"),
    document.getElementById("bettedChips"),
    document.getElementById("dealerPoints"),
    document.getElementById("playerPoints")
];
//Gameplay buttons
const stand = document.getElementById("stand");
const hit = document.getElementById("hit");
const double = document.getElementById("double");
//Game elements
const cardStack = document.querySelector(".card-stack");
const dealerCardSpots = document.querySelectorAll(".dealer .cardSpot");
const playerCardSpots = document.querySelectorAll(".player .cardSpot");
//Other buttons
const closeBtn = document.querySelectorAll("#closeBtn");

//Game functions
function dealCard(card, destination, flip, pointer)
{
    const cardRect = card.getBoundingClientRect();
    const destRect = destination.getBoundingClientRect();

    const clone = card.cloneNode(true);
    document.body.appendChild(clone);

    clone.style.position = 'fixed';
    clone.style.top = `${cardRect.top}px`;
    clone.style.left = `${cardRect.left}px`;
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.height}px`;
    clone.style.transition = 'transform 0.6s ease-in-out';

    const deltaX = destRect.left - cardRect.left;
    const deltaY = destRect.top - cardRect.top;

    requestAnimationFrame(() => {
        clone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    clone.addEventListener('transitionend', () => {
        clone.remove();

        destination.appendChild(card);
        card.style.display = 'block';
        if (flip) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    flipCard(card, pointer);
                });
            });
        }
    });
}

function createCard(card, backCard)
{
    const cardContainer = document.createElement("div");
    const playingCard = document.createElement("div");
    const cardFront = document.createElement("div");
    const cardBack = document.createElement("div");

    cardContainer.classList.add("cardContainer");
    playingCard.classList.add("playingCard");
    cardFront.classList.add("cardSide");
    cardFront.classList.add("cardFront");
    cardBack.classList.add("cardSide");
    cardBack.classList.add("cardBack");

    cardFront.style.backgroundImage = `url("imgs/${card}")`;
    cardBack.style.backgroundImage = `url("imgs/cardBack${backCard}.png")`;

    const value = card.split("_")[0];
    cardContainer.setAttribute("value", specials.indexOf(value) != -1 ? "10" : value);

    playingCard.appendChild(cardFront);
    playingCard.appendChild(cardBack);
    cardContainer.appendChild(playingCard);
    cardStack.appendChild(cardContainer);
    return cardContainer;
}

function selectRandomCard()
{
    let card = remainingCards[remainingCards.length * Math.random() | 0];
    let index = remainingCards.indexOf(card);
    remainingCards.splice(index, 1);
    return card;
}

function resetRemainingCards()
{
    remainingCards = [];
    cardImages.forEach((card) => {
        remainingCards.push(card);
    });
}

function flipCard(card, pointer)
{
    card.querySelector(".playingCard").classList.toggle("flip");
    countPoints(card, pointer);
}

function changeScreenVariable(value, pointer)
{
    const element = screenVariables[pointer];
    element.textContent = value;
}

function bet(amount)
{
    totalChips -= amount;
    betted += amount;
    changeScreenVariable(totalChips, 0);
    changeScreenVariable(betted, 1);
    //TODO: Add sound and animation play
}

function countPoints(card, pointer){
    var value = card.getAttribute("value");
    var index = pointer-2;
    if(value == "ace")
    {
        value = (points[pointer] + 11) > 21 ? 1 : 11;
    }
    points[index] += parseInt(value);
    changeScreenVariable(points[index], pointer);
    if(points > 21)
    {
        //TODO: Add losing game
    }
}

function startRound()
{
    resetRemainingCards();

    bet(betChips);

    points = [0, 0];
    
    let i = 0;
    let c = 1;
    let playerCards = [];
    let dealerCards = [];
    playerCards.push(selectRandomCard());
    playerCards.push(selectRandomCard());
    dealerCards.push(selectRandomCard());
    dealerCards.push(selectRandomCard());

    playerCardSpots.forEach((spot) => {
        let card = createCard(playerCards[i], bgCard);
        setTimeout(dealCard, (250 * c), card, spot, true, 3);
        i++
        c++;
    });
    i = 0;
    dealerCardSpots.forEach((spot) => {
        let card = createCard(dealerCards[i], bgCard);
        setTimeout(dealCard, (250 * c), card, spot, (c != 4 ? false : true), 2);
        i++
        c++;
    })
}

//Menu Event Listeners
playBtn.addEventListener("click", () => {
    gamePage.style.width = "100%";
    seClick.play();
    bgMusic.play();
    changeScreenVariable(totalChips, 0);
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

//Game Event Listeners
cardStack.addEventListener("click", () => {
    startRound(); 
});
