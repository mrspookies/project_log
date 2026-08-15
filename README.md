# EGREGORE

A Spookies_Workshop Experience — a self-contained interactive terminal fiction that runs in any browser.

You are not reading a manual. You are at a terminal. Type to it.

## How to play

- Open `index.html` in any modern browser, or drop the folder on any static host (GitHub Pages, itch.io, Netlify).
- The experience begins with a gateway prompt. Everything after that is told through the terminal.
- Click notes when the fiction tells you to. Listen carefully. Headphones recommended.
- No build step, no dependencies, no servers. One folder, open and play.

## Spoiler policy

All answers live inside the fiction — no passwords, no guides, no walkthroughs. The game keeps your progress in `sessionStorage`, so closing the tab wipes it clean. The experience is intended to be replayed.

## Project structure

```
egregore/
├── index.html          Entry point (terminal + gateway)
├── css/style.css       All styling (CRT/phosphor terminal)
├── js/main.js          The entire experience (vanilla JS)
├── deep-web/           In-fiction companion pages
├── assets/
│   ├── audio/          Soundscape + UI audio (mp3)
│   └── images/         Imagery, crash screens, clue archive
└── 404.html            Keeps Pages-hosted paths quiet
```

## Hosting notes

- Every asset path is relative, so the game works in a subfolder (e.g. `mrspookies.github.io/project_log/`) with zero configuration.
- Audio and images were optimized for a small footprint (~18 MB total) so it loads fast and fits within itch.io's upload limits.
- Original uncompressed WAV masters are kept out of the repo — ask the developer if you need them.

## Credits

- **Developer / Writer:** mrspookies
- **Tagline:** A Spookies_Workshop Experience
- Steam page: https://store.steampowered.com/app/4255090/Egregore/