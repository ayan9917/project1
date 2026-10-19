const items = [
  {name:"Apple", img:"assets/images/apple.svg"},
  {name:"Banana", img:"assets/images/banana.svg"},
  {name:"Car", img:"assets/images/car.svg"},
  {name:"Flower", img:"assets/images/flower.svg"},
  {name:"House", img:"assets/images/house.svg"},
  {name:"Cat", img:"assets/images/cat.svg"},
  {name:"Dog", img:"assets/images/dog.svg"},
  {name:"Ball", img:"assets/images/ball.svg"},
  {name:"Tree", img:"assets/images/tree.svg"},
  {name:"Book", img:"assets/images/book.svg"},
  {name:"Cup", img:"assets/images/cup.svg"},
  {name:"Star", img:"assets/images/star.svg"}
];

let level = 1;
let score = 0;
let lives = 3;
let round = 1;
let target = null;
let choices = [];
let timer = null;
let acceptingAnswer = false;

const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const roundEl = document.getElementById("round");
const messageEl = document.getElementById("message");
const imageArea = document.getElementById("imageArea");
const choicesArea = document.getElementById("choicesArea");
const choicesGrid = document.getElementById("choicesGrid");
const resultEl = document.getElementById("result");
const timerBar = document.getElementById("timerBar");
const timerText = document.getElementById("timerText");

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getDifficulty() {
  // Higher level = less viewing time and more choices.
  const viewSeconds = Math.max(1.2, 3.5 - (level - 1) * 0.35);
  const optionCount = Math.min(6, 2 + Math.floor((level - 1) / 2));
  return {viewSeconds, optionCount};
}

function updateStats() {
  levelEl.textContent = level;
  scoreEl.textContent = score;
  livesEl.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
  roundEl.textContent = round;
}

function nextRound() {
  clearInterval(timer);
  acceptingAnswer = false;
  choicesArea.classList.add("hidden");
  resultEl.textContent = "";

  const diff = getDifficulty();
  target = items[Math.floor(Math.random() * items.length)];

  const wrong = shuffle(items.filter(x => x.name !== target.name)).slice(0, diff.optionCount - 1);
  choices = shuffle([target, ...wrong]);

  imageArea.innerHTML = `<img src="${target.img}" alt="${target.name}">`;
  messageEl.textContent = `Remember this image carefully 👀`;
  startTimer(diff.viewSeconds);
}

function startTimer(seconds) {
  const start = performance.now();
  const duration = seconds * 1000;

  timerBar.style.width = "100%";
  timerText.textContent = `${seconds.toFixed(1)} seconds`;

  timer = setInterval(() => {
    const elapsed = performance.now() - start;
    const remaining = Math.max(0, duration - elapsed);
    const percent = (remaining / duration) * 100;
    timerBar.style.width = `${percent}%`;
    timerText.textContent = `${(remaining / 1000).toFixed(1)} seconds`;

    if (remaining <= 0) {
      clearInterval(timer);
      hideImageAndShowChoices();
    }
  }, 50);
}

function hideImageAndShowChoices() {
  imageArea.innerHTML = `<div class="placeholder">Image hidden 🔒</div>`;
  timerBar.style.width = "0%";
  timerText.textContent = "Choose the answer";
  messageEl.textContent = "Now choose what you remember.";
  choicesArea.classList.remove("hidden");
  acceptingAnswer = true;

  choicesGrid.innerHTML = "";
  choices.forEach(item => {
    const button = document.createElement("button");
    button.className = "choice";
    button.innerHTML = `<img src="${item.img}" alt="${item.name}">`;
    button.title = item.name;
    button.addEventListener("click", () => checkAnswer(item, button));
    choicesGrid.appendChild(button);
  });
}

function checkAnswer(selected, button) {
  if (!acceptingAnswer) return;
  acceptingAnswer = false;

  const allButtons = [...document.querySelectorAll(".choice")];
  allButtons.forEach(b => b.disabled = true);

  if (selected.name === target.name) {
    button.classList.add("correct");
    score += level * 10;
    resultEl.textContent = "✅ Correct! Great memory.";
    resultEl.style.color = "#15803d";

    // Upgrade every 3 successful rounds.
    if (round % 3 === 0) {
      level++;
      resultEl.textContent += ` 🎉 Level ${level} unlocked!`;
    }

    updateStats();
    setTimeout(() => {
      round++;
      updateStats();
      nextRound();
    }, 1300);
  } else {
    button.classList.add("wrong");
    const correctButton = allButtons.find(b =>
      b.querySelector("img")?.alt === target.name
    );
    if (correctButton) correctButton.classList.add("correct");

    lives--;
    resultEl.textContent = `❌ Not quite. The answer was ${target.name}.`;
    resultEl.style.color = "#dc2626";
    updateStats();

    if (lives <= 0) {
      setTimeout(gameOver, 1200);
    } else {
      setTimeout(() => {
        round++;
        updateStats();
        nextRound();
      }, 1500);
    }
  }
}

function gameOver() {
  clearInterval(timer);
  acceptingAnswer = false;
  imageArea.innerHTML = `
    <div>
      <div style="font-size:55px">🏁</div>
      <h2>Game Complete</h2>
      <p>Your score: <strong>${score}</strong></p>
      <p>You reached Level <strong>${level}</strong></p>
    </div>`;
  choicesArea.classList.add("hidden");
  messageEl.textContent = "Well done! Take a short rest.";
  resultEl.innerHTML = `<button class="secondary" onclick="resetGame()">Play Again</button>`;
}

function resetGame() {
  clearInterval(timer);
  level = 1;
  score = 0;
  lives = 3;
  round = 1;
  updateStats();
  nextRound();
}

document.getElementById("newGameBtn").addEventListener("click", resetGame);

updateStats();
nextRound();
