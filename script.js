const playBtn = document.getElementById("play");
const rulesBtn = document.getElementById("rules");
const configBtn = document.getElementById("config");
const gamePage = document.querySelector(".game");
const rulesPage = document.querySelector(".rules");
const configPage = document.querySelector(".config");
const closeGameBtn = document.getElementById("closeGame");


playBtn.addEventListener("click", () => {
    gamePage.style.width = "100%";
});

closeGameBtn.addEventListener("click", () => {
    gamePage.style.width = "0";
});