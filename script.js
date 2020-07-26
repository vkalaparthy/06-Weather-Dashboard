$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    $("#today").empty();
    console.log(searchValue);
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=aed806036e1b19433acabfb17d235ec0",
      method: "GET"
    }).then (function(data) {
        // create history link for this search
        //console.log(url);
        console.log(data);
        //console.log(data.main.temp);
        var tempF = ((data.main.temp - 273.15) * 9/5 + 32).toFixed(2);
        console.log ("In F " + tempF);
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        var todaysDate = moment().format('L');
        console.log(todaysDate);
        // clear any old content
        $("#today").empty();
        // create html content for current weather
        var iconcode = data.weather[0].icon;
        var imgTag = $("<img>").addClass("weather-icon").attr("src", "https://openweathermap.org/img/wn/"+iconcode+"@2x.png");
        imgTag.css("width", "50px");
        var newH2 = $("<h2>");
        newH2.html(searchValue + " (" + todaysDate + ") ");
        newH2.append(imgTag);
        $("#today").append(newH2);
        var textP1 = "Temparature: " + tempF + " &#8457;";
        //console.log(textP1);
        var newP1 = $("<p>").html(textP1);
        var textP2 = "Humidity: " + data.main.humidity + "%";
        var newP2 = $("<p>").text(textP2);
        var textP3 = "Wind Speed: " + data.wind.speed + " MPH";
        var newP3 = $("<p>").html(textP3);
        var lat = data.coord.lat;
        var lon = data.coord.lon;
        var newP4;
        $("#today").append(newP1, newP2, newP3);

        getUVIndex(data.coord.lat, data.coord.lon);

        getForecast(searchValue);
      });
  }
  
  function getForecast(searchValue) {
    //console.log("Inside getForecast for city: " + searchValue);
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=aed806036e1b19433acabfb17d235ec0";
    $.ajax({
      url: queryURL,
      method: "GET",
      dataType: "json"
    }). then (function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").empty();
        $("#forecast").append($("<h2>").text("5 Day Forecast:"));
        var newCardDeck = $("<div>").addClass("card-deck");
        $("#forecast").append(newCardDeck);
        console.log(queryURL);
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var day = changeToDate(data.list[i].dt_txt);
            var fTemp = ((data.list[i].main.temp - 273.15) * 9/5 + 32).toFixed(2);
            var newDiv = $("<div>").addClass("card text-white bg-primary mb-3").css("max-width", "12rem");
            //var headerDiv = $("<div>").addClass("card-header").text(day);
            //newDiv.append(headerDiv);
            var innerDiv = $("<div>").addClass("card-body");
            var newh5 = $("<h5>").addClass("card-title").text(day);
            innerDiv.append(newh5);
            var iconcode = data.list[i].weather[0].icon;
            //console.log(iconcode);
            var imgTag = $("<img>").addClass("weather-icon").attr("src", "https://openweathermap.org/img/wn/"+iconcode+"@2x.png");
            imgTag.css("width", "50px");
            innerDiv.append(imgTag);
            var newP = $("<p>").addClass("card-text").html("Temp: " + fTemp + " &#8457;" + "<br />" + "Humidity: " + data.list[i].main.humidity + "%" );
            innerDiv.append(newP);
            newDiv.append(innerDiv);
            $(".card-deck").append(newDiv);
          }
        }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=hourly,daily&appid=aed806036e1b19433acabfb17d235ec0",
      method: "GET"
    }).then (function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.current.uvi);
        
        // change color depending on uv value
        if (data.current.uvi < 3) {
          btn.css("background", "lightgreen");
        } else if (data.current.uvi < 6 && data.current.uvi >= 3) {
          btn.css("background", "yellow");
        } else if (data.current.uvi < 8 && data.current.uvi >= 6) {
          btn.css("background", "orange");
        } else if (data.current.uvi < 11 && data.current.uvi >= 8) {
          btn.css("background", "red");
        } else {
          btn.css("background", "#8A2BE2");
        }
        
        $("#today").append(uv.append(btn));
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }

  function changeToDate(input) {
    //There are different ways to do this, but for now I am leaving it this
    var arr = input.split(" ");
    //console.log (arr);
    arr = arr[0].split("-");
    //console.log (arr);
    return (arr[1]+"/"+arr[2]+"/"+arr[0]);
  }
});
