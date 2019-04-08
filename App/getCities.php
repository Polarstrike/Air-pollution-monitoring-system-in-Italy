<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

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

$pointer = findCities();
header("Content-type:application/json");
echo json_encode($pointer);

?>
