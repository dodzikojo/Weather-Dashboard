const APIKey = "234dd37d46a1b4a430f58520a10e1039"
let allPossibleCities = [];
let moment = require("moment")
let cities = require("cities.json")

let locationName = $("#locationName");
let temperature = $("#temperature");
var mainDescription = $("#mainDescription");
var secondaryDescription = $("#secondaryDescription");

let mainWeatherData;

// getJSONWeatherData(5.55602, -0.1969)

function getJSONWeatherData(lat, lon) {
    var openWeatherMapAPI = "https://api.openweathermap.org/data/2.5/forecast";

    $.getJSON(openWeatherMapAPI, {
        lat: lat,
        lon: lon,
        APIKey: APIKey
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







$("form").submit(function (event) {
    event.preventDefault();
    var array = $('#searchBar').val().split(', ');
    for (let index = 0; index < cities.length; index++) {
        if (cities[index].name.toLowerCase() === array[0].toLowerCase().trim() && cities[index].country.toLowerCase() === array[1].toLowerCase().trim()) {
            getJSONWeatherData(cities[index].lat, cities[index].lng)
            locationName.text(cities[index].name + ", " + cities[index].country)
            break;
        }

    }
    
})




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
    temperature.text(convertKelvinToCelsius(mainWeatherData.list[0].main.temp).toFixed(0));
    mainDescription.text(mainWeatherData.list[0].weather[0].main);
    secondaryDescription.text("("+mainWeatherData.list[0].weather[0].description+")");
}

function convertKelvinToFahrenheit(valueToConvert){
    return ((valueToConvert-273.15)*1.8)+32
}

function convertKelvinToCelsius(valueToConvert){
    return (valueToConvert-273.15)
}