let allEpisodes = [];
let filteredEpisodes = [];
let allShows = [];
let currentShow = null;
let cache = {
  shows: null,
  episodes: {}
};

async function fetchShows() {
  if (cache.shows) {
    return cache.shows;
  }

  const rootElem = document.getElementById("root");
  rootElem.innerHTML = '<div class="loading">Loading TV shows, please wait...</div>';

  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    const sortedShows = data.sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    
    cache.shows = sortedShows;
    return sortedShows;
  } catch (error) {
    rootElem.innerHTML = '<div class="error">Failed to load TV shows. Please try refreshing the page.</div>';
    throw error;
  }
}

async function fetchEpisodes(showId) {
  if (cache.episodes[showId]) {
    return cache.episodes[showId];
  }

  const rootElem = document.getElementById("root");
  const loadingDiv = document.querySelector(".loading");
  if (!loadingDiv) {
    rootElem.innerHTML = '<div class="loading">Loading episodes, please wait...</div>';
  }

  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    cache.episodes[showId] = data;
    return data;
  } catch (error) {
    rootElem.innerHTML = '<div class="error">Failed to load episodes. Please try refreshing the page.</div>';
    throw error;
  }
}
// test
async function setup() {
  try {
    allShows = await fetchShows();
    createPageStructure();
    
    const defaultShow = allShows.find(show => show.id === 82) || allShows[0];
    if (defaultShow) {
      document.getElementById("show-select").value = defaultShow.id;
      await loadShow(defaultShow.id);
    }
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

async function loadShow(showId) {
  try {
    const show = allShows.find(s => s.id === showId);
    if (!show) return;
    
    currentShow = show;
    allEpisodes = await fetchEpisodes(showId);
    filteredEpisodes = allEpisodes;
    
    updatePageTitle();
    updateEpisodeSelector();
    makePageForEpisodes(filteredEpisodes);
    updateEpisodeCount();
    
    document.getElementById("search-input").value = "";
  } catch (error) {
    console.error('Failed to load show:', error);
  }
}

function updatePageTitle() {
  const titleElement = document.querySelector(".page-title");
  if (titleElement && currentShow) {
    titleElement.textContent = `${currentShow.name} - Episodes`;
  }
}

function updateEpisodeSelector() {
  const episodeSelect = document.getElementById("episode-select");
  if (!episodeSelect) return;
  
  episodeSelect.innerHTML = "";
  
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select an episode...";
  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    option.value = episode.id;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

function createPageStructure() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const header = document.createElement("div");
  header.className = "header";

  const title = document.createElement("h1");
  title.textContent = "TV Show Episodes";
  title.className = "page-title";

  const showSection = document.createElement("div");
  showSection.className = "show-section";
  
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  showSelect.className = "show-select";
  showSelect.addEventListener("change", handleShowSelect);
  
  const defaultShowOption = document.createElement("option");
  defaultShowOption.value = "";
  defaultShowOption.textContent = "Select a TV show...";
  showSelect.appendChild(defaultShowOption);
  
  allShows.forEach(show => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  const searchSection = document.createElement("div");
  searchSection.className = "search-section";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.className = "search-input";
  searchInput.placeholder = "Search episodes by name or summary...";
  searchInput.addEventListener("input", handleSearch);

  const selectorSection = document.createElement("div");
  selectorSection.className = "selector-section";

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.className = "episode-select";
  episodeSelect.addEventListener("change", handleEpisodeSelect);

  const episodeCount = document.createElement("div");
  episodeCount.id = "episode-count";
  episodeCount.className = "episode-count";

  header.appendChild(title);
  showSection.appendChild(showSelect);
  searchSection.appendChild(searchInput);
  selectorSection.appendChild(episodeSelect);

  rootElem.appendChild(header);
  rootElem.appendChild(showSection);
  rootElem.appendChild(searchSection);
  rootElem.appendChild(selectorSection);
  rootElem.appendChild(episodeCount);
}

async function handleShowSelect(event) {
  const selectedShowId = parseInt(event.target.value);
  
  if (selectedShowId) {
    await loadShow(selectedShowId);
  }
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredEpisodes = allEpisodes;
  } else {
    filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);
      const summaryMatch = episode.summary.toLowerCase().includes(searchTerm);
      return nameMatch || summaryMatch;
    });
  }

  makePageForEpisodes(filteredEpisodes);
  updateEpisodeCount();

  document.getElementById("episode-select").value = "";
}

function handleEpisodeSelect(event) {
  const selectedEpisodeId = parseInt(event.target.value);

  if (selectedEpisodeId) {
    const selectedEpisode = allEpisodes.find(
      (episode) => episode.id === selectedEpisodeId
    );
    if (selectedEpisode) {
      filteredEpisodes = [selectedEpisode];
      makePageForEpisodes(filteredEpisodes);
      updateEpisodeCount();

      document.getElementById("search-input").value = "";

      setTimeout(() => {
        const episodeElement = document.querySelector(".episode-card");
        if (episodeElement) {
          episodeElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  } else {
    filteredEpisodes = allEpisodes;
    makePageForEpisodes(filteredEpisodes);
    updateEpisodeCount();
    document.getElementById("search-input").value = "";
  }
}

function updateEpisodeCount() {
  const countElement = document.getElementById("episode-count");
  const count = filteredEpisodes.length;
  const total = allEpisodes.length;

  if (count === total) {
    countElement.textContent = `Showing all ${total} episodes`;
  } else {
    countElement.textContent = `Showing ${count} of ${total} episodes`;
  }
}

function makePageForEpisodes(episodeList) {
  let episodeContainer = document.querySelector(".episode-container");
  if (episodeContainer) {
    episodeContainer.innerHTML = "";
  } else {
    episodeContainer = document.createElement("div");
    episodeContainer.className = "episode-container";
    document.getElementById("root").appendChild(episodeContainer);
  }

  for (let episode of episodeList) {
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode-card";
    episodeDiv.innerHTML = `
      <h2 class="episode-title">${episodeCode} - ${episode.name}</h2>
      <img src="${episode.image.medium}" alt="${episode.name}" class="episode-image">
      <div class="episode-summary">${episode.summary}</div>
    `;
    episodeContainer.appendChild(episodeDiv);
  }

  let credits = document.querySelector(".credits");
  if (!credits) {
    credits = document.createElement("p");
    credits.className = "credits";
    credits.innerHTML = `Data originally sourced from <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>`;
    document.getElementById("root").appendChild(credits);
  }
}

window.onload = setup;