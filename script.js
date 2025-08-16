let allEpisodes = [];
let filteredEpisodes = [];

async function fetchEpisodes() {
  const rootElem = document.getElementById("root");

  // Show loading message
  rootElem.innerHTML =
    '<div class="loading">Loading episodes, please wait...</div>';

  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // Show error message on page
    rootElem.innerHTML =
      '<div class="error">Failed to load episodes. Please try refreshing the page.</div>';
    throw error; // Rethrow to prevent further execution
  }
}

async function setup() {
  try {
    allEpisodes = await fetchEpisodes();
    filteredEpisodes = allEpisodes;
    createPageStructure();
    makePageForEpisodes(filteredEpisodes);
    updateEpisodeCount();
  } catch (error) {
    // Error already handled in fetchEpisodes
  }
}

function createPageStructure() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear loading/error message

  const header = document.createElement("div");
  header.className = "header";

  const title = document.createElement("h1");
  title.textContent = "TV Show Episodes";
  title.className = "page-title";

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

  const episodeCount = document.createElement("div");
  episodeCount.id = "episode-count";
  episodeCount.className = "episode-count";

  header.appendChild(title);
  searchSection.appendChild(searchInput);
  selectorSection.appendChild(episodeSelect);

  rootElem.appendChild(header);
  rootElem.appendChild(searchSection);
  rootElem.appendChild(selectorSection);
  rootElem.appendChild(episodeCount);
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
