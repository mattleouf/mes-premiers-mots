# mes-premiers-mots
Mes Premiers Mots

Mes Premiers Mots is a touch-first, browser-based educational game designed for toddlers and preschool children (ages 3–5) to learn the French alphabet and basic vocabulary in a playful and accessible way. The design focuses on simplicity, clarity, and joyful interaction on mobile devices (iPhone/iPad).

⸻

Game Design Overview

✨ Goal

Help young children recognize letters and form simple words associated with clear, colorful images — all in French.

🟡 Core Interaction
	•	The player is shown a picture (e.g., a cat).
	•	Below the image, the word (e.g., “CHAT”) appears in faint capital letters as empty letter boxes.
	•	Letter tiles (including distractors) are scattered around the screen.
	•	The player drags and drops or taps letters into the correct boxes to complete the word.

⸻

Gameplay Design

Element	Design Purpose
Touch controls	Large touch areas (≥44px), responsive on iPhone and iPad, with both tap-to-place and drag-and-drop to suit young children’s motor skills.
Visual targets	Faint, outlined letters act as soft guidance without making the answer too obvious. Letters “snap” comfortably into place.
Positive reinforcement	Correct placement triggers gentle animations and sounds (e.g., a “pop” or happy chime).
Negative feedback	Wrong placement gives immediate but soft feedback (e.g., shake effect, gentle “nope” sound).
Completion celebration	When a word is completed, a short success animation plays, followed by a “Nouveau mot” button to continue playing.
Simple navigation	Only two main screens: Landing Page and Game. Options accessible via a gear icon (to skip puzzles, toggle settings).
No distractions	Minimal text, no advertisements, no popups—pure focus on the learning experience.


⸻

Visual & Audio Design

Design Element	Guidelines
Color scheme	Bright, high-contrast backgrounds with soft gradients to create a welcoming atmosphere.
Typography	Sans-serif, uppercase letters for maximum legibility, avoiding overly stylized fonts.
Illustrations	Simple, vibrant images (WebP/AVIF) representing common words children recognize.
Animations	Subtle, low-framerate-friendly animations for snaps, shakes, and success fireworks.
Sound effects	Short, clear sounds to reinforce correct/incorrect actions without being overwhelming. Optional pronunciation audio clips after success.


⸻

Structure of the Game Flow
	1.	Landing Page
“Mes Premiers Mots” title → Jouer → Options
Goal: Clear entry point, no friction to start playing.
	2.	Game Screen
	•	Picture at the top.
	•	Faint letter boxes showing the word underneath.
	•	Scattered letter tiles in a lower pool.
	•	Drag or tap letters into boxes.
	•	Soft correction, celebration, and flow to the next word.
	3.	Options Menu
Planned settings:
	•	Skip puzzle
	•	Toggle “faint letters” visibility
	•	Sound on/off
	•	Word difficulty (future)

⸻

Design Priorities
	•	Immediate feedback: Every action produces a clear, positive or negative response.
	•	Repetitive loop with variety: Word changes frequently, reinforcing vocabulary.
	•	Minimal frustration: Generous hitboxes, forgiving interactions, no penalties.
	•	Instant play: No loading screens, no accounts, no downloads—tap the link and play.
	•	Mobile-first design: Prioritized for Safari on iPhone/iPad, but responsive on any modern browser.

⸻

Project Layout (Design-Centered Structure)

mes-premiers-mots/
├── index.html          ← landing page (start/options)
├── css/
│   ├── base.css        ← resets, variables (colors, spacing)
│   └── landing.css     ← landing page visuals
├── js/
│   └── landing.js      ← landing screen logic
├── game/
│   ├── index.html
│   ├── css/game.css    ← main game visuals
│   ├── js/
│   │   ├── main.mjs        ← game loop
│   │   ├── drag-drop.mjs   ← touch & pointer handling
│   │   ├── word-check.mjs  ← validation logic
│   │   └── audio.mjs       ← sound effects
│   ├── data/words-fr.json ← word list (with associated pictures)
│   └── assets/
│       ├── img/            ← pictures
│       └── sfx/            ← sound effects


⸻

Design Choices for Simplicity
	•	Two HTML pages (landing + game): minimal load, instant switching.
	•	Modular JS (ES Modules): easy to expand features (e.g., audio, new interactions) without bloating files.
	•	Separation of visuals and logic: CSS for layout, JS for interactions, JSON for words = clarity and easy maintenance.
	•	No dependencies: Vanilla JS and CSS only. Clean code, fast load.

⸻

Expansion Possibilities (Design-Focused)

Feature	Design Approach
More words	Easily added via JSON, no code changes.
Theme modes	Color variables in CSS for quick swaps.
Difficulty settings	Hide letter hints, increase distractors.
Language packs	Structure supports adding English/Spanish words easily.
Offline-ready	Game works offline by design; full offline PWA can be added later if needed.


⸻

Summary

Mes Premiers Mots is designed around clarity, joyful feedback, and accessibility for young learners. It prioritizes simplicity, instant play, and fun repetition to encourage early reading skills without unnecessary distractions.

This repository exists to structure development cleanly, with each element (visual, logic, content) clearly separated and easy to modify as the game evolves.

⸻

License

MIT — open educational resource, free to use and expand.
