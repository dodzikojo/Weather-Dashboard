

const APIKey = "cec087f788b4b894cba40f0ebde76d37"
let openWeatherMapAPI = "api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid="+APIKey;

let geoCodingAPI = "http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid="+APIKey


testGeoCoding()

function getWeatherData() {
    
    

    $.getJSON(flickrAPI, successFn)
}

function testGeoCoding(){
    $.getJSON("http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid="+APIKey, successFn)
}


function successFn(result) {
    console.log("Result: "+result)
}

