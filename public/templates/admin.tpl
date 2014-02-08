<h1>Plugin Finder</h1>

<h3>Options</h3>

<form class="form">
	<button class="btn btn-lg" id="update">Update</button>
	<table id="dataContainer">
		<thead>
			<tr>
				<th>Name</th>
				<th>Version</th>
				<th>Repository</th>
			</tr>
		</thead>
		<tbody id="dataBody">
		</tbody>

	</table>
	<div id="jsonDebug" />
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



<script type="text/javascript">
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
	// require.config({
	// 	paths: {
	// 		"datatables": "//cdnjs.cloudflare.com/ajax/libs/datatables/1.9.4/jquery.dataTables.min.js"
	// 	}
	// })
	require(['//cdn.datatables.net/1.10-dev/js/jquery.dataTables.js'], function(){
		var table = $('#dataContainer');
		//table.dataTable();
	});
	var finderDebug = true;

	// define('datatables', ['//cdnjs.cloudflare.com/ajax/libs/datatables/1.9.4/jquery.dataTables.min.js']);
	// re

	// console.log("pwd is: " + window.location.pathname);
	// require(['../js/main.js'], function(main){
	// 	console.log("Main loaded");
	// 	console.log(main);
	// });
	
	// $(document).ready(function(){
	// 	//$('#dataContainer').dataTable();
	// 	// requirejs(['plugins/finder/js/vendor/jquery.dataTables.min.js'], function(DataTables){
	// 	// 	$('#dataContainer').dataTable();
	// 	// })
	// });
	
	var anchor = $('#dataBody');

	$('#update').click(function(event){
		event.preventDefault();
		if (finderDebug) console.log("Update button clicked");
		// fire off an event
		socket.emit('tools.finderUpdate', {});
	});
	socket.on ('event:finder.client.update', function (data){
		// spew data here
		$('#jsonDebug').html(JSON.stringify(data));
		populateTable(data);
		// $('#dataContainer').dataTable().fnAddData(data);
	});
	socket.on ('event:finder.client.error', function (err){
		// show error message
		alert("An error occurred, check the console");
		console.log(err);
	});

	function populateTable(data){
		anchor.html(''); // clear previous data
		for (var i = 0; i < data.length; i++){
			var row = data[i];
			anchor.append("<tr>");
			anchor.append("<td>").append(row.name).append("</td>");
			anchor.append("<td>").append(row.versions[0]).append("</td>");
			anchor.append("<td>").append(row.repository ? '<a href="' + data[i].repository.url + '">' + data[i].repository.type + '</a>' : '').append("</td>");
			//anchor.append("<td>").append(data[i].name).append("</td>"); // installed?
			anchor.append("</tr>");
		}
	}

	// call the data on load
	//socket.emit('tools.finderUpdate', {});
</script>
<!-- DataTables CSS -->
<link rel="stylesheet" type="text/css" href="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css">
<!-- DataTables -->
<!-- <script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/datatables/1.9.4/jquery.dataTables.min.js"></script> -->
