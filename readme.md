# Cladle 🌿

Cladle is a phylogenetic guessing game inspired by Wordle.

Your goal is to guess a secret species.
After each guess, the game shows the closest shared clade between your guess and the secret species.

As you play, a phylogenetic tree is built in real time, showing:
- The clades discovered so far
- The branches explored by your guesses
- A "Secret" marker that moves deeper as you get closer

Hover any clade to see a Wikipedia summary with image + first paragraph, and a link to the article.

---

## How it works

Each species in the dataset contains a clade path up to **Metazoa**.

On each guess:
1. The game compares the guessed species clade list with the secret species clade list.
2. It finds the closest shared clade.
3. The tree expands with the new branch (even if the guess is off-path).
4. The Secret marker relocates to the deepest common clade discovered so far.

You have a limited number of guesses.

---

## Tech stack

- Vanilla JavaScript (ES Modules)
- D3.js (SVG tree layout + rendering)
- Wikipedia REST API (summary + image)
- GitHub Pages (hosting)

---

## Running locally

Because this project uses ES modules, you need a local server.

If you have Node installed:

npx serve .

Then open:
http://localhost:3000

(You can also use VSCode Live Server.)

---

## Data

- Species/clade data: metazoa.js
- Wikipedia links: Wiki object inside metazoa.js
- Wikipedia summaries/images are fetched live from the official API

---

## License

MIT
