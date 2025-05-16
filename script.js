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
let roundNumber = 1;
let historyData = [];
let startingRound = false;

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
const restartGame = document.getElementById("restartGameBtn");
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
const chipsSpot = document.querySelector(".chipsSpot");
//Config Menu
const musicVolume = document.getElementById("musicVolume");
const sfxVolume = document.getElementById("sfxVolume");
const backCardOptions = document.querySelectorAll(".card-option");
const multiplier = document.getElementById("multiplier");
const startChips = document.getElementById("startingChips");
const chipsBet = document.getElementById("chipsBet");
//Other buttons
const closeBtn = document.querySelectorAll("#closeBtn");
const historyBtn = document.getElementById("historyBtn");
const historyPanel = document.getElementById("historyPanel");
const closeHistory = document.getElementById("closeHistory");

//Miscelaneous functions
function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Game functions
function moveElement(card, destination, flip, pointer, returning = false)
{
    const elemRect = card.getBoundingClientRect();
    const destRect = destination.getBoundingClientRect();

    const clone = card.cloneNode(true);
    document.body.appendChild(clone);

    card.style.display = "none";
    clone.style.position = 'fixed';
    clone.style.top = `${elemRect.top}px`;
    clone.style.left = `${elemRect.left}px`;
    clone.style.width = `${elemRect.width}px`;
    clone.style.height = `${elemRect.height}px`;
    clone.style.transition = 'transform 0.6s ease-in-out';

    const deltaX = destRect.left - elemRect.left;
    const deltaY = destRect.top - elemRect.top;

    dealingInProgress = true;

    requestAnimationFrame(() => {
        clone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        playSound(seDeal)
    });

    clone.addEventListener('transitionend', () => {
        clone.remove();

        destination.appendChild(card);
        card.style.display = 'block';
        
        if (flip) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    flipCard(card, pointer);
                    setTimeout(() => {if (returning) card.remove();}, 1000)
                });
            });
        }

        dealingInProgress = false;
    });
}

function addToHistory(result, playerPts, dealerPts, chips) {
    historyData.push({
        round: roundNumber,
        result,
        playerPts,
        dealerPts,
        chips
    });

    const entry = document.createElement("div");
    entry.classList.add("history-entry");
    entry.innerHTML = `
        <b>Rodada ${roundNumber}:</b> ${result}<br>
        🧑 Jogador: ${playerPts} pontos<br>
        🃏 Dealer: ${dealerPts} pontos<br>
        💰 Fichas: ${chips > 0 ? "+" : ""}${chips}
    `;

    document.getElementById("historyContent").appendChild(entry);
    roundNumber++;
}

function showNotification(message, duration = 2500) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.remove("hidden");

    setTimeout(() => {
        notification.classList.add("hidden");
    }, duration);
}

function showAlertBanner(message, duration = 3000) {
    const alert = document.getElementById("alertBanner");
    alert.textContent = message;
    alert.classList.remove("hidden");

    setTimeout(() => {
        alert.classList.add("hidden");
    }, duration);
}

function showGameOverModal() {
    const modal = document.getElementById("gameOverModal");
    modal.classList.remove("hidden");
}

function playSound(sound)
{
    const soundClone = sound.cloneNode(true);
    soundClone.volume = sound.volume;
    document.body.appendChild(soundClone);
    soundClone.play();
    setTimeout(() => {soundClone.remove();}, 1000);
}

function createChip(positioned = false)
{
    let chips = [];

    let chip = document.createElement("div");
    chip.classList.add("chip");

    if(positioned)
    {
        chip.style.transform = "translate(0, 0)";
    }

    chips.push(chip);
    
    chipsSpot.appendChild(chip);

    let marginPx = getAmountMarginPxChips();

    chip.style.marginRight = marginPx+"px";
    chip.style.marginBottom = marginPx+"px";
    chip.style.zIndex = Math.round(marginPx/2);

    return chips;
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

function getAmountMarginPxChips()
{
    let allChips = document.querySelectorAll(".chip").length;

    return allChips * 2;
}

function bet(amount)
{
    totalChips -= amount;
    betted += amount;
    
    changeScreenVariable(totalChips, 0);
    changeScreenVariable(betted, 1);
    
    let cAmount = Math.round(amount / 50);
    cAmount = cAmount > 10 ? 10 : cAmount;

    for(let i = 0; i < cAmount; i++)
    {
        setTimeout(() => {
            let chip = createChip();
            moveChip(chip);
        }, 150 * i);
    }
}

function returnCards()
{
    let c = 1;
    
    cardSpots.forEach((type) => {
        type.forEach((spot) => {
            let card = spot.querySelector(".cardContainer");

            if (!card) return;

            let flip;
            try
            {
                flip = card.querySelector(".playingCard").classList.contains("flip");
            }catch (error)
            {
                flip = false;
            }
            setTimeout(moveElement, (250 * c), card, cardStack, flip, (spot.parentElement.parentElement.classList.contains("player") ? 2 : 3), true);
            c++;
        });
    });

    extraCardsSpots.forEach((spot) => {
        spot.querySelectorAll(".cardContainer").forEach((card) => {
            card.style.transform = "none";
            setTimeout(moveElement, (250 * c), card, cardStack, true, (spot.parentElement.parentElement.classList.contains("player") ? 2 : 3), true)
            c++;
        });
    });

    return c;
}

async function returnAllChips(remove = false)
{
    let chips = document.querySelectorAll(".chip");
    const delayTime = getChipDelay(chips.length);

    for (const chip of chips)
    {
        if(remove)
        {
            chip.remove();
        } else {
            moveChip(chip, true, true);
            await delay(delayTime);
        }
    }
}

function getChipDelay(totalChips) {
    if (totalChips <= 20) return 100;
    
    if (totalChips <= 100) return Math.max(20, 100 - Math.floor(totalChips / 2));
    
    return 10;
}

async function changeScreenVariableAnim(pointer) {
    let oldValue = parseInt(screenVariables[pointer].textContent);
    let newValue = (pointer === 0) ? totalChips : betted;
    let difference = newValue - oldValue;

    if (difference === 0) return;

    let steps = Math.min(100, Math.abs(difference)); 
    let stepValue = Math.ceil(Math.abs(difference) / steps) || 1;
    let delayMs = 10;

    if (Math.abs(difference) > 1000) {
        delayMs = 1;
    } else if (Math.abs(difference) > 500) {
        delayMs = 5;
    }

    let current = oldValue;
    let increment = difference > 0 ? stepValue : -stepValue;

    while ((increment > 0 && current < newValue) || (increment < 0 && current > newValue)) {
        current += increment;

        if ((increment > 0 && current > newValue) || (increment < 0 && current < newValue)) {
            current = newValue;
        }

        changeScreenVariable(current, pointer);
        await delay(delayMs);
    }

    await delay(500);
}

async function playerWon()
{
    if(!gameRunning) return;
    gameRunning = false;

    gameReloading = true;
    showNotification("Você venceu a rodada!");

    let oldBetted = betted;
    betted *= chipsMultiplier;
    let amount = betted - oldBetted;
    amount = Math.round(amount / 50);

    const delayTime = getChipDelay(amount);

    for(let i = 0; i < amount; i++)
    {
        await createChip(true);
        await delay(delayTime);
    }
    
    await changeScreenVariableAnim(1);

    totalChips += betted;

    addToHistory("Vitória", points[0], points[1], betted);
    
    betted = 0;
    
    changeScreenVariable(0, 1);
    await changeScreenVariableAnim(0);

    await returnAllChips();

    let c = returnCards();

    await delay(500 * c);
    gameReloading = false;
    startRound();
}

async function playerLost()
{

    if(!gameRunning) return;
    gameRunning = false;
    
    gameReloading = true;
    showNotification("Você perdeu a rodada!");

    changeScreenVariable(0, 1);

    addToHistory("Derrota", points[0], points[1], -betted);
    
    betted = 0;

    await returnAllChips(true);

    let c = returnCards();

    await delay(500 * c);

    gameReloading = false;
    startRound();
}

async function playerTied()
{
    if(!gameRunning) return;
    gameRunning = false;
    
    gameReloading = true;
    showNotification("Empate!");

    totalChips += betted;
    betted = 0;

    addToHistory("Empate", points[0], points[1], 0);

    changeScreenVariable(0, 1);
    await changeScreenVariableAnim(0);

    await returnAllChips();

    let c = returnCards();

    await delay(500 * c);
    gameReloading = false;
    startRound();
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
    extraCardsSpots[index].querySelectorAll(".cardContainer").forEach((card) => {
        if(card != null)
        {
            if(card.getAttribute("value") == "ace" && newValue > 21)
            {
                card.setAttribute("value", "1");
                points[index] -= 10;
            }
        }
    });
}

function countPoints(card, pointer){
    if(gameReloading || !gameRunning) return;
    
    var value = card.getAttribute("value");
    var index = pointer-2;

    if(value == "ace")
    {
        value = (points[index] + 11) > 21 ? 1 : 11;
        if(value == 1){
            card.setAttribute("value", "1");
        }
    }

    verifyHasAce(index, (points[index] + parseInt(value)));


    points[index] += parseInt(value);
    changeScreenVariable(points[index], pointer);

    if(pointer === 2) {
        if(points[index] > 21) {
            setTimeout(playerLost, 2000);
        } else if(points[index] == 21) {
            setTimeout(playerWon, 2000);
        }
    }
}

function cleanupCards()
{
    document.querySelectorAll(".cardContainer").forEach(card => {
        if (card.parentElement === cardStack) {
            card.remove();
        }
    });
}

function drawCard(pointer, flip, destination)
{
    let randomCard = selectRandomCard();
    
    let card = createCard(randomCard, bgCard);

    moveElement(card, destination, flip, pointer);
    return card;
}

function moveChip(chip, type = "deal", remove = false)
{
    let distance = type == "deal" ? "0" : "700px";
    chip = chip.style == undefined ? chip[0] : chip;

    requestAnimationFrame(() => {
        chip.style.transform = `translate(${distance}, ${distance})`;
        playSound(seChips);
        if (remove) setTimeout(() => {chip.remove()}, 500);
    });
}

function startRound()
{
    if (startingRound) return;

    startingRound = true;
    gameReloading = false;

    cleanupCards();

    if (totalChips < betChips) {
        showGameOverModal();
        gameRunning = false;
        return;
    }

    gameRunning = true;
    standed = false;

    resetPoints();
    resetRemainingCards();

    bet(betChips);
    
    let c = 1;
    cardSpots.forEach((type) => {
        type.forEach((spot) => {
            setTimeout(drawCard, (250 * c), (spot.parentElement.parentElement.classList.contains("player") ? 2 : 3), (c == 4 ? false : true),  spot);
            c++;
        });
    });
    startingRound = false;
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
    if(points[1] > points[0]) return false;
    if(points[0] > points[1]) return true;
    if (points[1] >= 21) return false;

    let risk = calculateDrawRisk(points[1], remainingCards);
    return risk < 0.7;
}

async function hitOption(pointer)
{
    if (dealingInProgress || (standed && pointer != 3) || !gameRunning) return;

    let newCard = selectRandomCard();
    let marginLeft = countExtraCards()[pointer-2];
    marginLeft = marginLeft == 0 ? 5 : marginLeft * 25;
    marginLeft += "px";
    let card = createCard(newCard, bgCard);
    setTimeout(moveElement, 250, card, extraCardsSpots[pointer-2], true, pointer);
    setTimeout(() => {card.style.transform = `translateX(${marginLeft})`;}, 1000)
    await delay(1000);
}

async function standOption()
{
    if (dealingInProgress || standed || !gameRunning) return;

    try
    {
        standed = true;

        cardSpots[1].forEach((spot) => {
            const card = spot.querySelector(".cardContainer");
            if(!card.firstChild.classList.contains("flip"))
            {
                flipCard(card, 3);
            }
        });
    }catch(error)
    {
        standed = false;
        return;
    }

    if(points[1] === 21) {
        if(points[0] === 21) {
            await playerTied();
        } else {
            await playerLost();
        }
        return;
    }

    while(dealerDecisionMaking())
    {
        await hitOption(3);
    }

    if(points[1] > 21) {
        await playerWon();
    } else if(points[1] === points[0]) {
        await playerTied();
    } else if(points[1] > points[0]) {
        await playerLost();
    } else {
        await playerWon();
    }
}

async function doubleOption()
{
    if (dealingInProgress || standed || !gameRunning) return;

    if(totalChips < betChips)
    {
        showAlertBanner("Você não tem fichas suficientes para dobrar.");
        return;
    }

    drawCard(2, true, extraCardsSpots[0]);

    bet(betChips);

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
    returnAllChips();

    document.getElementById("historyContent").innerHTML = "";
    historyData = [];
    roundNumber = 1;
    
    setTimeout(() => {
        gameReloading = false;
        gameRunning = false;
        startRound();
    }, (500 * c));
}

function validateConfigInput(input, min, defaultValue) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < min) {
        input.value = defaultValue;
        return defaultValue;
    }
    return value;
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

multiplier.addEventListener("blur", () => {
    chipsMultiplier = validateConfigInput(multiplier, 2, 2);
});

startChips.addEventListener("blur", () => {
    startingChips = validateConfigInput(startChips, 500, 500);
    if (!gameRunning) {
        totalChips = startingChips;
        changeScreenVariable(totalChips, 0);
    }
});

chipsBet.addEventListener("blur", () => {
    betChips = validateConfigInput(chipsBet, 50, 50);
});

//Game Event Listeners

hit.addEventListener("click", () => hitOption(2));
stand.addEventListener("click", standOption);
double.addEventListener("click", doubleOption);
restart.addEventListener("click", reloadGame);

cardStack.addEventListener("click", () => {
    if(!gameRunning && !gameReloading) startRound();
});

restartGame.addEventListener("click", () => {
    document.getElementById("gameOverModal").classList.add("hidden");
    reloadGame();
});

historyBtn.addEventListener("click", () => {
    historyPanel.classList.add("visible");
});

closeHistory.addEventListener("click", () => {
    historyPanel.classList.remove("visible");
});