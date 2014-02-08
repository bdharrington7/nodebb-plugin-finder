//library.js

(function (module){
	"use strict";
	var		fs = require('fs'),
			path = require('path'),
			npmSearch = require('npm-package-search'),
			winston = require('winston'),
			socketIndex = module.parent.require('./socket.io/index'),
			toolsSockets = module.parent.require('./socket.io/tools'),
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
		
	

	// message listener for the server
	toolsSockets.finderUpdate = function(socket, data, options){ 
		if (debug){
			winston.info('Finder: update request received');
		}
		// async call here, need data from installed plugins, and data from available, then when both
		// are done, need to check if there are available plugins that are in the installed plugins list

		// do search, no data to handle
		search(query, function (err, data){
			if (err){
				if (debug) {
					winston.error("Finder: Error: " + err);
				}
				socketIndex.server.sockets.emit('event:finder.client.error', err);
				return;
			}
			if(debug) { 
				winston.info("Finder: server returning data"); 
			}
			// add field indicating installed or not
			for (var i = 0; i < data.length; i++){

			}
			socketIndex.server.sockets.emit('event:finder.client.update', data);
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

	Finder.getScripts = function(scripts, callback){
		return scripts.concat(['plugins/finder/js/vendor/jquery.dataTables.min.js']);
	}

	module.exports = Finder;

}(module));
