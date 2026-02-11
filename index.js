import { Metazoa } from "./metazoa.js";

const speciesList = Object.entries(Metazoa).map(([key, obj]) => ({
    key,
    name: obj.name,
    nameLower: obj.name.toLowerCase()
}));
const suggestionsBox = document.getElementById("speciesSuggestions");
const input = document.getElementById("speciesA");
const button = document.getElementById("guessBtn")
const result = document.getElementById("comparisonResult");
const secretSpecies = document.getElementById("secretSpecies")

const theRandomSpecies = randomSpecies();
secretSpecies.textContent = theRandomSpecies;
//INPUT DA ESPECIE
//-------------------------------------------

input.addEventListener("input", () => {
    const text = input.value.trim().toLowerCase();

    input.dataset.selectedKey = "";

    if (text == "") {
        hideSuggestions();
        return;
    }

    const matches = getMatches(text);
    renderSuggestions(matches);
})
//-------------------------------------------

//CLICK DO BOTAO
//-------------------------------------------
button.addEventListener("click", () => {
  let selectedKey = input.dataset.selectedKey;

  if (!selectedKey) {
    const typed = input.value.trim().toLowerCase();
    const match = speciesList.find(
      s => s.nameLower === typed
    );
    if (match) {
      selectedKey = match.key;
    }
  }

  if (!selectedKey || !Metazoa[selectedKey]) {
    result.textContent = "Species not found.";
    return;
  }

  const clade = commonClade(selectedKey, theRandomSpecies);
  result.textContent = `Common clade: ${clade}`;
});
//-------------------------------------------

function getMatches(text) {
    const word = text.toLowerCase();

    return speciesList
        .filter(k => k.nameLower.startsWith(word))
        .slice(0, 12);
}

function renderSuggestions(matches) {
    suggestionsBox.innerHTML = "";

    if (matches.length === 0) {
        hideSuggestions();
        return;
    }

    for (const s of matches) {
        const item = document.createElement("button");
        item.className = "suggestion-item";
        item.textContent = s.name;

        item.addEventListener("click", () => {
            selectSuggestion(s);
        });

        suggestionsBox.appendChild(item);
    }

    suggestionsBox.style.display = "block";
}

function selectSuggestion(species) {
    input.value = species.name;
    input.dataset.selectedKey = species.key;
    hideSuggestions();
}

function hideSuggestions() {
    suggestionsBox.style.display = "none";
    suggestionsBox.innerHTML = "";
}

document.addEventListener("click", (e) => {
    const wrapper = document.querySelector(".autocomplete");
    if (!wrapper.contains(e.target)) {
        hideSuggestions();
    }
});


function commonClade(speciesKeyA, speciesKeyB) {
    const speciesA = Metazoa[speciesKeyA].cladeList;
    const speciesB = new Set(Metazoa[speciesKeyB].cladeList);

    for (const clade of speciesA)
        if (speciesB.has(clade))
            return clade;
}

function randomSpecies() {
    const speciesArray = Object.keys(Metazoa);
    var randomNumber = Math.floor(Math.random() * speciesArray.length);

    return speciesArray[randomNumber];
}

// logica da arvore
const buttonb = document.getElementById("buttonB");
const container = document.getElementById("tree");

const nodes = [
  { text: "Metazoa", level: 0 },
  { text: "Bilateria", level: 1 },
  { text: "Chordata", level: 2 },
  { text: "Vertebrata", level: 3 }
];

function render(array){

    container.innerHTML = "";
    for(let node of array){
        const div = document.createElement("div");
        div.textContent = node.text;
        div.style.marginLeft = node.level * 20 + "px";
        tree.appendChild(div);
    }


}


buttonb.addEventListener("click", () => {
  render(nodes);
});


