<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

function findCitiesDevice(){

 $cities_list=mysql_query("SELECT c.name as nomecitta, c.pk_city, d.pk_device, d.name as nomedevice, d.lat, d.lon FROM cities c inner join devices d on c.pk_city = d.fk_city GROUP BY d.name ORDER BY d.name");
 $array_cities = array();

 	while($row = @mysql_fetch_assoc($cities_list))
	{
	 $row["nomecitta"] = utf8_encode($row["nomecitta"]);
 	 $row["nomedevice"] = utf8_encode($row["nomedevice"]);
 		array_push($array_cities, $row);
	}
	return $array_cities;

}

$pointer = findCitiesDevice();
header("Content-type:application/json");
echo json_encode($pointer);

?>
