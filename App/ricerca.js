var cittaFirstTime = 0;
var citta = [];
var cittaDevice = [];
var actualSearch2 = "";
var actualSearch3 = "";
var actualCoord;
var actualDate;
var actualTimestamp;
var tenDayMeasure;
var thisDate;
var maxSearchMeasure = [ 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a' ];  //used to create the resultTab



function formatDate(d) {
    var month = '' + (d.getUTCMonth() + 1),
        day = '' + d.getUTCDate(),
        year = d.getUTCFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return day+'/'+month+'/'+year;
}

function formatDateITA(d) {
    var month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return day+'/'+month+'/'+year;
}

function cittaRead(){
    $(function(){
      $.get("getCities.php", function(data){
            citta = data;
        });
    });
}

function cittaDeviceRead(){
    $(function(){
      $.get("getCitiesDevice.php", function(data){
            cittaDevice = data;
        });
    });
}

function Station10DayMeasureRead(stationName, wantedDate){

  $(function(){
      $.post( "getStation10DayMeasure.php",
        { name: stationName, data: wantedDate })
            .done(function( data ) {
              /*
              tenDayMeasure = JSON.parse(data);
              console.log(tenDayMeasure);
              alert(tenDayMeasure.name + "   " + tenDayMeasure.data);
              */
              tenDayMeasure = data;

            });
  });
}

var stationAllMeasure, closeDateForButton;
function allMeasureOfStation(stationName){

  $(function(){

      $.ajax({
          global: false,
          type: "POST",
          data: {"name": stationName},
          url: 'stationAllMeasure.php'
      }).done(function(data) {
        stationAllMeasure = data;
        closeDateForButton = findCloseAvaiableMeasure();
        var el = document.getElementById("chart-div");
        var tmp ="";
        var c = 0;
        if(closeDateForButton.previous != 0){
          closeDateForButton.previous= new Date(closeDateForButton.previous);
          closeDateForButton.previous.setHours(0);
          c++;
          //console.log(1);
          tmp += '<button class="suggestionButton" onclick="dateChangePress(closeDateForButton.previous)">'+ formatDateITA(closeDateForButton.previous)+'</button>';
        }
        if(closeDateForButton.next != 0){
          closeDateForButton.next = new Date(closeDateForButton.next);
          closeDateForButton.next.setHours(0);
          c++
          //console.log(2);
          tmp += '<button class="suggestionButton" onclick="dateChangePress(closeDateForButton.next)">'+ formatDateITA(closeDateForButton.next)+'</button>';
        }
        if(c==1){
          el.innerHTML = '<p>Nessuna misurazione nei 10 giorni precedenti e successivi la data selezionata.</p><p>La data pi&ugrave; vicina &egrave;: </p>';
          el.innerHTML += tmp;
          //console.log(3);
        }
        else if(c==2){
          el.innerHTML = '<p>Nessuna misurazione nei 10 giorni precedenti e successivi la data selezionata.</p><p>Le date pi&ugrave; vicine sono: </p>';
          el.innerHTML += tmp;
          //console.log(4);
        }
        else{
          el.innerHTML = 'Non esistono misurazioni.'
          //console.log(5);
        }

        $('#searchResult').show();
      });
  });
}

function findCloseAvaiableMeasure(){
  console.log("run");
  var result = {previous: 0, next: 0};
  for(var i=0; i<stationAllMeasure.length; i++){
    if( result.previous < parseInt(stationAllMeasure[i]) && parseInt(stationAllMeasure[i]) < actualTimestamp )
        result.previous = parseInt(stationAllMeasure[i]);

    if( parseInt(stationAllMeasure[i]) >= actualTimestamp+86400000){
        result.next = parseInt(stationAllMeasure[i]);
        console.log('findCloseAvaiableMeasure in '+i+' over '+stationAllMeasure.length);
        return result;
    }
  }

  console.log('findCloseAvaiableMeasure in '+stationAllMeasure.length+' over '+stationAllMeasure.length);
  return result;
}

function addOptionToSelect2(){
    //  $('#menu_reg2').empty();
      $('#menu_reg2').empty().append('<option value="" disabled selected>Seleziona una citt&agrave;</option>');
      for(var i=0; i<citta.length; i++){
        $('#menu_reg2').append($('<option>', {
            value: citta[i],
            text: citta[i]
        }));
      }
      if(actualSearch2 != '')
        $("#menu_reg2").val(actualSearch2);
      $( "#menu_reg2" ).prop( "disabled", false );

}
function addOptionToSelect3(){

      $('#menu_reg3').empty().append('<option value="" disabled selected>Seleziona una centrale</option>');

      for(var i=0; i<cittaDevice.length; i++){
        if(cittaDevice[i].nomecitta == actualSearch2){
          $('#menu_reg3').append($('<option>', {
              value: cittaDevice[i].nomedevice,
              text: cittaDevice[i].nomedevice
          }));
        }
      }
}

function mainSearch(){
    addOptionToSelect2();
}


function changingSelect2(){
    actualSearch2 = document.getElementById("menu_reg2").value;
    $('#seleziona-regione3').show();
    addOptionToSelect3();
    $(document).ajaxStop(showData);
}

function changingSelect3(){
    actualSearch3 = document.getElementById("menu_reg3").value;
    for(var i=0; i<cittaDevice.length; i++)
      if(cittaDevice[i].nomedevice == actualSearch3)
        actualCoord = L.latLng(parseFloat(cittaDevice[i].lat), parseFloat(cittaDevice[i].lon));

    $('#data1').show();
    if($('#data').val() != ""){
      dateChange();
    }

}

function dateChange(){
  //console.log('dataChange');
  //console.log('data is: '+$( "#data" ).datepicker("getDate"));
    actualDate = $( "#data" ).datepicker("getDate");
    actualTimestamp = actualDate.getTime() - (actualDate.getTimezoneOffset() *60000 );
    Station10DayMeasureRead(actualSearch3, actualTimestamp);
    document.getElementById("tab-div").innerHTML = '';
    $('#tab-div').hide();
}

function dateChangePress(data){
  //console.log(formatDateITA(data));
    $('#data').val(formatDateITA(data));

      actualDate = $( "#data" ).datepicker("getDate");
      actualTimestamp = actualDate.getTime();
      Station10DayMeasureRead(actualSearch3, actualTimestamp);
      document.getElementById("tab-div").innerHTML = '';
      $('#tab-div').hide();
}

function fast(){
  document.getElementById("menu_reg2").value = 'Roma';
  changingSelect2();
  document.getElementById("menu_reg3").value = 'Preneste';
  changingSelect3();
  $('#data').val("08/01/2018");
  $('#data1').show();

//dateChange code
  actualDate = new Date($('#data').val());
  actualTimestamp = actualDate.getTime() - (actualDate.getTimezoneOffset() *60000 );
  Station10DayMeasureRead(actualSearch3, actualTimestamp);
  document.getElementById("tab-div").innerHTML = '';
  $('#tab-div').hide();
  //$(document).ajaxStop(showData);
}

function showData(){
  console.log("showData fired, number of records: " + tenDayMeasure.length);
  thisDate = [];
  for(var i=0; i < tenDayMeasure.length; i++){
    tenDayMeasure[i].date = parseInt(tenDayMeasure[i].date);
    var tmp = new Date(tenDayMeasure[i].date);



    if(tenDayMeasure[i].date >= actualTimestamp && tmp < actualTimestamp + 86400000){
      thisDate.push({ore: tmp.getHours(), date: tenDayMeasure[i].date, sensortype: tenDayMeasure[i].pk_sensortype-1 ,type: tenDayMeasure[i].type, measure: tenDayMeasure[i].measure, reference: tenDayMeasure[i].reference, scale: tenDayMeasure[i].scale});
    }
  }

  //console.log('thisDate length: '+thisDate.length);
  if(thisDate.length > 0 ){   //ci sono misurazioni di quel giorno
    //create a graph
    $('#searchResult').show();
    drawGraph();
    measureContainerMax();
    document.getElementById("tab-div").innerHTML = tabOfTheDay();
    $('#tab-div').show();
    $('div').animate({scrollTop:$(document).height()}, 1000);
  }
  else{
    closestDate();
    //console.log(closeDate);
    $('#searchResult').show();

    var el = document.getElementById("chart-div");
    //el.innerHTML = 'Non sono disponibili misurazioni <br>Vuoi provare le seguenti date:<br>';
    var test = 0;
    var tmpText = "";
    var pre = false;
    var ne = false;
    if(closeDate.previous.toDateString() != actualDate.toDateString()){
      tmpText += '<button class="suggestionButton" onclick="dateChangePress(closeDate.previous)">'+ formatDateITA(closeDate.previous) +'</button>';
      test++;
      pre = true;
    }
    if(closeDate.next.toDateString() != actualDate.toDateString()){
      tmpText += '<button class="suggestionButton" onclick="dateChangePress(closeDate.next)">'+ formatDateITA(closeDate.next) +'</button>';
      test++;
    }
    if(test==1){
      el.innerHTML = '<p>Non sono disponibili misurazioni per la data scelta</p><p>Vuoi provare la seguente data:</p><a '+ ((pre) ? ('onclick="dateChangePress(closeDate.previous)"><b style="font-weight:600">'+formatDateITA(closeDate.previous)) : ('onclick="dateChangePress(closeDate.next)"><b style="font-weight:600">'+formatDateITA(closeDate.next))) +'</b></a>';
      el.innerHTML += '<p>'+tmpText+'</p>';
    }
    else if(test==2){
      el.innerHTML = '<p>Non sono disponibili misurazioni per la data scelta</p><p>Vuoi provare le seguenti date:</p><a style="margin-right: 30px" onclick="dateChangePress(closeDate.previous)"><b style="font-weight:600">'+formatDateITA(closeDate.previous)+'</a>   <a onclick="dateChangePress(closeDate.next)"><b style="font-weight:600">'+formatDateITA(closeDate.next) +'</b></a>';
      el.innerHTML += '<p>'+tmpText+'</p>';
    }
    else if(test == 0){

      //add 1 button, with the closest date. or two? better 2
      console.log('c');
      allMeasureOfStation(actualSearch3);

    }

    if(test!=0){
      var today = new Date();
      if(actualDate <= today){      //not displayed if searched date is in future (of course no results )
        el.innerHTML += '<p>Vuoi cercare misurazioni di stazioni vicine a <b style="font-weight: 600">' + actualSearch3 + '</b> in data <b style="font-weight: 600">' + formatDateITA(actualDate) + '</b> ?</p>';
        el.innerHTML += '<button id = "ricercaOra" class="suggestionButton" onclick="findCloseStation(actualSearch3, actualTimestamp)">Cerca stazioni entro 30 km</button>';
      }
    }
  }


}


var whatNotNull = [false, false, false, false, false, false, false, false];
function somethingInside(array){
  var ctmp = 0;
  for(var i=0; i<array.length; i++){
    if(array[i] != null)
      return true;
  }
  return false;
}

var measureContainer = [ [], [], [], [], [], [], [], [] ];

function drawGraph() {
      var measureCount = 0;
      var container = document.getElementById('chart-div');

      var data = null;
      data = new google.visualization.DataTable();
      data.addColumn('number', 'X');

      measureContainer = [ [], [], [], [], [], [], [], [] ];
      for(var i=0; i<8; i++)
        for(var j=0; j<24; j++)
          measureContainer[i].push(null);
      for(var i=0; i<thisDate.length; i++)      //DATI DA DIVIDERE
          measureContainer[thisDate[i].sensortype][thisDate[i].ore]  = parseFloat(thisDate[i].measure);

      //var isItWorth = false;
      whatNotNull = [false, false, false, false, false, false, false, false];
      for(var i=0; i<inquinanti.length; i++){
        whatNotNull[i] = somethingInside(measureContainer[i]);
        if(whatNotNull[i]){
          //isItWorth = true;
          data.addColumn('number', inquinanti[i].type + " " + inquinanti[i].scale);
          //console.log(inquinanti[i].type + " " + inquinanti[i].scale);
        }
      }

      //if(isItWorth){
        //var c = ((a < b) ? 'minor' : 'major');
        for(var i=0; i<24; i++){
          var tmpRow = [];
          tmpRow.push(i);
          for(var j=0; j<inquinanti.length; j++){
            if(whatNotNull[j])
              tmpRow.push(measureContainer[j][i]);
          }
          //console.log(tmpRow);
          data.addRow(tmpRow);
        }

        var options = {
          title: 'Misurazioni del ' + formatDateITA(actualDate),
          width:		is_mobile ? 400 : 700,
      		height:		is_mobile ? 240 : 400,
      		vAxis:		{
                      title: 'Valori',
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
      		legend:		{ position: 'right' },
          //chartArea:	{left: 100 }
          chartArea:	{ left: 75, top: 10, width: is_mobile ? '40%' : '65%', height: is_mobile ? 190 : 250 }
      	};

        var chart = new google.visualization.LineChart(document.getElementById('chart-div'));



        chart.draw(data, options);
      //}
}

function measureContainerMax(){
  maxSearchMeasure = [ 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a' ];
  //console.log(measureContainer);
  for(var i=0; i<measureContainer.length; i++){
    var max = null;
    for(var j=0; j<measureContainer[i].length; j++){
      if(measureContainer[i][j] != null && measureContainer[i][j] > max)
        max = measureContainer[i][j];
    }
    if(max == null)
      maxSearchMeasure[i] = 'a';
    else
      maxSearchMeasure[i] = max;

    //console.log("iter: "+i+"  max: " + maxSearchMeasure[i] + "  realMax: " + max);

  }
}

function tabOfTheDay(){
  var maxInd = 0;
  var isTypeOne = 0;
  var tabContent = "";
  var value;
  inquinanti[0].type = "NO<sub>2</sub>";
  inquinanti[2].type = "O<sub>3</sub>";
  inquinanti[6].type = "SO<sub>2</sub>";
  for(var k=0; k<maxSearchMeasure.length; k++){
    value = maxSearchMeasure[k];
    if(!isNaN(value)){        //if the value is a NUMBER
        var chosenIndex = NaN;
        tabContent = tabContent +  "<tr class=" + 'sostanza-'+ k + "><td>&nbsp;" + inquinanti[k].type + "</td><td>&nbsp;" + value + " "+ inquinanti[k].scale +"</td>";    //sostanza + value
        if(k==1){  //if it's NO (no reference and index)
            tabContent += "<td>&nbsp;-</td><td>&nbsp;-</td><td>&nbsp;<svg height='20' width='20' style='visibility: hidden;'><circle cx='8' cy='12' r='5'/></svg></td></tr>";
            isTypeOne = 1;
        }
        else if(k==6){// if it's SO2
            tabContent += "<td>&nbsp;" + inquinanti[k].reference + " " + inquinanti[k].scale + "</td><td>&nbsp;" + Math.round(100*value/inquinanti[k].reference) + "%</td><td>&nbsp;" + getCircle(Math.round(100*value/inquinanti[k].reference)) + "</td></tr>";
            chosenIndex = Math.round(100*value/inquinanti[k].reference);
        }
        else{   //default
            tabContent += "<td>&nbsp;" + inquinanti[k].reference + " " + inquinanti[k].scale + "</td><td>&nbsp;" + Math.round(100*value/inquinanti[k].reference) + "%</td><td>&nbsp;" + getCircle(parseInt((100*value/inquinanti[k].reference).toFixed(2))) + "</td></tr>";
            chosenIndex = Math.round(100*value/inquinanti[k].reference);
        }
        if(chosenIndex > maxInd)    //saving the maxIndex %
          maxInd = chosenIndex;
    }

  }
  var stdTablePreBegin = "<table class='styleTable'><tbody><tr><td><span id ='cittaSpan'>&nbsp;<strong>" + actualSearch2 + "&nbsp;&nbsp;&nbsp;</strong></span><span id='centraleSpan'>"+ actualSearch3+"</span></td></tr></tbody></table>";      //station name + array index for debug
  var stdTableBegin = "<table class='styleTable'><tbody><tr><td>&nbsp;"+(is_mobile ? "" : "<strong>Sostanza</strong>") +"</td>"+
        "<td>&nbsp;<strong>" + (is_mobile ? "Valore" : "Misurazione") +"</strong></td><td><strong>"+ (is_mobile ? "Limite" : "Limite di riferimento") +"</strong></td>"+
        "<td><strong>"+ (is_mobile ? "IQA" : "Indice") +"</strong></td><td>"+ (is_mobile ? "" : "<strong>Qualit&agrave; Aria</strong>") +"</td></tr>";    //table header
  var stdTableEnding = "</tbody></table>";    //1st tab ending
  var stdJudgement = "";
  var lastUpdate = "";
  var date = actualDate;
  var valutation;
  valutation = evaluateIndex(maxInd);     //calculate a valutation of the maxIndex%
  stdJudgement += "<table class='styleTable'><tbody><tr><td><strong>Giudizio globale: " + valutation.giudizio + "</strong></td></tr>";    //Put the valutation into a row
                                                                          //get the date from unix millisecs
  lastUpdate += "<tr><td>Aggiornato al: " + formatDateITA(date) + "</td></tr>";          //put in human readable format into a row
  lastUpdate += "</tbody></table>";                                                                                                       //end the table (closing)



  inquinanti[0].type = "NO2";
  inquinanti[2].type = "O3";
  inquinanti[6].type = "SO2";

  return stdTablePreBegin + stdTableBegin + tabContent + stdTableEnding + stdJudgement + lastUpdate;
}

var closeDate;
function closestDate(){
  closeDate = {previous: actualTimestamp - 864000000, next: actualTimestamp + 864000000};
  for(var i=0; i<tenDayMeasure.length; i++){
    var tmp = new Date(parseInt(tenDayMeasure[i].date));
    if(actualDate.toDateString() != tmp.toDateString()){
      if(parseInt(tenDayMeasure[i].date) > closeDate.previous && parseInt(tenDayMeasure[i].date) < actualTimestamp){     //sto trovando il previous
        closeDate.previous = tmp;
      }
      if(parseInt(tenDayMeasure[i].date) < closeDate.next && parseInt(tenDayMeasure[i].date) > actualTimestamp){
        closeDate.next = tmp;
      }
    }
  }
  if(Number.isInteger(closeDate.previous))
    closeDate.previous = new Date(actualTimestamp);
  if(Number.isInteger(closeDate.next))
    closeDate.next = new Date(actualTimestamp);
}

var stationInSameDate, tmpDate, chosenStation;
var minDistance = [];
var closeArray = [];
function findCloseStation(stationName, wantedDate){
  console.log('findclosestation run; param: '+stationName+' - '+wantedDate);
  $(function(){

      $.ajax({
          global: false,
          type: "POST",
          data: {"name": stationName, "data": wantedDate},
          url: 'closeStation.php'
      }).done(function(data) {
        stationInSameDate = data;
        minDistance = 30000;      //max radius is 30km
        //console.log(minDistance);
        chosenStation = -1;
        for(var i=0; i<stationInSameDate.length; i++){
          var tmpPoint2 = L.latLng(parseFloat(stationInSameDate[i].lat), parseFloat(stationInSameDate[i].lon));
          var tmpDistance = haversine(actualCoord, tmpPoint2);      //calculate distance in metres between two coordinates
          if(tmpDistance < 30000){
            //console.log(stationInSameDate[i].name + ' distance is: '+ tmpDistance);
            closeArray.push({name: stationInSameDate[i].name, citta: stationInSameDate[i].citta, latlng: tmpPoint2, dist: tmpDistance, poly: ''});
          }
          if( tmpDistance < minDistance){
            minDistance = tmpDistance;
            chosenStation = i;
          }
        }

        if(chosenStation != -1){
          console.log('The closest is: ' + stationInSameDate[chosenStation].name + ' in: '+stationInSameDate[chosenStation].citta+' at '+ minDistance+' metres.');
          $('#ricercaOra').hide();
          var el = document.getElementById("chart-div");
          tmpDate = new Date(wantedDate);
          el.innerHTML += '<a onclick="searchNow(tmpDate)"><p><b style="font-weight: 600">'+stationInSameDate[chosenStation].name + '</b></a> &egrave; la stazione pi&ugrave; vicina a '+ parseFloat(minDistance/1000).toFixed(2) + ' km di distanza.<p><button class="suggestionButton" onclick="searchNow(tmpDate)">'+ stationInSameDate[chosenStation].name+'</button></p><div id="miniMap"></div>';
          mapCloseStation();

        }
        else if(chosenStation == -1){
          $('#ricercaOra').hide();
          var el = document.getElementById("chart-div");
          el.innerHTML += '<b style="font-weight: 600">Le stazioni nelle vicinanze non hanno misurazioni per la data selezionata.</b>';
        }

    });
  });

}

var ma;
var mb;

var searchIcon = L.Icon.extend({
    options: {
        iconSize:     [30, 50],
        iconAnchor:   [15, 50],   //open the marker on MS Paint, find it's size, and the point of the anchor. Then use them or their multiples as iconSize and iconAnchor or
        popupAnchor:  [0, -50]    //relative to iconAnchor
                                  //realSize/2 used here
    }
});



function mapCloseStation(){
  closeStationMapLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoicG9sYXJzdHJpa2UiLCJhIjoiY2pqbDM5a3YyMTk3aDNxbTA0ZXpqbmY0MSJ9.AXufjOch7xJ38s42dpYXVw'
  });

  var chosenCoords = L.latLng(parseFloat(stationInSameDate[chosenStation].lat), parseFloat(stationInSameDate[chosenStation].lon));
  //console.log('chosenCoords: '+chosenCoords);

  var closeStationMap = L.map("miniMap",{
    center: actualCoord,
    zoom: 10,
    layers: [closeStationMapLayer]
  });

  var circle = L.circle(actualCoord, {
      color: '#8c4',
      fillColor: '#ce7',
      fillOpacity: 0.3,
      radius: 30000
  }).addTo(closeStationMap);


  var icon = new searchIcon({iconUrl: 'images/markers/no_misure.png'});
  var centerMark = L.marker(actualCoord).bindPopup('<p><b>Stazione selezionata.</b></p><p>' + actualSearch3 + '</p>').setIcon(icon).addTo(closeStationMap);
  //centerMark.setIcon(icon);
  centerMark.openPopup();

  icon = new LeafIcon({iconUrl: 'images/markers/buona.png'});
  datePopup = new Date(actualTimestamp);
  var closeMark = L.marker(chosenCoords).bindPopup('<p><b>Stazione pi&ugrave; vicina</b></p><p>Stazione di <b>'+stationInSameDate[chosenStation].name+'</b></p><p>Distanza: '+ (minDistance/1000).toFixed(2) +' km</p><p><a onclick="searchNow(datePopup)">Visualizza risultati</a></p>').on('popupopen', function(popup) {
      //draw line
      var latlngs = [
        actualCoord, chosenCoords
      ];
      var polyline = L.polyline(latlngs, {color: 'blue'}).addTo(closeStationMap);
      ma = popup.poly = polyline;

    }).on('popupclose', function(popup) {
        //delete line
         mb = console.log(popup);
        closeStationMap.removeLayer(ma);
      });
  closeMark.setIcon(icon).addTo(closeStationMap);

  linkIndex = 0;
  for(var i=0; i<closeArray.length; i++){
    if(closeArray[i].name != stationInSameDate[chosenStation].name){
      var icon = new LeafIcon({iconUrl: 'images/markers/discreta.png'})
      datePopup = new Date(actualTimestamp);
      var closeMark = L.marker(closeArray[i].latlng).bindPopup('<p>Stazione di <b>'+closeArray[i].name+'</b></p><p>Distanza: '+ (closeArray[i].dist/1000).toFixed(2) +' km</p><p><a onclick="searchNow(datePopup, true, '+i+')">Visualizza risultati</a></p>',{title: i}).on('popupopen', function(popup) {
          //draw line
          //console.log(popup);
          var latlngs = [
            actualCoord, closeArray[popup.popup.options.title].latlng
          ];
          var polyline = L.polyline(latlngs, {color: 'green', weight: 2}).addTo(closeStationMap);
          ma = popup.poly = polyline;

        }).on('popupclose', function(popup) {
            //delete line
             mb = console.log(popup);
            closeStationMap.removeLayer(ma);
          });
      closeMark.setIcon(icon).addTo(closeStationMap);
    }
    linkIndex++;
  }

  $('div').animate({scrollTop:$(document).height()}, 1000);


}

function searchNow(date, boolean, num){
  if(boolean){
    document.getElementById("menu_reg2").value = closeArray[num].citta;
    changingSelect2();
    document.getElementById("menu_reg3").value = closeArray[num].name;
    changingSelect3();
  }
  else{
    document.getElementById("menu_reg2").value = stationInSameDate[chosenStation].citta;
    changingSelect2();
    document.getElementById("menu_reg3").value = stationInSameDate[chosenStation].name;
    changingSelect3();
  }
}
