# 🃏 Jogo de Blackjack

Um projeto simples e elegante de **Blackjack (21)** desenvolvido com **HTML, CSS e JavaScript**, com interface animada e lógica de jogo para um único jogador contra um dealer controlado por computador.

---

## 🎮 Funcionalidades

- Regras clássicas do Blackjack:
  - Bot (dealer) toma decisões com base na pontuação do jogador.
  - Apostas com fichas visuais.
- Sons de ambiente e efeitos (cartas, cliques, fichas).
- Suporte para: "Pedir", "Parar" e "Dobrar".

---

## 📋 Como Jogar

1. Clique em **"Jogar"** no menu principal.
2. Clique no baralho para iniciar o jogo.
3. Utilize os botões:
   - **Pedir**: solicitar mais uma carta.
   - **Parar**: encerrar sua jogada e passar para o dealer.
   - **Dobrar**: dobrar sua aposta e receber apenas mais uma carta.
4. O dealer (bot) seguirá sua lógica para tentar vencer.
5. As fichas são ajustadas automaticamente conforme o resultado.

---

## 🧠 Lógica do Dealer (Bot)

- **Sempre pede** cartas se o jogador tiver mais pontos.
- **Para** se tiver mais pontos que o jogador.
- **Empate**: avalia o risco de perder ao pedir outra carta.
  - Se o risco de estourar for **menor que 70%**, ele pede.
  - Caso contrário, para.

---

## 🛠 Tecnologias Usadas

- **HTML5**
- **CSS3**
- **JavaScript (ES6)**
- Animações com `transform`, `transition` e `setTimeout`.
- Manipulação direta do DOM.

---

## 📂 Estrutura do Projeto
    📁 projeto-blackjack/
    ├── index.html # Estrutura principal do jogo
    ├── style.css # Estilização e animações
    ├── script.js # Lógica do jogo e interações
    ├── imgs/ # Cartas, botões, fundo, etc.
    ├── sounds/ # Efeitos sonoros
    └── fonts/ # Fontes utilizadas no estilo

---

## ▶️ Como Rodar Localmente

1. Clone este repositório:
   ```bash git clone https://github.com/vitor-valentin/https://github.com/vitor-valentin/Projeto-1-Jogo-Blackjack-21.git```

2. Abra o arquivo index.html no navegador.

3. Aproveite o jogo!

---

## 🙌 Créditos

Desenvolvido por Vitor Valentin R. Becker 💻
Inspirado nos clássicos jogos de cassino.
