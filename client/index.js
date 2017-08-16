const mapboxgl = require("mapbox-gl");
const buildMarker = require("./marker");

/*
  * Instantiate the Map
  */

mapboxgl.accessToken = "pk.eyJ1Ijoic3d5eCIsImEiOiJjajY4M2hvcGYwY3lrMnZueXB2dDg5cWt5In0.7HkydSCJMjYLqxIxq5a-5A";
const map = new mapboxgl.Map({
  container: "map-canvas",
  center: [-74.0, 40.731],
  zoom: 12.5, // starting zoom
  pitch: 35,
  bearing: 20,
  style: "mapbox://styles/mapbox/streets-v10"
});
map.addControl(new mapboxgl.NavigationControl());
var mapData = function (data, targetElement) {
    data.forEach((hotel, index) => {
      var temp = document.createElement('option')
      temp.value = index
      temp.append(hotel.name)
      targetElement.append(temp)
    })
}
var globalstore = {}

var el = x => document.getElementById(x)

fetch('/api/all')
  .then(result => result.json())
  .then(data => { // data = { Hotels, Restaurants, Activities }
    mapData(data.Hotels, el('hotels-choices'));
    mapData(data.Restaurants, el('restaurants-choices'));
    mapData(data.Activities, el('activities-choices'));
    globalstore = data;
  })
  .catch(console.error)

var makePopupHTML = (placetype, selectedObj) => {
    var popupHTML = `<h3>${selectedObj.name}</h3>`;
    popupHTML += `<p>Address: ${selectedObj.place.address}</p>`;
    switch (placetype) {
      case 'Hotels':
        popupHTML += `<p>Stars: ${selectedObj.num_stars}</p>`;
        popupHTML += `<p>Amenities: ${selectedObj.amenities}</p>`;
        break;
      case 'Restaurants':
        popupHTML += `<p>Cuisine: ${selectedObj.cuisine}</p>`;
        popupHTML += `<p>Price: ${Array(selectedObj.price).join('$')}$</p>`;
        break;
      default: // Activities
        popupHTML += `<p>Age Range: ${selectedObj.age_range}</p>`;
        break;
    }
    return popupHTML
}

var setListeners = function(placetype) {
  el(placetype.toLowerCase() + '-add').addEventListener('click', () => {
    var selectedChoice = el(placetype.toLowerCase() + '-choices').value
    var selectedObj = globalstore[placetype][selectedChoice]
    var temp = document.createElement('li')
    temp.className = 'list-group-item';
    var button = document.createElement('button');
    button.append('x');
    button.className = 'btn btn-sm btn-danger pull-right reallysmallbtn';
    temp.append(selectedObj.name);
    temp.append(button);
    el(placetype.toLowerCase() + '-list').append(temp)
    var newmarker = buildMarker(placetype.toLowerCase(), selectedObj.place.location)
    // make popup
    var popup = new mapboxgl.Popup({offset: 25})
        .setHTML(makePopupHTML(placetype, selectedObj))
    newmarker.setPopup(popup)
    newmarker.addTo(map)
    // make removal possible
    button.onclick = function(){
      temp.remove();
      newmarker.remove();
      map.flyTo({center: selectedObj.place.location, zoom: 13, curve: 2, speed: 0.5});
    }
    //fly to the new marker once done
    map.flyTo({center: selectedObj.place.location, zoom: 15, curve: 2, speed: 0.5});
  })
}
['Hotels', 'Restaurants', 'Activities'].forEach(x => setListeners(x))

// START https://www.mapbox.com/mapbox-gl-js/example/setstyle/
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
    var layerId = layer.target.id;
    map.setStyle('mapbox://styles/mapbox/' + layerId + '-v9');
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}
// END https://www.mapbox.com/mapbox-gl-js/example/setstyle/