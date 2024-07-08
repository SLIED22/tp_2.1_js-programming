class Card {
  constructor(name, img) {
      this.name = name;
      this.img = img;
      this.isFlipped = false;
      this.element = this.#createCardElement();
  }

  #createCardElement() {
      const cardElement = document.createElement("div");
      cardElement.classList.add("cell");
      cardElement.innerHTML = `
        <div class="card" data-name="${this.name}">
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="${this.img}" alt="${this.name}">
                </div>
            </div>
        </div>
    `;
      return cardElement;
  }

  #flip() {
      const cardElement = this.element.querySelector(".card");
      cardElement.classList.add("flipped");
  }

  #unflip() {
      const cardElement = this.element.querySelector(".card");
      cardElement.classList.remove("flipped");
  }

  toggleFlip() {
      if (this.isFlipped) {
          this.#unflip();
      } else {
          this.#flip();
      }
      this.isFlipped = !this.isFlipped;
  }

  matches(otherCard) {
      return this.name === otherCard.name;
  }
}

class Board {
  constructor(cards) {
      this.cards = cards;
      this.fixedGridElement = document.querySelector(".fixed-grid");
      this.gameBoardElement = document.getElementById("game-board");
  }

  #calculateColumns() {
      const numCards = this.cards.length;
      let columns = Math.floor(numCards / 2);

      columns = Math.max(2, Math.min(columns, 12));

      if (columns % 2 !== 0) {
          columns = columns === 11 ? 12 : columns - 1;
      }

      return columns;
  }

  #setGridColumns() {
      const columns = this.#calculateColumns();
      this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
  }

  shuffleCards() {
      for (let i = this.cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
  }

  render() {
      this.#setGridColumns();
      this.gameBoardElement.innerHTML = "";
      this.cards.forEach((card) => {
          card.element
              .querySelector(".card")
              .addEventListener("click", () => this.onCardClicked(card));
          this.gameBoardElement.appendChild(card.element);
      });
  }

  flipDownAllCards() {
      this.cards.forEach(card => {
          if (card.isFlipped) {
              card.toggleFlip();
          }
      });
  }

  reset() {
      this.shuffleCards();
      this.flipDownAllCards();
      this.render();
  }

  onCardClicked(card) {
      if (this.onCardClick) {
          this.onCardClick(card);
      }
  }
}

class MemoryGame {
  constructor(board, flipDuration = 500) {
      this.board = board;
      this.flippedCards = [];
      this.matchedCards = [];
      this.moveCount = 0;
      this.timer = null;
      this.timeElapsed = 0;

      if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
          flipDuration = 350;
          alert(
              "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
          );
      }
      this.flipDuration = flipDuration;
      this.board.onCardClick = this.#handleCardClick.bind(this);
      this.board.reset();
  }

  startTimer() {
      this.timer = setInterval(() => {
          this.timeElapsed++;
          this.updateTimerDisplay();
      }, 1000);
  }

  stopTimer() {
      clearInterval(this.timer);
      this.timer = null;
  }

  resetTimer() {
      this.timeElapsed = 0;
      this.updateTimerDisplay();
  }

  updateTimerDisplay() {
      const timerElement = document.getElementById("timer");
      if (timerElement) {
          timerElement.textContent = `Time: ${this.timeElapsed}s`;
      }
  }

  updateMoveCount() {
      const moveCountElement = document.getElementById("move-count");
      if (moveCountElement) {
          moveCountElement.textContent = `Moves: ${this.moveCount}`;
      }
  }

  #handleCardClick(card) {
      if (!this.timer) {
          this.startTimer();
      }

      if (this.flippedCards.length < 2 && !card.isFlipped && !this.matchedCards.includes(card)) {
          card.toggleFlip();
          this.flippedCards.push(card);
          this.moveCount++;
          this.updateMoveCount();

          if (this.flippedCards.length === 2) {
              setTimeout(() => this.checkForMatch(), this.flipDuration);
          }
      }
  }

  checkForMatch() {
      const [card1, card2] = this.flippedCards;
      if (card1.matches(card2)) {
          this.matchedCards.push(card1, card2);
      } else {
          card1.toggleFlip();
          card2.toggleFlip();
      }
      this.flippedCards = [];

      if (this.matchedCards.length === this.board.cards.length) {
          this.stopTimer();
          alert(`Game Over! Time: ${this.timeElapsed}s, Moves: ${this.moveCount}`);
      }
  }

  resetGame() {
      this.flippedCards = [];
      this.matchedCards = [];
      this.moveCount = 0;
      this.updateMoveCount();
      this.stopTimer();
      this.resetTimer();
      this.board.reset();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cardsData = [
      { name: "Python", img: "./img/Python.svg" },
      { name: "JavaScript", img: "./img/JS.svg" },
      { name: "Java", img: "./img/Java.svg" },
      { name: "CSharp", img: "./img/CSharp.svg" },
      { name: "Go", img: "./img/Go.svg" },
      { name: "Ruby", img: "./img/Ruby.svg" },
  ];

  const cards = cardsData.flatMap((data) => [
      new Card(data.name, data.img),
      new Card(data.name, data.img),
  ]);
  const board = new Board(cards);
  const memoryGame = new MemoryGame(board, 1000);

  document.getElementById("restart-button").addEventListener("click", () => {
      memoryGame.resetGame();
  });
});
