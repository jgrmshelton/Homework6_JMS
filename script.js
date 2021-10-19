$(document).ready(function () {

	// create search button + .on("click"...)
	$("#search").on("click", function () {
		event.preventDefault();
		var cityName = $("#city-name").val();
		$("#city-name").val("");// clear input box
		$("input:text").click(function () { // click box for new input
			$(this).val("");
			$("#todayWeather").empty();
			$("#forecast").empty();
		});
		getWeather(cityName);
	});

	// search history
	$(".history").on("click", "li", function () {
		getWeather($(this).text());
	});

	// search history list
	function listCity(text) {
		var listCityName = $("<li>")
			.addClass("list-group-item list-group-item-action py-2") // add class
			.text(text); // add text
		$(".history").append(listCityName); // merge and add to html
	}

	var imperialUnits = "&units=imperial"; //used for metric converson
	var weatherAPIKey = "&appid=38f55767a0c60100721a848c0be8deb5"; // assign open weather API key to variable

	//get weather function
	function getWeather(cityName) {
		$.ajax({
			type: "GET",
			url:
				"https://api.openweathermap.org/data/2.5/weather?q=" +
				cityName +
				imperialUnits +
				weatherAPIKey,
			dataType: "json",
			success: function (data) {
				if (history.indexOf(cityName) === -1) { //start creating history link for search
					history.push(cityName);
					window.localStorage.setItem("history", JSON.stringify(history));
					listCity(cityName);
				}
				$("#todayWeather").empty(); // clear
				$("#forecast").empty(); // clear content in five day forecast

				// Time Conversion
				var sec = data.dt;
				var forecastDate = new Date(sec * 1000);
				var dateStr = forecastDate.toLocaleDateString();
				var weekday = new Array(7);
				weekday[0] = "Sunday";
				weekday[1] = "Monday";
				weekday[2] = "Tuesday";
				weekday[3] = "Wednesday";
				weekday[4] = "Thursday";
				weekday[5] = "Friday";
				weekday[6] = "Saturday";

				var forecastUl = $("<div>", { id: "forecast-container" });// creating <div> element html container

				var listName = $("<div>", { id: "name-div" });
				listName.text(data.name + " (" + dateStr + ") ");

				var listImg = $("<div>", { id: "img-div" });
				var iconImg = $("<img>");
				iconImg.attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png",);
				listImg.append(iconImg);

				var listTemp = $("<div>", { id: "temp-div" });
				listTemp.text("Temperature: " + data.main.temp + " °F");

				var listHumidity = $("<div>", { id: "humid-div" });
				listHumidity.text("Humidity: " + data.main.humidity + "%");

				var listWindSpeed = $("<div>", { id: "speed-div" });
				listWindSpeed.text("Wind Speed: " + data.wind.speed + " MPH");

				var listUVIndex = $("<div>", { id: "index-div" });

				forecastUl.append(
					listName,
					listImg,
					listTemp,
					listHumidity,
					listWindSpeed,
					listUVIndex,
				);

				$("#todayWeather").append(forecastUl); //merge and add to heml

				getFiveDayForecast(cityName); //call up five day forecast api
				getUVIndexWarning(data.coord.lat, data.coord.lon); //call  up uvIndex api
			}
		});
	}

	//start of the five day forecast
	function getFiveDayForecast(cityName) {
		$.ajax({
			type: "GET",
			url:
				"https://api.openweathermap.org/data/2.5/forecast?q=" +
				cityName +
				imperialUnits +
				weatherAPIKey,
			dataType: "json",
			success: function (data) {
				$("#forecast").empty(); //if there is any existing content, overwrite with title and empty row

				var fiveDayTitle = $("<div>", { //create variable and div element for five day forecast title
					id: "five-day-title", //add id
				});
				fiveDayTitle.text("5-Day Forecast:"); //add title to div element

				var fiveDayContent = $("<div>", { //create variable and div element for five day forecast container
					class: "card-container", //create card container for forecast
					id: "five-day-content", //add id
				});

				for (var i = 0; i < data.list.length; i++) { //loop over all forecasts. var i=0 makes forecast start on current day
					if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) { //take a look at forecast at 3:00 pm
						var fiveDayCards = $("<div>", { //create div element for html cards
							class: "card", //create cards
							id: "five-day-card", //add id
						});

						// time conversion
						var fiveDaySec = data.list[i].dt;
						var fiveDayForecastDate = new Date(fiveDaySec * 1000);
						var fiveDayDateStr = fiveDayForecastDate.toLocaleDateString();
						//weekday conversion
						var fiveDayStr = fiveDayForecastDate.getUTCDay();
						var fiveDayWeekday = new Array(7);
						fiveDayWeekday[0] = "Sunday";
						fiveDayWeekday[1] = "Monday";
						fiveDayWeekday[2] = "Tuesday";
						fiveDayWeekday[3] = "Wednesday";
						fiveDayWeekday[4] = "Thursday";
						fiveDayWeekday[5] = "Friday";
						fiveDayWeekday[6] = "Saturday";
						var fiveDayWeekdayStr = fiveDayWeekday[fiveDayStr];

						var fiveDays = $("<h4>", { //create <h4> element for card titles
							class: "card-title", //add class
							id: "five-day", //add id
						});
						fiveDays.text(fiveDayWeekdayStr); //add days text to cards

						var fiveDayDates = $("<h5>", { //create <h5> element for dates on cards
							class: "card-title", //add class
							id: "five-day-date", //add id
						});
						fiveDayDates.text(fiveDayDateStr);

						var fiveDayImg = $("<p>", { //create <p> element for image icon
							class: "card-body", //add class
							id: "five-img", //add id
						});

						var fiveDayIconImg = $("<img>"); //create <img> element for image
						fiveDayIconImg.attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png",);
						fiveDayImg.append(fiveDayIconImg);

						var fiveDayTemps = $("<p>", { //create <p> element to store temps
							class: "card-body", //add class
							id: "five-temp", //add id
						});
						fiveDayTemps.text("Temperature: " + data.list[i].main.temp + " °F"); //add text to card and concantanate for that day

						var fiveDayWind = $("<p>", {
							class: "card-body", //add class
							id: "five-wind", //add id
						});
						fiveDayWind.text("Wind Speed: " + data.list[i].wind.speed + " MPH");

						var fiveDayHumidity = $("<p>", { //create <p> element to store humidity
							class: "card-body", //add class
							id: "five-humid", //add id
						});
						fiveDayHumidity.text("Humidity: " + data.list[i].main.humidity + "%"); //add text to card and concantanate for that days humidity

						fiveDayCards.append(
							fiveDays,
							fiveDayDates,
							fiveDayIconImg,
							fiveDayTemps,
							fiveDayWind,
							fiveDayHumidity,
						);

						$("#forecast .card-container").append(fiveDayCards); //merge together and add to html

						fiveDayContent.append(fiveDayCards); //put cards in container
					}
				}
				$("#forecast").append(fiveDayTitle, fiveDayContent); //append the forecast title and container
			},
		});
	}

	function getUVIndexWarning(lat, lon) {
		$.ajax({
			type: "GET",
			url:
				"https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" +
				lat +
				"&lon=" +
				lon +
				weatherAPIKey,
			dataType: "json",
			success: function (data) {
				var uv = data[0].value; //look for the UV Index
				var uvText = $("<p>").text("UV Index: "); // create UV Index <p> element and placeholder
				var btn = $("<span>").addClass("btn btn-sm").text(data[0].value); //make UV button
				// change color depending on uv value
				if (uv > 0 && uv <= 2.99) {
					btn.addClass("low-uv");
					btn.css("color", "white");
					btn.css("background-color", "lightblue");
				} else if (uv >= 3 && uv <= 5.99) {
					btn.addClass("moderate-uv");
					btn.css("color", "white");
					btn.css("background-color", "green");
				} else if (uv >= 6 && uv <= 7.99) {
					btn.addClass("high-uv");
					btn.css("color", "white");
					btn.css("background-color", "orange");
				} else if (uv >= 8 && uv <= 10.99) {
					btn.addClass("vhigh-uv");
					btn.css("color", "white");
					btn.css("background-color", "red");
				} else {
					btn.addClass("extreme-uv");
					btn.css("color", "white");
					btn.css("background-color", "darkred");
				}
				$("#todayWeather #index-div").append(uvText.append(btn)); //append btn and add to #index-div
			},
		});
	}

	// get current history, if any
	var history = JSON.parse(window.localStorage.getItem("history")) || [];

	if (history.length > 0) {
		getWeather(history[history.length - 1]);
	}

	for (var i = 0; i < history.length; i++) {
		listCity(history[i]);
	}
});