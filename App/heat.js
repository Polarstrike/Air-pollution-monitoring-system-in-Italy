var testLayer, map2;
var hTest = [];
var heatCoord = [];

function heatIni(){
  testLayer =  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicG9sYXJzdHJpa2UiLCJhIjoiY2pqbDM5a3YyMTk3aDNxbTA0ZXpqbmY0MSJ9.AXufjOch7xJ38s42dpYXVw'
  });

  map2 = L.map('map2',{
    center: is_mobile ? [43.336906, 11.324942] : [42.29, 12.41],
    zoom: is_mobile ? 5 : 6,
    minZoom: 4,
    maxZoom: 12,
    layers: [testLayer],
    zoomControl: false
    //,maxBounds: bounds
  });

  if(!is_mobile)
    L.control.scale({imperial: false}).addTo(map2);         //show metric scale control on map

  L.control.zoom({                                        //show zoom control on map
       position: 'topleft'
  }).addTo(map2);
}

function readHeatMarker(){
var lat, lon, marker;
heatCoord = [];
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
             marker.measure = new Array();        //8 max measurements
             for(var k=0; k<8; k++)
                marker.measure.push(0);

             heatCoord.push(marker);
           }
         }
     });
  });
}

function heatProcess(){
  if(heatProcessAlreadyRun == 0){
    heatProcessAlreadyRun = 1;
    console.log("HEATPROCESS RUN");
    for(var i=0; i<heatCoord.length; i++){
      var iteration = 0;
      var count = new Array();
      for(var v=0; v<8; v++)
        count.push(0);

      var sensorType;
      for(var j=iteration; j<cache_measure.length; j++){              //QUICK FOR
        if(cache_measure[j].fk_device == heatCoord[i].pk_device){
          sensorType = parseInt(cache_measure[j].fk_sensortype);      //WHICH SENSOR
          //test = sensorType;
          heatCoord[i].measure[sensorType-1] += parseFloat(cache_measure[j].measure);   //GET THAT SENSOR'S MEASURE
          count[sensorType-1]++;                                                                  //INCREASE SENSORTYPE MEASURE COUNT to calculate avg value
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
      for(var k=0; k<maxSensorType; k++){
        var value = heatCoord[i].measure[k] = parseFloat((heatCoord[i].measure[k]/count[k]).toFixed(2));      //avg value = sum/number

        //filling the row of the popup with  data
        if(!isNaN(value)){        //if the value is a NUMBER
            var chosenIndex = NaN;
            if(k==1)  //if it's NO (no reference and index)
                isTypeOne = 1;
            else if(k==6)  // if it's SO2
                chosenIndex = Math.ceil(100*value/inquinanti[k].reference);
            else   //default
                chosenIndex = parseInt((100*value/inquinanti[k].reference).toFixed(2));


            if(chosenIndex > maxInd)    //saving the maxIndex %
              maxInd = chosenIndex;
        }

      }

      if(isTypeOne ==1 || maxInd != 0){   //if in last station there were a NO sensor or index is != from 0    (got worth data)

        // HEATMAP OPERATION
        var valutation = evaluateIndex(maxInd);
        heatCoord[i].heatIntensity = parseInt(valutation.val) + 1;
        hTest.push([heatCoord[i].lat, heatCoord[i].lon, 1]);


      }


    }

      //finally drawing the heatmap
    var heatMap = L.heatLayer(hTest, {
              radius: 20,
              max: 3,
              maxZoom: 7,
              blur: 50,
              minOpacity:0.5
              /*
              gradient: {
                    0.0: 'white',
                    0.5: 'gray',
                    1: 'black'
                }
              */
              ,
              gradient: {
                    0.0: 'blue',
                    0.25: 'lime',
                    0.5: 'orange',
                    0.75: 'violet',
                    1: 'red'
                }


        }).addTo(map2);



        var legend = L.control({position: 'topright'});

        legend.onAdd = function (map2) {

          var div = L.DomUtil.create('div', 'infos legend'),
            grades = [0, 50, 100, 150, 200],
            labels = [],
            from, to;

        div.innerHTML = '<div style="margin-bottom:5px;"><b id="tip" title="Questa rappresentazione si riferisce alla copertura di stazioni di rilevamento sul territorio nazionale. Non intende in alcun modo dare informazioni riguardo alla qualit&agrave; dell'+"'"+'aria.">Concentrazione</b></div><div style="float: left;"><b>-</b></div><div style="text-align: right;"><b>+</b></div></div>' +
        '<div id="grad1"></div>';

          return div;
        };

        legend.addTo(map2);
        $('#tip').tooltip();

  }
}
