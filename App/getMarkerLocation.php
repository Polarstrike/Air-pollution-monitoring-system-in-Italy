<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

function findDeviceLocation(){
	$query = "SELECT d.pk_device, d.name, d.lat, d.lon, r.name as region FROM devices d inner join regions r on d.fk_region = r.pk_region";
	$result = mysql_query($query);
	$array_result = array();
	$index = 0;
	while($row = @mysql_fetch_assoc($result)){
		$row["name"] = utf8_encode($row["name"]);
		array_push($array_result, $row);
	}
	return $array_result;
}


$pointer = findDeviceLocation();
header("Content-type:application/json");
echo json_encode($pointer);


?>
