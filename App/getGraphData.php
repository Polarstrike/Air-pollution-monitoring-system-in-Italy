<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

function collectGraphData(){


  $name = $_POST["name"];
  $date = $_POST["data"];

  $measure_list=mysql_query("SELECT measurements.date, measurements.measure, sensortypes.pk_sensortype
														FROM devices join sensors on sensors.fk_device=devices.pk_device
															  join measurements on measurements.fk_sensor=sensors.pk_sensor
															  join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype
														WHERE
															devices.name = '$name' and
															  measurements.date BETWEEN '$date' AND '$date'+86399999");
  $array_result = array();

   while($row = @mysql_fetch_assoc($measure_list))
  {
	 array_push($array_result, $row);
  }
  return $array_result;

}

  $pointer = collectGraphData();
  header("Content-type:application/json");
  echo json_encode($pointer);

?>
