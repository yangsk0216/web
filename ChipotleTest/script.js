
var markers;//// 标记组 
var geojson;// GeoJSON 数据 
var info; // 信息组件 
var legend// 图例组件
// 定义人口密度图例分组
var grades_den=[0,10,20,50,100,200,500,1000]
// 定义经济图例分组
var grades_gdp=[0,0.5,1,1.5,2,2.5,3,3.5]



// 获取地图数据和设置
function fetchData(judge)	{

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
	
	// 加载包含美国各州边界信息的 GeoJSON 数据
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
	
	// A Places map is added to a map instance
	basemaps.Places.addTo(map);

	// creates a new control element that allows you to toggle the visibility of the basemaps layer.
	L.control.layers(basemaps).addTo(map);
	

	// 判断传进的参数density还是gdp，根据传进的参数对图例进行绘制
	if(judge==='Density'){
		// console.log(judge)
		L.geoJson(statesData, {style: style(grades_den,'density')}).addTo(map);
		getLegend(grades_den,'US Population Density','density',' people / mi<sup>2</sup>');

	}
	else{
		// console.log(judge)
		L.geoJson(statesData, {style: style(grades_gdp,'gdp')}).addTo(map);
		getLegend(grades_gdp,'US State gdp','gdp',' trillion dollars');

	}
	


	
	//Define array to hold results returned from server
	fandiandata = new Array();
	
	// 通过 AJAX 请求从服务器获取数据 
	//and a callback function to execute if the request is successful. 
	$.getJSON("fetchDataMap.php", function(results)	{ 
		
		//Populate fandiandata with results
		for (var i = 0; i < results.length; i++ )	{
			
			fandiandata.push ({
				id: results[i].id, 
				state: results[i].state, 
				lat: results[i].lat, 
				lon: results[i].lon,
				loc: results[i].loc,
				add: results[i].add,
			}); 
		}
		
		plotTweets(); 
		
	});
	
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
	//Loop through fandiandata to create marker at each location 
	for (var i=0; i <fandiandata.length; i++) { 
	   var markerLocation = new L.LatLng(fandiandata[i].lat, fandiandata[i].lon);
	   var marker = new L.Marker(markerLocation);

	   marker.bindPopup(`<b>fandian ID:</b> ${fandiandata[i].id}<br><b>Latitude:</b> ${fandiandata[i].lat}<br><b>Longitude:</b> ${fandiandata[i].lon}<br><b>location:</b> ${fandiandata[i].loc}<br><b>address:</b> ${fandiandata[i].add}`);

	
	   marker.setIcon(myIcon);

	   // add each marker to the markers group
	   markers.addLayer(marker);
	   
	}

	 // add the markers group to the map
	 map.addLayer(markers);	
	 
 }


 


// 根据人口密度获取对应的填充颜色代码 
function getColor(d,grades) {  
	
	  
	return d > grades[7] ?  '#800026' :
           d > grades[6]  ? '#BD0026':
           d > grades[5]  ? '#E31A1C' :
           d > grades[4]  ? '#FC4E2A':
           d > grades[3]   ? '#FD8D3C':
           d > grades[2]   ? '#FEB24C' :
           d > grades[1]   ? '#FED976' :
		   					'#FFEDA0';

}




// 设置每个州多边形的样式 
function style(grades, number) {
	// console.log(grades, number)

    return function(feature) {
        return {
			
            fillColor: getColor(feature.properties[number], grades),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    };
}


function getLegend(grades,relation,number,unite){
	
	// 添加静态图件
	legend = L.control({position: 'bottomright'});
	// 创建一个标签，用于描述图例
	legend.onAdd = function (map) {
		// 将人口密度分级，并生成一个颜色填充的标签
		var div = L.DomUtil.create('div', 'info legend'),
			// grades = [0, 10, 20, 50, 100, 200, 500, 1000],
			labels = [];
			// var keys = Object.keys(grades); // 获取键的数组：[0, 10, 20]
			// keys.sort();
			//  console.log(keys,grades)
	
		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < grades.length; i++) {
			div.innerHTML +=
				'<i style="background:' + getColor(grades[i] + 1,grades) + '"></i> ' +
				grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
		}
	
		return div;// 返回图例
	};
	
	legend.addTo(map);// 将图例组件添加到地图对象上

	
	
	geojson = L.geoJson(statesData, {
		style:style(grades,number),
		onEachFeature: onEachFeature
	}).addTo(map);
	
	info = L.control();
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();// 更新信息组件状态
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
		this._div.innerHTML = '<h4>'+relation+'</h4>' +  (props ?
			'<b>' + props.name + '</b><br />' + props[number] + unite
			: 'Hover over a state');
	};
	info.addTo(map);
}


// 当鼠标悬停时，突出显示州的多边形 
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
	// 按顺序迭代图层组，并将当前图层带到前端
	info.update(layer.feature.properties);
}

// 当鼠标移出时，重置州的多边形样式
function resetHighlight(e) {
    geojson.resetStyle(e.target);
	info.update();
}

// 当州的多边形被单击时，缩放地图以适应多边形 
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// 在每个州的多边形上绑定鼠标悬停、鼠标移出和单击等交互方法
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}




function submitForm() {

	// Get the latitude and longitude values from the form
	var marker;
	var lat = parseFloat(document.getElementById('insertData').elements['lat'].value);
	var lon = parseFloat(document.getElementById('insertData').elements['lon'].value);
	// Create a new LatLng object with the latitude and longitude
	var loc = L.latLng(lat, lon);
	map.setView(loc, 10);

	// 定义新的图标
	var newIcon = L.icon({
		iconUrl: 'picture/122.png',
		iconSize: [155, 80]
	});
	// 创建标记点对象，并使用新的图标
	var marker = L.marker([lat, lon], {icon: newIcon}).addTo(map);

	// Return false to prevent the form from submitting (we'll submit it manually later)
	return false;

	
}







		

	

 