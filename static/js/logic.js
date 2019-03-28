// Step 1: USGS earthquake URL
// ============================
var earthquakeURL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Step 2: GET json object from earthquake URL
// ============================================
d3.json(earthquakeURL, function(response) {
  // Call function to create bindpopup & circle for each latitude & longitude obtained from response.features
  createFeatures(response.features);
});

// Step 3: Define the createFeature function that creates a geoJSON layer of marker with popup containing additional info
// Also each marker's size & color is based on magnitude of the earthquake.
// ========================================================================================================================
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "<h3>Location: " +
          feature.properties.place +
          "</h3><h6>Magnitude: " +
          feature.properties.mag +
          "</h6><hr><p>" +
          new Date(feature.properties.time) +
          "</p>"
      );
    },

    pointToLayer: function(feature, latlng) {
      return new L.circle(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.6,
        color: "#000",
        stroke: true,
        weight: 0.8
      });
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Step 4: CreateMap function that creates baseMaps & overLay Maps
// =================================================================
function createMap(earthquakes) {
  // Step 4a: Define satelite, outdoors & grayscale tiles
  // ---------------------------------------------------
  var outdoors = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ"
  );

  var satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ"
  );

  var grayscale = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ"
  );

  // Step 4b: Define a baseMaps object to hold base layers
  // ----------------------------------------------------------
  var baseMaps = {
    Satellite: satellite,
    Grayscale: grayscale,
    Outdoors: outdoors
  };

  // Step 4c: Create overlay object to hold overlay layer
  // ----------------------------------------------------------
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Step 4d: Create map & layers to display on load
  // -------------------------------------------------
  var myMap = L.map("map-id", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [satellite, earthquakes]
  });

  // Step 4e: Add the layer control to the map
  // ------------------------------------------
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false
    })
    .addTo(myMap);

  // Step 4f: Set up the legend
  // ---------------------------
  var legend = L.control({
    position: "bottomright"
  });
  // legend.onAdd = function() {
  //   var div = L.DomUtil.create("div", "info legend");
  //   var limits = geojson.options.limits;
  //   var colors = geojson.options.colors;
  //   var labels = [];

  //   // Add min & max
  //   var legendInfo =
  //     "<h1>Median Income</h1>" +
  //     '<div class="labels">' +
  //     '<div class="min">' +
  //     limits[0] +
  //     "</div>" +
  //     '<div class="max">' +
  //     limits[limits.length - 1] +
  //     "</div>" +
  //     "</div>";

  //   div.innerHTML = legendInfo;

  //   limits.forEach(function(limit, index) {
  //     labels.push('<li style="background-color: ' + colors[index] + '"></li>');
  //   });

  //   div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  //   return div;
  // };

  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [0, 1, 2, 3, 4, 5];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };
  legend.addTo(myMap);
}

// Step 5: Create color & radius range for the circle diameter for each marker
// -----------------------------------------------------------------------------
function getColor(d) {
  return d > 5
    ? "#a54500"
    : d > 4
    ? "#cc5500"
    : d > 3
    ? "#ff6f08"
    : d > 2
    ? "#ff9143"
    : d > 1
    ? "#ffb37e"
    : "#ffcca5";
}

// Change the maginutde of the earthquake by a factor of 25,000 for the radius of the circle.
function getRadius(value) {
  return value * 25000;
}
