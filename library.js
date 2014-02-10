//library.js

(function (module){
	"use strict";
	var		fs = require('fs'),
			path = require('path'),
			npmSearch = require('npm-package-search'),
			child,
			winston = require('winston'),
			exec = require('child_process').exec,
			socketIndex = module.parent.require('./socket.io/index'),
			toolsSockets = module.parent.require('./socket.io/tools'),
			async = require('async'),
			templates = module.parent.require('../public/src/templates.js');

	var constants = Object.freeze({
		"name": "Finder",
		"admin": {
			"route": "/finder/",
			"icon": "fa-th-large"
		}
	});

	var debug = process.env.NODE_ENV == 'development';

	// path variables
	var packageListFile = path.join(__dirname, "/npm.json"),
		search = npmSearch(packageListFile, {
			filter: function(record){  // show and save only nodebb plugins
				if (record.name.indexOf('nodebb-plugin-') != -1){
					return record;
				}
			},
			interval: 1000 * 24 * 60 * 60 // one day
		}),
		query = ''; // all results
		
	
	toolsSockets.finderInstall = function(socket, data, options){ // TODO check message origin for security (i.e. admin)
		winston.info("Installing " + data.id);
		console.log (data);
		child = exec("npm install " + data.id, function(error, stdout, stderr){
			if (error){
				winston.error(error);
				socketIndex.server.sockets.emit('event:finder.client.error', { id: data.id, message: error, stdout: stdout, stderr: stderr });
				return;
			}
			socketIndex.server.sockets.emit('event:finder.client.installed', { id: data.id, stdout: stdout, stderr: stderr });
		});
		
	}

	toolsSockets.finderUninstall = function(socket, data, options){
		winston.info("Uninstalling " + data.id);
		console.log (data);
		child = exec("npm uninstall " + data.id, function(error, stdout, stderr){
			if (error){
				winston.error(error);
				socketIndex.server.sockets.emit('event:finder.client.error', { id: data.id, message: error, stdout: stdout, stderr: stderr });
				return;
			}
			socketIndex.server.sockets.emit('event:finder.client.uninstalled', { id: data.id, stdout: stdout, stderr: stderr });
		});
	}

	toolsSockets.finderUpdate = function(socket, data, options){
		serverQuery(socket, data, options, 'update');
	}

	toolsSockets.finderPopulate = function(socket, data, options){
		serverQuery(socket, data, options, 'fetch');
	}


	// message listener for the server
	var serverQuery = function(socket, data, options, getMethod){ 
		if (debug){
			winston.info('Finder: update request received');
		}
		// async call here, need data from installed plugins, and data from available, then when both
		// are done, need to check if there are available plugins that are in the installed plugins list
		var installed = {},
			available = [];

		async.parallel([
			function(callback){  // find installed plugins
				fs.readdir(path.join(__dirname, ".."), function(err, files){
					if (err){
						winston.error("Finder: Error reading directory");
						callback(err);
						return;
					}
					for(var f = 0; f < files.length; f++){
						installed[files[f]] = files[f];
					}
					callback();
				});
			},
			function(callback){  // find available plugins
				if (getMethod == 'fetch'){
					// do search, no data to handle
					search(query, function (err, data){
						if (err){
							if (debug) {
								winston.error("Finder: Error: " + err);
							}
							socketIndex.server.sockets.emit('event:finder.client.error', err);
							callback(err);
							return;
						}
						available = data;

						callback(); // signal done
						
					});
				}
				else if (getMethod == 'update') {
					// TODO: do npm update
					search.update(function(){
						search(query, function (err, data){
							if (err){
								if (debug) {
									winston.error("Finder: Error: " + err);
								}
								socketIndex.server.sockets.emit('event:finder.client.error', err);
								callback(err);
								return;
							}
							available = data;

							callback(); // signal done
							
						});
					});
				}
				else {
					var error = "the method " + getMethod + " is not supported";
					socketIndex.server.sockets.emit('event:finder.client.error', error);
					callback(error)
				}
			}], 
			function (err){ // after completion
				if (err){
					winston.error(err);
					return;
				}
				for (var i = 0; i < available.length; i++){
					available[i].installed = (installed[available[i].name] !== undefined);
				}
				if(debug) { 
					winston.info("Finder: server returning data"); 
				}
				socketIndex.server.sockets.emit('event:finder.client.update', available);
			});
		
	}

	var Finder = {};

	Finder.registerPlugin = function(custom_header, callback){
		custom_header.plugins.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		return custom_header;
	}

	Finder.addRoute = function(custom_routes, callback){
		fs.readFile(path.resolve(__dirname, "./public/templates/admin.tpl"), function (err, template){
			custom_routes.routes.push({
				"route": constants.admin.route,
				"method": "get",
				"options": function (req, res, callback) {
					callback({
						req: req,
						res: res,
						route: constants.admin.route,
						name: constants.name,
						content: template
					});
				}
			});

			callback(null, custom_routes);
		});
	}


	module.exports = Finder;

}(module));
