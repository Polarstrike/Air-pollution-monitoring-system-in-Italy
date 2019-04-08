<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

function allMeasureOfAStation(){

  $name = $_POST["name"];

  $measure_list=mysql_query("SELECT measurements.date
                            	FROM devices join sensors on sensors.fk_device=devices.pk_device
                              		join measurements on measurements.fk_sensor=sensors.pk_sensor
                              		join sensortypes on sensortypes.pk_sensortype=sensors.fk_sensortype
                            	WHERE devices.name='$name'
                              		ORDER BY measurements.date ASC");
  $array_result = array();

   while($row = @mysql_fetch_assoc($measure_list))
  {
	 array_push($array_result, $row["date"]);
  }
  return $array_result;

}

  $pointer = allMeasureOfAStation();
  header("Content-type:application/json");
  echo json_encode($pointer);

?>
