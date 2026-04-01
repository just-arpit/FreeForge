var API_URL = "https://www.freetogame.com/api/games";
var PROXY_URL = "https://api.allorigins.win/raw?url=" + encodeURIComponent(API_URL);
var PROXY_FALLBACK_URL = "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(API_URL);

var allGames = [];
var favoriteIds = [];
var isDarkMode = localStorage.getItem("theme") === "dark";

var savedFavorites = localStorage.getItem("favorites");
if (savedFavorites) {
  favoriteIds = JSON.parse(savedFavorites);
}

var loader = document.getElementById("loader");
var errorBox = document.getElementById("errorBox");
var gamesContainer = document.getElementById("gamesContainer");
var searchInput = document.getElementById("searchInput");
var genreFilter = document.getElementById("genreFilter");
var platformFilter = document.getElementById("platformFilter");
var sortSelect = document.getElementById("sortSelect");
var favoriteOnlyToggle = document.getElementById("favoriteOnlyToggle");
var themeToggle = document.getElementById("themeToggle");
var resultCount = document.getElementById("resultCount");
var retryBtn = document.getElementById("retryBtn");

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
  if (isDarkMode) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

function applyTheme() {
  if (isDarkMode) {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light Mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark Mode";
  }
}

function renderGenreOptions() {
  var genres = [];
  var i = 0;
  var genre = "";
  var html = '<option value="all">All Genres</option>';

  for (i = 0; i < allGames.length; i++) {
    genre = allGames[i].genre;
    if (genres.indexOf(genre) === -1) {
      genres.push(genre);
    }
  }

  genres.sort();

  for (i = 0; i < genres.length; i++) {
    html = html + '<option value="' + genres[i] + '">' + genres[i] + "</option>";
  }

  genreFilter.innerHTML = html;
}

function createCard(game) {
  var isFavorite = favoriteIds.indexOf(game.id) !== -1;
  var favoriteText = "Add Favorite";
  var cardHtml = "";

  if (isFavorite) {
    favoriteText = "Remove Favorite";
  }

  cardHtml = cardHtml + '<article class="game-card">';
  cardHtml = cardHtml + '<img src="' + game.thumbnail + '" alt="' + game.title + ' thumbnail" class="game-image" loading="lazy" />';
  cardHtml = cardHtml + '<div class="card-content">';
  cardHtml = cardHtml + "<h3>" + game.title + "</h3>";
  cardHtml = cardHtml + "<p><strong>Genre:</strong> " + game.genre + "</p>";
  cardHtml = cardHtml + "<p><strong>Platform:</strong> " + game.platform + "</p>";
  cardHtml = cardHtml + "<p><strong>Release:</strong> " + game.release_date + "</p>";
  cardHtml = cardHtml + '<div class="card-actions">';
  cardHtml = cardHtml + '<button class="favorite-btn" onclick="toggleFavorite(' + game.id + ')">' + favoriteText + "</button>";
  cardHtml = cardHtml + '<button class="view-more-btn" onclick="toggleDetails(' + game.id + ')">View More</button>';
  cardHtml = cardHtml + "</div>";
  cardHtml = cardHtml + '<p class="details hidden" id="details-' + game.id + '">' + game.short_description + "</p>";
  cardHtml = cardHtml + "</div>";
  cardHtml = cardHtml + "</article>";

  return cardHtml;
}

function updateResultCount(count) {
  resultCount.textContent = "Showing " + count + " games";
}

function renderGames(games) {
  var html = "";
  var i = 0;

  if (games.length === 0) {
    gamesContainer.innerHTML = '<p class="empty-message">No games found.</p>';
    updateResultCount(0);
    return;
  }

  for (i = 0; i < games.length; i++) {
    html = html + createCard(games[i]);
  }

  gamesContainer.innerHTML = html;
  updateResultCount(games.length);
}

function toggleFavorite(gameId) {
  var index = favoriteIds.indexOf(gameId);

  if (index === -1) {
    favoriteIds.push(gameId);
  } else {
    favoriteIds.splice(index, 1);
  }

  saveFavorites();
  applyFiltersAndSort();
}

function toggleDetails(gameId) {
  var details = document.getElementById("details-" + gameId);
  if (details) {
    details.classList.toggle("hidden");
  }
}

function applyFiltersAndSort() {
  var searchText = searchInput.value.toLowerCase().trim();
  var selectedGenre = genreFilter.value;
  var selectedPlatform = platformFilter.value;
  var selectedSort = sortSelect.value;
  var favoriteOnly = favoriteOnlyToggle.checked;
  var filteredGames = [];
  var i = 0;

  for (i = 0; i < allGames.length; i++) {
    var game = allGames[i];
    var keep = true;
    var platform = "pc";

    if (game.title.toLowerCase().indexOf(searchText) === -1) {
      keep = false;
    }

    if (selectedGenre !== "all" && game.genre !== selectedGenre) {
      keep = false;
    }

    if (game.platform.toLowerCase().indexOf("browser") !== -1) {
      platform = "browser";
    }

    if (selectedPlatform !== "all" && selectedPlatform !== platform) {
      keep = false;
    }

    if (favoriteOnly && favoriteIds.indexOf(game.id) === -1) {
      keep = false;
    }

    if (keep) {
      filteredGames.push(game);
    }
  }

  if (selectedSort === "date") {
    filteredGames.sort(function(a, b) {
      return new Date(b.release_date) - new Date(a.release_date);
    });
  }

  if (selectedSort === "title") {
    filteredGames.sort(function(a, b) {
      if (a.title < b.title) {
        return -1;
      }
      if (a.title > b.title) {
        return 1;
      }
      return 0;
    });
  }

  renderGames(filteredGames);
}

async function fetchFromOneUrl(url) {
  var response = await fetch(url);
  var text = "";
  var data = null;

  if (!response.ok) {
    return null;
  }

  text = await response.text();

  try {
    data = JSON.parse(text);
  } catch (error) {
    data = null;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return null;
}

async function fetchGames() {
  var data;
  var urls;
  var i;

  showLoader();
  hideError();

  try {
    urls = [PROXY_URL, PROXY_FALLBACK_URL, API_URL];
    data = null;

    for (i = 0; i < urls.length; i++) {
      try {
        data = await fetchFromOneUrl(urls[i]);
        if (data) {
          break;
        }
      } catch (error) {
        data = null;
      }
    }

    if (!data) {
      throw new Error("Could not load games from any endpoint");
    }

    allGames = data;
    renderGenreOptions();
    applyFiltersAndSort();
  } catch (error) {
    if (location.protocol === "file:") {
      showError("Could not load games. Open with Live Server.");
    } else {
      showError("Could not load games right now. Please try again.");
    }
  }

  hideLoader();
}

function addEventListeners() {
  searchInput.addEventListener("keyup", applyFiltersAndSort);
  genreFilter.addEventListener("change", applyFiltersAndSort);
  platformFilter.addEventListener("change", applyFiltersAndSort);
  sortSelect.addEventListener("change", applyFiltersAndSort);
  favoriteOnlyToggle.addEventListener("change", applyFiltersAndSort);

  themeToggle.addEventListener("click", function() {
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
