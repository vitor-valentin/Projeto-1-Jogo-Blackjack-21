//TODO: 
// Add sound effects to flipping and dealing cards
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
var startingChips = 500;
var betChips = 50;
var betted = 0;
var chipsMultiplier = 2;
var remainingCards = [];
var bgCard = "Black";
var points = [0, 0];
var dealingInProgress = false;
var gameReloading = false;

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
    document.getElementById("playerPoints"),
    document.getElementById("dealerPoints")
];
//Gameplay buttons
const stand = document.getElementById("stand");
const hit = document.getElementById("hit");
const double = document.getElementById("double");
const restart = document.getElementById("restart");
//Game elements
const cardStack = document.querySelector(".card-stack");
const cardSpots = [
    document.querySelectorAll(".player .cardSpots .cardSpot"),
    document.querySelectorAll(".dealer .cardSpots .cardSpot")
];
const extraCardsSpots = [
    document.querySelector(".player .extraCards .cardSpot"),
    document.querySelector(".dealer .extraCards .cardSpot")
];
//Other buttons
const closeBtn = document.querySelectorAll("#closeBtn");

//Game functions
function dealCard(card, destination, flip, pointer, returning = false)
{
    const cardRect = card.getBoundingClientRect();
    const destRect = destination.getBoundingClientRect();

    const clone = card.cloneNode(true);
    document.body.appendChild(clone);

    card.style.display = "none";
    clone.style.position = 'fixed';
    clone.style.top = `${cardRect.top}px`;
    clone.style.left = `${cardRect.left}px`;
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.height}px`;
    clone.style.transition = 'transform 0.6s ease-in-out';

    const deltaX = destRect.left - cardRect.left;
    const deltaY = destRect.top - cardRect.top;

    dealingInProgress = true;

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
                    setTimeout(() => {if (returning) card.style.display = "none"}, 1000)
                });
            });
        }

        dealingInProgress = false;
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
    if (points[pointer-2] < 21 && !gameReloading) countPoints(card, pointer);
}

function changeScreenVariable(value, pointer)
{
    const element = screenVariables[pointer];
    element.textContent = value;
}

function resetPoints()
{
    points = [0, 0];

    changeScreenVariable(0, 2);
    changeScreenVariable(0, 3);
}

function bet(amount)
{
    totalChips -= amount;
    betted += amount;
    changeScreenVariable(totalChips, 0);
    changeScreenVariable(betted, 1);
    //TODO: Add sound and animation play
}

function returnCards()
{
    let c = 1;
    
    cardSpots.forEach((type) => {
        type.forEach((spot) => {
            let card = spot.querySelector(".cardContainer");
            let flip = card.querySelector(".playingCard").classList.contains("flip");
            setTimeout(dealCard, (250 * c), card, cardStack, flip, (spot.parentElement.parentElement.classList.contains("player") ? 2 : 3), true);
            c++;
        });
    });

    extraCardsSpots.forEach((spot) => {
        spot.querySelectorAll(".cardContainer").forEach((card) => {
            setTimeout(dealCard, (250 * c), card, cardStack, true, (spot.parentElement.parentElement.classList.contains("player") ? 2 : 3), true)
            c++;
        });
    });

    return c;
}

function playerWon()
{
    gameReloading = true;

    betted *= chipsMultiplier;
    totalChips += betted;
    betted = 0;
    
    changeScreenVariable(0, 1);
    changeScreenVariable(totalChips, 0);

    let c = returnCards();

    setTimeout(startRound, (500 * c));
}

function playerLost()
{
    gameReloading = true;

    changeScreenVariable(0, 1);
    betted = 0;

    let c = returnCards();

    setTimeout(startRound, (500 * c));
}

function verifyHasAce(index, newValue)
{
    cardSpots[index].forEach((spot) => {
        let card = spot.querySelector(".cardContainer");
        if(card != null){            
            if(card.getAttribute("value") == "ace" && newValue > 21)
            {
                card.setAttribute("value", "1");
                points[index] -= 10;
            }
        }
    });
}

function countPoints(card, pointer){
    if(gameReloading) return;
    
    var value = card.getAttribute("value");
    var index = pointer-2;

    if(value == "ace")
    {
        value = (points[index] + 11) > 21 ? 1 : 11;
    }

    verifyHasAce(index, (points[index] + parseInt(value)));

    points[index] += parseInt(value);
    changeScreenVariable(points[index], pointer);
    if(points[index] > 21)
    {
        if(index == 0) setTimeout(playerLost, 1000);
        if(index == 1) setTimeout(playerWon, 1000);
    }else if(points[index] == 21)
    {
        if(index == 0); setTimeout(playerWon, 1000);
        if(index == 1) setTimeout(playerLost, 1000);
    }
}

function startRound()
{
    gameRunning = true;
    gameReloading = false;

    resetRemainingCards();
    resetPoints();

    bet(betChips);
    
    let c = 1;
    let playerCards = [];
    let dealerCards = [];
    playerCards.push(selectRandomCard());
    playerCards.push(selectRandomCard());
    dealerCards.push(selectRandomCard());
    dealerCards.push(selectRandomCard());

    cardSpots.forEach((type) => {
        let i = 0;
        type.forEach((spot) => {
            let card = createCard(playerCards[i], bgCard);
            setTimeout(dealCard, (250 * c), card, spot, (c == 4 ? false : true), (spot.parentElement.parentElement.classList.contains("player") ? 2 : 3));
            i++;
            c++;
        });
    });
}

function countExtraCards()
{
    let count = [];
    extraCardsSpots.forEach((spot) => {
        let cards = 0;
        spot.querySelectorAll(".cardContainer").forEach((card) => {
            cards++;
        });
        count.push(cards);
    });
    return count;
}

function hitOption(pointer)
{
    if (dealingInProgress) return;

    let newCard = selectRandomCard();
    let marginLeft = countExtraCards()[0];
    marginLeft = marginLeft == 0 ? 5 : marginLeft * 25;
    marginLeft += "px";
    let card = createCard(newCard, bgCard);
    setTimeout(dealCard, 250, card, extraCardsSpots[0], true, pointer);
    setTimeout(() => {card.style.marginLeft = marginLeft}, 1000)
}

function reloadGame()
{
    if(gameReloading) return;
    if(dealingInProgress) return;

    gameReloading = true;

    let c =returnCards();
    totalChips = startingChips;
    betted = 0;

    changeScreenVariable(totalChips, 0);
    changeScreenVariable(0, 1);
    
    setTimeout(startRound, (500 * c));
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
    if(!gameRunning){
        startRound();

        hit.addEventListener("click", () => {
            hitOption(2);
        });

        restart.addEventListener("click", () => {
            reloadGame();
        });
    }
});