# Canton Halloween Run

This is a Chrome-Dino-style browser game, updated for Halloween and customized to use your `canton.png` character.
It includes double-jump, pumpkin pickups, an adaptive background, and local leaderboard storage (via localStorage).

## Files
- `index.html`
- `style.css`
- `script.js`
- `canton.png` (your character image) - INCLUDED
- `README.md`

## How to use
1. Replace `canton.png` if you want to use a different image (recommended ~64x64). The game will scale it to ~1/6 of the canvas height.
2. Open `index.html` in a browser or deploy to GitHub Pages (upload repository root to `main` branch).

## Controls
- **Space** — Jump (press once to jump)
- **Double Jump** — Press Space again while airborne to jump higher (second jump is stronger)
- **Mobile** — Tap the screen to jump. Game is responsive; rotating to landscape gives best experience.

## Gameplay specifics / tweaks
- Speed increases by **10% every 15 seconds**.
- First obstacle appears ~**1 second** after game start (earlier spawn).
- Pumpkins (`🎃`) are collectible and are counted in the leaderboard.
- All UI text is in English.
- Background: sunset sky with gray clouds, bumpy grass, brown soil with stones under the ground.
- Title displayed at top center: **Canton Halloween Run** (in orange).

## Publishing to GitHub Pages
1. Create a new public repository.
2. Upload all files to the repository root (or in `docs/` folder and choose that in Pages settings).
3. In Settings → Pages, select the branch and folder, then save. The site becomes available at: `https://<your-username>.github.io/<repo-name>/`

