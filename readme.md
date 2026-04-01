# FreeForge

FreeForge is a simple web app to discover free-to-play games using the FreeToGame API.

## Features

- Browse free-to-play games in card layout
- Search games by title
- Filter by genre and platform
- Sort by release date or title
- Add or remove favorites
- Save favorites in localStorage
- Toggle dark/light theme
- Retry button and error message for failed API calls

## Tech Stack

- HTML
- CSS
- JavaScript

## API

- Main API: https://www.freetogame.com/api/games
- Proxy fallback 1: allorigins
- Proxy fallback 2: codetabs
- No API key required

## Project Structure

- index.html
- style.css
- script.js
- readme.md

## How To Run Locally

1. Clone or download this project.
2. Open the project folder in VS Code.
3. Run using a local server (recommended).

### Option 1: Live Server (VS Code)

1. Install Live Server extension.
2. Right-click index.html.
3. Click Open with Live Server.

### Option 2: Python local server

1. Open terminal in project folder.
2. Run:

```bash
python -m http.server 5500
```

3. Open `http://localhost:5500` in browser.

## Notes

- If API does not load, click Retry.
- Hard refresh browser: Cmd + Shift + R.
- Running directly as `file://` may block API in some browsers.

## Deployment

You can deploy this project on:

- GitHub Pages
- Netlify
- Vercel

Basic flow:

1. Push project to GitHub.
2. Connect repo in your hosting platform.
3. Deploy with `index.html` as entry point.