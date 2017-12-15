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
 * This file contains the logic for the reset password service.
 *
 *************************************************************************/


var config = require('./../../../config');
var log = require('./../../../log');
var moment = require('moment');
var crypto = require('crypto');



exports.create = function(request, response) {
    var json;
    try {
        if(request.body.userId != null && request.body.oldPassword != null && request.body.newPassword != null) {
            request.getConnection(function(connectionError, connection) {
                if (connectionError != null) {
                    log.error(connectionError, "Database Connection Error (Function = ResetPassword.Create)");
                    json = {
                        error: "Password Reset failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                }
                var passwordFilter = config.passwordFilterRegex;
                if (!passwordFilter.test(request.body.newPassword)) {
                    json = {
                        error: "Not a valid password. Password should be 6 characters and must contain at least one digit"
                    };
                    log.info({Function: "ResetPassword.Create"}, "Not a valid password.");
                    return response.status(400).json(json);
                }
                var randomBytes = crypto.randomBytes(24);
                var encodedPassword = crypto.pbkdf2Sync(request.body.newPassword, randomBytes.toString("base64"), config.hashIterations, 24);
                var password = config.hashIterations + ":" + randomBytes.toString("base64") + ":" + (encodedPassword.toString("base64"));


                connection.query('SELECT password FROM '+ config.mysql.db.name +'.user WHERE id = ?', request.body.userId, function(queryError, check) {
                    if (queryError != null) {
                        log.error(queryError, "Query Error. Password Reset failed. (Function = ResetPassword.Create)");
                        json = {
                            error: "Password Reset failed. Database could not be reached."
                        };
                        return response.status(500).json(json);
                    }
                    if(check.length != 0) {
                        var utcTimeStamp = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
                        var passwordArray = check[0].password.split(":");
                        var iterations = passwordArray[0];
                        var salt = passwordArray[1];
                        var originalPassword = passwordArray[2];
                        crypto.pbkdf2(request.body.oldPassword, salt, parseInt(iterations), 24, function(cryptoPdkError, encodedPassword) {
                            if (cryptoPdkError) {
                                json = {
                                    error: "Reset Password Failed"
                                };
                                log.error(cryptoPdkError, "Reset Password Failed. (Function = ResetPassword.Create)");
                                return response.status(500).json(json);
                            }

                            if (encodedPassword.toString("base64") === originalPassword) {
                                connection.query('UPDATE '+ config.mysql.db.name +'.user SET password = ?, updated_time = ? WHERE id = ?', [password, utcTimeStamp, request.body.userId], function(queryError, reset) {
                                    if (queryError != null) {
                                        log.error(queryError, "Query Error. Password Reset failed. Username: " + request.body.username + " (Function = ResetPassword.Create)");
                                        json = {
                                            error: "Password Reset failed. Database could not be reached."
                                        };
                                        return response.status(500).json(json);
                                    }
                                    else {
                                        json = {
                                            message: "Password reset successful."
                                        };
                                        log.info({Function: "ResetPassword.Create"}, "Password reset success.");
                                        return response.status(200).json(json);
                                    }
                                });
                            }
                            else {
                                json = {
                                    error: "Incorrect Old Password"
                                };
                                log.info({Function: "ResetPassword.Create"}, "Incorrect Old Password");
                                return response.status(401).json(json);
                            }
                        });
                    }
                    else {
                        json = {
                            error: "User not found"
                        };
                        log.info({Function: "ResetPassword.Create"}, "User not found");
                        return response.status(404).json(json);
                    }
                })
            });
        }
    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = Student.Create)");
        return response.status(500).json(json);
    }
};