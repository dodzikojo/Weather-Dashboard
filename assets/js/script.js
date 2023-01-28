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
let availableTags = [
    "Use Current Location",
];

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    color: 'black',
    iconColor: 'red',
    customClass: {
        popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 1200,
    timerProgressBar: true
})


//Get previously saved city information and load it's weather data.
$("document").ready(function () {
    $("#weather-panel").fadeOut(200)
    getSetWeatherDataOnNoSelection()

    addRemoveRow()
    applyContainer()
});

//Autocomplete event for the searchbar
$("#searchBar").autocomplete({
    source: availableTags,
    minLength: 0,
    select: function (event, ui) { //Gets the user's selection and checks if the user selected to get current location.
        if (availableTags[0] == ui.item.value) {
            getLocation()
        }
    }
}).bind('focus', function () { $(this).autocomplete("search"); });

//Keyup Event listener for search bar
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


//Apply and Remove container type classes to element sections.
function applyContainer() {
    if ($(window).width() < 1000) {
        $("#weatherSection").removeClass("container")
        $("#weatherSection").addClass("container-fluid")

        $("#headerContainer").removeClass("container")
        $("#headerContainer").addClass("container-fluid")
    }
    else {
        $("#weatherSection").addClass("container")
        $("#weatherSection").removeClass("container-fluid")

        $("#headerContainer").addClass("container")
        $("#headerContainer").removeClass("container-fluid")
    }
}

//Function to add Remove row class for historic buttons
function addRemoveRow() {
    if ($(window).width() < 600) {
        $("#historyButtons").addClass("row")
    }
    else {
        $("#historyButtons").removeClass("row")
    }

}

//Resize window event listener
$(window).resize(function () {
    applyContainer()
    addRemoveRow()
})


//Gets the location information based on Lat, Long  data.
let coordinatesToLocationInformation = function (lat, lon) {
    $("#weather-panel").fadeOut(200)

    $.getJSON(openWeatherMapReverseGeocodingAPI, {
        lat: lat,
        lon: lon,
        APIKey: APIKey,
    }, successReturnedLocation)

}

//function to run when coordinatesToLocationInformation is successfull
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

//Get the openWeatherMap data based on lat, long coordinates.
function getJSONWeatherData(lat, lon) {
    $.getJSON(openWeatherMapForecastAPI, {
        lat: lat,
        lon: lon,
        APIKey: APIKey,
        units: "metric",
    }, successFn)
}

//function to run when getJSONWeatherData is successful
function successFn(result) {
    mainWeatherData = result;
    forecastWeatherDataArray = [];
    result.list.forEach(element => {
        if (moment(element.dt_txt, "YYYY-MM-DD HH:mm:ss").format("hh:mm A").toString() === "12:00 PM") {
            forecastWeatherDataArray.push(element)
        }
    });
    updateHTMLElements(mainWeatherData);
    updateForecastHTMLElement(forecastWeatherDataArray)
    $("#weather-panel").fadeIn(500)
}


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
    coordinatesToLocationInformation(position.coords.latitude, position.coords.longitude)
    getJSONWeatherData(position.coords.latitude, position.coords.longitude)

}
// #endregion

//Error switch cases for when location data cannot be retrieved.
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:

            Toast.fire({
                width: 300,
                padding: '0.45em',
                icon: 'error',
                title: 'Location request denied'
            })
            getSetWeatherDataOnNoSelection()
            break;
        case error.POSITION_UNAVAILABLE:

            Toast.fire({
                width: 300,
                padding: '0.45em',
                icon: 'error',
                title: 'Location information is unavailable'
            })
            getSetWeatherDataOnNoSelection()
            break;
        case error.TIMEOUT:

            Toast.fire({
                width: 300,
                padding: '0.45em',
                icon: 'error',
                title: 'Failed to get location'
            })
            getSetWeatherDataOnNoSelection()
            break;
        case error.UNKNOWN_ERROR:

            Toast.fire({
                width: 300,
                padding: '0.45em',
                icon: 'error',
                title: 'Unable to get location'
            })
            getSetWeatherDataOnNoSelection()
            break;
    }
}


//Submit event when a city is selected.
$("form").submit(function (event) {
    event.preventDefault();
    var cityCountryArray = $('#searchBar').val().split(', ');
    if ($('#searchBar').val().toLowerCase() == availableTags[0].toLocaleLowerCase()) {

    }
    else {
        getWeatherDataFromCityCountryName(cityCountryArray, cities)

        //save searched information to localstorage
        let historicWeatherData = JSON.parse(localStorage.getItem("historicWeatherData")) || []
        let alreadyExist = false;

        for (let index = 0; index < historicWeatherData.length; index++) {
            if (historicWeatherData[index].toString() === cityCountryArray.toString()) {
                let item = historicWeatherData[index];
                historicWeatherData.splice(index, 1)
                historicWeatherData.unshift(item);
                alreadyExist = true;

                break;
            }
        }
        if (alreadyExist != true) {
            if (historicWeatherData.length === 6) {
                historicWeatherData.pop();

            }
            historicWeatherData.unshift(cityCountryArray);
        }
        localStorage.setItem("historicWeatherData", JSON.stringify(historicWeatherData));
        //Create buttons
        $("#historyButtons").empty()
        createButtons(historicWeatherData)
    }

})

//Uses the search result city information to find the matching location and request weather data.
function getWeatherDataFromCityCountryName(cityCountryArray, cities) {
    for (let index = 0; index < cities.length; index++) {
        if (cities[index].name.toLowerCase() === cityCountryArray[0].toLowerCase().trim() && cities[index].country.toLowerCase() === cityCountryArray[1].toLowerCase().trim()) {
            getJSONWeatherData(cities[index].lat, cities[index].lng)
            coordinatesToLocationInformation(cities[index].lat, cities[index].lng)

            //Add lat and long to data before saving in localStorge
            cityCountryArray.push(cities[index].lat)
            cityCountryArray.push(cities[index].lng)
            break; //No need to continue searching.
        }

    }
}

//Get previously searched city or select a random city and show it's weather data.
function getSetWeatherDataOnNoSelection() {
    let historicCity = localStorage.getItem("historicWeatherData");
    if (historicCity != null) {

        let historicData = JSON.parse(historicCity);
        getWeatherDataFromCityCountryName(historicData[0], cities)

        //Create buttons
        $("#historyButtons").empty()
        createButtons(historicData)
    }
    else {
        //Select a random city and display weather.
        let selectedCity = cities[Math.floor(Math.random() * cities.length)];
        coordinatesToLocationInformation(selectedCity.lat, selectedCity.lng)
        getJSONWeatherData(selectedCity.lat, selectedCity.lng)
    }
}

//Creates buttons for historic weather data
function createButtons(data) {
    for (let index = 0; index < data.length; index++) {
        createHistoryCityButtons(data[index][0], data[index][2], data[index][3])
    }
}

//Sets weather icon based on retreived data
function setWeatherIcon(iconCode, iconImgEl) {
    iconImgEl.attr("src", "./././assets/images/" + iconCode + ".png")
}

//Sets the page Favicon based on retrieved weather data
function setWeatherFavicon(iconCode, iconImgEl) {
    iconImgEl.attr("href", "./././assets/images/" + iconCode + ".png")
}

//function to remove duplicated array items.
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

//Update all Mainweather HTML Elements
function updateHTMLElements(mainWeatherData) {
    temperatureEl.text(mainWeatherData.list[0].main.temp.toFixed());
    feelsLikeValueEl.text(mainWeatherData.list[0].main.feels_like.toFixed(0) + " °C");
    mainDescriptionEl.text(mainWeatherData.list[0].weather[0].main);
    secondaryDescriptionEl.text("(" + mainWeatherData.list[0].weather[0].description + ")");
    windSpeedEl.text(mainWeatherData.list[0].wind.speed + " km/h");
    humidityValueEl.text(mainWeatherData.list[0].main.humidity + " %");
    mainWeatherDateTimeEl.text(moment(mainWeatherData.list[0].dt_txt, "YYYY-MM-DD HH:mm:ss").format("dddd, MMM DD hh:mm A"));

    pageTitleEl.text(mainWeatherData.list[0].main.temp.toFixed(0) + " °C - " + locationNameEl.text());
    setWeatherIcon(mainWeatherData.list[0].weather[0].icon, mainWeatherImageEl)
    setWeatherFavicon(mainWeatherData.list[0].weather[0].icon, faviconEl)
}

//Updates forecastHTML Elements
function updateForecastHTMLElement(forecastWeatherDataArray) {
    counter = 0;
    forecastWeatherDataArray.forEach(element => {
        ++counter
        let temp = element.main.temp.toFixed(0);
        let description = element.weather[0].description;
        let windSpeed = element.wind.speed;
        let humidity = element.main.humidity;

        $("#forecast" + counter).empty();

        createForecaseCardElements("forecast" + counter, element.weather[0].icon, description, moment(element.dt_txt, "YYYY-MM-DD HH:mm:ss").format("dddd DD"), temp, windSpeed.toFixed(1), humidity, " °C", " km/h")

    });
}

//Create forecast card elements based on retrieved weather data
function createForecaseCardElements(forecastDivId, image, description, forecastDate, forecastTemp, forecastWind, forecastHumidity, tempUnit, windUnit) {
    let cardBodyEl = $("<div>", {
        class: "card-body p-3"
    })

    let forecastWeatherImgEl = $("<img>", {
        class: "forecastWeatherImage",
        id: ""
    })


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


    cardBodyEl.appendTo($("#" + forecastDivId))

}

//Creates buttons for previously searched weather data
function createHistoryCityButtons(cityName, cityLat, cityLong) {
    let historyButton = $("<button>", {
        id: cityName.trim(),
        class: "btn btn-dark my-1"
    })

    historyButton.attr("type", "button")
    historyButton.attr("latitude", cityLat);
    historyButton.attr("Longitude", cityLong);

    historyButton.text(cityName)

    historyButton.appendTo($("#historyButtons"))

    historyButton.on("click", function (evt) {
        coordinatesToLocationInformation($(this).attr("latitude"), $(this).attr("longitude"))
        getJSONWeatherData($(this).attr("latitude"), $(this).attr("longitude"))


    })

}
