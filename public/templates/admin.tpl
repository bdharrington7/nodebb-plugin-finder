<h1>Plugin Finder</h1>

<h3>Options</h3>

<form class="form">
	<button class="btn btn-lg" id="update">Update</button>
	<div id="dataContainer"/>
	<!-- <div class="form-group">
		<label for="upload">
			<input type="checkbox" data-field="nodebb-plugin-finder:options:upload" id="upload" />
			Upload linked pictures automatically to the forum server
		</label>
		<div class="alert alert-warning">
			<strong><i class="icon-warning-sign"></i> Careful!</strong>
			<p>
				Make sure you have enough disk space and bandwidth on your server before you enable this.
			</p>
		</div>
	</div>
	 TODO: make group to choose between uploading to the server, or imgur 
	<div class="form-group">
		<label for="extensions">
			Allowed Extensions (comma separated, forum restart required)
		</label>
		<input class="form-control" placeholder="jpeg,jpg,gif,png" type="text" data-field="nodebb-plugin-finder:options:extensions" id="extensions" />
	</div>
-->
	<div style="display:none">
		<button class="btn btn-lg btn-primary" id="save">Save</button> 
	</div>
</form>

<!-- DataTables CSS -->
<!-- <link rel="stylesheet" type="text/css" href="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css"> -->
<!-- DataTables -->
<!-- <script type="text/javascript" charset="utf8" src="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js"></script> -->

<script type="text/javascript">
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
	var finderDebug = true;

	// console.log("pwd is: " + window.location.pathname);
	// require(['../js/main.js'], function(main){
	// 	console.log("Main loaded");
	// 	console.log(main);
	// });
	

	
	$('#update').click(function(event){
		event.preventDefault();
		if (finderDebug) console.log("Update button clicked");
		// fire off an event
		socket.emit('tools.finderUpdate', {});
	});
	socket.on ('event:finder.client.update', function (data){
		// spew data here
		$('#dataContainer').html(JSON.stringify(data));
	});
	socket.on ('event:finder.client.error', function (err){
		// show error message
		console.log ("An error occurred:");
		console.log(err);
	});

	// call the data on load
	socket.emit('tools.finderUpdate', {});
</script>
