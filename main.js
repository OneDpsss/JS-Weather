const API_KEY = '81ac6854a1b748926ad19292fd753dab';
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastDiv = document.getElementById('forecast');
const errorDiv = document.getElementById('error');
const forecastModal = document.getElementById('forecastModal');
const modalClose = document.getElementById('modalClose');

const cityNameEl = document.getElementById('cityName');
const currentTempEl = document.getElementById('currentTemp');
const weatherIconEl = document.getElementById('weatherIcon');
const weatherDescEl = document.getElementById('weatherDesc');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const pressureEl = document.getElementById('pressure');
const forecastItemsEl = document.getElementById('forecastItems');

const modalDateEl = document.getElementById('modalDate');
const modalTempEl = document.getElementById('modalTemp');
const modalWeatherEl = document.getElementById('modalWeather');
const modalMinMaxEl = document.getElementById('modalMinMax');
const modalHumidityEl = document.getElementById('modalHumidity');
const modalWindEl = document.getElementById('modalWind');
const modalIconEl = document.getElementById('modalIcon');

let currentUnit = 'metric';
let latestWeatherData = null;

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('cityInput');
    const celsiusBtn = document.getElementById('celsiusBtn');
    const fahrenheitBtn = document.getElementById('fahrenheitBtn');

    console.log("DOM elements check:");
    console.log("currentWeatherDiv:", currentWeatherDiv);
    console.log("forecastDiv:", forecastDiv);
    console.log("searchBtn:", searchBtn);
    console.log("cityInput:", cityInput);

    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });

    celsiusBtn.addEventListener('click', () => switchUnit('metric', celsiusBtn, fahrenheitBtn));
    fahrenheitBtn.addEventListener('click', () => switchUnit('imperial', fahrenheitBtn, celsiusBtn));

    modalClose.addEventListener('click', () => {
        forecastModal.classList.add('hidden');
    });

    cityInput.value = 'Moscow';
    searchWeather();
});

async function searchWeather() {
    console.log("searchWeather triggered");
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        const data = await getWeatherData(city);
        latestWeatherData = data;
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

async function getWeatherData(city) {
    try {
        currentWeatherDiv.classList.add('hidden');
        forecastDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');

        console.log("Fetching current weather for:", city);
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`
        );

        console.log("Current weather response status:", currentResponse.status);
        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error('City not found. Please try another location.');
            } else {
                throw new Error('Unable to fetch weather data. Please try again later.');
            }
        }

        const currentData = await currentResponse.json();
        console.log("Current weather data:", currentData);

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${API_KEY}&units=${currentUnit}`
        );

        console.log("Forecast response status:", forecastResponse.status);
        if (!forecastResponse.ok) throw new Error('Unable to fetch forecast data');

        const forecastData = await forecastResponse.json();
        console.log("Forecast data:", forecastData);

        return { current: currentData, forecast: forecastData };
    } catch (error) {
        console.error("Error in getWeatherData:", error);
        throw error;
    }
}

function displayWeather(data) {
    console.log("Displaying weather data:", data);

    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

    cityNameEl.textContent = `${data.current.name}, ${data.current.sys.country}`;
    currentTempEl.textContent = `${Math.round(data.current.main.temp)}${unitSymbol}`;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
    weatherIconEl.alt = data.current.weather[0].description;
    weatherDescEl.textContent = data.current.weather[0].description.charAt(0).toUpperCase() +
        data.current.weather[0].description.slice(1);
    feelsLikeEl.textContent = `Feels like: ${Math.round(data.current.main.feels_like)}${unitSymbol}`;
    humidityEl.textContent = `Humidity: ${data.current.main.humidity}%`;
    windSpeedEl.textContent = `Wind: ${data.current.wind.speed} ${windUnit}`;
    pressureEl.textContent = `Pressure: ${data.current.main.pressure} hPa`;

    forecastItemsEl.innerHTML = '';
    const dailyForecast = data.forecast.list.filter(item =>
        item.dt_txt.includes('12:00:00')
    );

    dailyForecast.forEach((day, index) => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.style.cursor = 'pointer';
        forecastItem.innerHTML = `
            <p>${new Date(day.dt * 1000).toLocaleDateString('en', {weekday: 'short'})}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <p class="temp">${Math.round(day.main.temp)}${unitSymbol}</p>
            <p>${day.weather[0].main}</p>
        `;
        forecastItem.addEventListener('click', () => showForecastDetails(day));
        forecastItemsEl.appendChild(forecastItem);
    });

    currentWeatherDiv.classList.remove('hidden');
    forecastDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');

    console.log("UI updated, elements should be visible");
}

function showForecastDetails(day) {
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

    modalDateEl.textContent = new Date(day.dt * 1000).toLocaleDateString('en', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
    modalTempEl.textContent = `Temperature: ${Math.round(day.main.temp)}${unitSymbol}`;
    modalWeatherEl.textContent = `Weather: ${day.weather[0].description.charAt(0).toUpperCase() + day.weather[0].description.slice(1)}`;
    modalMinMaxEl.textContent = `Min/Max: ${Math.round(day.main.temp_min)}${unitSymbol} / ${Math.round(day.main.temp_max)}${unitSymbol}`;
    modalHumidityEl.textContent = `Humidity: ${day.main.humidity}%`;
    modalWindEl.textContent = `Wind: ${day.wind.speed} ${windUnit}`;
    modalIconEl.src = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    modalIconEl.alt = day.weather[0].description;

    forecastModal.classList.remove('hidden');
}

function switchUnit(unit, activeBtn, inactiveBtn) {
    if (unit === currentUnit) return;
    currentUnit = unit;
    activeBtn.classList.add('active');
    inactiveBtn.classList.remove('active');
    if (latestWeatherData) {
        displayWeather(latestWeatherData);
    } else {
        searchWeather();
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    currentWeatherDiv.classList.add('hidden');
    forecastDiv.classList.add('hidden');
}