# Weather Dashboard
This responsive weather web application allows users to search for the current weather in any city around the world. The app also includes a feature that saves the last 6 cities searched, making it easy for users to quickly access the weather information for their most frequently searched locations. Additionally, the app also provides weather information for the user's current location, making it easy to know what to expect when they step outside.

<img src="assets/preview/preview.gif" alt="Weather Dashboard" width="900"/>


[Live Preview - Weather Dashbaord](https://dodzikojo.github.io/Weather-Dashboard/ "Live Preview")

## Project Requirements
* When a user searches for a city they are presented with current and future conditions for that city and that city is added to the search history
  * When a user views the current weather conditions for that city they are presented with:
    * The city name
    * The date
    * An icon representation of weather conditions
    * The temperature
    * The humidity
    * The wind speed
  * When a user view future weather conditions for that city they are presented with a 5-day forecast that displays:
    * The date
    * An icon representation of weather conditions
    * The temperature
    * The humidity
  * When a user click on a city in the search history they are again presented with current and future conditions for that city
  * The user should be able to get the weather for their current location.

## Notes
### Node.js Implementation
I explored and implemented the use of Node.js for the first time on a project. Node.js provided the functionality to retrieve a collection of over 14,000 cities world wide using the [cities.json](https://github.com/lutangar/cities.json) package. This allows the application to show a list of cities based on the values the user enters during the search.

### Getting User's Current Location
The application implements the use of Javascript Geolocation API as it provides a great and standard way to request a user for its location. This action does not trigger until the user selects an option to retrieve the device's current location.

```javascript
// #region Get current location
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
```