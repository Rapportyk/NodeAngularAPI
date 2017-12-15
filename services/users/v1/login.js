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
 * This file contains the logic for the login service.
 * 
 *************************************************************************/

var crypto = require('crypto');
var config = require('./../../../config');
var log = require('./../../../log');
var moment = require('moment');
var _ = require('lodash');

exports.create = function(request, response) {

    try {
        if (request.body.email == null) {
            log.info({Function: "Login.Create"}, "Login Failed. Details: Email is empty");
            return response.sendStatus(401);
        }

        if (request.body.password == null) {
            log.info({Function: "Login.Create"}, "Login Failed. Details: Password is empty");
            return response.sendStatus(401);
        }

        request.getConnection(function(connectionError, connection) {
            if (connectionError != null) {
                log.error(connectionError, "Database Connection Error (Function = Login.Create)");
                json = {
                    error: "User Login failed. Database could not be reached."
                };
                return response.status(500).json(json);
            }
            connection.query('SELECT first_name AS firstName, last_name AS lastName, password AS password, email, phone, id AS userId, (SELECT name FROM ' + config.mysql.db.name + '.role WHERE id = role_id) AS role, is_active AS isActive  FROM ' + config.mysql.db.name + '.user WHERE email=? AND is_active;', request.body.email, function (queryError, list) {
                if (queryError != null) {
                    log.error(queryError, "Query Error. User Login failed. Username: " + request.body.email + " (Function = Login.Create)");
                    json = {
                        error: "User Login failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                } else {
                    if (list) {
                        var authenticatedUser = [];
                        var userObj = {};

                        list.forEach(function(entry) {
                            if (typeof userObj[entry.userId] == "undefined") {
                                userObj[entry.userId] = [];
                            }
                            userObj[entry.userId].push(entry);
                        });

                        for (var obj in userObj) {
                            if (userObj.hasOwnProperty(obj)) {
                                var user = {
                                    firstName: userObj[obj][0].firstName,
                                    lastName: userObj[obj][0].lastName,
                                    email: userObj[obj][0].email,
                                    phone: userObj[obj][0].phone,
                                    role: userObj[obj][0].role,
                                    userId: userObj[obj][0].userId,
                                    isActive: userObj[obj][0].isActive,
                                    password: userObj[obj][0].password
                                };
                                authenticatedUser.push(user);
                            }
                        }

                        if ((authenticatedUser == null) || (authenticatedUser.length == 0)) {
                            var json = {
                                error: "The email address or password supplied were not correct."
                            };
                            log.info({Function: "Login.Create"}, "Login Failed. Details: The email address or password supplied were not correct.");
                            return response.status(401).json(json);
                        }

                        var passwordArray = authenticatedUser[0].password.split(":");
                        var iterations = passwordArray[0];
                        var salt = passwordArray[1];
                        var originalPassword = passwordArray[2];
                        crypto.pbkdf2(request.body.password, salt, parseInt(iterations), 24, function(cryptoPdkError, encodedPassword) {
                            if (cryptoPdkError) {
                                json = {
                                    error: "Login Failed"
                                };
                                log.error(cryptoPdkError, "Login Failed. Username: " + request.body.email + " (Function = Login.Create)");
                                return response.status(500).json(json);
                            }

                            if (encodedPassword.toString("base64") === originalPassword) {
                                var utcTimeStamp = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');

                                connection.query('UPDATE '+ config.mysql.db.name +'.user SET access_time=? WHERE id = ?', [utcTimeStamp,authenticatedUser[0].userId], function(queryError, result) {
                                    if (queryError != null) {
                                        log.error(queryError, "Query Error. User Login failed. Username: " + request.body.email + " (Function = Login.Create)");
                                        json = {
                                            error: "User Login failed. Database could not be reached."
                                        };
                                        return response.status(500).json(json);
                                    } else {
                                        return response.status(200).json(authenticatedUser[0]);
                                    }
                                });
                            } else {
                                json = {
                                    error: "The email address or password supplied were not correct."
                                };
                                log.info({Function: "Login.Create"}, "Login Failed. Details: The email address or password supplied were not correct.");
                                return response.status(401).json(json);
                            }
                        });
                    } else {
                        json = {
                            error: "The email address or password supplied were not correct."
                        };
                        log.info({Function: "Login.Create"}, "Login Failed. Details: The email address or password supplied were not correct.");
                        return response.status(401).json(json);
                    }
                }
            });
        });
    } catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = Login.Create)");
        return response.status(500).json(json);
    }
};

exports.options = function(request, response) {
    return response.sendStatus(200);
};

exports.index = function(request, response) {
    var json;
    json = {
        message: 'Login index called'
    };
    return response.status(200).json(json);
};