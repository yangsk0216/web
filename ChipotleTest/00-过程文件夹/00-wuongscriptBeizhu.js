 // 声明变量 
 var map; 
 // 地图对象 
 var markers; 
 // 标记组 
 var geojson; 
 // GeoJSON 数据 
 var info; 
 // 信息组件 
 var legend; 
 // 图例组件

// 获取地图数据和设置
 function fetchData() {

// 创建地图对象并设置中心点和缩放级别
 map = L.map('map').setView([37.8, -96], 5);

// 加载 OpenStreetMap 的 tile layer 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map data ©OpenStreetMap contributors, CC-BY-SA, Imagery ©CloudMade', maxZoom: 18 }).addTo(map); // 将 tile layer 添加到地图对象上

// 加载包含美国各州边界信息的 GeoJSON 数据
 L.geoJson(statesData).addTo(map);

// 创建底图 
var basemaps = { Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', { layers: 'OSM-Overlay-WMS' }),

Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
  layers: 'TOPO-WMS'
}),

'Topography, then places': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
  layers: 'TOPO-WMS,OSM-Overlay-WMS'
}),
};

// 将地形图添加到地图实例 
basemaps.Places.addTo(map);

// 创建一个新的控制元素，允许您切换底图图层的可见性
 L.control.layers(basemaps).addTo(map);

// 根据人口密度确定州的多边形的样式 
L.geoJson(statesData, { style: style }).addTo(map);

// 添加静态图件
 legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) { 
    // 创建一个标签，用于描述图例
     var div = L.DomUtil.create('div', 'info legend');

// 将人口密度分级，并生成一个颜色填充的标签
var grades = [0, 10, 20, 50, 100, 200, 500, 1000];
for (var i = 0; i < grades.length; i++) {
  div.innerHTML +=
    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

return div; // 返回图例
};

legend.addTo(map); // 将图例组件添加到地图对象上

// 创建一个新的信息组件，用于在地图上显示鼠标悬停或单击时的状态 info = L.control(); info.onAdd = function(map) { // 创建一个新的 div 元素，并添加基本的 CSS 样式 this._div = L.DomUtil.create('div', 'info');

// 更新信息组件状态
this.update();
return this._div;
};

// 当鼠标悬停或单击时，根据对应的地图 feature 的 properties 属性中的信息，更新信息组件状态 
info.update = function(props) { this._div.innerHTML = 'US Population Density' + (props ? '' + props.name + '
' + props.density + ' people / mi2' : 'Hover over a state'); };
info.addTo(map);

// 声明一个数组来保存从服务器返回的结果 
fandiandata = new Array();

// 通过 AJAX 请求从服务器获取数据 
$.getJSON("fetchDataMap.php", function(results) { // 将结果添加到 tweetData 数组中 
    for (var i = 0; i < results.length; i++) { fandiandata.push({ id: results[i].id, state: results[i].state, lat: results[i].lat, lon: results[i].lon, loc: results[i].loc, add: results[i].add, }); }

plotTweets();
});

}

// 创建饭店位置的标记 
function plotTweets() { markers = L.markerClusterGroup(); // 创建标记集群组 var myIcon = L.icon({ // 创建自定义标记图标 iconUrl: '122.png', iconSize: [60, 60], });

// 循环遍历 fandiandata 数组，并在每个位置上创建标记 
for (var i = 0; i < fandiandata.length; i++) { var markerLocation = new L.LatLng(fandiandata[i].lat, fandiandata[i].lon); var marker = new L.Marker(markerLocation); // 创建标记

// 设置标记的弹出式图层
marker.bindPopup(`<b>fandian ID:</b> ${fandiandata[i].id}<br><b>Latitude:</b> ${fandiandata[i].lat}<br><b>Longitude:</b> ${fandiandata[i].lon}<br><b>location:</b> ${fandiandata[i].loc}<br><b>address:</b> ${fandiandata[i].add}`);

marker.setIcon(myIcon); // 设置标记的自定义图标

// 将标记添加到标记集群组中
markers.addLayer(marker);
}

map.addLayer(markers); // 将标记集群组添加到地图对象上 }

// 根据人口密度获取对应的填充颜色代码 
function getColor(d) { return d > 1000 ? '#800026' : d > 500 ? '#BD0026' : d > 200 ? '#E31A1C' : d > 100 ? '#FC4E2A' : d > 50 ? '#FD8D3C' : d > 20 ? '#FEB24C' : d > 10 ? '#FED976' : '#FFEDA0'; }

// 设置每个州多边形的样式 
function style(feature) { return { fillColor: getColor(feature.properties.density), weight: 2, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.7 }; }

// 当鼠标悬停时，突出显示州的多边形 
function highlightFeature(e) { var layer = e.target;

layer.setStyle({ weight: 5, color: '#666', dashArray: '', fillOpacity: 0.7 });

layer.bringToFront(); 
// 按顺序迭代图层组，并将当前图层带到前端
 info.update(layer.feature.properties); // 更新信息组件状态 }

// 当鼠标移出时，重置州的多边形样式 
function resetHighlight(e) { geojson.resetStyle(e.target); info.update(); }

// 当州的多边形被单击时，缩放地图以适应多边形 
function zoomToFeature(e) { map.fitBounds(e.target.getBounds()); }

// 在每个州的多边形上绑定鼠标悬停、鼠标移出和单击等交互方法 
function onEachFeature(feature, layer) { layer.on({ mouseover: highlightFeature, mouseout: resetHighlight