
<?php
include 'database.php';

function call_db()
{
	$db = new DataBase();
	$db -> connetti();
}

call_db();

$cache_file = "cache.json";
$fd = fopen($cache_file, "r");
$content = fread($fd, filesize($cache_file));
fclose($fd);

header("Content-type:application/json");
echo json_encode($content);




?>
