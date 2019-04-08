<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

function findTypes(){
	$query = "SELECT pk_sensortype, type, reference, scale FROM sensortypes;";
	$result = mysql_query($query);
	$array_result = array();
	$index = 0;
	while($row = @mysql_fetch_assoc($result)){
		$row["type"] = utf8_encode($row["type"]);
  	$row["scale"] = utf8_encode($row["scale"]);
		array_push($array_result, $row);
	}
	return $array_result;
}


$pointer = findTypes();
header("Content-type:application/json");
echo json_encode($pointer);


?>
