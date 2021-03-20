// 785aad59f51a31c19fdb12b735b526d0

var cityNameEl = document.querySelector('#cityName');
var searchBtnEl = document.querySelector('#searchBtn');
var cityName;
var cityLat;
var cityLon;

// CALLED FIRST, then CALLS GETWEATHERDATA, passes in city name user typed in
var buttonClickHandler = function (event) {
  event.preventDefault();

  cityName = cityNameEl.value.trim();

  if (cityName) {
    getWeatherData(cityName);

    // repoContainerEl.textContent = '';
    // nameInputEl.value = '';
  } else {
    alert('Please enter a valid city name');
  }
};

// Function takes in city name, then calls getLatitudeLongitude to create a city object we can use for more precise call
function getWeatherData (cityName) {

    var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=1&appid=785aad59f51a31c19fdb12b735b526d0';

    // Request the latitude and longitude for desired city from OpenWeather
    fetch(apiUrl)
      .then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
           
                cityLat = data[0].lat;
                cityLon = data[0].lon;
            
                console.log(cityLat);
                console.log(cityLon);
                console.log(cityName);

                var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&units=imperial&exclude=minutely,hourly,alerts&appid=785aad59f51a31c19fdb12b735b526d0';
  
                console.log("API URL: " + apiUrl);
            
                fetch(apiUrl)
                    .then(function (response) {
                    if (response.ok) {
                        response.json().then(function (data) {
                            console.log(data);
                            displayCurrentWeather(cityName, data.current, data.daily[0].uvi);
                            displayFiveDayForecast(data.daily);
                        });
                    } else {
                        alert('Error: ' + response.statusText);
                    }
                    })
                    .catch(function (error) {
                    alert('Unable to connect to Open Weather Map');
                    });
          });
        } else {
          alert('Error: ' + response.statusText);
        }
      })
      .catch(function (error) {
        alert('Unable to connect to Open Weather Map');
      });
    
};


function displayCurrentWeather (nameOfCity, currentWeather, dailyUVI) {

    var divContainerEl = document.querySelector('#currentWeather');
    divContainerEl.innerHTML = "";  // Clear out before display new information
    var cityNameDateEl = document.createElement('h5');
    cityNameDateEl.classList = 'card-title';
    var today = moment().format("MM/DD/YY");
    cityNameDateEl.textContent = nameOfCity + " (" + today + ")";

    var imgIconEl = document.createElement('img');
    imgIconEl.setAttribute('src', `http://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`);

    var temperatureEl = document.createElement('p');
    temperatureEl.classList = 'card-text';
    temperatureEl.textContent = "Temperature: " + currentWeather.temp + " \u00B0F";

    var humidityEl = document.createElement('p');
    humidityEl.classList = 'card-text';
    humidityEl.textContent = "Humidity: " + currentWeather.humidity + "%";

    var windSpeedEl = document.createElement('p');
    windSpeedEl.classList = 'card-text';
    windSpeedEl.textContent = "Wind Speed: " + currentWeather.wind_speed + " MPH";

    var uvIndexEl = document.createElement('p');
    uvIndexEl.classList = 'card-text';
    uvIndexEl.textContent = "UV Index: ";
    var uvColorEl = document.createElement('span');

    if (dailyUVI <= 2) {
        uvColorEl.classList = 'bg-success p-2 text-white';  // Green
    } else if (dailyUVI >= 2 && dailyUVI < 6) {
        uvColorEl.classList = 'bg-warning p-2 text-white';  // Yellow
    } else {
        uvColorEl.classList = 'bg-danger p-2 text-white';   // Red
    }
    uvColorEl.textContent = dailyUVI;

    divContainerEl.appendChild(cityNameDateEl);
    cityNameDateEl.appendChild(imgIconEl);
    divContainerEl.appendChild(temperatureEl);
    divContainerEl.appendChild(humidityEl);
    divContainerEl.appendChild(windSpeedEl);
    divContainerEl.appendChild(uvIndexEl);
    uvIndexEl.appendChild(uvColorEl);
};

function displayFiveDayForecast (dailyWeatherArray) {

    var fiveDayContainerRowEl = document.querySelector('#fiveDayContainerRow');
    var fiveDayForecastTitleEl = document.querySelector('#fiveDayForecastTitle');
    fiveDayContainerRowEl.innerHTML = "";
    fiveDayForecastTitleEl.innerHTML = "";
    
    var fiveDayTitleEl = document.createElement('h3');
    fiveDayTitleEl.textContent = "Five Day Forecast: ";
    fiveDayForecastTitleEl.appendChild(fiveDayTitleEl);

    for (var i = 1; i < 6; i++) {

        //Display five-day forecast cards
        var displayDate = moment.unix(dailyWeatherArray[i].sunset).format("MM/DD/YY");

        var outerDivEl = document.createElement('div');
        outerDivEl.classList = 'col';
        
        var divCardEl = document.createElement('div');
        divCardEl.classList = 'card bg-blue fiveDayWidth';

        var divCardBodyEl = document.createElement('div');
        divCardBodyEl.classList = 'card-body';

        var h5DateEl = document.createElement('h5');
        h5DateEl.classList = 'card-title';
        h5DateEl.textContent = displayDate;

        var imgIconEl = document.createElement('img');
        imgIconEl.setAttribute('src', `http://openweathermap.org/img/w/${dailyWeatherArray[i].weather[0].icon}.png`)

        var tempEl = document.createElement('p');
        tempEl.classList = 'card-text';
        tempEl.textContent = "Temp: " + dailyWeatherArray[i].temp.day + " \u00B0F";

        var humidEl = document.createElement('p');
        humidEl.classList = 'card-text';
        humidEl.textContent = "Humidity: " + dailyWeatherArray[i].humidity + "%";

        fiveDayContainerRowEl.appendChild(outerDivEl);
        outerDivEl.appendChild(divCardEl);
        divCardEl.appendChild(divCardBodyEl);
        divCardBodyEl.appendChild(h5DateEl);
        divCardBodyEl.appendChild(imgIconEl);
        divCardBodyEl.appendChild(tempEl);
        divCardBodyEl.appendChild(humidEl);

    }
};


searchBtnEl.addEventListener('click', buttonClickHandler);
