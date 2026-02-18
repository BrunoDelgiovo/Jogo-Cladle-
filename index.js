import { Metazoa } from "./metazoa.js";

/* =========================
    Misc
========================= */

function getRandomSpeciesKey() {
  const keys = Object.keys(Metazoa);
  const i = Math.floor(Math.random() * keys.length);
  return keys[i];
}

function findCommonClade(speciesKeyA, speciesKeyB) {
  const pathA = Metazoa[speciesKeyA].cladeList;
  const setB = new Set(Metazoa[speciesKeyB].cladeList);

  for (const clade of pathA) {
    if (setB.has(clade)) return clade;
  }
  return null;
}

/* =========================
   Estado do jogo 
========================= */

const gameState = {
  // --- dataset indexado para autocomplete ---
  speciesIndex: Object.entries(Metazoa).map(([key, obj]) => ({
    key,
    name: obj.name,
    nameLower: obj.name.toLowerCase(),
  })),

  // --- rodada atual ---
  secretKey: null,
  lastGuessKey: null,
  lastCommonCladeId: null,

  // --- árvore da partida ---
  root: {
    id: "Metazoa",
    level: 0,
    children: [],
  },


  secretMarker: {
    id: "Secret",
    level: 0,
    children: [],
  },
  secretParent: null,
  bestCommonLevel: -1,
};

/* =========================
   DOM refs
========================= */

const dom = {
  input: document.getElementById("speciesA"),
  suggestionsBox: document.getElementById("speciesSuggestions"),
  guessBtn: document.getElementById("guessBtn"),
  resultText: document.getElementById("comparisonResult"),
  secretText: document.getElementById("secretSpecies"),
  treeContainer: document.getElementById("tree"),
  autocompleteWrapper: document.querySelector(".autocomplete"),
};

/* =========================
   Setup inicial
========================= */

gameState.secretKey = getRandomSpeciesKey();
dom.secretText.textContent = gameState.secretKey;

/* =========================
   Autocomplete
========================= */

dom.input.addEventListener("input", () => {
  const typed = dom.input.value.trim().toLowerCase();

  dom.input.dataset.selectedKey = "";

  if (typed === "") {
    hideSuggestions();
    return;
  }

  const matches = getNameMatches(typed, gameState.speciesIndex);
  renderSuggestions(matches);
});

dom.guessBtn.addEventListener("click", () => {
  const guessKey = resolveGuessKey();

  if (!guessKey || !Metazoa[guessKey]) {
    dom.resultText.textContent = "Species not found.";
    return;
  }

  gameState.lastGuessKey = guessKey;
  gameState.lastCommonCladeId = findCommonClade(guessKey, gameState.secretKey);

  dom.resultText.textContent = `Common clade: ${gameState.lastCommonCladeId ?? "None"}`;

  updateGameTreeWithGuess(guessKey);

  renderTree(gameState.root);
});

document.addEventListener("click", (e) => {
  if (!dom.autocompleteWrapper.contains(e.target)) {
    hideSuggestions();
  }
});

function getNameMatches(typedLower, speciesIndex) {
  return speciesIndex
    .filter((s) => s.nameLower.startsWith(typedLower))
    .slice(0, 12);
}

function renderSuggestions(matches) {
  dom.suggestionsBox.innerHTML = "";

  if (matches.length === 0) {
    hideSuggestions();
    return;
  }

  for (const species of matches) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "suggestion-item";
    btn.textContent = species.name;

    btn.addEventListener("click", () => selectSuggestion(species));
    dom.suggestionsBox.appendChild(btn);
  }

  dom.suggestionsBox.style.display = "block";
}

function selectSuggestion(species) {
  dom.input.value = species.name;
  dom.input.dataset.selectedKey = species.key;
  hideSuggestions();
}

function hideSuggestions() {
  dom.suggestionsBox.style.display = "none";
  dom.suggestionsBox.innerHTML = "";
}

function resolveGuessKey() {
  const selectedKey = dom.input.dataset.selectedKey;
  if (selectedKey) return selectedKey;

  const typed = dom.input.value.trim().toLowerCase();
  const match = gameState.speciesIndex.find((s) => s.nameLower === typed);
  return match ? match.key : null;
}

/* =========================
   Árvore da partida 
========================= */

// Insere caminho do chute na árvore da partida.
// (aqui não mexo no Secret ainda — só organizo a base)
function updateGameTreeWithGuess(guessKey) {
  // caminho do dataset é "mais baixo -> mais alto"; pra árvore, queremos "alto -> baixo"
  const pathTopDown = [...Metazoa[guessKey].cladeList].reverse();

  // Garante que começa no root ("Metazoa") ou pelo menos não cria "Metazoa" embaixo de Metazoa
  insertPathIntoTree(gameState.root, pathTopDown);
}

// Inserção usando índice (mais fácil de manter do que shift)
function insertPathIntoTree(rootNode, pathTopDown) {
  let current = rootNode;

  // se o path começa com o root, pule o primeiro item
  let startIndex = 0;
  if (pathTopDown[0] === current.id) startIndex = 1;

  for (let i = startIndex; i < pathTopDown.length; i++) {
    const nextId = pathTopDown[i];

    let child = current.children.find((c) => c.id === nextId);
    if (!child) {
      child = {
        id: nextId,
        level: current.level + 1,
        children: [],
      };
      current.children.push(child);
    }
    current = child;
  }

  return current;
}

/* =========================
   Renderização da árvore (recursiva)
========================= */

function renderTree(rootNode) {
  dom.treeContainer.innerHTML = "";
  renderNodeRecursive(rootNode, 0);
}

function renderNodeRecursive(node, depth) {
  const line = document.createElement("div");
  line.textContent = node.id;
  line.style.marginLeft = `${depth * 20}px`;
  dom.treeContainer.appendChild(line);

  for (const child of node.children) {
    renderNodeRecursive(child, depth + 1);
  }
}
