import { Metazoa, Wiki } from "./metazoa.js";

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
  guessesLeft: 10,
  over: 0,

  // --- árvore  ---
  root: {
    id: "Metazoa",
    level: 0,
    children: [],
  },

  // --- wiki ---
  wiki: {
  cache: new Map(),   
  currentTitle: null,
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
  wonText: document.getElementById("won"),
  guessesText: document.getElementById("guesses"),
  wikiPanel: document.getElementById("wikiPanel"),
  wikiTitle: document.getElementById("wikiTitle"),
  wikiImg: document.getElementById("wikiImg"),
  wikiExtract: document.getElementById("wikiExtract"),
  wikiLink: document.getElementById("wikiLink")

};

/* =========================
   Setup inicial
========================= */

gameState.secretKey = getRandomSpeciesKey();
dom.secretText.textContent = gameState.secretKey;
dom.guessesText.textContent = gameState.guessesLeft;

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
    if(gameState.over){
        dom.wonText.textContent = "The game is over";
        return;
    }
  const guessKey = resolveGuessKey();

  if (!guessKey || !Metazoa[guessKey]) {
    dom.resultText.textContent = "Species not found.";
    return;
  }

  gameState.lastGuessKey = guessKey;
  gameState.lastCommonCladeId = findCommonClade(guessKey, gameState.secretKey);

  dom.resultText.textContent = `Common clade: ${gameState.lastCommonCladeId ?? "None"}`;

  updateGameTreeWithGuess(guessKey);

  renderTree(gameState.root, gameState);
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

function updateGameTreeWithGuess(guessKey) {
  const pathTopDown = [...Metazoa[guessKey].cladeList].reverse();

  insertPathIntoTree(gameState.root, pathTopDown);
}

function insertPathIntoTree(rootNode, pathTopDown) {
  let current = rootNode;


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
    if(current.id == gameState.lastCommonCladeId && current.level > gameState.bestCommonLevel){
        if(gameState.secretParent)
        {
            gameState.secretParent.children = gameState.secretParent.children.filter(
        c => c.id !== "Secret");
        }
        
        gameState.secretParent = current;
    
        gameState.secretMarker.level = current.level + 1;
        gameState.bestCommonLevel = current.level;
        current.children.push(gameState.secretMarker)
    }
  }

  return current;
}

/* =========================
   Renderização da árvore (recursiva)
========================= */

function renderTree(rootNode, gameState) {
  dom.treeContainer.innerHTML = "";
  if(checkIfCorrectAnswer(gameState)){
    gameState.secretParent.children = gameState.secretParent.children.filter(
        c => c.id !== "Secret");
    dom.wonText.textContent =
    `You got it! The correct answer was: ${Metazoa[gameState.secretKey].name}`;
    gameState.over = true;

  }
    gameState.guessesLeft--;
    dom.guessesText.textContent = gameState.guessesLeft;
    if (gameState.guessesLeft < 1) 
        {
            dom.wonText.textContent =
    `Failed! You used all of your guesses. The correct answer was: ${Metazoa[gameState.secretKey].name}`;
            gameState.over = true;
        }

  renderNodeRecursive(rootNode, 0);
}

function renderNodeRecursive(node, depth) {
  const line = document.createElement("div");
  line.style.marginLeft = `${depth * 20}px`;
  dom.treeContainer.appendChild(line);
  const label = document.createElement("span");
  label.className = "node-label";

  label.textContent = node.id;
  label.addEventListener("mouseenter", () => showWikiForNode(node.id));
  line.appendChild(label);

  for (const child of node.children) {
    renderNodeRecursive(child, depth + 1);
  }
}

/* =========================
   Game functions
========================= */

function checkIfCorrectAnswer(gameState){
    if(gameState.lastGuessKey == gameState.secretKey)
        return true;
    else
        return false;
}

/* ========================
    Wiki
==========================*/
async function showWikiForNode(nodeId) {
  gameState.wiki.currentId = nodeId;

  const url = Wiki[nodeId];
  if (!url) {
    dom.wikiTitle.textContent = nodeId;
    dom.wikiExtract.textContent = "No Wikipedia link for this node yet.";
    dom.wikiImg.style.display = "none";
    dom.wikiLink.style.display = "none";
    return;
  }

  const cached = gameState.wiki.cache.get(nodeId);
  if (cached) {
    renderWikiPanel(nodeId, cached);
    return;
  }

  const titleSlug = getWikiTitleFromUrl(url);
  if (!titleSlug) return;

  dom.wikiTitle.textContent = nodeId;
  dom.wikiExtract.textContent = "Loading...";
  dom.wikiImg.style.display = "none";
  dom.wikiLink.style.display = "none";

  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${titleSlug}`;
  const resp = await fetch(apiUrl);
  if (!resp.ok) {
    dom.wikiExtract.textContent = "Failed to load Wikipedia summary.";
    return;
  }

  const data = await resp.json();

  const info = {
    extract: data.extract ?? "",
    thumbnail: data.thumbnail?.source ?? null,
    pageUrl: data.content_urls?.desktop?.page ?? url,
  };

  gameState.wiki.cache.set(nodeId, info);

  if (gameState.wiki.currentId !== nodeId) return;

  renderWikiPanel(nodeId, info);
}
function renderWikiPanel(nodeId, info) {
  dom.wikiTitle.textContent = nodeId;
  dom.wikiExtract.textContent = info.extract || "No summary available.";

  if (info.thumbnail) {
    dom.wikiImg.src = info.thumbnail;
    dom.wikiImg.style.display = "block";
  } else {
    dom.wikiImg.style.display = "none";
  }

  dom.wikiLink.href = info.pageUrl;
  dom.wikiLink.style.display = "inline-block";
}


function getWikiTitleFromUrl(url) {
  const idx = url.indexOf("/wiki/");
  if (idx === -1) return null;
  return url.slice(idx + "/wiki/".length);
}
