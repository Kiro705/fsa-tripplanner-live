const mapboxgl = require("mapbox-gl");
const buildMarker = require("./marker");
const {State, Plan} = require('./state');

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
var plan = new Plan()
var planThing = plan.days[plan.currentday];
var markerArray = [];

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

function addPlaceDiv(selectedObj, selectedChoice, placetype){
  var temp = document.createElement('li')
  temp.className = 'list-group-item';

  //make the button to remove the selected place
  var button = document.createElement('button');
  button.append('x');
  button.className = 'btn btn-sm btn-danger pull-right reallysmallbtn';
  temp.append(selectedObj.name);
  temp.append(button);
  el(placetype + '-list').append(temp)
  var newmarker = buildMarker(placetype, selectedObj.place.location)
  markerArray.push(newmarker);

  // make popup
  var popup = new mapboxgl.Popup({offset: 25})
      .setHTML(makePopupHTML(placetype, selectedObj))
  newmarker.setPopup(popup)
  newmarker.addTo(map)
  // make removal possible
  button.onclick = function(){
    temp.remove();
    newmarker.remove();
    plan.removePlaceFromCurrentDay(placetype, selectedChoice)
    map.flyTo({center: selectedObj.place.location, zoom: 13, curve: 2, speed: 0.5});
  }
}

function addSelectedPlace(selectedObj, selectedChoice, placetype){
  if (plan.addPlaceToCurrentDay(placetype, selectedChoice)) {
    addPlaceDiv(selectedObj, selectedChoice, placetype);
  }
}

el('day-add').addEventListener('click', () => {
  plan.addNewDay();
  var button = document.createElement('button');
  var number = plan.days.length - 1;
  map.flyTo({center: [-74.000000, 40.731000], zoom: 12, curve: 2, speed: 0.5});
  button.append(number + 1);
  button.className = 'btn btn-primary btn-circle backgroundGray margin5';
  button.value = number;
  button.id = 'Day-' + (number + 1);
  button.addEventListener('click', () => {
    plan.currentday = +button.value;
    removeAll();
    el('Day-' + (number + 1)).classList.add('selectedClass');
    map.flyTo({center: [-74.000000, 40.731000], zoom: 12, curve: 2, speed: 0.5});
    renderDay();
  })
  el('day-container').append(button)
})

var setListeners = function(Placetype) {
  var placetype = Placetype.toLowerCase()
  // add a new place
  el(placetype + '-add').addEventListener('click', () => {
    var selectedChoice = el(placetype + '-choices').value // position in the array, not really the placeId
    var selectedObj = globalstore[Placetype][selectedChoice]
    addSelectedPlace(selectedObj, selectedChoice, placetype);
    map.flyTo({center: selectedObj.place.location, zoom: 15, curve: 2, speed: 0.5});
  })
}

function removeAll(){
  var num = 1
  while (el('Day-' + num)){
    el('Day-' + num).classList.remove('selectedClass');
    num++;
  }
}

function renderDay(){
  planThing = plan.days[plan.currentday];
  while (markerArray.length){
    var temp = markerArray.shift()
    temp.remove();
  }
  el('myStuff').innerHTML = `<div>
              <h4 class="h3Text paddingLeft15">My Hotel</h4>
              <ul class="list-group paddingLeft15" id="hotels-list">

              </ul>
            </div>
            <div>
              <h4 class="h3Text paddingLeft15">My Restaurants</h4>
              <ul class="list-group paddingLeft15" id="restaurants-list">

              </ul>
            </div>
            <div>
              <h4 class="h3Text paddingLeft15">My Activities</h4>
              <ul class="list-group paddingLeft15" id="activities-list">

              </ul>
            </div>`;
  for (var place in {Hotels: 'hotels', Restaurants: 'restaurants', Activities: 'activities'}){
    var upper = place.toString();
    var lower = upper.toLowerCase();
    var placeArray = planThing[lower]; //the array
    placeArray.forEach(function(number){
      //is number
      //var selectedChoice = el(lower + '-choices').value
      var selectedObj = globalstore[upper][number]
      addPlaceDiv(selectedObj, number, lower)
    })
  }
}

el('Day-1').addEventListener('click', () => {
  map.flyTo({center: [-74.000000, 40.731000], zoom: 12, curve: 2, speed: 0.5});
  plan.currentday = 0;
  removeAll();
  el('Day-1').classList.add('selectedClass');
  renderDay();
})

renderDay();
setListeners('Hotels')
setListeners('Restaurants')
setListeners('Activities')

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





