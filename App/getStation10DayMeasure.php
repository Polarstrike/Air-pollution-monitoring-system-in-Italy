<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

function stationTenDayMeasure(){

  $name = $_POST["name"];
  $date = $_POST["data"];

  $measure_list=mysql_query("SELECT measurements.date, measurements.measure , sensortypes.pk_sensortype , sensortypes.type, sensortypes.reference, sensortypes.scale
														FROM devices join sensors on sensors.fk_device=devices.pk_device
															  join measurements on measurements.fk_sensor=sensors.pk_sensor
															  join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype
														WHERE devices.name='$name' AND
															  measurements.date BETWEEN '$date'-864000000 AND '$date'+864000000
														ORDER BY measurements.date ASC");
  $array_result = array();

   while($row = @mysql_fetch_assoc($measure_list))
  {
	 $row["type"] = utf8_encode($row["type"]);
	 $row["scale"] = utf8_encode($row["scale"]);
	 array_push($array_result, $row);
  }
  return $array_result;

}

  $pointer = stationTenDayMeasure();
  header("Content-type:application/json");
  echo json_encode($pointer);

?>
