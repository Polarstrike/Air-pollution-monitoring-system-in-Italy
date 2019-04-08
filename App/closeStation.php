<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

function findCloseStations(){

  $name = $_POST["name"];
  $date = $_POST["data"];

 $result_list=mysql_query("SELECT devices.name, cities.name as citta, devices.lat, devices.lon
                        	FROM devices join sensors on sensors.fk_device=devices.pk_device
                        		join measurements on measurements.fk_sensor=sensors.pk_sensor
                        		join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype
                            join cities on cities.pk_city = devices.fk_city
                        	WHERE devices.name <> '$name' AND
                        		measurements.date BETWEEN '$date' AND '$date'+86400000
                                AND devices.lat BETWEEN -90 AND 90
                                AND devices.lon BETWEEN -180 AND 180
                          GROUP BY devices.name
 ");
 $array_result = array();

 	while($row = @mysql_fetch_assoc($result_list))
	{
	 $row["name"] = utf8_encode($row["name"]);
 	 $row["citta"] = utf8_encode($row["citta"]);
 		array_push($array_result, $row);
	}
	return $array_result;

}

$pointer = findCloseStations();
header("Content-type:application/json");
echo json_encode($pointer);

?>
