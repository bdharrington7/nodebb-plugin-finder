<h1>Plugin Finder</h1>

<h3>Options</h3>

<form class="form">
	<button class="btn btn-lg" id="update">Update</button>
	<table id="dataContainer">
		<thead id = "dataHead">
		</thead>
		<tbody id="dataBody">
		</tbody>

	</table>
	<div id="jsonDebug" />
	<div style="display:none">
		<button class="btn btn-lg btn-primary" id="save">Save</button> 
	</div>
</form>



<script type="text/javascript">
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});

	// initializae datatables
	var table = $('#dataContainer');
	// require.config({
	// 	paths: {
	// 		jqueryDt: "//code.jquery.com/jquery",
	// 		foo: "//cdn.datatables.net/1.10-dev/js/jquery.dataTables"
	// 	},
	// 	shim: {
	// 		'foo': ['jqueryDt']
			
	// 	}
	// });
	var columns = 
		[
			{
				"sTitle": "Installed",
				"mData": "installed",
				"mRender": function(data, type, full){
					if(data){ // installed
						return '<button class="btn btn-sm btn-primary installBtn" id="' + full.name + '">Uninstall</button>'
					} 
					else {
						return '<button class="btn btn-sm btn-warn installBtn" id="' + full.name + '">Install</button>'
					}
				}
			},
			{ 
				"sTitle": "Name", 
				"mData": "name"
			},
			{ 
				"sTitle": "Description", 
				"mData": "description"
			},
			{
				"sTitle": "Repository",
				"mData" : "repository",
				"mRender": function(data, type, full){
					if (data){
						return '<a target="_blank" href="' + data.url + '">' + data.type + '</a>';
					}
					else {
						return '';
					}
					
				}
			}

		];

	// require(['jqueryDt','foo'], function(){
		
	// 	table.dataTable({
	// 		"aoColumns": columns
	// 	});
	// });
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
	
	var tbody = $('#dataBody');

	$('#update').click(function(event){
		event.preventDefault();
		if (finderDebug) console.log("Update button clicked");
		// fire off an event
		socket.emit('tools.finderUpdate', {});
	});

	tbody.on("click", "tr td button", function(event){
		event.preventDefault();
		console.log("install button clicked: " + event.currentTarget.id);
		//console.log(event);
	});
	socket.on ('event:finder.client.update', function (data){
		// spew data here
		$('#jsonDebug').html(JSON.stringify(data));
		// populateTable(data);
		// table.dataTable().fnAddData(data);
		populateTable(data);
	});
	socket.on ('event:finder.client.error', function (err){
		// show error message
		alert("An error occurred, check the console");
		console.log(err);
	});

	function populateTable(data){  // until datatables is working
		tbody.html(''); // clear previous data
		for (var i = 0; i < data.length; i++){
			var row = data[i];
			var trow = "<tr>";
			for (var col = 0; col < columns.length; col++){
				trow += "<td>" + renderCell(row,columns[col]) + "</td>";
			}
			trow += "</tr>";
			tbody.append(trow);
			
		}
	}

	function renderCell(row, column){
		var data = row[column.mData];
		if (column.mRender){
			return(column.mRender(data, 'display', row));
		}
		else {
			return data;
		}
	}

	// add the table headers
	var headerHtml = "<tr>";
	for (var r = 0; r < columns.length; r ++){
		headerHtml += "<th>" + columns[r].sTitle + "</th>";
	}
	headerHtml += "</tr>";
	$('#dataHead').append(headerHtml);


	// call the data on load
	//socket.emit('tools.finderUpdate', {});
</script>
<!-- DataTables CSS -->
<link rel="stylesheet" type="text/css" href="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css">
<!-- DataTables -->
<!-- <script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/datatables/1.9.4/jquery.dataTables.min.js"></script> -->
