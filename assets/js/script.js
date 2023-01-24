

const APIKey = "cec087f788b4b894cba40f0ebde76d37"
let openWeatherMapAPI = "api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=" + APIKey;

let geoCodingAPI = "http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid=" + APIKey

let allPossibleCities = [];

var moment = require("moment")
var cities = require("cities.json")

testGeoCoding()




function testGeoCoding() {
    $.getJSON("http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=" + APIKey, successFn)
}


function successFn(result) {
    console.log("Result: " + result)
}


$("form").submit(function (event) {
    event.preventDefault();
    
})




$("#searchBar").keyup(function (e) {
    allPossibleCities = []
    if ($("#searchBar").val().length >= 2) {
        for (let index = 0; index < cities.length; index++) {

            if (cities[index].name.toLowerCase() == $("#searchBar").val().toLowerCase() || cities[index].name.toLowerCase().includes($("#searchBar").val().toLowerCase())) {
                // console.log(cities[index]);
                allPossibleCities.push(cities[index].name + ", " + cities[index].country)
            }
        }

    }

    $("#searchBar").autocomplete({
        maxHeight: 10,
        source: allPossibleCities.filter(onlyUnique).slice(0,9)
    });
});

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
