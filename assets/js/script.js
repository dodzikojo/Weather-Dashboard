const APIKey = "234dd37d46a1b4a430f58520a10e1039"
const openWeatherMapForecastAPI = "https://api.openweathermap.org/data/2.5/forecast";
const openWeatherMapReverseGeocodingAPI = "http://api.openweathermap.org/geo/1.0/reverse?";



let allPossibleCities = [];
let moment = require("moment")
let cities = require("cities.json")

let locationNameEl = $("#locationName");
let temperatureEl = $("#temperature");
let mainDescriptionEl = $("#mainDescription");
let secondaryDescriptionEl = $("#secondaryDescription");
let feelsLikeValueEl = $("#feelLikeValue");
let windSpeedEl = $("#windValue");
let humidityValueEl = $("#humidityValue");
let mainWeatherImageEl = $("#mainWeatherImage");
let faviconEl = $("#favicon");
let pageTitleEl = $("#pageTitle");
let mainWeatherDateTimeEl = $("#weatherDateTime");
let mainWeatherData;

//Get previously saved city information and load it's weather data.
$("document").ready(function() {
    let historicCity = localStorage.getItem("lastWeatherData");
    if(historicCity != null){
        getWeatherDataFromCityCountryName(JSON.parse(historicCity), cities)
        
    }
    else{
        //Select a random city and display weather.
        let selectedCity = cities[Math.floor(Math.random() * cities.length)];
        coordinatesToLocationInformation(selectedCity.lat, selectedCity.lng)
        getJSONWeatherData(selectedCity.lat, selectedCity.lng)
    }
});


let coordinatesToLocationInformation = function (lat, lon) {
    $.getJSON(openWeatherMapReverseGeocodingAPI, {
        lat: lat,
        lon: lon,
        APIKey: APIKey,
    },  successReturnedLocation)

}

function successReturnedLocation(result) {
    var city = "";
    var state= "";
    var country = "";
    if(result[0].name != null){
        city = result[0].name + ", "
    }
    if(result[0].state != null){
        state = result[0].state + ", "
    }
    if(result[0].country != null){
        country = result[0].country
    }
    locationNameEl.text(city +state +country)  ;
    
}

function getJSONWeatherData(lat, lon) {
    $.getJSON(openWeatherMapForecastAPI, {
        lat: lat,
        lon: lon,
        APIKey: APIKey,
        units:"metric",
    }, successFn)
}

function successFn(result) {
    mainWeatherData  = result;

    updateHTMLElements(mainWeatherData);
}


  var availableTags = [
    "Use Current Location",
];

  $( "#searchBar" ).autocomplete({
    source: availableTags,
    minLength:0,
    select: function( event, ui ) {
        getLocation()
    }
}).bind('focus', function(){ $(this).autocomplete("search"); } );


// #region  Get current location
function getLocation() {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    console.log("Latitude: " + position.coords.latitude);
    console.log("Longitude: " + position.coords.longitude);

    getJSONWeatherData(position.coords.latitude, position.coords.longitude)
}
// #endregion


function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.")
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.")
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.")
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.")
        break;
    }
  }



//Submit event when a city is selected.
$("form").submit(function (event) {
    event.preventDefault();
    console.log($("#searchBar").val())
    var cityCountryArray = $('#searchBar').val().split(', ');
    // console.log(cityCountryArray)
    getWeatherDataFromCityCountryName(cityCountryArray, cities)
})

function getWeatherDataFromCityCountryName(cityCountryArray, cities){
    for (let index = 0; index < cities.length; index++) {
        if (cities[index].name.toLowerCase() === cityCountryArray[0].toLowerCase().trim() && cities[index].country.toLowerCase() === cityCountryArray[1].toLowerCase().trim()) {
            getJSONWeatherData(cities[index].lat, cities[index].lng)
            coordinatesToLocationInformation(cities[index].lat, cities[index].lng)

            //Add lat and long to data before saving in localStorge
            cityCountryArray.push(cities[index].lat)
            cityCountryArray.push(cities[index].lng)
            //save searched information to localstorage
            localStorage.setItem("lastWeatherData",JSON.stringify(cityCountryArray));
            break; //No need to continue searching.
        }

    }
}

function setWeatherIcon(iconCode, iconImgEl) {
    iconImgEl.attr("src", "./././assets/images/"+iconCode+".png" )
}

function setWeatherFavicon(iconCode, iconImgEl) {
    iconImgEl.attr("href", "./././assets/images/"+iconCode+".png" )
}

$("#searchBar").keyup(function (e) {
    allPossibleCities = []
    if ($("#searchBar").val().length >= 2) {
        for (let index = 0; index < cities.length; index++) {

            if (cities[index].name.toLowerCase() == $("#searchBar").val().toLowerCase() || cities[index].name.toLowerCase().includes($("#searchBar").val().toLowerCase())) {
                allPossibleCities.push(cities[index].name + ", " + cities[index].country)
            }
        }
    }

    $("#searchBar").autocomplete({
        maxHeight: 10,
        source: allPossibleCities.filter(onlyUnique).slice(0, 9)
    });
});

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function updateHTMLElements (mainWeatherData) {
    temperatureEl.text(mainWeatherData.list[0].main.temp.toFixed());
    feelsLikeValueEl.text(mainWeatherData.list[0].main.feels_like.toFixed(0)+" °C");
    mainDescriptionEl.text(mainWeatherData.list[0].weather[0].main);
    secondaryDescriptionEl.text("("+mainWeatherData.list[0].weather[0].description+")");
    windSpeedEl.text(mainWeatherData.list[0].wind.speed+" KMPH");
    humidityValueEl.text(mainWeatherData.list[0].main.humidity+" %");
    mainWeatherDateTimeEl.text(moment(mainWeatherData.list[0].dt_txt, "YYYY-MM-DD HH:mm:ss").format("dddd, MMM DD hh:mm A")); 
   
    pageTitleEl.text(mainWeatherData.list[0].main.temp.toFixed(0)+" °C - "+locationNameEl.text());
    setWeatherIcon(mainWeatherData.list[0].weather[0].icon, mainWeatherImageEl)
    setWeatherFavicon(mainWeatherData.list[0].weather[0].icon, faviconEl)
}

function convertKelvinToFahrenheit(valueToConvert){
    return ((valueToConvert-273.15)*1.8)+32
}

function convertKelvinToCelsius(valueToConvert){
    return (valueToConvert-273.15)
}