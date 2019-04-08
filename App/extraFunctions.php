<?php
include 'database.php';
//PK VUOL DIRE PRIMARY KEY -_____________-
//E OVVIAMENTE FK SARA FOREIGN KEY
function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

///codice nuovo

function findCities(){

 $cities_list=mysql_query("SELECT name FROM cities");
 $array_cities = array();

 	while($row = @mysql_fetch_assoc($cities_list))
	{
	 $row["name"] = utf8_encode($row["name"]);
	 array_push($array_cities, $row["name"]);
	}
	return $array_cities;

}

function findTypes(){
 $types_list=mysql_query("SELECT sensortypes.type FROM sensortypes");
 $array_types= array();

 	while($row = @mysql_fetch_assoc($types_list))
	{
	 $row["type"] = utf8_encode($row["type"]);
	 array_push($array_types, $row["type"]);
	}
	return $array_types;

}
/*
function findMeasurements($city,$date){//per la previsione
 $measurements_list=mysql_query("SELECT measurements.measure,measurements.date,sensortypes.type FROM cities join devices on cities.pk_city=devices.fk_city join sensors on sensors.fk_device=devices.pk_device join measurements on measurements.fk_sensor=sensors.pk_sensor join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype WHERE cities.name='$city' AND measurements.date>='$date'-604800000");
 $array_values = array();
 while($row = @mysql_fetch_assoc($measurements_list))
	{
		$row["type"] = utf8_encode($row["type"]);
		array_push($array_values, $row);
	}
	return $array_values;
}*/
//////////////////////////////////////inizio
function findMeasurementsMultipleResultSetsOneVerySpecificDate($station,$date){
  $array_types=findTypes();

 $length=count($array_types);
 $array_resultsets=array();

 $index=0;
 //no multiquery in php 5
 while ($index<$length){
    $type=$array_types[$index];
    $query="SELECT measurements.measure,measurements.date,sensortypes.type,sensortypes.pk_sensortype FROM devices join sensors on sensors.fk_device=devices.pk_device join measurements on measurements.fk_sensor=sensors.pk_sensor join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype WHERE devices.name='$station' AND measurements.date BETWEEN '$date'  AND '$date'+86400000 AND sensortypes.type='$type' ORDER BY measurements.date ASC";
    $result=mysql_query($query);

	if (mysql_num_rows($result)>0){
      array_push($array_resultsets, $result);

	  }



    $index++;
 }
 $array_values = array();
 $index=0;
 $length=count($array_resultsets);

  while ($index<$length){
   // ini_set('memory_limit', '-1');//ehm...?It will take unlimited memory usage of server, it's working fine.

    $type_values=array();

	while($row = @mysql_fetch_assoc($array_resultsets[$index]))
	   {
	      $row_values=array();

		  $row["type"] = utf8_encode($row["type"]);
		  array_push($row_values, $row["type"]);
		  array_push($row_values, $row["measure"]);
	      array_push($row_values, $row["date"]);
		  array_push($row_values, $row["pk_sensortype"]);
		  array_push($type_values, $row_values);

	   }
	 array_push($array_values, $type_values);
	 $index++;
    }
	return $array_values;
}



function a($station,$date){//per la previsione
 $array_types=findTypes();

 $length=count($array_types);
 $array_resultsets=array();

 $index=0;
 //no multiquery in php 5
 while ($index<$length){
    $type=$array_types[$index];
    $query="SELECT measurements.measure,measurements.date,sensortypes.type,sensortypes.pk_sensortype
    FROM devices join sensors on sensors.fk_device=devices.pk_device join measurements on measurements.fk_sensor=sensors.pk_sensor
    join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype WHERE devices.name='$station' AND measurements.date
    BETWEEN '$date'-1209600000  AND '$date' AND sensortypes.type='$type' ORDER BY measurements.date ASC";
    $result=mysql_query($query);
	if (mysql_num_rows($result)>0){
      array_push($array_resultsets, $result);

	  }
        //c'� qualcosa che non va nella query,torna 0 anche se la stazione misura NO2


    $index++;
 }

 $array_values = array();
 $index=0;
 $length=count($array_resultsets);

  while ($index<$length){
    ini_set('memory_limit', '-1');//ehm...?It will take unlimited memory usage of server, it's working fine.

    $type_values=array();

	while($row = @mysql_fetch_assoc($array_resultsets[$index]))
	   {
	      $row_values=array();

		  $row["type"] = utf8_encode($row["type"]);
		  array_push($row_values, $row["type"]);
		  array_push($row_values, $row["measure"]);
	      array_push($row_values, $row["date"]);
		  array_push($row_values, $row["pk_sensortype"]);
		  array_push($type_values, $row_values);

	   }
	 array_push($array_values, $type_values);
	 $index++;
    }
	return $array_values;
}

////////////////////////////////fine
function findMeasurementsMultipleResultSets($station,$date){//per la previsione
 $array_types=findTypes();

 $length=count($array_types);
 $array_resultsets=array();

 $index=0;

 while ($index<$length){
    $type=$array_types[$index];
    $query="SELECT measurements.measure,measurements.date,sensortypes.type,sensortypes.pk_sensortype
    FROM devices join sensors on sensors.fk_device=devices.pk_device join measurements on measurements.fk_sensor=sensors.pk_sensor join
    sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype
    WHERE devices.name='$station' AND measurements.date>='$date'-1209600000  AND sensortypes.type='$type' ORDER BY measurements.date ASC";
    $result=mysql_query($query);
	if (mysql_num_rows($result)>0){
      array_push($array_resultsets, $result);

	  }



    $index++;
 }

 $array_values = array();
 $index=0;
 $length=count($array_resultsets);

  while ($index<$length){
    ini_set('memory_limit', '-1');//ehm...?It will take unlimited memory usage of server, it's working fine.

    $type_values=array();

	while($row = @mysql_fetch_assoc($array_resultsets[$index]))
	   {
	      $row_values=array();

		  $row["type"] = utf8_encode($row["type"]);
		  array_push($row_values, $row["type"]);
		  array_push($row_values, $row["measure"]);
	      array_push($row_values, $row["date"]);
		  array_push($row_values, $row["pk_sensortype"]);
		  array_push($type_values, $row_values);

	   }
	 array_push($array_values, $type_values);
	 $index++;
    }
	return $array_values;
}

function findStationsSpecificDate($city,$date){
 //$stations_list=mysql_query('SELECT DISTINCT devices.name FROM devices JOIN regions ON devices.fk_region = regions.pk_region JOIN sensors ON devices.pk_device=sensors.fk_device JOIN sensortypes ON sensors.fk_sensortype=sensortypes.pk_sensortype JOIN measurements ON sensors.pk_sensor=measurements.fk_sensor WHERE regions.name=\'' . $region . '\' ');
 $stations_list=mysql_query("SELECT DISTINCT devices.name,measurements.date
 	FROM devices JOIN cities ON devices.fk_city = cities.pk_city JOIN sensors ON devices.pk_device=sensors.fk_device JOIN
 	sensortypes ON sensors.fk_sensortype=sensortypes.pk_sensortype JOIN measurements ON
 	sensors.pk_sensor=measurements.fk_sensor
 	WHERE cities.name='$city' AND measurements.date BETWEEN '$date' -86400000 AND '$date'");

 $array_stations = array();

	while($row = @mysql_fetch_assoc($stations_list))
	{

		  $row["name"] = utf8_encode($row["name"]);
		  array_push($array_stations, $row["name"]);

	}
	return $array_stations;
}

function checkStation($station,$today){//with at least one measure

  $check=mysql_query("SELECT DISTINCT devices.name FROM devices JOIN cities ON devices.fk_city = cities.pk_city
  	JOIN sensors ON devices.pk_device=sensors.fk_device JOIN sensortypes ON sensors.fk_sensortype=sensortypes.pk_sensortype
  	JOIN measurements ON sensors.pk_sensor=measurements.fk_sensor
  	WHERE devices.name='$station' AND measurements.date>'$today'-604800000
  	GROUP BY  devices.name
  	HAVING COUNT(measurements.measure)>1");

  if(mysql_num_rows($check)==0)
    return 0;
  else
    return 1;

}//posso usare una versione di questa senza sapere la stazione come load_markers,anche per il colore devo sapere quale � in quella sotto
function findDetails($station,$date){
  $query="SELECT DISTINCT sensortypes.type,measurements.measure FROM  devices JOIN
  sensors ON devices.pk_device=sensors.fk_device RIGHT OUTER JOIN measurements ON sensors.pk_sensor=measurements.fk_sensor JOIN
  sensortypes ON  sensors.fk_sensortype=sensortypes.pk_sensortype
  WHERE devices.name='$station' AND measurements.date BETWEEN '$date' -86400000 AND '$date'";

  $result_values = mysql_query($query);
  $array_values = array();
  while($row = @mysql_fetch_assoc($result_values))
	{
		$row["type"] = utf8_encode($row["type"]);
		array_push($array_values, $row);
	}


	return $array_values;
}
//fine codice nuovo

function load_markers()
{
	$tab_devices = mysql_query("SELECT * FROM devices");
	$array_devices = array();
	while($row = mysql_fetch_assoc($tab_devices))
	{
		$row["name"] = utf8_encode($row["name"]);
		array_push($array_devices, $row);
	}
	echo json_encode($array_devices);
}
function microtime_float()
{
    list($usec, $sec) = explode(" ", microtime());
    return ((float)$usec + (float)$sec);
}
function load_active_markers(){//with at least one measure
    $today=round(microtime_float()*1000);//dobbiamo scrivere un file
    $tab_devices=mysql_query("SELECT  devices.*
    	FROM devices  JOIN sensors ON devices.pk_device=sensors.fk_device JOIN
    	sensortypes ON sensors.fk_sensortype=sensortypes.pk_sensortype JOIN
    	measurements ON sensors.pk_sensor=measurements.fk_sensor
    	WHERE measurements.date>'$today'-604800000
    	GROUP BY  devices.name
    	HAVING COUNT(measurements.measure)>1");


    $array_devices = array();
	while($row = mysql_fetch_assoc($tab_devices))
	{
		$row["name"] = utf8_encode($row["name"]);
		//echo($row["name"]);
		array_push($array_devices, $row);
	}

	echo json_encode($array_devices);

}

function extract_measurements($deviceid){
	$array_sensors = array();
	$query1 = "SELECT DISTINCT sensors.fk_sensortype
	FROM sensors JOIN devices ON devices.pk_device = sensors.fk_device
	WHERE devices.pk_device=$deviceid";

	$sensor_type = @mysql_query($query1);
	$array_sensors = array();
	while($row_sens = @mysql_fetch_assoc($sensor_type))
	{
		array_push($array_sensors, $row_sens);

	}
//	$query2 ="SELECT measurements.measure, sensors.fk_sensortype, measurements.date FROM measurements JOIN sensors ON measurements.fk_sensor=sensors.pk_sensor JOIN devices ON sensors.fk_device=devices.pk_device WHERE devices.pk_device=$deviceid AND measurements.date  > ((SELECT MAX(date) FROM `measurements` JOIN sensors ON measurements.fk_sensor=sensors.pk_sensor JOIN devices ON sensors.fk_device=devices.pk_device WHERE devices.pk_device=$deviceid) - 86400000) ORDER BY measurements.date ASC, sensors.fk_sensortype ASC";
	$query2 ="SELECT measure, fk_sensortype, date
	FROM measureview_minimal
	WHERE fk_device=$deviceid AND date > ((SELECT MAX(date) FROM `measurements` JOIN
	sensors ON measurements.fk_sensor=sensors.pk_sensor JOIN devices ON sensors.fk_device=devices.pk_device
	WHERE devices.pk_device=$deviceid) - 86400000)
	ORDER BY date ASC, fk_sensortype ASC";

	$measures = @mysql_query($query2);
	$array_measures = array();
	$risultato = array();
	while($row_meas = @mysql_fetch_assoc($measures))
	{
		array_push($array_measures, $row_meas);

	}

	$risultato["sensors"] = $array_sensors;
	$risultato["measures"] = $array_measures;

	header("content-type:application/json");
	echo json_encode($risultato);

}


$cache_file = "tmp/get_color_cache.json";
$cache_file_predicted= "tmp/get_color_predicted_cache.json";
$cache_expires = 3600;

function get_color(){
	global $cache_file, $cache_expires;
	if(file_exists($cache_file)){
		echo file_get_contents($cache_file);
	}else{
		$array_colors = array();

              $queryc =      "SELECT devices.name, T.fk_device, measure, fk_sensortype, maxdate AS date
													FROM measureview_minimal
													JOIN (
															SELECT fk_device, MAX( DATE ) AS maxdate
															FROM `measureview_minimal`
															GROUP BY fk_device
														) T ON T.fk_device = measureview_minimal.fk_device
                                                    JOIN devices ON T.fk_device = devices.pk_device
													WHERE date > maxdate - 86400000
													GROUP BY fk_device, fk_sensortype, measure
													ORDER BY T.fk_device ASC, fk_sensortype ASC, date DESC;";
		/*$queryc = "SELECT T.fk_device, measure, fk_sensortype, maxdate AS date
													FROM measureview_minimal
													JOIN (
															SELECT fk_device, MAX( DATE ) AS maxdate
															FROM `measureview_minimal`
															GROUP BY fk_device
														) T ON T.fk_device = measureview_minimal.fk_device
													WHERE date > maxdate - 86400000
													GROUP BY fk_device, fk_sensortype, measure
													ORDER BY T.fk_device ASC, fk_sensortype ASC, date DESC;";*/


		$colors = @mysql_query($queryc);
		$array_colors = array();
		while($row_cs = @mysql_fetch_assoc($colors)) {
		    $row_cs["name"] = utf8_encode($row_cs["name"]);
			array_push($array_colors, $row_cs);
		}

		// Save cache to file
		$fp = fopen($cache_file, "w");
		fwrite($fp, json_encode($array_colors));
		fclose($fp);

		echo json_encode($array_colors);
	}
}


function get_predicted_color(){
	global $cache_file_predicted, $cache_expires;
	if(file_exists($cache_file_predicted)){
		echo file_get_contents($cache_file_predicted);
	}else{
		$array_colors = array();

        $today=round(microtime_float()*1000);
		$queryc = "SELECT devices.name, devices.pk_device, measurements.measure, measurements.date, sensortypes.type, sensortypes.pk_sensortype FROM devices join sensors on sensors.fk_device=devices.pk_device join measurements on measurements.fk_sensor=sensors.pk_sensor join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype WHERE  measurements.date>='$today'-1209600000   ORDER BY devices.pk_device ASC, measurements.date ASC;";


		$colors = @mysql_query($queryc);
		$array_colors = array();

		while($row_cs = @mysql_fetch_assoc($colors)) {

		    $row_cs["name"] = utf8_encode($row_cs["name"]);
			array_push($array_colors, $row_cs);

		}


//ci sono ma non le scrive
		// Save cache to file
		$ciao = fopen($cache_file_predicted, "w");
		fwrite($ciao, json_encode($array_colors));
		fclose($ciao);

		echo json_encode($array_colors);
	}
}

function write_prediction(){
	global $cache_file_predicted, $cache_expires;
     ini_set('memory_limit', '-1');
		$array_colors = array();

        $today=round(microtime_float()*1000);
		$queryc = "SELECT devices.name, devices.pk_device, measurements.measure, measurements.date, sensortypes.type, sensortypes.pk_sensortype FROM devices join sensors on sensors.fk_device=devices.pk_device join measurements on measurements.fk_sensor=sensors.pk_sensor join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype WHERE  measurements.date>='$today'-1209600000  ORDER BY devices.pk_device ASC, measurements.date ASC;";


		$colors = @mysql_query($queryc);
		$array_colors = array();

		while($row_cs = @mysql_fetch_assoc($colors)) {

		    $row_cs["name"] = utf8_encode($row_cs["name"]);
			array_push($array_colors, $row_cs);

		}


//ci sono ma non le scrive
		// Save cache to file
		$ciao = fopen($cache_file_predicted, "w");
		fwrite($ciao, json_encode($array_colors));
		fclose($ciao);

		echo json_encode($array_colors) . PHP_EOL ;
	}


/*

$results = array();


	if(!isset($_POST['function_name']))
	{
		$results['errors'] = "No name or function name!";
	}
	if( !isset($results['errors']) )
	{
		if($_POST['function_name'] == 'get_color')
		{
			$results['result'] = get_color();
		}
	}
*/
function write_file_iqa(){
		global $cache_file;
		$array_colors = array();


        $queryc ="SELECT devices.name, T.fk_device, measure, fk_sensortype, maxdate AS date FROM measureview_minimal JOIN (SELECT fk_device, MAX( DATE ) AS maxdate FROM measureview_minimal GROUP BY fk_device ) T ON T.fk_device = measureview_minimal.fk_device JOIN devices ON T.fk_device = devices.pk_device WHERE date > maxdate - 86400000 GROUP BY fk_device, fk_sensortype, measure ORDER BY T.fk_device ASC, fk_sensortype ASC, date DESC;";


		$colors = mysql_query($queryc) ;

		$array_colors = array();
		while($row_cs = @mysql_fetch_assoc($colors)) {
		    $row_cs["name"] = utf8_encode($row_cs["name"]);
			array_push($array_colors, $row_cs);
		}

		// Save cache to file
		$fp = fopen($cache_file, "w");
		fwrite($fp, json_encode($array_colors));
		fclose($fp);

}


?>
