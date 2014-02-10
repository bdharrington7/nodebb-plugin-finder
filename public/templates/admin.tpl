<h1>Plugin Finder</h1>


<form class="form">
	<button class="btn btn-lg" id="update">Update</button><div id="waitMessage"><h4>Updating...</h4></div>
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


<!-- <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/spin.js/1.3.3/spin.min.js"></script> -->
<script type="text/javascript">
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
	
	// require.config({ 
	// 	paths: {
	// 		jqueryDt: "//code.jquery.com/jquery",
	// 		foo: "//cdn.datatables.net/1.10-dev/js/jquery.dataTables",
	// 		spinner: "//cdnjs.cloudflare.com/ajax/libs/spin.js/1.3.3/spin.min.js"
	// 	},
	// 	shim: {
	// 		'foo': ['jqueryDt']
			
	// 	}
	// });
	var table = $('#dataContainer'),
		buttonInstallText = "Install",
		buttonInstallClass = "btn-primary",
		buttonUninstallText = "Uninstall",
		buttonUninstallClass = "btn-success",
		finderDebug = config.environment == 'development',
		tbody = $('#dataBody'),
		// spinner,
		columns = 
		[
			{
				"sTitle": "Installed",
				"mData": "installed",
				"mRender": function(data, type, full){
					if(data){ // installed
						return '<button class="btn btn-sm installBtn ' + buttonUninstallClass + '" id="' + full.name + '">' + buttonUninstallText + '</button>'
					} 
					else {
						return '<button class="btn btn-sm installBtn ' + buttonInstallClass +'" id="' + full.name + '">' + buttonInstallText + '</button>'
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

	// require(['//cdnjs.cloudflare.com/ajax/libs/spin.js/1.3.3/spin.min.js']);
	// require(['jqueryDt','foo'], function(){
		
	// 	table.dataTable({
	// 		"aoColumns": columns
	// 	});
	// });
	

	// define('datatables', ['//cdnjs.cloudflare.com/ajax/libs/datatables/1.9.4/jquery.dataTables.min.js']);
	// re

	// console.log("pwd is: " + window.location.pathname);
	// require(['../js/main.js'], function(main){
	// 	console.log("Main loaded");
	// 	console.log(main);
	// });
	
	var wait = $("#waitMessage");
	

	$('#update').click(function(event){
		event.preventDefault();
		socket.emit('tools.finderUpdate', {});
		wait.show();
	});

	tbody.on("click", "tr td button", function(event){
		event.preventDefault();
		// spinner.spin();
		wait.show();
		if (event.currentTarget.textContent == buttonInstallText){
			socket.emit('tools.finderInstall', { id: event.currentTarget.id });
		}
		else if (event.currentTarget.textContent == buttonUninstallText){
			socket.emit('tools.finderUninstall', { id: event.currentTarget.id });
		}
	});
	socket.on ('event:finder.client.update', function (data){
		// spew data here
		//$('#jsonDebug').html(JSON.stringify(data));
		// table.dataTable().fnAddData(data);
		populateTable(data);
		// spinner.stop();
		wait.hide();
		if(finderDebug){
			console.log("List updated!");
		}
	});
	socket.on ('event:finder.client.error', function (err){
		// show error message
		// spinner.stop();
		wait.hide();
		if (err.message){
			alert("An error occurred: " + err.message);
		}
		console.log(err);
	});
	socket.on ('event:finder.client.installed', function(data){
		$('#' + data.id).removeClass( buttonInstallClass ).addClass( buttonUninstallClass ).text( buttonUninstallText );
		if (finderDebug){
			console.log("Stdout: " + data.stdout);
			console.log("Stderr: " + data.stderr);
		}
		// spinner.stop();
		wait.hide();
		
	});
	socket.on ('event:finder.client.uninstalled', function(data){
		$('#' + data.id).removeClass( buttonUninstallClass ).addClass( buttonInstallClass ).text( buttonInstallText );
		if (finderDebug){
			console.log("Stdout: " + data.stdout);
			console.log("Stderr: " + data.stderr);
		}
		// spinner.stop();
		wait.hide();
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
	socket.emit('tools.finderPopulate', {});
</script>
<!-- DataTables CSS -->
<!-- <link rel="stylesheet" type="text/css" href="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css"> -->
<!-- DataTables -->
<!-- <script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/datatables/1.9.4/jquery.dataTables.min.js"></script> -->
