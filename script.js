//TODO: 
// Get new chips images
// Animate and use the sound effects for the chips
// How to play section
// Change the setting of the player automatically winning when getting 21 points
// Not enough chips
// Losing message

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
var standed = false;

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
const seDeal = document.getElementById("seDeal");
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
//Config Menu
const musicVolume = document.getElementById("musicVolume");
const sfxVolume = document.getElementById("sfxVolume");
const backCardOptions = document.querySelectorAll(".card-option");
const multiplier = document.getElementById("multiplier");
const startChips = document.getElementById("startingChips");
const chipsBet = document.getElementById("chipsBet");
//Other buttons
const closeBtn = document.querySelectorAll("#closeBtn");

//Miscelaneous functions
function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        playSound(seDeal);
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

function playSound(sound)
{
    const soundClone = sound.cloneNode(true);
    soundClone.volume = sound.volume;
    document.body.appendChild(soundClone);
    soundClone.play();
    setTimeout(() => {soundClone.remove();}, 1000);
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
    playSound(seFlip);
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
            let flip;
            try
            {
                flip = card.querySelector(".playingCard").classList.contains("flip");
            }catch (error)
            {
                flip = false;
            }
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

function playerTied()
{
    gameReloading = true;

    totalChips += betted;
    betted = 0;

    changeScreenVariable(0, 1);
    changeScreenVariable(totalChips, 0);

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
        if(index == 0) setTimeout(playerWon, 1000);
        if(index == 1) setTimeout(playerLost, 1000);
    }
}

function drawCard(pointer, flip, destination)
{
    let randomCard = selectRandomCard();
    let card = createCard(randomCard, bgCard);

    dealCard(card, destination, flip, pointer);
    return card;
}

function startRound()
{
    gameRunning = true;
    gameReloading = false;
    standed = false;

    resetRemainingCards();
    resetPoints();

    bet(betChips);
    
    let c = 1;
    cardSpots.forEach((type) => {
        type.forEach((spot) => {
            setTimeout(drawCard, (250 * c), (spot.parentElement.parentElement.classList.contains("player") ? 2 : 3), (c == 4 ? false : true),  spot);
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

function getCardValue(card)
{
    if(specials.includes(card)) return 10;
    if(card == "ace") return 11;
    return parseInt(card);
}

function calculateDrawRisk(botPoints, deck)
{
    let bustCount = 0;
    let totalCards = deck.length;

    deck.forEach((card) => {
        let value = card.split("_")[0];
        value = getCardValue(value);
        
        if(botPoints + value > 21)
        {
            bustCount++;
        }
    });

    return bustCount / totalCards;
}

function dealerDecisionMaking()
{
    if(points[1] > points[0])
    {
        return false;
    }

    if(points[0] > points[1])
    {
        return true;
    }

    let risk = calculateDrawRisk(points[1], remainingCards);
    return risk < 0.7;
}

async function hitOption(pointer)
{
    if (dealingInProgress) return;
    if (standed && pointer != 3) return;

    let newCard = selectRandomCard();
    let marginLeft = countExtraCards()[pointer-2];
    marginLeft = marginLeft == 0 ? 5 : marginLeft * 25;
    marginLeft += "px";
    let card = createCard(newCard, bgCard);
    setTimeout(dealCard, 250, card, extraCardsSpots[pointer-2], true, pointer);
    setTimeout(() => {card.style.marginLeft = marginLeft}, 1000)
    await delay(1000);
}

async function standOption()
{
    if (dealingInProgress) return;
    if (standed) return;

    standed = true;

    cardSpots[1].forEach((spot) => {
        const card = spot.querySelector(".cardContainer");
        if(!card.firstChild.classList.contains("flip"))
        {
            flipCard(card, 3);
        }
    });

    while(dealerDecisionMaking())
    {
        await hitOption(3);
    }

    if(points[1] > points[0] && points[1] < 21)
    {
        playerLost();
    }else if(points[1] == points[0])
    {
        playerTied();
    }
}

async function doubleOption()
{
    if (dealingInProgress) return;
    if (standed) return;

    drawCard(2, true, extraCardsSpots[0]);

    totalChips -= betChips;
    betted += betChips;

    changeScreenVariable(totalChips, 0);
    changeScreenVariable(betted, 1);

    await delay(1000);

    if(points[0] < 21){
        await standOption();
    }
}

function reloadGame()
{
    if(gameReloading) return;
    if(dealingInProgress) return;

    gameReloading = true;

    let c = returnCards();
    totalChips = startingChips;
    betted = 0;

    changeScreenVariable(totalChips, 0);
    changeScreenVariable(0, 1);
    
    setTimeout(startRound, (500 * c));
}

//Menu Event Listeners
playBtn.addEventListener("click", () => {
    gamePage.style.width = "100%";
    playSound(seClick);
    bgMusic.play();
    changeScreenVariable(totalChips, 0);
});

rulesBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        rulesPage.style.width = "100%";
        playSound(seClick);
    });
});

configBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        configPage.style.width = "100%";
        playSound(seClick);
    });
});

closeBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        btn.parentElement.style.width = "0";
        playSound(seClick);
        if(btn.parentElement.classList.contains("game"))
        {
            bgMusic.pause();
        }
    });
});

//Configuration Event Listeners
musicVolume.addEventListener("input", () => {
    bgMusic.volume = musicVolume.value / 100;
});

sfxVolume.addEventListener("input", () => {
    seClick.volume = sfxVolume.value / 100;
    seChips.volume = sfxVolume.value / 100;
    seDeal.volume = sfxVolume.value / 100;
    seFlip.volume = sfxVolume.value / 100;
});

backCardOptions.forEach((option) => {
    option.addEventListener("click", () => {
        if(option.id != "selected")
        {
            document.getElementById("selected").id = "";
            option.id = "selected";
            bgCard = option.getAttribute("value");
            
            cardStack.querySelectorAll(".card").forEach((card) => {
                card.style.backgroundImage = "url(imgs/cardBack"+bgCard+".png)";
            });

            const currentCards = document.querySelectorAll(".cardContainer");
            currentCards.forEach((card) => {
                card.querySelector(".cardBack").style.backgroundImage = "url(imgs/cardBack"+bgCard+".png)";
            });
        }
    });
});

multiplier.addEventListener("input", () => {
    if (multiplier.value !== "" && parseInt(multiplier.value) < 2) {
        multiplier.value = 2;
    }
    chipsMultiplier = multiplier.value != "" ? parseInt(multiplier.value) : 2;
});

startChips.addEventListener("blur", () => {
    if (parseInt(startChips.value) < 500 || startChips.value == "") {
        startChips.value = 500;
    }
    startingChips = parseInt(startChips.value);
    if(!gameRunning)
    {
        totalChips = startingChips;
        changeScreenVariable(totalChips, 0);
    }
});

chipsBet.addEventListener("blur", () => {
    if (parseInt(chipsBet.value) < 50 || chipsBet.value == "") {
        chipsBet.value = 50;
    }
    betChips = parseInt(chipsBet.value);
});

//Game Event Listeners
cardStack.addEventListener("click", () => {
    if(!gameRunning){
        startRound();

        hit.addEventListener("click", () => {
            hitOption(2);
        });

        stand.addEventListener("click", () => {
            standOption();
        });

        double.addEventListener("click", () => {
            doubleOption();
        });

        restart.addEventListener("click", () => {
            reloadGame();
        });
    }
});