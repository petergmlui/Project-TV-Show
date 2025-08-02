//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  // Get the root element by its ID
  const rootElem = document.getElementById("root");
  // Clear any existing content in the root element
  rootElem.innerHTML = "";

  // Create a container div for the grid layout
  const episodeContainer = document.createElement("div");
  episodeContainer.className = "episode-container"; // Class for CSS later

  // Show each episode in allEpisodes array
  for (let episode of episodeList) {
    // Format episode code as SXXEXX
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    // Create a div for the episode card
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode-card"; // Class for CSS later
    // Add episode details
    episodeDiv.innerHTML = `
      <h2>${episodeCode} - ${episode.name}</h2>
      <img src="${episode.image.medium}" alt="${episode.name}">
      <div>${episode.summary}</div>
    `;
    // Append the episode card to the container
    episodeContainer.appendChild(episodeDiv);
  }

  // Append the episode container to the root element
  rootElem.appendChild(episodeContainer);

  // // testing CSS for grid layout
  // episodeContainer.style.display = "grid";
  // episodeContainer.style.gridTemplateColumns =
  //   "repeat(auto-fit, minmax(300px, 1fr))";
  // episodeContainer.style.gap = "20px";
  // episodeContainer.style.padding = "20px";
  // for (let card of episodeContainer.children) {
  //   card.style.border = "1px solid #ccc";
  //   card.style.padding = "15px";
  //   card.style.boxSizing = "border-box";
  // }

  // TVMaze credits
  const credits = document.createElement("p");
  credits.innerHTML = `Data originally sourced from <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>`;
  rootElem.appendChild(credits);
}

// Run setup function when the window finishes loading
window.onload = setup;
