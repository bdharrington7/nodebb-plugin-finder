//library.js

(function (module){
	"use strict";
	var		fs = require('fs'),
			path = require('path'),
			mkdirp = require('mkdirp'),
			exec = require('child_process').exec,
			spawn = require('child_process').spawn,
			nconf = module.parent.require('nconf'),
			winston = require('winston'),
			templates = module.parent.require('../public/src/templates.js');

	var constants = Object.freeze({
		"name": "Finder",
		"admin": {
			"route": "/finder/",
			"icon": "fa-th-large"
		}
	});

	// path variables
	var pluginsDir = path.join(nconf.get('base_dir'), "/node_modules/"), // for creating the dir
		packageListFile = path.join(__dirname, "/npm.json"),
		wgetUploadPath = path.join(nconf.get('upload_path'), constants.admin.route);


	fs.exists(pluginsDir, function(exists){
		if(!exists){
			winston.info(constants.name + ": Plugins path doesn't exist, creating " + pluginsDir);
			mkdirp(pluginsDir, function(err){
				if (err){
					console.log(constants.name + ": Error creating directory: " + err);
				}
				else {
					console.log(constants.name + ": Successfully created upload directory!");
				}
			});
			console.log(constants.name + ": Done!");
		}
		else {
			winston.info("[plugins] " + constants.name + ": Plugins path exists");
		}
	});

	var Finder = {};
		//XRegExp = require('xregexp').XRegExp;

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
