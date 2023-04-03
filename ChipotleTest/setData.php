<!DOCTYPE html>
<head>
	<title>Hurricane Tweets</title>
	
	<link rel="stylesheet" type="text/css" href="style.css">
	
</head>

<body>

	<div class = "title">
		<h1>Secure INSERT example</a></h1>
	</div>

	<?php 

		array_filter($_POST, 'trim_value');
		$pattern = "/[^A-Za-z0-9\s\.\:\-\+\!\@\,\'\"]/";
		$user		= sanitize('user',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
		$password 	= sanitize('password',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
		$state		= sanitize('state',FILTER_SANITIZE_SPECIAL_CHARS,$pattern);
		$pattern = "/[^A-Za-z0-9\s\.\:\-\+\.\�\,\'\"]/";
		$lat 		= sanitize('lat',FILTER_SANITIZE_SPECIAL_CHARS,$pattern);
		$lon 		= sanitize('lon',FILTER_SANITIZE_SPECIAL_CHARS,$pattern);
		$loc 		= sanitize('loc',FILTER_SANITIZE_SPECIAL_CHARS,$pattern);
		$add 		= sanitize('add',FILTER_SANITIZE_SPECIAL_CHARS,$pattern);
		// $min 		= sanitize('min',FILTER_SANITIZE_NUMBER_INT,$pattern);
		
		
		//Connect to db 
		$pgsqlOptions = "host='localhost' dbname='geog5871' user='$user' password='$password'";
		$dbconn = pg_connect($pgsqlOptions) or die ('connection failure');
		
		//Return current maximum ID
		$getID = pg_query($dbconn, "SELECT MAX(id) FROM fandian") or die ('Query 1 failed: '.pg_last_error());
		$id = pg_fetch_result($getID, 0, 0);
		
		//Increment ID by one to create new row ID
		$id++; 
		
		$dbconn = pg_connect($pgsqlOptions);
		$insertQuery = pg_prepare($dbconn, "my_query", "INSERT INTO fandian(id, state, location, address, latitude, longitude) VALUES($1,$2,$3,$4,$5,$6)");
		$result = pg_execute($dbconn, "my_query", array($id,$state,$loc,$add,$lat,$lon))  or die ('Insert Query failed: '.pg_last_error()); 

		
		if (is_null($result))	{
			echo 'Data insert failed, please try again';
		}
		
		else {
			// echo json_encode(array('success' => true, 'message' => 'Data insert successful'));

			echo 'Data insert successful';
			// echo '<script>window.close();</script>';
		}
		
		//Close db connection
		pg_close($dbconn);
		
		
		function trim_value(&$value){
		   $value = trim($value);
		// Define regular expression pattern
		   $pattern = "/[\(\)\[\]\{\}]/";
		// replace the value with regular expression pattern
		   $value = preg_replace($pattern," - ",$value);
		}

		
		// The incoming string is filtered and cleaned to ensure that it matches the expected format and length
		function sanitize($str,$filter,$pattern) {
		// Replaces an invalid character in a string that matches the regular expression with an empty string
		   $sanStr = preg_replace($pattern,"",$tr);
		// Filters the POST parameter corresponding to $str based on the specified filter type.
		   $sanStr = filter_var($_POST[$str], $filter);
		// Make the character length less than 255
		   if (strlen($sanStr) > 255) $sanStr = substr($sanStr,0,255);
		   return $sanStr;
		} 
	?>

</body>