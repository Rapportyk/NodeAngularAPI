/*************************************************************************
 * 
 * COPYRIGHT NOTICE
 * __________________
 * 
 * NodeServiceManager - v0.1.0
 *
 * Copyright (C) 2015, Kennet Jacob
 * All Rights Reserved.
 * 
 * NOTICE:  All information contained herein is, and remains the property 
 * of Kennet Jacob. Unauthorised copying of this  file, via any medium is 
 * strictly prohibited. Redistribution and use in source and binary forms,
 * with or without modification, are not permitted.
 * Proprietary and confidential.
 *
 * Author:
 * Name: Kennet Jacob
 * Email: kennetjacob@gmail.com
 * Website: http://kennetjacob.com
 *
 *
 * FILE SUMMARY
 * __________________
 * 
 * 
 * 
 *************************************************************************/

var module, resource, service, services, version, versions, _ref;

var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var config = require('./config');
var log = require('./log');
var auth = require('./auth');
var bodyParser = require('body-parser');
var socket = require('./socket.js');
var schedule = require('node-schedule');

var requestLog = function(request, response, next) {
    var details;
    details = {
        client: request.ip,
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body
    };
    var tag = "request";
    log.info({Function: tag}, details);
    next();
};
var enableCORS = function(request, response, next) {
    response.header('Access-Control-Allow-Origin', request.headers.origin);
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Date, X-Date');
    return next();
};
var mysql = require('mysql'), // node-mysql module
    myConnection = require('express-myconnection'), // express-myconnection module
    dbOptions = {
        host: config.mysql.server.host,
        user: config.mysql.db.username,
        password: config.mysql.db.password,
        port: config.mysql.server.port,
        database: config.mysql.db.name,
        multipleStatements: true
    };

app.disable('x-powered-by');
app.use(enableCORS);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(myConnection(mysql, dbOptions, 'single'));
app.use(requestLog);

var dailySchedule = schedule.scheduleJob('01 23 * * 1-7', function(){
    console.log("Daily Job Started");
    var connection = mysql.createConnection({
        host: config.mysql.server.host,
        user: config.mysql.db.username,
        password: config.mysql.db.password,
        port: config.mysql.server.port,
        database: config.mysql.db.name,
        multipleStatements: true
    });

    connection.connect();

    connection.query('UPDATE ' + config.mysql.db.name + '.visitor SET status_id = 3 WHERE status_id = 2', function (queryError, item) {
        if (queryError != null) {
            log.error(queryError, "Query error. Failed to reset user status. (Function = Schedule.Update)");
            json = {
                error: "Requested action failed. Database could not be reached."
            };
        }
        else {
            connection.query('UPDATE ' + config.mysql.db.name + '.visitor SET status_id = 4, pic_comments="This task was not taken by the respective PIC" WHERE status_id = 1', function (queryError, item) {
                if (queryError != null) {
                    log.error(queryError, "Query error. Failed to reset user status. (Function = Schedule.Update)");
                    json = {
                        error: "Requested action failed. Database could not be reached."
                    };
                }
                else {
                    connection.end();
                    log.info({ Function: "init" }, "Daily Reset Job Completed");
                }
            });
        }
    });
});

log.info({Function: "init"}, config.name + " version " + config.version + " Scanning " + __dirname + "/services for service modules");

services = fs.readdirSync(__dirname + "/services");

for (var _i = 0, _len = services.length; _i < _len; _i++) {
    service = services[_i];
    versions = fs.readdirSync(__dirname + "/services/" + service);
    log.info({Function: "init"}, "Registering Service: " + service + " with " + versions.length + " versions");
    for (var _j = 0, _len1 = versions.length; _j < _len1; _j++) {
        version = versions[_j];
        log.info({Function: "init"}, "Registering resources for: " + service + "/" + version);
        module = require(__dirname + "/services/" + service + "/" + version + "/service.js");
        _ref = module.resources;
        for (var _k = 0, _len2 = _ref.length; _k < _len2; _k++) {
            resource = _ref[_k];
            resource.url = "/" + service + "/" + version + "/" + resource.name;
            switch (resource.auth) {
                case 'bypass':
                    resource.auth = auth.bypass;
                    break;
                case 'required':
                    resource.auth = auth.required;
                    break;
                default:
                    resource.auth = auth.required;
            }
            if (resource.methods.create != null) {
                app.post(resource.url, resource.auth, resource.methods.create);
            }
            if (resource.methods["delete"] != null) {
                app["delete"](resource.url + "/:id", resource.auth, resource.methods["delete"]);
            }
            if (resource.methods.index != null) {
                app.get(resource.url, resource.auth, resource.methods.index);
            }
            if (resource.methods.show != null) {
                app.get(resource.url + "/:id", resource.auth, resource.methods.show);
            }
            if (resource.methods.update != null) {
                app.put(resource.url + "/:id", resource.auth, resource.methods.update);
            }
            if (resource.methods.options != null) {
                app.options(resource.url, resource.methods.options);
            }
            if (resource.methods.head != null) {
                app.head(resource.url, resource.methods.head);
            }
            app.get('/', function(req, res) {
                res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
            });
        }
    }
}

if (config.http.enabled) {
    var server = http.createServer(app).listen(config.http.port);
    var io = require('socket.io').listen(server);
    io.on('connection', socket);
    log.info({Function: "init"}, "Service Manager listening for http on port " + config.http.port);
}

if (config.https.enabled) {
    https.createServer(config.https.options, app).listen(config.https.port);
    log.info({Function: "init"}, "Service Manager listening for https on port " + config.https.port);
}

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    dailySchedule.cancel();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));