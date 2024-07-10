const apiKey = "1bb98242754bde91af62e9ca661c32d9";
const searchInput = document.getElementById('citysearch');
const searchButton = document.querySelector('.search-button');
const searchHistory = document.getElementById('search-history');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');

let searchHistoryArray = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Function to fetch weather data from the OpenWeatherMap API
function fetchWeatherData(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error fetching weather data');
      }
    })
    .then(data => {
      const { name, weather, main, wind } = data;
      const { description, icon } = weather[0];
      const { temp, humidity } = main;
      const { speed } = wind;

      const currentWeatherHTML = `
        <h2>${name} (${new Date().toLocaleDateString()})</h2>
        <img src="https://openweathermap.org/img/w/${icon}.png" alt="${description}">
        <p>Temperature: ${temp}°C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${speed} m/s</p>
      `;

      currentWeatherDiv.innerHTML = currentWeatherHTML;

      const lat = data.coord.lat;
      const lon = data.coord.lon;
      fetchForecastData(lat, lon);
    })
    .catch(error => {
      currentWeatherDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

// Function to fetch forecast data from the OpenWeatherMap API
function fetchForecastData(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error fetching forecast data');
      }
    })
    .then(data => {
      const forecastHTML = data.list
        .filter((item) => item.dt_txt.includes('12:00:00'))
        .map((item) => {
          const { dt_txt, weather, main, wind } = item;
          const { description, icon } = weather[0];
          const { temp, humidity } = main;
          const { speed } = wind;

          return `
            <div class="col-md-2 bg-primary text-white rounded p-2 m-2">
              <h5>${new Date(dt_txt).toLocaleDateString()}</h5>
              <img src="https://openweathermap.org/img/w/${icon}.png" alt="${description}">
              <p>Temp: ${temp}°C</p>
              <p>Wind: ${speed} m/s</p>
              <p>Humidity: ${humidity}%</p>
            </div>
          `;
        })
        .join('');

      forecastDiv.innerHTML = forecastHTML;
    })
    .catch(error => {
      forecastDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

// Function to render search history
function renderSearchHistory() {
  searchHistory.innerHTML = '';
  searchHistoryArray.forEach((city) => {
    const historyItem = document.createElement('button');
    historyItem.textContent = city;
    historyItem.classList.add('btn', 'btn-secondary', 'mb-2');
    historyItem.addEventListener('click', () => fetchWeatherData(city));
    searchHistory.appendChild(historyItem);
  });
}

// Event listener for search button
searchButton.addEventListener('click', () => {
  const city = searchInput.value.trim();
  if (city) {
    fetchWeatherData(city);
    if (!searchHistoryArray.includes(city)) {
      searchHistoryArray.push(city);
      localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArray));
    }
    renderSearchHistory();
    searchInput.value = '';
  }
});

// Render search history on page load
renderSearchHistory();