//library.js

(function (module){
	"use strict";
	var		fs = require('fs'),
			path = require('path'),
			npmSearch = require('npm-package-search'),
			winston = require('winston'),
			socketIndex = module.parent.require('./socket.io/index'),
			templates = module.parent.require('../public/src/templates.js');

	var constants = Object.freeze({
		"name": "Finder",
		"admin": {
			"route": "/finder/",
			"icon": "fa-th-large"
		}
	});

	var finderDebug = true;

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
		
	socketIndex.server.sockets.on('event:finder.server.update', function (noData) { // TODO: why isn't this registered?
		// do search, no data to handle
		search(query, function (err, data){
			if (err){
				if (finderDebug) console.log ("Finder: Error: " + err);
				socketIndex.server.sockets.emit('event:finder.client.error', err);
				return;
			}
			if(finderDebug) { console.log ("server returning data"); }
			socketIndex.server.sockets.emit('event:finder.client.update', data);
		});
		
	});

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
