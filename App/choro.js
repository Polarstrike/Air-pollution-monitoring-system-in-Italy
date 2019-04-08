var choroMap;
var geojson;
var info;
var indexInRegion = [];
var choro_array = [];
var choro_cache_measure =[];
var choro_inquinanti=[];
for(var  i=0; i< 20; i++)
  indexInRegion.push(0);

function choroIni(){

  quickDataProcess();

  choroMap = L.map('choro').setView(is_mobile ? [43.336906, 11.324942] : [42.29, 12.41], is_mobile ? 5 : 6);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoicG9sYXJzdHJpa2UiLCJhIjoiY2pqbDM5a3YyMTk3aDNxbTA0ZXpqbmY0MSJ9.AXufjOch7xJ38s42dpYXVw'
  }).addTo(choroMap);

  // control that shows state info on hover
  info = L.control();

  info.onAdd = function (choroMap) {
    this._div = L.DomUtil.create('div', 'infos');
    this.update();
    return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML = '<b>Distribuzione regionale</b><br>' + (is_mobile ? '<br>' : '<i style="font-size: 13px;">Indice % medio giornaliero</i><br><br>') ;
    if(props){
      if(isNaN(props.feature.properties.maxInd) || (props.feature.properties.maxInd == 0)){
        this._div.innerHTML += '<b>' + props.feature.properties.name + '</b></br></br>Nessuna misurazione';
      }
      else{
        this._div.innerHTML += '<b>' + props.feature.properties.name +/* '  '+props.feature.properties.id+ */'</b></br></br>Indice medio: <b>' + (props.feature.properties.maxInd).toFixed(2) +'%</b>'
      }
    }
    else {
      this._div.innerHTML += 'Posizionati su una regione';
    }



  };

  info.addTo(choroMap);
  var legend = L.control({position: 'topright'});

  legend.onAdd = function (choroMap) {

    var div = L.DomUtil.create('div', 'infos legend'),
      grades = [0, 50, 100, 150, 200],
      labels = [],
      from, to;

    for (var i = 0; i < grades.length; i++) {
      from = grades[i];
      to = grades[i + 1];

      labels.push(
        '<i style="background:' + getColor(from + 1) + '"></i> ' +
        from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(choroMap);

count = new Array();
for(var k=0; k<regionData.features.length; k++)
  count.push(0);

for(var i=0; i<choro_array.length; i++){
  for(var j=0; j<regionData.features.length; j++){
    if(choro_array[i].region == regionData.features[j].properties.name){   //comparo tutto minuscolo
      regionData.features[j].properties.maxInd += choro_array[i].maxInd;
      count[j]++;
    }
  }
}
for(var j=0; j<regionData.features.length; j++)
  regionData.features[j].properties.maxInd = (regionData.features[j].properties.maxInd)/count[j];

  geojson = L.geoJson(regionData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(choroMap);

}




// get color depending on population density value
function getColor(d) {
  return d > 200 ? '#792978' :
      d > 150  ? '#d51e29' :
      d > 100  ? '#d87c2e' :
      d > 50   ? '#46a64a' :
            '#1dadea';
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: (isNaN(feature.properties.maxInd) || feature.properties.maxInd==0) ? 0 : 0.7,
    fillColor: getColor(feature.properties.maxInd)
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: ''
    //,fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer);
}

function resetHighlight(e) {
geojson.resetStyle(e.target);
info.update();
}

function zoomToFeature(e) {
choroMap.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
layer.on({
  mouseover: highlightFeature,
  mouseout: resetHighlight,
  click: zoomToFeature
});
}



function quickDataProcess(){
  if(quickDataProcessAlreadyRun == 0){
    quickDataProcessAlreadyRun=1;
    console.log('QUICKdataprocess run');
    for(var i=0; i<choro_array.length; i++){
      var iteration = 0;
      //var count = new Array();
      var count = [];
      for(var v=0; v<8; v++)
        count.push(0);

      var sensorType;
      for(var j=iteration; j<choro_cache_measure.length; j++){              //QUICK FOR
        var max = 0;
        if(choro_cache_measure[j].fk_device == choro_array[i].pk_device){
          sensorType = parseInt(choro_cache_measure[j].fk_sensortype);      //WHICH SENSOR
          //test = sensorType;
          if(choro_array[i].measure[sensorType-1] < parseFloat(choro_cache_measure[j].measure)){   //GET THAT SENSOR'S MEASURE
            choro_array[i].measure[sensorType-1] = parseFloat(choro_cache_measure[j].measure);
            choro_array[i].lastUpdate = choro_cache_measure[j].date;                              //GET THE DATE OF THE MEASURE
  			    count[sensorType-1]++;                                                                  //INCREASE SENSORTYPE MEASURE COUNT to calculate avg value
          }
          iteration ++;                                                                                     //QUICK FOR VAR
              //per i diversi sensori conviene sfruttare il fatto che la query php ordina Device e poi per TipoSensore
              //potrei fare anche meglio
        }
        else{
          if(iteration!=0)
            break;
        }
      }

      var maxInd = 0;
      var isTypeOne = 0;
      //PEDICE

      for(var k=0; k<maxSensorType; k++){
        var value;
        if(count[k] != 0){
          value = parseFloat(choro_array[i].measure[k]); //
        }
        else
          value = choro_array[i].measure[k] = NaN;      // if no measure -> the stored measure become NaN

        //filling the row of the popup with  data
        if(!isNaN(value)){        //if the value is a NUMBER
            var chosenIndex = NaN;
            if(k==1){  //if it's NO (no reference and index)
                isTypeOne = 1;
            }
            else if(k==6){// if it's SO2
                chosenIndex = Math.round(100*value/choro_inquinanti[k].reference);
            }
            else{   //default
                chosenIndex = Math.round(100*value/choro_inquinanti[k].reference);
            }
            if(chosenIndex > maxInd)    //saving the maxIndex %
              maxInd = chosenIndex;
        }

      }
      choro_array[i].maxInd = maxInd;   //saving into array                                                                             //end the table (closing)

    }
  }
}



function choro_readMarker(){
  var lat, lon, marker;
  choro_array = [];
     $(function(){
       $.get("getMarkerLocation.php", function(data){
           for(var i in data){
             lat = parseFloat(data[i].lat);
             lon =  parseFloat(data[i].lon);
             if(lat > -90 && lat < 90)
              if(lon > -180 && lon < 180){
               marker = L.marker(L.latLng(lat, lon));
               marker.pk_device = data[i].pk_device;
               marker.lat = lat;
               marker.lon = lon;
               marker.name = data[i].name;
               marker.region = data[i].region;
               marker.measure = new Array();        //8 max measurements
               for(var k=0; k<8; k++)
                  marker.measure.push(0);

               choro_array.push(marker);
             }
           }
           markerRequest = true;
       });
    });
}

function choro_cacheRead(){
     $(function(){
       $.get("getCache.php", function(data){
            choro_cache_measure = JSON.parse(data);
            cacheRequest = true;
       });
    });
}

function choro_inquinantiRead(){
       $(function(){
         $.get("getInquinanti.php", function(data){
              choro_inquinanti = data;
              for(var i=0; i<choro_inquinanti.length; i++)
                  choro_inquinanti[i].pk_sensortype = parseInt(choro_inquinanti[i].pk_sensortype) -1 ;
              inquinantiRequest = true;
         });
      });
}
