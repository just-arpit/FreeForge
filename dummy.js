const DIRECT_API_URL = "https://www.freetogame.com/api/games";
const PROXY_API_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(DIRECT_API_URL)}`;
const PROXY_FALLBACK_URL = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(DIRECT_API_URL)}`;

let allGames = [];
let filteredGames = [];
let favoriteIds = JSON.parse(localStorage.getItem("favorites")) || [];
let isDarkMode = localStorage.getItem("theme") === "dark";

const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const gamesContainer = document.getElementById("gamesContainer");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const platformFilter = document.getElementById("platformFilter");
const sortSelect = document.getElementById("sortSelect");
const favoriteOnlyToggle = document.getElementById("favoriteOnlyToggle");
const themeToggle = document.getElementById("themeToggle");
const resultCount = document.getElementById("resultCount");
const retryBtn = document.getElementById("retryBtn");

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  retryBtn.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
  retryBtn.classList.add("hidden");
}

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favoriteIds));
}

function saveTheme() {
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

function applyTheme() {
  document.body.classList.toggle("dark", isDarkMode);
  themeToggle.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
}

function debounce(callback, delay) {
  let timeoutId;

  return function debouncedFunction(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

function normalizePlatform(gamePlatform) {
  return gamePlatform.toLowerCase().includes("browser") ? "browser" : "pc";
}

function getGenreOptions(games) {
  return [...new Set(games.map((game) => game.genre))].sort((a, b) => a.localeCompare(b));
}

function renderGenreOptions() {
  const optionsHtml = getGenreOptions(allGames)
    .map((genre) => `<option value="${genre}">${genre}</option>`)
    .join("");

  genreFilter.innerHTML = '<option value="all">All Genres</option>' + optionsHtml;
}

function updateResultCount(count) {
  resultCount.textContent = `Showing ${count} game${count === 1 ? "" : "s"}`;
}

function createCard(game) {
  const isFavorite = favoriteIds.includes(game.id);

  return `
    <article class="game-card">
      <img src="${game.thumbnail}" alt="${game.title} thumbnail" class="game-image" loading="lazy" />
      <div class="card-content">
        <h3>${game.title}</h3>
        <p><strong>Genre:</strong> ${game.genre}</p>
        <p><strong>Platform:</strong> ${game.platform}</p>
        <p><strong>Release:</strong> ${game.release_date}</p>

        <div class="card-actions">
          <button class="favorite-btn" data-id="${game.id}">
            ${isFavorite ? "Remove Favorite" : "Add Favorite"}
          </button>
          <button class="view-more-btn" data-id="${game.id}">View More</button>
        </div>

        <p class="details hidden" id="details-${game.id}">${game.short_description}</p>
      </div>
    </article>
  `;
}

function renderGames(games) {
  if (games.length === 0) {
    gamesContainer.innerHTML = '<p class="empty-message">No games found for this selection.</p>';
    updateResultCount(0);
    return;
  }

  gamesContainer.innerHTML = games.map((game) => createCard(game)).join("");
  updateResultCount(games.length);
}

function toggleFavorite(gameId) {
  if (favoriteIds.includes(gameId)) {
    favoriteIds = favoriteIds.filter((id) => id !== gameId);
  } else {
    favoriteIds = [...favoriteIds, gameId];
  }

  saveFavorites();
  applyFiltersAndSort();
}

function toggleDetails(gameId) {
  const detailsElement = document.getElementById(`details-${gameId}`);

  if (detailsElement) {
    detailsElement.classList.toggle("hidden");
  }
}

function sortGames(games, sortBy) {
  const gamesCopy = [...games];

  if (sortBy === "date") {
    return gamesCopy.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
  }

  if (sortBy === "title") {
    return gamesCopy.sort((a, b) => a.title.localeCompare(b.title));
  }

  return gamesCopy;
}

function applyFiltersAndSort() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedGenre = genreFilter.value;
  const selectedPlatform = platformFilter.value;
  const selectedSort = sortSelect.value;
  const favoriteOnly = favoriteOnlyToggle.checked;

  filteredGames = allGames
    .filter((game) => game.title.toLowerCase().includes(searchText))
    .filter((game) => (selectedGenre === "all" ? true : game.genre === selectedGenre))
    .filter((game) => (selectedPlatform === "all" ? true : normalizePlatform(game.platform) === selectedPlatform))
    .filter((game) => (favoriteOnly ? favoriteIds.includes(game.id) : true));

  const sortedGames = sortGames(filteredGames, selectedSort);
  renderGames(sortedGames);
}

async function fetchGames() {
  showLoader();
  hideError();

  try {
    const endpoints = [PROXY_API_URL, PROXY_FALLBACK_URL, DIRECT_API_URL];

    const data = await endpoints.reduce(async (previousResult, endpoint) => {
      const resolved = await previousResult;
      if (resolved) {
        return resolved;
      }

      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          return null;
        }

        const json = await response.json();
        return Array.isArray(json) ? json : null;
      } catch (error) {
        return null;
      }
    }, Promise.resolve(null));

    if (!data) {
      throw new Error("All API endpoints failed");
    }

    allGames = Array.isArray(data) ? data : [];

    renderGenreOptions();
    applyFiltersAndSort();
  } catch (error) {
    const fileModeHint =
      location.protocol === "file:"
        ? " Tip: Open with Live Server or any local server."
        : "";
    showError("Could not load games right now." + fileModeHint);
  } finally {
    hideLoader();
  }
}

function addEventListeners() {
  searchInput.addEventListener("input", debounce(applyFiltersAndSort, 350));
  genreFilter.addEventListener("change", applyFiltersAndSort);
  platformFilter.addEventListener("change", applyFiltersAndSort);
  sortSelect.addEventListener("change", applyFiltersAndSort);
  favoriteOnlyToggle.addEventListener("change", applyFiltersAndSort);

  gamesContainer.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".favorite-btn");
    const viewMoreButton = event.target.closest(".view-more-btn");

    if (favoriteButton) {
      toggleFavorite(Number(favoriteButton.dataset.id));
    }

    if (viewMoreButton) {
      toggleDetails(Number(viewMoreButton.dataset.id));
    }
  });

  themeToggle.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    applyTheme();
    saveTheme();
  });

  retryBtn.addEventListener("click", fetchGames);
}

function initApp() {
  applyTheme();
  addEventListeners();
  fetchGames();
}

initApp();
