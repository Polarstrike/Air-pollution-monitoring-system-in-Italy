// initialize the map
var test;
var aaa;
var openedPopup = null;
var click = 0;
var clickedFilter = false;
var inquinantiRequest = false;
var cacheRequest = false;
var markerRequest = false;
var graphInfo = [];

var LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [20, 33],
        iconAnchor:   [10, 33],   //open the marker on MS Paint, find it's size, and the point of the anchor. Then use them or their multiples as iconSize and iconAnchor or
        popupAnchor:  [0, -66]    //relative to iconAnchor
                                  //realSize/2 used here
    }
});
var icon = [new LeafIcon({iconUrl: 'images/markers/buona.png'}),
    new LeafIcon({iconUrl: 'images/markers/discreta.png'}),
    new LeafIcon({iconUrl: 'images/markers/mediocre.png'}),
    new LeafIcon({iconUrl: 'images/markers/scadente.png'}),
    new LeafIcon({iconUrl: 'images/markers/pessima.png'}),
    new LeafIcon({iconUrl: 'images/markers/no_misure.png'})];

var markerPath = ["images/markers/buona.png", "images/markers/discreta.png", "images/markers/mediocre.png", "images/markers/scadente.png", "images/markers/pessima.png", "images/markers/no_misure.png"];
var cache_measure;
var inquinanti;
var map1;
var map2;
var heat;
var hTest = [];
  //BOUND MAP AROUND ITALY (BORING FEATURE)
var corner1 = L.latLng(47.591,4.153), corner2 = L.latLng(34.724,22.390), bounds = L.latLngBounds(corner1, corner2);
var streetLayer, satLayer, regionLayer, testLayer;
var marker_array = new Array();							//test
var fromDB_marker_array = [];			//array marker delle centraline
var heat_Array = new Array();
var maxSensorType = 8;


var color =["#8AD9E0", "#98CB00", "#E98400", "#FE0000", "#81007F"];       //popup dots color

function mapIni(){

    streetLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: is_mobile? '' : 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoicG9sYXJzdHJpa2UiLCJhIjoiY2pqbDM5a3YyMTk3aDNxbTA0ZXpqbmY0MSJ9.AXufjOch7xJ38s42dpYXVw'
    });
    satLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets-satellite',
    accessToken: 'pk.eyJ1IjoicG9sYXJzdHJpa2UiLCJhIjoiY2pqbDM5a3YyMTk3aDNxbTA0ZXpqbmY0MSJ9.AXufjOch7xJ38s42dpYXVw'
    });




    map1 = L.map("map1",{
      center: is_mobile ? [43.336906, 11.324942] : [42.29, 12.41],
      zoom: is_mobile ? 5 : 6,
      layers: [streetLayer],
      zoomControl: false
      //,maxBounds: bounds
    });


    var baseLayers = {
      "Satellite": satLayer,
      "Street": streetLayer
    };



    var layerControl = L.control.layers(baseLayers);               //autoZindex option enable by default keep track of the order of the layers
          //adding {collapsed: false}  option will leave the layerControl opened by default
    layerControl.setPosition('topleft');
    layerControl.addTo(map1);

    if(!is_mobile)
      L.control.scale({imperial: false}).addTo(map1);         //show metric scale control on map

    L.control.zoom({                                        //show zoom control on map
         position:'bottomright'
    }).addTo(map1);

}



//POSIZIONA TUTTI I MARKER CON LE COORDINATE RECUPERATE DAL DB -> file getMarkerLocation.php
function readMarker(){
  var lat, lon, marker;
  fromDB_marker_array = [];
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
               marker.oldPopup = "";
               marker.emptyFirstTime = true;
               marker.firstMeasureIndex = null;
               marker.measure = new Array();        //8 max measurements
               for(var k=0; k<8; k++)
                  marker.measure.push(0);

               fromDB_marker_array.push(marker);
             }
           }
           markerRequest = true;
       });
    });
}

function cacheRead(){
  if(cacheFirstTime == 0){
    console.log("cacheRead run");
    cacheFirstTime = 1;
     $(function(){
       $.get("getCache.php", function(data){
            cache_measure = JSON.parse(data);
            cacheRequest = true;
       });
    });
  }
}

function inquinantiRead(){
  if(inquinantiFirstTime == 0){
      console.log("inquinantiRead run");
      inquinantiFirstTime = 1;
       $(function(){
         $.get("getInquinanti.php", function(data){
              inquinanti = data;
              for(var i=0; i<inquinanti.length; i++)
                  inquinanti[i].pk_sensortype = parseInt(inquinanti[i].pk_sensortype) -1 ;
              inquinantiRequest = true;
         });
      });
  }
}

//return a numerical valutation of a %index
function evaluateIndex(index){
  if (index <= 50)
  return {val: "0", giudizio: "Buona"};
  else if (index <= 100)
  return {val: "1", giudizio: "Discreta"};
  else if (index <= 150)
  return {val: "2", giudizio: "Mediocre"};
  else if (index <= 200)
  return {val: "3", giudizio: "Scadente"};
  else
  return {val: "4", giudizio: "Pessima"};

}

function hasMeasure(index){
  count = 0;
  for(var i=0; i<8; i++)
    if(isNaN(fromDB_marker_array[index].measure[i]))
      count++;

    if(count == 8)
      return false;
    else
      return true;

}

//colored circle into the popup
function getCircle(index){
    var level = evaluateIndex(index);
    var selectedColor = color[level.val];
    var result = "<svg height='20' width='20'><circle cx='8' cy='12' r='5'  fill='"+ selectedColor + "' /></svg>";
    return result;
}

//colored bar into the popup
function get_bar(m) {
	if (m == 0)
	return "<div class='bar buona'></div>";
	else if (m == 1)
	return "<div class='bar accettabile'></div>";
	else if (m == 2)
	return "<div class='bar mediocre'></div>";
	else if (m == 3)
	return "<div class='bar scadente'></div>"
	else
	return "<div class='bar pessima'></div>";

}

function dataProcess(){
  if(dataProcessAlreadyRun == 0){
    dataProcessAlreadyRun=1;
    console.log('dataprocessrun');
    for(var i=0; i<fromDB_marker_array.length; i++){
      var iteration = 0;
      //var count = new Array();
      var count = [];
      for(var v=0; v<8; v++)
        count.push(0);

      var sensorType;

      var tmpconta = 0;
      for(var j=iteration; j<cache_measure.length; j++){              //QUICK FOR
        var max = 0;
        if(cache_measure[j].fk_device == fromDB_marker_array[i].pk_device){
          tmpconta++;
          sensorType = parseInt(cache_measure[j].fk_sensortype);      //WHICH SENSOR
          //test = sensorType;
          if(fromDB_marker_array[i].measure[sensorType-1] < parseFloat(cache_measure[j].measure)){   //GET THAT SENSOR'S MEASURE
            fromDB_marker_array[i].measure[sensorType-1] = parseFloat(cache_measure[j].measure);
            fromDB_marker_array[i].lastUpdate = cache_measure[j].date;                              //GET THE DATE OF THE MEASURE
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

      fromDB_marker_array[i].firstMeasureIndex = j-tmpconta;

      var popupContent = "";
      var maxInd = 0;
      var isTypeOne = 0;
      //PEDICE
      inquinanti[0].type = "NO<sub>2</sub>";
      inquinanti[2].type = "O<sub>3</sub>";
      inquinanti[6].type = "SO<sub>2</sub>";
      var classNum = 0;
      for(var k=0; k<maxSensorType; k++){
        var value;
        if(count[k] != 0){
          value = parseFloat(fromDB_marker_array[i].measure[k]); //
          classNum++;
        }
        else
          value = fromDB_marker_array[i].measure[k] = NaN;      // if no measure -> the stored measure become NaN

        //filling the row of the popup with  data
        if(!isNaN(value)){        //if the value is a NUMBER
            var chosenIndex = NaN;
            popupContent = popupContent +  "<tr class=" + 'sostanza-'+ k + "><td>" + inquinanti[k].type + "</td><td>" + value + " "+ inquinanti[k].scale +"</td>";    //sostanza + value
            if(k==1){  //if it's NO (no reference and index)
                popupContent += "<td>-</td><td>-</td><td><svg height='20' width='20' style='visibility: hidden;'><circle cx='8' cy='12' r='5'/></svg></td></tr>";
                isTypeOne = 1;
            }
            else if(k==6){// if it's SO2
                popupContent += "<td>" + inquinanti[k].reference + " " + inquinanti[k].scale + "</td><td>" + Math.round(100*value/inquinanti[k].reference) + "%</td><td>" + getCircle(Math.round(100*value/inquinanti[k].reference)) + "</td></tr>";
                chosenIndex = Math.round(100*value/inquinanti[k].reference);
            }
            else{   //default
                popupContent += "<td>" + inquinanti[k].reference + " " + inquinanti[k].scale + "</td><td>" + Math.round(100*value/inquinanti[k].reference) + "%</td><td>" + getCircle(parseInt((100*value/inquinanti[k].reference).toFixed(2))) + "</td></tr>";
                chosenIndex = Math.round(100*value/inquinanti[k].reference);
            }
            if(chosenIndex > maxInd)    //saving the maxIndex %
              maxInd = chosenIndex;
        }

      }
      //console.log(count + '  '+classNum);
      fromDB_marker_array[i].maxInd = maxInd;   //saving into array
      var stdTablePreBegin = "<table class='styleTable'><tbody><tr><td><p style='margin-bottom:0px;'><b>" + fromDB_marker_array[i].name  + /*" < "+ i + " > nMisure: " + tmpconta + */"</b></p></td></tr></tbody></table>";      //station name + array index for debug
      var stdTableBegin = "<table class='styleTable'><tbody><tr>" +
                          "<td>" + (is_mobile ? "" : "<strong>Sostanza</strong>") +
                          "</td><td><strong>" + (is_mobile ? "Valore" : "Misurazione") + "</strong></td>" +
                          "<td><strong>"+ (is_mobile ? "Limite" : "Limite di riferimento") +"</strong></td><td><strong>"+ (is_mobile ? "IQA" : "Indice") +"</strong></td>" +
                          "<td>"+ (is_mobile ? "" : "<strong>Qualit&agrave; Aria</strong>") +"</td></tr>";    //table header

      var stdTableEnding = "</tbody></table>";    //1st tab ending
      var stdJudgement = "";
      var lastUpdate = "";
      var date;
      var valutation;
      if(isTypeOne==1 || maxInd != 0){   //if in last station there were a NO sensor or index is != from 0    (got worth data)
        valutation = evaluateIndex(maxInd);     //calculate a valutation of the maxIndex%
        stdJudgement += "<table class='styleTable'><tbody><tr><td><strong>Giudizio globale: " + valutation.giudizio + "</strong></td></tr>";    //Put the valutation into a row

        date = new Date(parseInt(fromDB_marker_array[i].lastUpdate));                                                                           //get the date from unix millisecs
        lastUpdate += "<tr><td>Aggiornato al: " + date.getUTCDate() + "/" + (1+date.getUTCMonth()) + "/"+ date.getUTCFullYear() + "</td></tr>";          //put in human readable format into a row
        lastUpdate += "</tbody></table>";                                                                                                       //end the table (closing)

              //MARKER ATTATCHING TO THE MAP
        fromDB_marker_array[i].addTo(map1);
              //POPUP BINDING + eventHandler on PopupOpen  -> show only filtered values

            var fixedHeight = 8;
        var content1 = '<div class="tabs measure'+
                        (is_mobile ? classNum : fixedHeight) +
                        ' "><div class="tab" id="tab-1">' +
                          '<div class="content" id="popup1">';

        var content2 = '</div>' +
                          '</div>' +

                          '<div class="tab" id="tab-2">' +
                          '<div class="content" id="popup2" style="display: none;">' +
                          '</div>' +
                          '</div>' +

                          '<ul class="tabs-link">' +
                          '<li class="tab-link" id="li1" style="z-index: 1" onclick="zUpdate(1)"><a class="noSub"  ><span>Indici</span></a></li>' +
                          '<li class="tab-link" id="li2" style="z-index: 0; display: none; background-color: #f5f5f5; left: -6px" onclick="zUpdate(2)"> <a class="noSub"  ><span>Andamento Giornaliero</span></a></li>' +
                          '</ul>' +
                      '</div>';


        //fromDB_marker_array[i].classNum = classNum;
        //fromDB_marker_array[i].pk_device = i;
        fromDB_marker_array[i].bindPopup((content1 + stdTablePreBegin + stdTableBegin +
           popupContent + stdTableEnding + stdJudgement + lastUpdate +   get_bar(valutation.val) + content2),
           {
               title: i, minWidth: (is_mobile ? 290 : 500), maxHeight: "auto",
               autoPanPaddingTopLeft: (is_mobile ? L.point(0, 40) : L.point(10, 40) ), autoPanPaddingBottomRight: (is_mobile ? L.point(0, 40) : L.point(10, 40) )
             }).on('popupopen', function(e) {
               //console.log(e);
                openedPopup = e.popup.options.title;
                console.log('aperto il numero: '+openedPopup);
                setTimeout(function(){ $('#li2').hide(); }, 200);

                //$('#li2').hide();
                //console.log('openPopup: '+clickedFilter);

                //setTimeout(function(){ $('#li2').fadeOut(600) }, 300);
                var tmpData = new Date(parseInt(e.sourceTarget.lastUpdate));

                //console.log('last: '+ formatDate(tmpData));
                popupGraphDataGather(e.sourceTarget.name, tmpData);

                for(var i=0; i<inquinanti.length; i++){
                  if(get_filters(i)){                       //if selected
                    $('.sostanza-' + i).show();
                  }
                  else{                                     //if not selected
                    $('.sostanza-' + i).hide();
                  }
                }
                //console.log('openedPopup: '+openedPopup);
        }).on('popupclose', function(e) {
          console.log(document.getElementById('popup2'));
              //console.log('dovrei chiudere il numero: '+e.popup.options.title);
              if(clickedFilter == true){
                clickedFilter = false;
              }
              else{
                openedPopup = null;
              }

        });

        fromDB_marker_array[i].setIcon(icon[valutation.val]);       //set the right icon following the valutation
        if(!is_mobile)
          fromDB_marker_array[i].bindTooltip(fromDB_marker_array[i].name);

        // HEATMAP OPERATION      check heatDraw()
        /*
        fromDB_marker_array[i].heatIntensity = parseInt(valutation.val) + 1;
        var tmp = parseInt(valutation.val) + 1;
        hTest.push([fromDB_marker_array[i].lat, fromDB_marker_array[i].lon, fromDB_marker_array[i].heatIntensity]);
        */

      }
      else{   //IF data wasn't worth (no measurements)
        valutation.val = 5;
        fromDB_marker_array[i].setIcon(icon[valutation.val]);   //forcing a trasparent marker

        map1.removeLayer(fromDB_marker_array[i]);               //remove no data marker from map but not from array
      }


    }
    inquinanti[0].type = "NO2";
    inquinanti[2].type = "O3";
    inquinanti[6].type = "SO2";
    $("#main-content").removeClass("loading");
  }

}



//add the map legend (which can help noob user to understand the meaning of the color used in marker [must be a very noob user])
function legend(){
  var legend = L.control({position: is_mobile ? 'topleft' : 'topright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'infos legend'),
        grades = ["Buona", "Discreta", "Mediocre", "Scadente", "Pessima"];

        div.innerHTML = is_mobile ? "" : "<p style='margin-top: 0;'><strong>Qualit" + "&agrave;" +" dell'aria</strong></p>";
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML += (is_mobile ?
        "<img style='position: relative; top: -4px;' src=" + markerPath[i] +  " width='12px' height='20px' align='middle'> "  +  grades[i] +  "<br>"
        :
        "<p style='margin-top: 0;" + ((i == grades.length-1) ? "margin-bottom: 0px;" : "margin-bottom: 6px;") +"'><img style='position: relative; top: -4px;' src=" + markerPath[i] +  "  width='15px' height='25px' align='middle'>"  +  grades[i] +  "</p>" ) ;
     }
     return div;
   };

   legend.addTo(map1);
}

//true if checked, false if not
function get_filters(u) {
	if ($(document).find("input[name='sostanza-" + u + "']").is(':checked') == true)
	   return true;
	else
	   return false;
}

//on filterChange  -> change icon color if needed  (recalculate max index)
function filterChange(){
  console.log('filterchange called!');
  for(var i=0; i<fromDB_marker_array.length; i++){
    var maxInd = 0;
    var count = 0;
    for(var j=0; j<inquinanti.length; j++){
      if(!isNaN(fromDB_marker_array[i].measure[j]) && get_filters(j)){  //if i have a valid measure for K and it's selected into filtertab
        count++;
        if(j!=1){
          /*
          if(i == 80){
            console.log("fromdb[80]: inquinante="+inquinanti[j].type +" misura=" + fromDB_marker_array[80].measure[j]);
          }
          */
          var tmpInd = (fromDB_marker_array[i].measure[j]/inquinanti[j].reference) * 100;
          if(tmpInd > maxInd)
            maxInd = Math.round(tmpInd);
        }
      }
    }
    //if(i==80)
      //console.log("At fromdb["+i+"]   New maxInd = " + maxInd + "  with count: " + count);
    var judgement = evaluateIndex(maxInd);

    if(count==0 && hasMeasure(i)){
      judgement.val = 5;
      //console.log("count=0 on index " + i);
      fromDB_marker_array[i].setIcon(icon[judgement.val]);      //set a new icon
      //fromDB_marker_array[i].unbindPopup();
      var tmp = fromDB_marker_array[i].getPopup();
      if(fromDB_marker_array[i].emptyFirstTime == true){
        fromDB_marker_array[i].emptyFirstTime = false;
        fromDB_marker_array[i].oldPopup = tmp._content.substring(0, tmp._content.indexOf("<table class='styleTable'><tbody><tr><td><strong>Giudizio"));
        fromDB_marker_array[i].oldPopup = fromDB_marker_array[i].oldPopup.substring(fromDB_marker_array[i].oldPopup.indexOf("<table class='styleTable'><tbody><tr><td><h1>"));
      }
      var popup = "<table class='styleTable'><tbody><tr><td><p style='margin-bottom:0px;'><b>" + fromDB_marker_array[i].name /*+ " < "+ i +" >"*/ +"</b></></td></tr><tr><td>Non sono presenti misurazioni.</td></tr></tbody></table>" ;      //station name + array index for debug
      fromDB_marker_array[i].bindPopup(popup);
    }
    else{
      fromDB_marker_array[i].setIcon(icon[judgement.val]);      //set a new icon
      fromDB_marker_array[i].emptyFirstTime = true;
      var firstPopupPart;
      //console.log("count=" +count+" on index " + i);
      if(hasMeasure(i)){
        if(fromDB_marker_array[i]._popup._content.search("Non sono") >= 0){         //era un "undisplayed"
            firstPopupPart = fromDB_marker_array[i].oldPopup;
            //console.log(firstPopupPart);
        }
        else{
            var tmp = fromDB_marker_array[i].getPopup();
            //console.log("done1 " + i + "   count = " + count);
            firstPopupPart = tmp._content.substring(0, tmp._content.indexOf("<table class='styleTable'><tbody><tr><td><strong>Giudizio"));

            firstPopupPart = firstPopupPart.substring(firstPopupPart.indexOf("<table class='styleTable'>"));
            //console.log(firstPopupPart);
        }
        //var firstPopupPart = fromDB_marker_array[i]._popup._content.substring(0, fromDB_marker_array[i]._popup._content.indexOf("<table class='styleTable'><tbody><tr><td><strong>Giudizio"));
        //reAdd
        //console.log("done2 " + i);
        var secondPopupPart = "<table class='styleTable'><tbody><tr><td><strong>Giudizio globale: " + judgement.giudizio + "</strong></td></tr>";    //Put the valutation into a row
        date = new Date(parseInt(fromDB_marker_array[i].lastUpdate));                                                                                 //get the date from unix millisecs
        secondPopupPart += "<tr><td>Aggiornato al: " + date.getDate() + "/" + (1+date.getMonth()) + "/"+ date.getFullYear() + "</td></tr>";           //put in human readable format into a row
        secondPopupPart += "</tbody></table>" + get_bar(judgement.val);

        var fixedHeight = 8;

        var content1 = '<div class="tabs measure'+
                          (is_mobile ? count : fixedHeight) +
                          '"> '+ '<div class="tab" id="tab-1">' +
                            '<div class="content " id="popup1">';

        var content2 = '</div>' +
                          '</div>' +

                          '<div class="tab" id="tab-2">' +
                          '<div class="content" id="popup2" style="display: none;">' +
                          '</div>' +
                          '</div>' +

                          '<ul class="tabs-link">' +
                          '<li class="tab-link" id="li1" style="z-index: 1" onclick="zUpdate(1)"><a class="noSub" ><span>Indici</span></a></li>' +
                          '<li class="tab-link" id="li2" style="z-index: 0; display: none; background-color: #f5f5f5; left: -6px" onclick="zUpdate(2)"> <a class="noSub" ><span>Andamento Giornaliero</span></a></li>' +
                          '</ul>' +
                      '</div>';


        /*
        fromDB_marker_array[i].unbindPopup();
        fromDB_marker_array[i].bindPopup((content1 + firstPopupPart + secondPopupPart + content2),
            {title: i, minWidth: (is_mobile ? 290 : 450), maxHeight: "auto"}).on('popupopen', function(popup) {
                 //alert("popup");
                // openedPopup = popup.popup.options.title;
                 for(var i=0; i<inquinanti.length; i++){
                   if(get_filters(i)){                       //if selected
                     $('.sostanza-' + i).show();
                   }
                   else{                                     //if not selected
                     $('.sostanza-' + i).hide();
                   }
                 }
         });

         */
         fromDB_marker_array[i]._popup._content = (content1 + firstPopupPart + secondPopupPart + content2);

      }
    }
  }
  if(openedPopup != null)
    fromDB_marker_array[openedPopup].openPopup();
}


//filter tab to show only measurements of interest
function filterTab(){
  var filterTab = L.control({position: is_mobile ? 'bottomleft' : 'topleft'});
  filterTab.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'infos filterTab'),
          grades = ["Buona", "Discreta", "Mediocre", "Scadente", "Pessima"];

          div.innerHTML += "<div id='filtri'>" +
          "<form id='filters' action='' autocomplete='on' name='fil' onchange='filterChange()'>" +
              "<h3 >Filtri:</h3>" +
                  "<label><input type='checkbox' name='sostanza-0' value='NO2' checked>NO<sub>2</sub></label><br>" +
                  "<label><input type='checkbox' name='sostanza-1' value='NO' checked>NO</label><br>" +
                  "<label><input type='checkbox' name='sostanza-2' value='O3' checked>O<sub>3</sub></label><br>" +
                  "<label><input type='checkbox' name='sostanza-3' value='PM10' checked>PM10</label><br>" +
                  "<label><input type='checkbox' name='sostanza-4' value='CO' checked>CO</label><br>" +
                  "<label><input type='checkbox' name='sostanza-5' value='PM25' checked>PM2.5</label><br>" +
                  "<label><input type='checkbox' name='sostanza-6' value='SO2' checked>SO<sub>2</sub></label><br>" +
                  "<label><input type='checkbox' name='sostanza-7' value='BENZENE' checked>BENZENE</label><br>" +
          "</form>" +
          "</div>";


       return div;
   };

   filterTab.addTo(map1);

   //event listener click on the filter tab
   document.getElementById("filters").onclick = function(e) {
       e = e || event
   var target = e.target || e.srcElement
   // variable target has your clicked element
       clickedFilter = true;
       //console.log('clickedFilter: '+clickedFilter);

   }
}





function readData(){
  readMarker();
  cacheRead();
}





function measureOf(index, avg){
  var iteration = 0;
  var media = 0;
  var count = 0;
  var max = 0;
    var sensorType;
    for(var j=iteration; j<cache_measure.length; j++){              //QUICK FOR
      if(cache_measure[j].fk_device == fromDB_marker_array[index].pk_device){
        sensorType = parseInt(cache_measure[j].fk_sensortype);
        console.log("Misura: " + sensorType + "   " + cache_measure[j].measure );      //WHICH SENSOR                                                              //INCREASE SENSORTYPE MEASURE COUNT to calculate avg value
        if(avg != 0 &&  avg == sensorType){
          media = media + parseFloat(cache_measure[j].measure);
          count++;
          if(max < parseFloat(cache_measure[j].measure))
            max = parseFloat(cache_measure[j].measure);
        }


        iteration ++;                                                                                     //QUICK FOR VAR
      }
      else{
        if(iteration!=0)
          break;
      }
    }

    if(avg != 0){
      media = media/count;
      console.log("Media di " + avg + ": " + media);
      console.log("Massimo: " + max);
    }
}




























function zoomOnRegion(value){
  swap("mappa");            //show map
  switch (value) {

    case 'italia':
    map1.setView({lat: 42.15522, lng: 12.51215}, 6);
    break;

    case 'abruzzo':
    map1.setView({lat: 42.366111, lng: 13.394444}, 9);
    break;

    case 'basilicata':
    map1.setView({lat: 40.639167, lng: 15.805278}, 9);
    break;

    case 'calabria':
    map1.setView({lat: 38.891667, lng: 16.599444}, 8);
    break;

    case 'campania':
    map1.setView({lat: 40.833333, lng: 14.25}, 8);
    break;

    case 'emilia romagna':
    map1.setView({lat: 44.510556, lng: 10.956944}, 9);
    break;

    case 'friuli venezia giulia':
    map1.setView({lat: 46.03611, lng: 13.504167}, 9);
    break;

    case 'lazio':
    map1.setView({lat: 41.893056, lng: 12.482778}, 8);
    break;

    case 'liguria':
    map1.setView({lat: 44.455556, lng: 8.734722}, 9);
    break;

    case 'lombardia':
    map1.setView({lat: 45.585556, lng: 9.930278}, 8);
    break;

    case 'marche':
    map1.setView({lat: 43.616667, lng: 13.516667}, 8);
    break;

    case 'molise':
    map1.setView({lat: 41.566667, lng: 14.666667}, 9);
    break;

    case 'piemonte':
    map1.setView({lat: 45.066667, lng: 7.7}, 8);
    break;

    case 'puglia':
    map1.setView({lat: 41.062778, lng: 16.380556}, 8);
    break;

    case 'sardegna':
    map1.setView({lat: 40.05, lng: 9.083333}, 8);
    break;

    case 'sicilia':
    map1.setView({lat: 37.559722, lng: 14.139167}, 8);
    break;

    case 'toscana':
    map1.setView({lat: 43.771389, lng: 11.254167}, 8);
    break;

    case 'trentino alto adige':
    map1.setView({lat: 46.066667, lng: 11.116667}, 8);
    break;

    case 'umbria':
    map1.setView({lat: 43.1121, lng: 12.3888}, 9);
    break;

    case "valle d'aosta":
    map1.setView({lat: 45.737222, lng: 7.320556}, 10);
    break;

    case 'veneto':
    map1.setView({lat: 45.439722, lng: 12.331944},   9);
    break;
  }
}


function zoomOn(value){
  if(value){
    switch (value) {

      case 'italia':
      map1.setView({lat: 42.15522, lng: 12.51215}, 6);
      break;

      case 'abruzzo':
      map1.setView({lat: 42.366111, lng: 13.394444}, 9);
      break;

      case 'basilicata':
      map1.setView({lat: 40.639167, lng: 15.805278}, 9);
      break;

      case 'calabria':
      map1.setView({lat: 38.891667, lng: 16.599444}, 8);
      break;

      case 'campania':
      map1.setView({lat: 40.833333, lng: 14.25}, 8);
      break;

      case 'emilia romagna':
      map1.setView({lat: 44.510556, lng: 10.956944}, 9);
      break;

      case 'friuli venezia giulia':
      map1.setView({lat: 46.03611, lng: 13.504167}, 9);
      break;

      case 'lazio':
      map1.setView({lat: 41.893056, lng: 12.482778}, 8);
      break;

      case 'liguria':
      map1.setView({lat: 44.455556, lng: 8.734722}, 9);
      break;

      case 'lombardia':
      map1.setView({lat: 45.585556, lng: 9.930278}, 8);
      break;

      case 'marche':
      map1.setView({lat: 43.616667, lng: 13.516667}, 8);
      break;

      case 'molise':
      map1.setView({lat: 41.566667, lng: 14.666667}, 9);
      break;

      case 'piemonte':
      map1.setView({lat: 45.066667, lng: 7.7}, 8);
      break;

      case 'puglia':
      map1.setView({lat: 41.062778, lng: 16.380556}, 8);
      break;

      case 'sardegna':
      map1.setView({lat: 40.05, lng: 9.083333}, 8);
      break;

      case 'sicilia':
      map1.setView({lat: 37.559722, lng: 14.139167}, 8);
      break;

      case 'toscana':
      map1.setView({lat: 43.771389, lng: 11.254167}, 8);
      break;

      case 'trentino alto adige':
      map1.setView({lat: 46.066667, lng: 11.116667}, 8);
      break;

      case 'umbria':
      map1.setView({lat: 43.1121, lng: 12.3888}, 9);
      break;

      case "valle d'aosta":
      map1.setView({lat: 45.737222, lng: 7.320556}, 10);
      break;

      case 'veneto':
      map1.setView({lat: 45.439722, lng: 12.331944},   9);
      break;
    }
  }
}

//DEG TO RADIANS CONVERSION
function toRadians(degrees) {
  return degrees * Math.PI / 180;
};

//HAVERSINE FUNCTION, CALCULATE DISTANCE BETWEEN TWO POINTS OF GIVEN LAT,LNG    distance is in metres
//better edit to work with _latlng leaflet object ?
function haversine(coord1, coord2){
  var R = 6371e3; // metres
  var phi1 = toRadians(coord1.lat);
  var phi2 = toRadians(coord2.lat);
  var deltaphi = toRadians(coord2.lat-coord1.lat);
  var deltalambda = toRadians(coord2.lng-coord1.lng);

  var a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c ;
  return d;         //return distance in metres
}


function zUpdate(num){
  if(num==2){
    document.getElementById("li1").style.zIndex = 0;
    document.getElementById("li1").style.backgroundColor = "#f5f5f5";
    $('#popup1').hide()
    document.getElementById("li2").style.zIndex = 1;
    document.getElementById("li2").style.backgroundColor = "#ffffff";
    $('#popup2').show()
    //console.log('Grafico');

  }
  else{
    document.getElementById("li1").style.zIndex = 1;
    document.getElementById("li1").style.backgroundColor = "#ffffff";
    $('#popup1').show()
    document.getElementById("li2").style.zIndex = 0;
    document.getElementById("li2").style.backgroundColor = "#f5f5f5";
    $('#popup2').hide()
    //console.log('Indici');
  }
}



function popupGraphDataGather(stationName, chosenDay){

  var chosenUTCts = Date.UTC(chosenDay.getUTCFullYear(), chosenDay.getUTCMonth(), chosenDay.getUTCDate());
  //console.log('chosen: '+chosenUTCts);
  $(function(){
      $.post( "getGraphData.php",
        { name: stationName, data: chosenUTCts })
            .done(function( data ) {
              graphInfo = data;
              drawPopupGraph();
            });
  });
}



var popupMeasureContainer = [ [], [], [], [], [], [], [], [] ];

function drawPopupGraph() {
      var measureCount = 0;
      //var container = document.getElementById('tab-2');

      var data = null;
      data = new google.visualization.DataTable();
      data.addColumn('number', 'X');

      popupMeasureContainer = [ [], [], [], [], [], [], [], [] ];
      for(var i=0; i<8; i++)
        for(var j=0; j<24; j++)
          popupMeasureContainer[i].push(null);

      for(var i=0; i<graphInfo.length; i++){      //DATI DA DIVIDERE
          var tmpDate = new Date(parseInt(graphInfo[i].date))
          graphInfo[i].ore = tmpDate.getUTCHours();
          graphInfo[i].pk_sensortype = parseInt(graphInfo[i].pk_sensortype) - 1;
          popupMeasureContainer[parseInt(graphInfo[i].pk_sensortype)][graphInfo[i].ore]  = parseFloat(graphInfo[i].measure);
      }
      whatNotNull = [false, false, false, false, false, false, false, false];
      for(var i=0; i<inquinanti.length; i++){
        whatNotNull[i] = somethingInside(popupMeasureContainer[i]);
        if(whatNotNull[i]){
          if(get_filters(i))
            data.addColumn('number', inquinanti[i].type + " " + inquinanti[i].scale);
          //console.log(inquinanti[i].type + " " + inquinanti[i].scale);
        }
      }


      var isItWorth = false;
      for(var i=0; i<8; i++){
        var c=0;
        for(var j=0; j<24; j++){
          if(popupMeasureContainer[i][j] != null){
            c++;
            if(c == 2)
              isItWorth = true;
          }
        }
      }


      if(isItWorth){
                                               //se c'è almeno 1 linea da mostrare (2pt)
        //var c = ((a < b) ? 'minor' : 'major');
        for(var i=0; i<24; i++){
          var tmpRow = [];
          tmpRow.push(i);
          for(var j=0; j<inquinanti.length; j++){
            if(whatNotNull[j])
              if(get_filters(j))
                tmpRow.push(popupMeasureContainer[j][i]);
          }
          //console.log(tmpRow);
          data.addRow(tmpRow);
        }



        var options = {
          width:		is_mobile ? 400 : 500,
      		height:		is_mobile ? 280 : 400,
      		vAxis:		{
                      viewWindow: {
                        min: 0
                      }
                },
      		hAxis:		{
                      title: 'Ore',
                      viewWindow: {
                        min:0,
                        max:23
                      }
                },
          curveType: 'function',
          pointSize: 3,
          backgroundColor: { fill:'transparent' },
          interpolateNulls: true,              //keep the line smooth and continue
      		legend:		{ position: (is_mobile ? 'none' : 'right') , textStyle: {fontSize: 11} },
          //chartArea:	{left: 100 }
          chartArea:	{left: is_mobile ? 30: 50, width: is_mobile ? '50%' : '65%', height: is_mobile ? 190 : 250 }
      	};



        setTimeout(function(){
          var chart = new google.visualization.LineChart(document.getElementById('popup2'));
          google.visualization.events.addListener(chart, 'ready', myReadyHandler);
          chart.draw(data, options);
          $('#li2').fadeIn(400)
        }, 200);

      }
      else{
        console.log('no data!');

      }
}

function myReadyHandler(){
  console.log('loaded');
}

function x2somethingInside(array, selector){
  var ctmp = 0;
  for(var i=0; i<array.length; i++){
    if(selector == 1){    //x2 ??
      if(array[i] != null)
        ctmp++;
        if(ctmp == 2)
          return true;
    }

  }
  return false;
}
