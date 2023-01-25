

const APIKey = "234dd37d46a1b4a430f58520a10e1039"

let openWeatherMapAPI = "api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=" + APIKey;

let geoCodingAPI = "http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid=" + APIKey

let sampleAPI = "https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}"

let allPossibleCities = [];

var moment = require("moment")
var cities = require("cities.json")



// testGeoCoding("accra") 
// testGeoCoding(1, 1)

getLocation()

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    console.log("Latitude: " + position.coords.latitude);
    console.log("Longitude: " + position.coords.longitude);
}



function testGeoCoding(lat, long) {
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + long + "&appid=" + APIKey,
        method: "GET"
    }).then(function (response) {
        response.list.forEach(element => {
            console.log(element);
        });
    });
}



function successFn(result) {
    console.log("Result: " + result)
}


$("form").submit(function (event) {
    event.preventDefault();
    var array = $('#searchBar').val().split(', ');
    console.log(array)

    for (let index = 0; index < cities.length; index++) {
        if (cities[index].name.toLowerCase() === array[0].toLowerCase().trim() && cities[index].country.toLowerCase() === array[1].toLowerCase().trim()) {
            console.log(cities[index]);

            // testGeoCoding(cities[index].name);
            // console.log(testGeoCoding(cities[index].name))
            console.log(cities[index].lat + "," + cities[index].lng)
            testGeoCoding(cities[index].lat, cities[index].lng)
            break;
        }

    }


    // testGeoCoding(array[0].trim());
})




$("#searchBar").keyup(function (e) {
    allPossibleCities = []
    if ($("#searchBar").val().length >= 2) {
        for (let index = 0; index < cities.length; index++) {

            if (cities[index].name.toLowerCase() == $("#searchBar").val().toLowerCase() || cities[index].name.toLowerCase().includes($("#searchBar").val().toLowerCase())) {
                // console.log(cities[index])
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

// $( "#searchBar" ).on( "autocompleteselect", function( event, ui ) {
//     console.log($('#searchBar').val())
// } );

