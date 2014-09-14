//library.js

(function (module){
	'use strict';
	var	fs = require('fs'),
		path = require('path'),
		meta = module.parent.require('./meta'), // settings
		npmSearch = require('npm-package-search'),
		child,
		winston = require('winston'),
		exec = require('child_process').exec,				// for calling npm install / uninstall
		socketIndex = module.parent.require('./socket.io/index'), 	// signaling the client
		pluginsSockets = module.parent.require('./socket.io/plugins'), 	// receiving signals from the client
		async = require('async'),
		semver = require('semver'),
		templates = module.parent.require('../public/src/templates.js');

	var constants = Object.freeze({
		"name": "Finder",
		"admin": {
			"route": "/plugins/finder/",
			"icon": "fa-puzzle-piece"
		},
		"namespace": "nodebb-plugin-finder"
	});

	winston.warn('*** DEPRECATED: nodebb-plugin-finder: The function of this plugin has been implemented in the core platform');

	var debug = process.env.NODE_ENV === 'development';

	// takes any form of truth and returns boolean value
	function isTrue(value){
		if (typeof(value) == 'string'){
			value = value.toLowerCase();
		}
		switch(value){
			case true:
			case "true":
			case 1:
			case "1":
			case "on":
			case "yes":
				return true;
			default:
				return false;
		}
	}

	var updateInterval = isTrue(meta.config[constants.namespace + ':options:autoUpdate']) ? 1000 * 24 * 60 * 60: undefined; // one day

	var npmSearchOptions = {
		filter: function npmFilter (record){  // show and save only nodebb plugins
			if (record.name.indexOf('nodebb-plugin-') != -1){
				return record;
			}
		},
		interval: updateInterval
	};

	// path variables
	var packageListFile = path.join(__dirname, '/npm.json'),
		search = npmSearch(packageListFile, npmSearchOptions),
		query = ''; // all results


	pluginsSockets.finderInstall = function(socket, data, options){ // TODO check message origin for security (i.e. admin)
		winston.info('Installing ' + data.id);
		console.log (data);
		child = exec('npm install ' + data.id, function(error, stdout, stderr){
			if (error){
				winston.error(error);
				socketIndex.server.sockets.emit('event:finder.client.error', { id: data.id, message: error, stdout: stdout, stderr: stderr });
				return;
			}
			socketIndex.server.sockets.emit('event:finder.client.installed', { id: data.id, stdout: stdout, stderr: stderr });
		});
	};

	pluginsSockets.finderUninstall = function(socket, data, options){
		winston.info('Uninstalling ' + data.id);
		console.log (data);
		child = exec('npm uninstall ' + data.id, function(error, stdout, stderr){
			if (error){
				winston.error(error);
				socketIndex.server.sockets.emit('event:finder.client.error', { id: data.id, message: error, stdout: stdout, stderr: stderr });
				return;
			}
			socketIndex.server.sockets.emit('event:finder.client.uninstalled', { id: data.id, stdout: stdout, stderr: stderr });
		});
	};

	// these functions allow us to call server functions from the client
	pluginsSockets.finderUpdate = function(socket, data, options){
		serverQuery(socket, data, options, 'update');
	};

	pluginsSockets.finderPopulate = function(socket, data, options){
		serverQuery(socket, data, options, 'fetch');
	};


	// message listener for the server
	var serverQuery = function(socket, data, options, getMethod){
		if (debug){
			winston.info('Finder: update request received');
		}
		// async call here, need data from installed plugins, and data from available, then when both
		// are done, need to check if there are available plugins that are in the installed plugins list
		var installed = [],
			available = [];

		async.parallel([
			function(callback){  // find installed plugins
				fs.readdir(path.join(__dirname, '..'), function(err, files){
					if (err){
						winston.error("Finder: Error reading directory");
						callback(err);
						return;
					}
					for (var i = files.length - 1; i >= 0; --i) {
						installed[files[i]] = 'installed' // get version number here
					};

					callback();
				});
			},
			function(callback){  // find available plugins
				if (getMethod == 'fetch'){
					// do search, no data to handle
					search(query, function (err, data){
						if (err){
							if (debug) {
								winston.error('Finder: Error: ' + err);
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
					search.update(function(){
						search(query, function (err, data){
							if (err){
								if (debug) {
									winston.error('Finder: Error: ' + err);
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
					var error = 'The method ' + getMethod + ' is not supported';
					socketIndex.server.sockets.emit('event:finder.client.error', error);
					callback(error)
				}
			}],
			function (err){ // after completion
				if (err){
					winston.error(err);
					return;
				}
				// keep track of latest versions only
				var seen = {};
				for (i = available.length-1; i >= 0; --i){
					var pkg = available[i];
					if (!seen[pkg.name]){
						seen[pkg.name] = pkg;
						seen[pkg.name].ver = pkg['dist-tags'].latest;
					}
					else {
						if (semver.gt(pkg['dist-tags'].latest, seen[pkg.name].ver)){
							seen[pkg.name] = pkg;
							seen[pkg.name].ver = pkg['dist-tags'].latest;
						}
					}
				}
				available = []; // clear out

				var keys = Object.keys(seen);

				for (var i = keys.length-1; i >= 0; --i){
					if(installed[keys[i]]){
						seen[keys[i]].installed = true;
						// seen[keys[i]].upgradeable = semver.gt(seen[keys[i]].ver, installed[keys[i]].ver);
					}

					available.push(seen[keys[i]]);
				}
				if(debug) {
					winston.info('Finder: server returning data');
				}
				socketIndex.server.sockets.emit('event:finder.client.update', available);
			});

	}; // end fn serverQuery decl

	var Finder = {};

	Finder.init = function(app, middleware, controllers){
		function renderAdminPage(req, res, next){
			res.render('admin', {});
		}

		app.get('/admin/plugins/finder', middleware.admin.buildHeader, renderAdminPage);
		app.get('/api/admin/plugins/finder', renderAdminPage);
	};

	Finder.admin = {
		menu: function(custom_header, callback){
			custom_header.plugins.push({
				"route": "/plugins/finder",
				"icon": constants.admin.icon,
				"name": constants.name
			});
			return custom_header;
		}
	};

	module.exports = Finder;

}(module));
