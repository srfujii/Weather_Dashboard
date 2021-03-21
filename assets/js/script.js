// 785aad59f51a31c19fdb12b735b526d0

var cityNameEl = document.querySelector('#cityName');
var searchBtnEl = document.querySelector('#searchBtn');
var cityName;
var cityLat;
var cityLon;
var cityWeatherObject = {
    cityName: "",
    current: {
        date: "",
        iconURL: "",
        temp: "",
        humidity: "",
        windspeed: "",
        uvi: ""
    },
    dailyArray: [{date: "", iconURL: "", temp: "", humidity: ""}, 
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""}]
}


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
                            setWeatherObjectVals(cityName, data.current, data.daily[0].uvi);
                            setFiveDayObjectVals(cityName, data.daily);
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
    
};

function setWeatherObjectVals (nameofCity, currentWeather, dailyUVI) {
    cityWeatherObject.cityName = nameofCity;
    cityWeatherObject.current.date = moment().format("MM/DD/YY");
    cityWeatherObject.current.iconURL = `http://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`;
    cityWeatherObject.current.temp = "Temperature: " + currentWeather.temp + " \u00B0F";
    cityWeatherObject.current.humidity = "Humidity: " + currentWeather.humidity + "%";
    cityWeatherObject.current.windspeed = "Wind Speed: " + currentWeather.wind_speed + " MPH";
    cityWeatherObject.current.uvi = dailyUVI;
}

function setFiveDayObjectVals (nameofCity, dailyWeatherArray){

    for (var i = 1; i < 6; i++) {

        cityWeatherObject.dailyArray[i].date = moment.unix(dailyWeatherArray[i].sunset).format("MM/DD/YY");
        cityWeatherObject.dailyArray[i].iconURL = `http://openweathermap.org/img/w/${dailyWeatherArray[i].weather[0].icon}.png`;
        cityWeatherObject.dailyArray[i].temp = "Temp: " + dailyWeatherArray[i].temp.day + " \u00B0F";
        cityWeatherObject.dailyArray[i].humidity = "Humidity: " + dailyWeatherArray[i].humidity + "%";

    }
}

function displayCurrentWeather () {

    console.log(cityWeatherObject.cityName);
    console.log(cityWeatherObject.current.date);
    console.log(cityWeatherObject.current.iconURL);
    console.log(cityWeatherObject.current.temp);
    console.log(cityWeatherObject.current.humidity);
    console.log(cityWeatherObject.current.windspeed);
    console.log(cityWeatherObject.current.uvi);


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

function displayFiveDayForecast () {

    var fiveDayContainerRowEl = document.querySelector('#fiveDayContainerRow');
    var fiveDayForecastTitleEl = document.querySelector('#fiveDayForecastTitle');
    fiveDayContainerRowEl.innerHTML = "";
    fiveDayForecastTitleEl.innerHTML = "";
    
    var fiveDayTitleEl = document.createElement('h3');
    fiveDayTitleEl.textContent = "Five Day Forecast: ";
    fiveDayForecastTitleEl.appendChild(fiveDayTitleEl);

    for (var i = 1; i < 6; i++) {

        console.log(cityWeatherObject.dailyArray[i].date);
        console.log(cityWeatherObject.dailyArray[i].date);
        console.log(cityWeatherObject.dailyArray[i].iconURL);
        console.log(cityWeatherObject.dailyArray[i].temp);
        console.log(cityWeatherObject.dailyArray[i].humidity);

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

function storeCityData (e) {

    e.preventDefault();

    // Sanitize user input
    highScoreObject.userInitials = document.querySelector("#initials").value.trim();
    highScoreObject.userScore = score;

    // Make sure they entered *something*
    if (highScoreObject.userInitials !== "") {

        // Pull old local storage items and store in array
        // Get stored value from client storage, if it exists
        var storedScores = JSON.parse(localStorage.getItem("highScores"));
        
        if (storedScores == null) {
            var storedScores = [];
        } 
        
        // Add new score to our array of high scores
        storedScores.push(highScoreObject);
        // Stringify and set key in localStorage to storedScores array
        localStorage.setItem("highScores", JSON.stringify(storedScores));
        // Disable Submit...only allowed to enter one high score per game
        submitButton = document.querySelector("#submitButton");
        submitButton.disabled = true;
        displayHighScores();
    } else {
        alert("Please type your initials.");    // User must enter *something*
    }



}


searchBtnEl.addEventListener('click', buttonClickHandler);
