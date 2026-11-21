# Vyaruth: The Impossible USA Trip

A fully playable 3D voxel endless-runner built with Three.js + WebGL. Vyaruth runs from an Indian airport, through an impossible airplane world, across the Atlantic, and finally to a gate that may or may not contain his legendary girlfriend Vizag.

## Run it

Because it uses ES modules, it must be served over HTTP (not opened as a `file://` page):

```powershell
cd "C:\Users\Admin\Documents\Default Project\vyaruth-game"
python -m http.server 8000
```

Then open `http://localhost:8000`.

Three.js is vendored in `vendor/`, so no CDN is required to play. A pixel font is loaded from Google Fonts with a monospace fallback.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move left / right | `←` `→` or `A` `D` | Swipe left / right or the ◀ ▶ buttons |
| Jump | `Space`, `↑`, `W` | Swipe up or the ▲ button |
| Slide | `↓`, `S` | Swipe down or the ▼ button |
| Pause | `Esc` or `P` | Pause button in the HUD |

## What's implemented

- Three-lane runner with jump, slide, lane changing, collision detection, score, coins, combos.
- Six ordered story levels with unique palettes, obstacles, decor, dialogue and a final ending sequence with four outcomes.
- Endless mode (unlocks after the story) with gradually increasing speed, theme cycling and random coin-rain events.
- Vyaruth voxel character with run/jump/slide/fly/crash poses, facial expressions, backpack and six unlockable outfits.
- Power-ups: jetpack, magnet, shield and speed boost, plus shop upgrades and persistent progress via `localStorage`.
- A password gate before the opening cutscene for the shared copy. Change `PASSWORD` in `js/lock.js` to set your own; it remembers the unlock on that device.
- A 2D animated opening cutscene (skippable, replayable from the menu) explaining that Vyaruth has a girlfriend named Vizag and his friends refuse to believe him.
- Main menu, story select, characters, shop, settings, HUD, pause, game over and ending screens — all functional.
- Synthesised retro music, sound effects, engine/wind ambience and lightning (Web Audio, no asset files).
- Keyboard + swipe + on-screen touch controls. The 3D renders at full resolution with antialiasing, soft shadows, ACES tone mapping, PBR-style materials, animated obstacles, a pooled particle system and articulated character animation. The retro pixel 3D mode is optional in Settings; the UI text always uses the pixel font.

## Files

```
index.html          UI markup and import map
css/style.css       Retro pixel UI
js/config.js        Levels, story text, outfits, shop, dialogue, endings
js/storage.js       localStorage persistence
js/audio.js         Web Audio synthesis
js/input.js         Keyboard/touch/swipe input
js/voxel.js         Shared voxel mesh helpers and pixel text labels
js/player.js        Vyaruth model, outfits, animation and expressions
js/world.js         Recycled track segments, themed decor, entities
js/game.js          Game states, physics, collisions, scoring, progression
js/ui.js            Menus, HUD and screen wiring
js/story.js         2D opening cutscene timeline
js/lock.js          Password gate for the public GitHub Pages copy
js/main.js          Bootstrap
vendor/three.module.js  Local Three.js r160
```
