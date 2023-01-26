const APIKey = "234dd37d46a1b4a430f58520a10e1039"
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

console.log(faviconEl)

let mainWeatherData;

//Get previously saved city information and load it's weather data.
$("document").ready(function() {
    let historicCity = localStorage.getItem("lastWeatherData");
    if(historicCity != null){
        getWeatherDataFromCityCountryName(JSON.parse(historicCity), cities)
    }
});

function getJSONWeatherData(lat, lon) {
    var openWeatherMapAPI = "https://api.openweathermap.org/data/2.5/forecast";

    $.getJSON(openWeatherMapAPI, {
        lat: lat,
        lon: lon,
        APIKey: APIKey,
        units:"metric",
    }, successFn)

}

function successFn(result) {
    mainWeatherData  = result;

    updateHTMLElements();

    result.list.forEach(element => {
        console.log(element)
    });

    console.log(result.list[0].weather[0].main)
    
}



//#region  Get current location
// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(showPosition);
//     } else {
//         console.log("Geolocation is not supported by this browser.");
//     }
// }

// function showPosition(position) {
//     console.log("Latitude: " + position.coords.latitude);
//     console.log("Longitude: " + position.coords.longitude);
// }
//#endregion






//Submit event when a city is selected.
$("form").submit(function (event) {
    event.preventDefault();
    var cityCountryArray = $('#searchBar').val().split(', ');
    getWeatherDataFromCityCountryName(cityCountryArray, cities)
})

function getWeatherDataFromCityCountryName(cityCountryArray, cities){
    for (let index = 0; index < cities.length; index++) {
        if (cities[index].name.toLowerCase() === cityCountryArray[0].toLowerCase().trim() && cities[index].country.toLowerCase() === cityCountryArray[1].toLowerCase().trim()) {
            getJSONWeatherData(cities[index].lat, cities[index].lng)
            locationNameEl.text(cities[index].name + ", " + cities[index].country)

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

function updateHTMLElements () {
    temperatureEl.text(mainWeatherData.list[0].main.temp.toFixed());
    feelsLikeValueEl.text(mainWeatherData.list[0].main.feels_like.toFixed(0)+" °C");
    mainDescriptionEl.text(mainWeatherData.list[0].weather[0].main);
    secondaryDescriptionEl.text("("+mainWeatherData.list[0].weather[0].description+")");
    windSpeedEl.text(mainWeatherData.list[0].wind.speed+" KMPH");
    humidityValueEl.text(mainWeatherData.list[0].main.humidity+" %");
    pageTitleEl.text(mainWeatherData.list[0].main.temp.toFixed(0)+" °C");
    setWeatherIcon(mainWeatherData.list[0].weather[0].icon, mainWeatherImageEl)
    setWeatherFavicon(mainWeatherData.list[0].weather[0].icon, faviconEl)
}

function convertKelvinToFahrenheit(valueToConvert){
    return ((valueToConvert-273.15)*1.8)+32
}

function convertKelvinToCelsius(valueToConvert){
    return (valueToConvert-273.15)
}