let points = 0; // Tracks user points
const badges = []; // Stores earned badges
let map; // Global map variable
let mapInitialized = false; // Flag to check if map is already initialized

// initialize and display the map using Leaflet.js
function initMap(lat, lon) {
  // Check if map is already initialized
  if (!mapInitialized) {
    map = L.map("map").setView([lat, lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
    mapInitialized = true;
  } else {
    map.setView([lat, lon], 13);
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
  }
  L.marker([lat, lon]).addTo(map).bindPopup("You are here!").openPopup();
}

// fetch weather data server and update points and badges
async function getWeather() {
  const city = document.getElementById("city").value.trim();

  // input validation
  if (!city) {
    document.getElementById("weather-info").innerHTML =
      "<p>Please enter a city!</p>";
    return;
  }

  try {
    const response = await fetch(`/api/weather?city=${city}`);

    if (!response.ok) {
      const errorData = await response.json();
      document.getElementById("weather-info").innerHTML = `<p>Error: ${
        errorData.error || "City not found!"
      }</p>`;
      return;
    }

    const data = await response.json();
    document.getElementById("weather-info").innerHTML = `
      <p><strong>City:</strong> ${data.name}</p>
      <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
      <p><strong>Weather:</strong> ${data.weather[0].description}</p>
    `;
    updatePointsAndBadges(data.coord.lat, data.coord.lon);
  } catch (error) {
    document.getElementById("weather-info").innerHTML =
      "<p>Failed to fetch weather data.</p>";
  }
}

// update points, badges, and map based on points achieved
function updatePointsAndBadges(lat, lon) {
  if (points < 100) {
    points += 10;
  }

  document.getElementById("points").innerText = `Points: ${points}`;
  const progressBar = document.getElementById("progress");
  const progressPercentage = Math.min((points / 100) * 100, 100);
  progressBar.style.width = `${progressPercentage}%`;

  if (points >= 50 && !badges.includes("Weather Explorer")) {
    badges.push("Weather Explorer");
    document.getElementById(
      "badges"
    ).innerHTML += `<span class="badge">Weather Explorer</span>`;
  }

  if (points >= 100 && !badges.includes("Weather Master")) {
    badges.push("Weather Master");
    document.getElementById(
      "badges"
    ).innerHTML += `<span class="badge">Weather Master</span>`;
    document.getElementById("map").style.display = "block";
    initMap(lat, lon);
  } else if (points >= 100) {
    initMap(lat, lon);
  }
}
