var map;
var markers;
var geojson;
var info;
var legend

// tweetData = new Array();
// var markers = L.markerClusterGroup();
function fetchData()	{

	//Create the map object and set the centre point and zoom level 
	map = L.map('map',{
		minZoom:3,
		maxZoom:18
	}).setView([37.8, -96], 5);
		
	//Load tiles from open street map (you maybe have mapbox tiles here- this is fine) 
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:'Map data ©OpenStreetMap contributors, CC-BY-SA, Imagery ©CloudMade',
		maxZoom: 18,
		minZoom:2
		
	//add the basetiles to the map object	
	}).addTo(map);
	

	L.geoJson(statesData).addTo(map);

	// generate basemap 
	var basemaps = {
		Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
			layers: 'OSM-Overlay-WMS'
		}),

		Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
			layers: 'TOPO-WMS'
		}),

		'Topography, then places': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
			layers: 'TOPO-WMS,OSM-Overlay-WMS'
		}),
	
		
	};

	// creates a new control element that allows you to toggle the visibility of the basemaps layer.
	L.control.layers(basemaps).addTo(map);
	L.geoJson(statesData, {style: style}).addTo(map);

	// 添加静态图件
	legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 10, 20, 50, 100, 200, 500, 1000],
			labels = [];
	
		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < grades.length; i++) {
			div.innerHTML +=
				'<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
				grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
		}
	
		return div;
	};
	
	legend.addTo(map);


	// A Topography map is added to a map instance
	basemaps.Places.addTo(map);

	geojson = L.geoJson(statesData, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);
	info = L.control();
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};


	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
		this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
			'<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
			: 'Hover over a state');
	};
	
	info.addTo(map);
		
}



function plotTweets() {
	markers = L.markerClusterGroup();
	var myIcon = L.icon({
		iconUrl: 'picture/122.png',
		iconSize: [155, 80],
		// iconAnchor: [12, 41],
		// popupAnchor: [1, -34],
		// shadowSize: [41, 41]
	  });
	//Loop through tweetData to create marker at each location 
	for (var i=0; i <fandianData.length; i++) { 
	   var markerLocation = new L.LatLng(fandianData[i].lat, fandianData[i].lon);
	   var marker = new L.Marker(markerLocation);

	   marker.bindPopup(`<b>fandian ID:</b> ${fandianData[i].id}<br><b>Latitude:</b> ${fandianData[i].lat}<br><b>Longitude:</b> ${fandianData[i].lon}<br><b>fandian:</b> ${fandianData[i].state}`);

	//    marker.bindPopup(tweetData[i].body);
	   marker.setIcon(myIcon);

	   // add each marker to the markers group
	   markers.addLayer(marker);
	   
	}

	 // add the markers group to the map
	 map.addLayer(markers);	
	 
 }
 
// search data 
function search_data(){
	var state =  document.getElementById('state').value
	
	fandianData = [];
	$.getJSON("searchData.php",{state:state}, function(results)	{ 
		
		//Populate fandianData with results
		for (var i = 0; i < results.length; i++ )	{
			
			fandianData.push ({
				id: results[i].id, 
				state: results[i].state, 
				lat: results[i].lat, 
				lon: results[i].lon
			}); 
		}
		
		plotTweets(); 
		
	});
}

function clear_Data(){
	location.reload();
}
  


function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}


function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// mouseover
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
	info.update(layer.feature.properties);
}

// mouseout
function resetHighlight(e) {
    geojson.resetStyle(e.target);
	info.update();
}

//   zoom
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}


function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}		

	

 