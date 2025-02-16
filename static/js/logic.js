// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let streetLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let earthquakes = new L.LayerGroup();

let plateQuery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
let tectonic_plates = new L.layerGroup();


// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [37.09, -95.71],
  zoom: 5
})


// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);
streetLayer.addTo(map);


// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let baseMaps = {
  "Base Map": basemap,
  "Street Layer": streetLayer
};

let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonic_plates
};

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);

earthquakes.addTo(map);


// Make a request that retrieves the earthquake geoJSON data.
d3.json(queryURL).then(function (data) {
  console.log(data);

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature, latlng) {
    let format = {color: getColor(feature.geometry.coordinates[2]),
      fillColor: getColor(feature.geometry.coordinates[2]),
      radius: getRadius(feature.properties.mag),
      fillOpacity: 0.5
    };
    return format
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    let color = "";
    if (depth >= -10 && depth <= 10) {
      return color = '#57ea2c';
    }
    else if (depth > 10 && depth <= 30) {
      return color = '#fcdd75';
    }
    else if (depth > 30 && depth <= 50) {
      return color = '#f7b356';
    }
    else if (depth > 50 && depth <=70) {
      return color = '#eb9929';
    }
    else if (depth > 70 && depth <=90) {
      return color = '#e97500';
    }
    else if (depth > 90) {
      return color = '#f3230f';
    }
    else {
      return color = 'black';
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return magnitude * 1
    };
    return magnitude * 5;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
      // OPTIONAL: Step 2
      // Add the data to the earthquake layer instead of directly to the map.
    }}).addTo(earthquakes);
  
  
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    let colors = ['#57ea2c', '#fcdd75', '#f7b356', '#eb9929', '#e97500', '#f3230f']
    let depthIntervals = [-10, 10, 30, 50, 70, 90];
    let labels = [];


    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depthIntervals.length; i++) {
      labels.push('<li style=\"background-color:' + colors[i] + '\"></li> ' +
            depthIntervals[i] + (depthIntervals[i + 1] ? ' &ndash; ' + depthIntervals[i + 1] + '<br>' : '+'));
    }
    div.innerHTML += '<ul>' + labels.join('') + '</ul>';
    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(map);


  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json(plateQuery).then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.

    // Then add the tectonic_plates layer to the map.
    L.geoJson(plate_data).addTo(tectonic_plates);

  });
});