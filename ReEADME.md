# FreeForge

## Description
FreeForge is a simple and responsive web app to discover free-to-play games using the FreeToGame public API. Users can search, filter, sort, favorite games, and switch between light and dark themes.

## API Used
- API: https://www.freetogame.com/api/games
- No API key required

## Data Flow
Fetch API -> Store in array -> Apply search/filter/sort using array methods -> Render cards using map()

## Features Implemented
- Fetch game data with `fetch()` and store it in an array
- Loading state while API data is being fetched
- Error message if API request fails
- Retry button if API request fails
- API fallback support for browser/CORS issues
- Responsive card layout for mobile, tablet, and desktop
- Search by title using `filter()` with `includes()`
- Filter by genre and platform using `filter()`
- Sort by latest release date and alphabetically using `sort()`
- Render cards using `map()`
- Favorite add/remove system on each card
- Favorite data saved in `localStorage`
- View More button to show/hide game description
- Dark mode / light mode toggle
- Theme preference saved in `localStorage`
- Debounced search input for better performance
- Fetch once and reuse data for smooth updates

## Project Structure
- index.html
- style.css
- script.js

## How to Run
1. Download or clone the project.
2. Open the project folder.
3. Recommended: run with a local server (for best API support).
4. Open index.html in browser using the local server URL.

### Simple local server options
- VS Code Live Server extension: Right-click index.html and click "Open with Live Server"
- Python server:
	- `python -m http.server 5500`
	- then open http://localhost:5500

## If API is not working
- Click the Retry button on the page
- Hard refresh the browser (Cmd + Shift + R)
- Make sure internet is active
- Use local server mode instead of opening file directly

## Technologies Used
- HTML
- CSS
- JavaScript (Vanilla)

## Deployment
You can deploy this project on:
- Netlify
- GitHub Pages
- Vercel

### Deployment steps (quick)
1. Push project to GitHub
2. Import repo in Netlify / Vercel, or enable GitHub Pages
3. Deploy and use index.html as entry file
