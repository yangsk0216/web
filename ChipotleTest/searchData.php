
<?php 
	//Returns JSON data to Javascript file
	// header("Content-type:application/json");

	$state = $_GET['state'];

	//Connect to db 
	$pgsqlOptions = "host='localhost' dbname='geog5871' user='geog5871student' password='Geibeu9b'";
	$dbconn = pg_connect($pgsqlOptions) or die ('connection failure');
	
	//Define sql query
	$query .="SELECT id, address, latitude, longitude, location, state FROM fandian where  state LIKE '%$state%'";
	
	//Execute query
	$result = pg_query($dbconn, $query) or die ('Query failed: '.pg_last_error());
	
	//Define new array to store results
	$fandianData = array();
	
	//Loop through query results 
	while ($row = pg_fetch_array($result, null, PGSQL_ASSOC))	{
	
		//Populate fandianData array 
		$fandianData[] = array("id" => $row["id"], "state" => $row["state"],"loc" => $row["location"],"add" => $row["address"],"lat" => $row["latitude"], "lon" => $row["longitude"]);
	}
	//Encode tweetData array in JSON
	echo json_encode($fandianData); 
	
	//Close db connection
	pg_close($dbconn);
	exit();
?>

	