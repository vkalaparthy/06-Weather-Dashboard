$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    $("#today").empty();
    console.log(searchValue);
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    $("#today").empty();
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").prepend(li);
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
        console.log(data.main.temp);
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

        // create html content for current weather
        var newh2 = $("<h2>").html(searchValue + " (" + todaysDate + ")");
        var textP1 = "Temparature: " + tempF + " &#8457;";
        console.log(textP1);
        var newP1 = $("<p>").html(textP1);
        var textP2 = "Humidity: " + data.main.humidity + "%";
        var newP2 = $("<p>").html(textP2);
        var textP3 = "Wind Speed: " + data.wind.speed + " MPH";
        var newP3 = $("<p>").html(textP3);
        var lat = data.coord.lat;
        var lon = data.coord.lon;
        var newP4;
        $("#today").append(newh2, newP1, newP2, newP3);

        getUVIndex(data.coord.lat, data.coord.lon);

        getForecast(searchValue);
      });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "",
      url: "" + searchValue + "",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            

            // merge together and put on page
          }
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
});
