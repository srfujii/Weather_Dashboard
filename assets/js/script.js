// Weather Dashhboard JavaScript
//
//  This JavaScript powers a weather dashhboard where a user can search for weather information 
//  by city name. If the city exists, the current weather and the five-day forecast weather is 
//  displayed for the chosen city. If the user types in an invalid city, an alert is displayed
//  prompting the user to please enter a valid city name.

/*** GLOBAL VARIABLES ***/
var cityNameEl = document.querySelector('#cityName');               // Reference to city user entered
var searchBtnEl = document.querySelector('#searchBtn');             // Reference to search button
var cityListContainerEl = document.querySelector('#cityList');      // Reference to previous city search list
var cityName;                                                       // Name of city
var cityLat;                                                        // Latitude
var cityLon;                                                        // Longitude
var cityWeatherObject = {                                           // City Weather Object to store in local storage
    cityName: "",                                                   // Contains current weather info, and
    current: {
        date: "",
        iconURL: "",
        temp: "",
        humidity: "",
        windspeed: "",
        uvi: ""
    },
    dailyArray: [{date: "", iconURL: "", temp: "", humidity: ""},   // also an array of daily weather info
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""}]
}


// Function buttonClickHandler: Called first when user enters a city name and clicks the Search button,
//      Calls getWeatherData and passes in the name of the city the user entered.
var buttonClickHandler = function (event) {
  event.preventDefault();                   // Prevent default action

  cityName = cityNameEl.value.trim();       // Sanitize user input

  if (cityName) {
    cityName = toTitleCase(cityName);       // Convert to Title Case e.g. San Francisco not sAn francisco
    getWeatherData(cityName);               // Call getWeatherData with the sanitized city name
  } else {
    alert('Please enter a valid city name');
  }
};

// function toTitleCase: Called by the Search button click event handler,
//      Returns city name in title case form (e.g. San Francisco not sAn francisCO
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

//  function listContainerClickHandler: when user clicks on a previous city name
//      stored in localStorage, this function retrieves the city weather object
//      from local storage and displays the current weather and five-day forecast.
var listContainerClickHandler = function (event) {

    event.preventDefault();

    // Make sure we clicked the city button, then set city name and city weather 
    // object to that city's information from local storage. 
    if (event.target.nodeName === "BUTTON") {
        cityName = event.target.innerHTML;
        cityWeatherObject = JSON.parse(localStorage.getItem(`${cityName}`));
        displayCurrentWeather();
        displayFiveDayForecast();
    }
}

// Function getWeatherData: Called by the Search Button click handler after user
//      enters a city name. Checks to see whether city weather data already exists
//      in local storage. If so, retrieves data from local storage and calls displayCurrentWeather
//      and displayFiveDayForecast weather to show the data on the website.
//      If city name is NOT found in local storage, composes two fetch requests to 
//      get weather data from the Open Weather API. Fetches the latitude and longitude of the city and 
//      displays an alert if the city is not found (e.g. city name of "weoairjeojo").
//      If a valid city name, performs another fetch to retrieve the weather information for
//      that city. Calls display functions to display the data.
function getWeatherData (cityName) {

    // Check to see if city is already stored in local storage, if so, retrieve & display
    if (localStorage.getItem(`${cityName}`) !== null) {
        cityWeatherObject = JSON.parse(localStorage.getItem(`${cityName}`));
        displayCurrentWeather();
        displayFiveDayForecast();
    } else {
        // Our first fetch request to obtain latitude and longitude for city
        var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=1&appid=785aad59f51a31c19fdb12b735b526d0';

        fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
            response.json().then(function (data) {
                // If Open Weather returns empty data object, alert the user and go back
                if (data == "") {
                    alert('Error: ' + 'You must enter a valid city name. Please try again.');
                    return;
                }
                cityLat = data[0].lat;      // Set city latitude
                cityLon = data[0].lon;      // Set city longitude

                // Our second fetch request to obtain city weather data using latitude and longitude
                var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&units=imperial&exclude=minutely,hourly,alerts&appid=785aad59f51a31c19fdb12b735b526d0';
        
                fetch(apiUrl)
                    .then(function (response) {
                    if (response.ok) {
                        response.json().then(function (data) {
                            
                            // If Open Weather returns empty data object, alert the user and go back
                            if (data == "") {
                                alert('Error: ' + 'We could not find that city, please try again.');
                                return;
                            }
                            // Create and display new data object
                            setWeatherObjectVals(cityName, data.current, data.daily[0].uvi);
                            setFiveDayObjectVals(cityName, data.daily);
                            addCityToList(cityName);
                            localStorage.setItem(`${cityName}`, JSON.stringify(cityWeatherObject));
                            displayCurrentWeather();
                            displayFiveDayForecast();
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
    }
};

/*** Function addCityToList: Creates new city list item below search input box on web page ***/
function addCityToList (cityName) {

    var buttonEl = document.createElement('button');
    buttonEl.classList = 'list-group-item list-group-item-action';
    buttonEl.textContent = cityName;
    cityListContainerEl.appendChild(buttonEl);
}

/*** Function setWeatherObjectVals: sets our current city weather object values ***/
function setWeatherObjectVals (nameofCity, currentWeather, dailyUVI) {
    cityWeatherObject.cityName = nameofCity;
    cityWeatherObject.current.date = moment().format("MM/DD/YY");
    cityWeatherObject.current.iconURL = `http://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`;
    cityWeatherObject.current.temp = "Temperature: " + currentWeather.temp + " \u00B0F";
    cityWeatherObject.current.humidity = "Humidity: " + currentWeather.humidity + "%";
    cityWeatherObject.current.windspeed = "Wind Speed: " + currentWeather.wind_speed + " MPH";
    cityWeatherObject.current.uvi = dailyUVI;
}

/*** Function setFiveDayObjectVals: Sets our five-day city weather object values ***/
function setFiveDayObjectVals (nameofCity, dailyWeatherArray){

    // Set days 1 - 5 only
    for (var i = 1; i < 6; i++) {
        cityWeatherObject.dailyArray[i].date = moment.unix(dailyWeatherArray[i].sunset).format("MM/DD/YY");
        cityWeatherObject.dailyArray[i].iconURL = `http://openweathermap.org/img/w/${dailyWeatherArray[i].weather[0].icon}.png`;
        cityWeatherObject.dailyArray[i].temp = "Temp: " + dailyWeatherArray[i].temp.day + " \u00B0F";
        cityWeatherObject.dailyArray[i].humidity = "Humidity: " + dailyWeatherArray[i].humidity + "%";
    }
}

/*** Function displayCurrentWeather: Displays current city weather information on web page  ***/
function displayCurrentWeather () {

    var divContainerEl = document.querySelector('#currentWeather');
    divContainerEl.innerHTML = "";  // Clear out before display new information

    var divCardEl = document.createElement('div');
    divCardEl.classList = 'card';

    var divCardBodyEl = document.createElement('div');
    divCardBodyEl.classList = 'card-body';

    var cityNameDateEl = document.createElement('h3');
    cityNameDateEl.classList = 'card-title';
    var today = cityWeatherObject.current.date;
    cityNameDateEl.textContent = cityWeatherObject.cityName + " (" + today + ")";

    var imgIconEl = document.createElement('img');
    imgIconEl.setAttribute('src', cityWeatherObject.current.iconURL);

    var temperatureEl = document.createElement('p');
    temperatureEl.classList = 'card-text';
    temperatureEl.textContent = cityWeatherObject.current.temp;

    var humidityEl = document.createElement('p');
    humidityEl.classList = 'card-text';
    humidityEl.textContent = cityWeatherObject.current.humidity;

    var windSpeedEl = document.createElement('p');
    windSpeedEl.classList = 'card-text';
    windSpeedEl.textContent = cityWeatherObject.current.windspeed;

    var uvIndexEl = document.createElement('p');
    uvIndexEl.classList = 'card-text';
    uvIndexEl.textContent = "UV Index: ";
    var uvColorEl = document.createElement('span');

    // Set our UVI background color according to UVI number
    if (cityWeatherObject.current.uvi <= 2) {
        uvColorEl.classList = 'bg-success p-2 text-white';  // Green
    } else if ((cityWeatherObject.current.uvi >= 2) && (cityWeatherObject.current.uvi < 6)) {
        uvColorEl.classList = 'bg-warning p-2 text-white';  // Yellow
    } else {
        uvColorEl.classList = 'bg-danger p-2 text-white';   // Red
    }
    uvColorEl.textContent = cityWeatherObject.current.uvi;

    divContainerEl.appendChild(divCardEl);
    divCardEl.appendChild(divCardBodyEl);
    divCardBodyEl.appendChild(cityNameDateEl);
    cityNameDateEl.appendChild(imgIconEl);
    divCardBodyEl.appendChild(temperatureEl);
    divCardBodyEl.appendChild(humidityEl);
    divCardBodyEl.appendChild(windSpeedEl);
    divCardBodyEl.appendChild(uvIndexEl);
    uvIndexEl.appendChild(uvColorEl);
};

/*** Function displayFiveDayForecast: Displays the five-day forecast in individual card elements on the web page ***/
function displayFiveDayForecast () {

    var fiveDayContainerRowEl = document.querySelector('#fiveDayContainerRow');
    var fiveDayForecastTitleEl = document.querySelector('#fiveDayForecastTitle');
    fiveDayContainerRowEl.innerHTML = "";
    fiveDayForecastTitleEl.innerHTML = "";
    
    var fiveDayTitleEl = document.createElement('h3');
    fiveDayTitleEl.textContent = "Five Day Forecast: ";
    fiveDayForecastTitleEl.appendChild(fiveDayTitleEl);

    // Loop through days 1 - 5
    for (var i = 1; i < 6; i++) {

        //Display five-day forecast cards
        var displayDate = cityWeatherObject.dailyArray[i].date;

        var outerDivEl = document.createElement('div');
        outerDivEl.classList = 'col';
        
        var divCardEl = document.createElement('div');
        divCardEl.classList = 'card fiveDayWidth';

        var divCardBodyEl = document.createElement('div');
        divCardBodyEl.classList = 'card-body bg-primary text-white';

        var h5DateEl = document.createElement('h5');
        h5DateEl.classList = 'card-title';
        h5DateEl.textContent = displayDate;

        var imgIconEl = document.createElement('img');
        imgIconEl.setAttribute('src', cityWeatherObject.dailyArray[i].iconURL);

        var tempEl = document.createElement('p');
        tempEl.classList = 'card-text';
        tempEl.textContent = cityWeatherObject.dailyArray[i].temp;

        var humidEl = document.createElement('p');
        humidEl.classList = 'card-text';
        humidEl.textContent = cityWeatherObject.dailyArray[i].humidity;

        fiveDayContainerRowEl.appendChild(outerDivEl);
        outerDivEl.appendChild(divCardEl);
        divCardEl.appendChild(divCardBodyEl);
        divCardBodyEl.appendChild(h5DateEl);
        divCardBodyEl.appendChild(imgIconEl);
        divCardBodyEl.appendChild(tempEl);
        divCardBodyEl.appendChild(humidEl);

    }
};

/*** Event Listeners ***/
searchBtnEl.addEventListener('click', buttonClickHandler);
cityListContainerEl.addEventListener('click', listContainerClickHandler);
