# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Abay26/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Abay26/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden on PlayStation — with a guide in its own words for every trophy, a roadmap to the platinum, every missable trophy flagged, and a checklist that saves in the browser.

## What it is

A static web app under `app/` — no build step, no network requests at runtime. Open `app/index.html` in desktop Chrome with the network off and it works.

- **Checklist of all 55 trophies** with the official name, description and grade exactly as PlayStation publishes them, plus a guide and cited sources for each one. Tick a trophy off and it stays ticked (localStorage).
- **Roadmap to the platinum** in five phases — story → activities → collectibles → grind → platinum — built from the official descriptions, with per-phase progress.
- **12 missable trophies flagged**, each with when to do it and why it can be missed.
- **Filters** by kind (story, missable, collectibles, activities, online) and by grade, plus search and a hide-earned toggle.
- **Spoiler-safe mode**: hides story trophy names and descriptions until they are earned.
- **Export / import**: download progress as JSON and import it back; reset clears it.
- **Deep links**: `?view=roadmap`, `?view=missable`, `?kind=collectibles`, `?spoiler=on`, `?trophy=17`, `?checked=2,3,15`.

## Sources

Every guide cites its sources beside the trophy. The facts come from the official trophy descriptions as published by PlayStation, via [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), plus Rockstar Games' official GTA VI material at [rockstargames.com](https://www.rockstargames.com/VI). Where a method is inferred from the official description rather than a published guide, the guide says so plainly. All guide text is written for this entry in its own words — nothing is copied from another guide. No Rockstar logo, artwork or game screenshot is used anywhere.

## How it runs

```sh
node serve.ts
# open http://localhost:8080
```

`main.ts` (Node 22, standard library only) hands the entry in: it copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Running it twice produces byte-identical output. No network is used.

## Files

- `app/index.html` — the guide page (checklist, roadmap, missables, controls)
- `app/app.js` — tracker logic: rendering, filters, spoiler mode, localStorage, export/import, deep links
- `app/style.css` — the guide's own look (deep teal, Vice City pink, sunset amber)
- `app/data/trophies.json` — all 55 trophies: official name, description, grade, kind, missable flag, roadmap stage, guide and sources
- `screenshots/` — 4 real renders of the app in a browser (cover first)
- `main.ts` — the entry program; `serve.ts` — local static server for trying the app
