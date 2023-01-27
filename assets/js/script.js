const APIKey = "234dd37d46a1b4a430f58520a10e1039"
const openWeatherMapForecastAPI = "https://api.openweathermap.org/data/2.5/forecast";
const openWeatherMapReverseGeocodingAPI = "https://api.openweathermap.org/geo/1.0/reverse?";



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
let forecastWeatherDataArray = [];

//Get previously saved city information and load it's weather data.
$("document").ready(function () {
    getSetWeatherDataOnNoSelection()
});



let coordinatesToLocationInformation = function (lat, lon) {
    $.getJSON(openWeatherMapReverseGeocodingAPI, {
        lat: lat,
        lon: lon,
        APIKey: APIKey,
    }, successReturnedLocation)

}

function successReturnedLocation(result) {
    var city = "";
    var state = "";
    var country = "";
    if (result[0].name != null) {
        city = result[0].name + ", "
    }
    if (result[0].state != null) {
        state = result[0].state + ", "
    }
    if (result[0].country != null) {
        country = result[0].country
    }
    locationNameEl.text(city + state + country);

}

function getJSONWeatherData(lat, lon) {
    $.getJSON(openWeatherMapForecastAPI, {
        lat: lat,
        lon: lon,
        APIKey: APIKey,
        units: "metric",
    }, successFn)
}

function successFn(result) {
    mainWeatherData = result;
    forecastWeatherDataArray = [];


    result.list.forEach(element => {
        if (moment(element.dt_txt, "YYYY-MM-DD HH:mm:ss").format("hh:mm A").toString() === "12:00 PM") {
            forecastWeatherDataArray.push(element)
        }
    });

    console.log("Total number of items in forecastWeatherDataArray: "+forecastWeatherDataArray.length);
    updateHTMLElements(mainWeatherData);
    updateForecastHTMLElement(forecastWeatherDataArray)
}


var availableTags = [
    "Use Current Location",
];

$("#searchBar").autocomplete({
    source: availableTags,
    minLength: 0,
    select: function (event, ui) { //Gets the user's selection and checks if the user selected to get current location.
        if (availableTags[0] == ui.item.value) {
            getLocation()
        }

    }
}).bind('focus', function () { $(this).autocomplete("search"); });


// #region  Get current location
function getLocation() {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

//Retrieves the position object and converts position data to location information.
function showPosition(position) {
    getJSONWeatherData(position.coords.latitude, position.coords.longitude)
    coordinatesToLocationInformation(position.coords.latitude, position.coords.longitude)
}
// #endregion

//Error switch cases for when location data cannot be retrieved.
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.")
            getSetWeatherDataOnNoSelection()
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            getSetWeatherDataOnNoSelection()
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            getSetWeatherDataOnNoSelection()
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            getSetWeatherDataOnNoSelection()
            break;
    }
}



//Submit event when a city is selected.
$("form").submit(function (event) {
    event.preventDefault();
    var cityCountryArray = $('#searchBar').val().split(', ');
    getWeatherDataFromCityCountryName(cityCountryArray, cities)
})

function getWeatherDataFromCityCountryName(cityCountryArray, cities) {
    for (let index = 0; index < cities.length; index++) {
        if (cities[index].name.toLowerCase() === cityCountryArray[0].toLowerCase().trim() && cities[index].country.toLowerCase() === cityCountryArray[1].toLowerCase().trim()) {
            getJSONWeatherData(cities[index].lat, cities[index].lng)
            coordinatesToLocationInformation(cities[index].lat, cities[index].lng)

            //Add lat and long to data before saving in localStorge
            cityCountryArray.push(cities[index].lat)
            cityCountryArray.push(cities[index].lng)
            //save searched information to localstorage
            localStorage.setItem("lastWeatherData", JSON.stringify(cityCountryArray));
            break; //No need to continue searching.
        }

    }
}

//Get previously searched city or select a random city and show it's weather data.
function getSetWeatherDataOnNoSelection() {
    let historicCity = localStorage.getItem("lastWeatherData");
    if (historicCity != null) {
        getWeatherDataFromCityCountryName(JSON.parse(historicCity), cities)

    }
    else {
        //Select a random city and display weather.
        let selectedCity = cities[Math.floor(Math.random() * cities.length)];
        coordinatesToLocationInformation(selectedCity.lat, selectedCity.lng)
        getJSONWeatherData(selectedCity.lat, selectedCity.lng)
    }
}


function setWeatherIcon(iconCode, iconImgEl) {
    iconImgEl.attr("src", "./././assets/images/" + iconCode + ".png")
}

function setWeatherFavicon(iconCode, iconImgEl) {
    iconImgEl.attr("href", "./././assets/images/" + iconCode + ".png")
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

    allPossibleCities.splice(0, 0, availableTags[0]) //Add use current location option at index 0 - first item.

    $("#searchBar").autocomplete({
        maxHeight: 10,
        source: allPossibleCities.filter(onlyUnique).slice(0, 9)
    });
});

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

//Update all Mainweather HTML Elements
function updateHTMLElements(mainWeatherData) {
    temperatureEl.text(mainWeatherData.list[0].main.temp.toFixed());
    feelsLikeValueEl.text(mainWeatherData.list[0].main.feels_like.toFixed(0) + " °C");
    mainDescriptionEl.text(mainWeatherData.list[0].weather[0].main);
    secondaryDescriptionEl.text("(" + mainWeatherData.list[0].weather[0].description + ")");
    windSpeedEl.text(mainWeatherData.list[0].wind.speed + " KMPH");
    humidityValueEl.text(mainWeatherData.list[0].main.humidity + " %");
    mainWeatherDateTimeEl.text(moment(mainWeatherData.list[0].dt_txt, "YYYY-MM-DD HH:mm:ss").format("dddd, MMM DD hh:mm A"));

    pageTitleEl.text(mainWeatherData.list[0].main.temp.toFixed(0) + " °C - " + locationNameEl.text());
    setWeatherIcon(mainWeatherData.list[0].weather[0].icon, mainWeatherImageEl)
    setWeatherFavicon(mainWeatherData.list[0].weather[0].icon, faviconEl)
}


function updateForecastHTMLElement(forecastWeatherDataArray){
    console.log("Updating forecast element...");
    counter = 0;
    forecastWeatherDataArray.forEach(element => {
        ++counter
        let temp = element.main.temp.toFixed();
        // feelsLikeValueEl.text(mainWeatherData.list[0].main.feels_like.toFixed(0));
        // mainDescriptionEl.text(mainWeatherData.list[0].weather[0].main);
        let description = element.weather[0].description;
        let windSpeed = element.wind.speed ;
        let humidity = element.main.humidity;

        $("#forecast"+counter).empty();
        
        createForecaseCardElements("forecast"+counter, element.weather[0].icon,description, moment(element.dt_txt, "YYYY-MM-DD HH:mm:ss").format("dddd DD"), temp, windSpeed, humidity," °C", " KMPH")
        // console.log(counter)
        
    });
}


// let forecastListArray = ["forecastOne", "forecastTwo", "forecastThree", ""]

// createForecaseCardElements("forecast1", "assets/images/10d.png" , "Tuesday, 22nd Jan", "18.89", "18.89", "44", " °C", " KMPH")

function createForecaseCardElements(forecastDivId, image,description, forecastDate, forecastTemp, forecastWind, forecastHumidity, tempUnit, windUnit) {

   

    
    let cardBodyEl = $("<div>", {
        class: "card-body p-3"
    })

    let forecastWeatherImgEl = $("<img>", {
        class: "forecastWeatherImage",
        id: ""
    })
    
    let breakLine1 = $("<br>")
    let breakLine2 = $("<br>")

    let forecastWeatherDate = $("<h5>", {
        class: "forecastWeatherDate mb-1"
    })

    let forecastWeatherDesc = $("<h6>", {
        class: "forecastWeatherDesc mb-1"
    })

    let forecastWeatherSplitLineEl = $("<hr>", {
        class: "py-0 mt-0 mb-1 forecastWeatherSplitLine"
    })

    let forecastDetailsEl = $("<div>", {
        class: "card-text d-inline forecastDetails"
    })

    let forecastTempTitleEl = $("<p>", {
        class: "py-0 m-0 d-inline"
    })

    let forecastTempEl = $("<p>", {
        class: "forecastTemp d-inline"
    })

    let forecastTempUnitEl = $("<p>", {
        class: "forecastTempUnit d-inline mr-2"
    })

    let forecastWindContainerEl = $("<p>", {
        class: "badge badge-pull badge-light mr-2 mb-0 windContainer"
    })

    let forecastWindEl = $("<p>", {
        class: "forecastWind d-inline"
    })

    let forecastWindTitleEl = $("<p>", {
        class: "py-0 m-0 d-inline"
    })

    let forecastWindUnitEl = $("<p>", {
        class: "forecastWindUnit d-inline"
    })

    

    let forecastHumidityContainerEl = $("<p>", {
        class: "badge badge-pull badge-light mb-0 humidityContainer"
    })

    let forecastHumidityTitleEl = $("<p>", {
        class: "py-0 m-0 d-inline"
    })

    let forecastHumidityEl = $("<p>", {
        class: "forecastHumidity d-inline"
    })

    let forecastHumidityUnitEl = $("<p>", {
        class: "d-inline"
    })

    setWeatherIcon(image, forecastWeatherImgEl)

    forecastTempTitleEl.text("Temp: ")
    forecastWindTitleEl.text("Wind: ")
    forecastHumidityTitleEl.text("Humidity: ")

    forecastTempUnitEl.text(tempUnit)
    forecastWindUnitEl.text(windUnit)


    // forecastWeatherImgEl.attr("src", image)
    forecastWeatherDesc.text(description.charAt(0).toUpperCase() + description.slice(1))
    forecastWeatherDate.text(forecastDate)
    forecastTempEl.text(forecastTemp)
    forecastWindEl.text(forecastWind)

    forecastHumidityEl.text(forecastHumidity + "%")

    // forecastTempTitleEl.appendTo(forecastDetailsEl)
    forecastTempEl.appendTo(forecastDetailsEl)
    forecastTempUnitEl.appendTo(forecastDetailsEl)

    // breakLine1.appendTo(forecastDetailsEl)

    // forecastWindTitleEl.appendTo(forecastDetailsEl)
    forecastWindEl.appendTo(forecastWindContainerEl)
    forecastWindUnitEl.appendTo(forecastWindContainerEl)

   
    // forecastHumidityTitleEl.appendTo(forecastDetailsEl)
    forecastHumidityEl.appendTo(forecastHumidityContainerEl)
    forecastHumidityUnitEl.appendTo(forecastHumidityContainerEl)
   

    forecastWeatherDate.appendTo(cardBodyEl)
    forecastWeatherImgEl.appendTo(cardBodyEl)
    forecastWeatherDesc.appendTo(cardBodyEl)
    
    forecastWeatherSplitLineEl.appendTo(cardBodyEl)
    
    forecastDetailsEl.appendTo(cardBodyEl)
    forecastWindContainerEl.appendTo(cardBodyEl)
    forecastHumidityContainerEl.appendTo(cardBodyEl)
    

    cardBodyEl.appendTo($("#"+forecastDivId))

}

function convertKelvinToFahrenheit(valueToConvert) {
    return ((valueToConvert - 273.15) * 1.8) + 32
}

function convertKelvinToCelsius(valueToConvert) {
    return (valueToConvert - 273.15)
}