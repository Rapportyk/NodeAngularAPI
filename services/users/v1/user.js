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
 * This file contains the logic for the user service.
 * 
 *************************************************************************/

var crypto = require('crypto');
var config = require('./../../../config');
var sendEmail = require('./../../../email');
var sms = require('./../../../sms');
var log = require('./../../../log');
var moment = require('moment');
var _ = require('lodash');

/**
 * @apiDefine UserNotFoundError
 *
 * @apiError UserNotFound The requested user was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 */

/**
 * @apiDefine DatabaseError
 *
 * @apiError DatabaseError Database could not be reached.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Requested Action Failed. Database could not be reached."
 *     }
 */

/**
 * @api {post} /user Create a new user
 * @apiSampleRequest http://localhost:3000/users/v1/user
 * @apiVersion 0.1.0
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {String} firstName User's first name.
 * @apiParam {String} lastName User's last name.
 * @apiParam {String} userCode User's code.
 * @apiParam {String} email User's email.
 * @apiParam {String} phone User's phone number.
 * @apiParam {String} password User's password.
 * @apiParam {Number} roleId User's Role ID.
 * @apiParam {Number} officeId User's Office ID.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *           "firstName": "Kennet",
 *           "lastName": "Jacob",
 *           "userCode": "KJ",
 *           "email": "kennetjacob@gmail.com",
 *           "password": "ken&jac21",
 *           "phone": "9994012253",
 *           "roleId": 1,
 *           "officeId": 1
 *       }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *           "secretKey": "2b73926b3cf4f6554eb5f2eadc38be95e3b1e883b7e16d3f80fbe6b5732501007575f90ea947d988a6c63bab8216ca2dd2fcc2a0e7b604a8f8a76c3856f4fdf2",
 *           "publicKey": "5ba30d56a51dea3c77bba7bddc39885d6a01879d18dbb6eb4df406d6988d8d55",
 *           "userId": "67"
 *     }
 *
 * @apiUse DatabaseError
 *
 * @apiError UserAlreadyExists The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "User already exists"
 *     }
 *
 */

exports.create = function(request, response) {
    var email, json;
    try {
        if ((request.body.email != null) && (request.body.firstName != null) && (request.body.lastName != null) && (request.body.password != null) && (request.body.phone != null) && (request.body.roleId != null)) {

            if ((request.body.email != null)) {
                emailFilter = config.emailFilterRegex;
                if (!emailFilter.test(request.body.email)) {
                    json = {
                        error: "Not a valid email address"
                    };
                    log.info({Function: "User.Create"}, "Not a valid email address. Email:" + request.body.email);
                    return response.status(400).json(json);
                }
                email = request.body.email;
            }

            if ((request.body.phone != null)) {
                var phoneFilter = /^\d{10}$/;
                if(!request.body.phone.match(phoneFilter))
                {
                    json = {
                        error: "Not a valid phone number"
                    };
                    log.info({Function: "User.Create"}, "Not a valid phone number. Phone:" + request.body.phone);
                    return response.status(400).json(json);
                }
            }

            if (request.body.password != null) {
                var passwordFilter = config.passwordFilterRegex;
                if (!passwordFilter.test(request.body.password)) {
                    json = {
                        error: "Not a valid password. Password should be 6 characters and must contain at least one digit"
                    };
                    log.info({Function: "User.Create"}, "Not a valid password. Password:" + "REDACT");
                    return response.status(400).json(json);
                }
            }

            request.getConnection(function(connectionError, connection) {
                if (connectionError != null) {
                    log.error(connectionError, "Database Connection Error (Function = User.Create)");
                    json = {
                        error: "User Create failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                }

                connection.query('SELECT * FROM '+ config.mysql.db.name +'.user WHERE email = ?', email.toLowerCase(), function(queryError, user) {
                    if (queryError != null) {
                        log.error(queryError, "Query Error. Failed To Create A New User. User details: " + JSON.stringify(request.body.email) + " (Function = User.Create)");
                        json = {
                            error: "Requested Action Failed. Database could not be reached."
                        };
                        return response.status(500).json(json);
                    }
                    if (user[0]) {
                        json = {
                            error: "User already exists"
                        };
                        log.info({Function: "User.Create"}, "User already exists. Email:" + email);
                        return response.status(400).json(json);
                    } else {
                        var password = "";
                        var utcTimeStamp = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');

                        crypto.randomBytes(24, function(cryptoRandomError, randomBytes) {
                            if (cryptoRandomError) {
                                json = {
                                    error: "Failed To Create A New User"
                                };
                                log.error(cryptoRandomError, "Failed To Create A New User. User details: " + JSON.stringify(request.body.email) + " (Function = User.Create)");
                                return response.status(500).json(json);
                            } else {
                                crypto.pbkdf2(request.body.password, randomBytes.toString("base64"), config.hashIterations, 24, function(cryptoPdkError, encodedPassword) {
                                    if (cryptoPdkError) {
                                        json = {
                                            error: "Failed To Create A New User"
                                        };
                                        log.error(cryptoPdkError, "Failed To Create A New User. User details: " + JSON.stringify(request.body.email) + " (Function = User.Create)");
                                        return response.status(500).json(json);
                                    } else {
                                        password = config.hashIterations + ':' + randomBytes.toString("base64") + ':' + (encodedPassword.toString("base64"));
                                        var publicKey =  crypto.randomBytes(32).toString("hex");
                                        var secretKey = crypto.randomBytes(64).toString("hex");

                                        //firstName, lastName, userCode, email, phone, password, publicKey, secretKey, accessTime, createdTime, updateTime, isActive, isLeave, lastToken, roleId, officeId

                                        connection.query('INSERT INTO '+ config.mysql.db.name +'.user (first_name, last_name, email, phone, password, public_key, secret_key, access_time, created_time, updated_time, is_active, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [request.body.firstName, request.body.lastName, request.body.email.toLowerCase(), request.body.phone, password, publicKey, secretKey, utcTimeStamp, utcTimeStamp, utcTimeStamp, true, request.body.roleId], function(queryError, user) {
                                            if (queryError != null) {
                                                log.error(queryError, "Query Error. Failed To Create A New User. User details: " + JSON.stringify(request.body.email) + " (Function = User.Create)");
                                                json = {
                                                    error: "Requested Action Failed. Database could not be reached."
                                                };
                                                return response.status(500).json(json);
                                            } else {
                                                if(config.notification.enabled) {
                                                    if(config.notification.email.enabled) {
                                                        var data = {
                                                            email: email.toLowerCase(),
                                                            password: request.body.password,
                                                            appUrl: config.appUrl
                                                        };
                                                        sendEmail.sendEmail(email.toLowerCase(), 'Welcome to Propozal!', 'welcome', data);
                                                    }
                                                }
                                                return response.sendStatus(200);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

            });
        } else {
            json = {
                error: "Email/Username and Password are required"
            };
            log.error({Function: "User.Create"}, "Email/Username and Password are required");
            return response.status(400).json(json);
        }
    } catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = User.Create)");
        return response.status(500).json(json);
    }
};

/**
 * @api {delete} /user/:id Delete a user
 * @apiSampleRequest http://localhost:3000/users/v1/user/:id
 * @apiVersion 0.1.0
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {Number} id User's unique ID.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiUse DatabaseError
 *
 * @apiUse UserNotFoundError
 *
 */
exports["delete"] = function(request, response) {
    try {
        request.getConnection(function(connectionError, connection) {
            if (connectionError != null) {
                log.error(connectionError, "Database Connection Error (Function = User.Delete)");
                json = {
                    error: "User Delete failed. Database could not be reached."
                };
                return response.status(500).json(json);
            }

            connection.query('DELETE FROM ' + config.mysql.db.name + '.user WHERE id = ?', [request.params.id, request.params.id, request.params.id], function (queryError, result) {
                if (queryError != null) {
                    log.error(queryError, "Query Error. Failed To Delete A User. User ID: " + request.params.id + " (Function = User.Delete)");
                    json = {
                        error: "Requested Action Failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                } else {
                    if (result.affectedRows != 0) {
                        log.info({Function: "User.Delete"}, "User Deleted Successfully. id: " + request.params.id);
                        return response.sendStatus(200);
                    } else {
                        log.info({Function: "User.Delete"}, "Requested User Not Found. User ID: " + request.params.id );
                        return response.sendStatus(404);
                    }
                }
            });
        });
    } catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = User.Delete)");
        return response.status(500).json(json);
    }
};

/**
 * @api {get} /user/:id Show user details
 * @apiSampleRequest http://localhost:3000/users/v1/user/:id
 * @apiVersion 0.1.0
 * @apiName ShowUser
 * @apiGroup User
 *
 * @apiParam {Number} id User's unique ID.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiUse DatabaseError
 *
 * @apiUse UserNotFoundError
 *
 */
exports.show = function(request, response) {
    try {
        request.getConnection(function(connectionError, connection) {
            if (connectionError != null) {
                log.error(connectionError, "Database Connection Error (Function = User.Show)");
                json = {
                    error: "User Show failed. Database could not be reached."
                };
                return response.status(500).json(json);
            }

            connection.query('SELECT user.first_name AS firstName, user.last_name AS lastName, user.email, user.phone, user.id AS userId, (SELECT name FROM ' + config.mysql.db.name + '.role WHERE id = user.role_id) AS role, user.is_active AS isActive FROM ' + config.mysql.db.name + '.user  WHERE user.id = ?', request.params.id, function (queryError, list) {
                if (queryError != null) {
                    log.error(queryError, "Query Error. Failed To Retrieve User Details. User ID: " + request.params.id + " (Function = User.Show)");
                    json = {
                        error: "Requested Action Failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                } else {
                    if (list) {
                        var resp = [];
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
                                    userCode: userObj[obj][0].userCode,
                                    email: userObj[obj][0].email,
                                    phone: userObj[obj][0].phone,
                                    role: userObj[obj][0].role,
                                    userId: userObj[obj][0].userId,
                                    isLeave: userObj[obj][0].isLeave,
                                    isActive: userObj[obj][0].isActive,
                                    baseOffice: {
                                        id: userObj[obj][0].baseOfficeId,
                                        title: userObj[obj][0].baseOfficeTitle
                                    },
                                    departmentList: [],
                                    officeList: []
                                };
                                var departmentList = [];
                                var officeList = [];
                                for(var i = 0; i < userObj[obj].length; i++) {
                                    var department = {
                                        id: userObj[obj][i].departmentId,
                                        name: userObj[obj][i].departmentName
                                    };

                                    var office = {
                                        id: userObj[obj][i].officeId,
                                        title: userObj[obj][i].officeTitle
                                    };
                                    departmentList.push(department);
                                    officeList.push(office);
                                }
                                user.departmentList = _.uniqBy(departmentList, 'id');
                                user.officeList = _.uniqBy(officeList, 'id');

                                resp.push(user);
                            }
                        }

                        log.info({Function: "User.Show"}, "User List fetched");
                        return response.status(200).json(resp);
                    } else {
                        log.info({Function: "User.Show"}, "Requested User Not Found");
                        return response.sendStatus(404);
                    }
                }
            });
        });
    } catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = User.Show)");
        return response.status(500).json(json);
    }
};

/**
 * @api {put} /user Update user details
 * @apiSampleRequest http://localhost:3000/users/v1/user/:id
 * @apiVersion 0.1.0
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {Number} id User's unique ID.
 * @apiParam {String} firstName User's first name.
 * @apiParam {String} lastName User's last name.
 * @apiParam {String} userCode User's code.
 * @apiParam {String} email User's email.
 * @apiParam {String} phone User's phone number.
 * @apiParam {String} password User's password.
 * @apiParam {Number} roleId User's Role ID.
 * @apiParam {Number} officeId User's Office ID.
 * @apiParam {Boolean} isLeave Is User Leave.
 * @apiParam {Boolean} isActive Is User Active.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *          "firstName": "Kennet",
 *          "lastName": "Jacob",
 *          "userCode": "KJ",
 *          "email": "kennetjacob@gmail.com",
 *          "password": "kenjac21",
 *          "phone": "9994012253",
 *          "roleId": 1,
 *          "officeId": 1,
 *          "isLeave": true,
 *          "isActive": true
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "secret": "02a84f8833b7cec407cddeab8cc1e58e5a2a886c7b50e4e51da367f90bf31e7477c6b3504064571590852d3c331bb771067e579181e7a9930ba06ae3649b83eb",
 *         "atime": "Mon, 07 Sep 2015 19:36:53 GMT",
 *         "utime": "Mon, 07 Sep 2015 19:37:04 GMT",
 *         "phone": "9994012253",
 *         "verified": 1,
 *         "user_id": 69,
 *         "password": "1000:2awcPmOPysUHz6E1XoZYHJXjRazzOPMI:c7YSMYfFUlnoHVOiSI2T/uias9JnzQxg",
 *         "ctime": "Mon, 07 Sep 2015 19:36:53 GMT",
 *         "publickey": "508f214c74b7c4c11cfc87eb530a75337b39f875f6dd01dbb1c3e02bfb44f954",
 *         "user_name": "kennetjacob@gmail.com",
 *         "role": "User",
 *         "first_name": "Kennet",
 *         "last_name": "Paul",
 *         "email": "kennetjacob@gmail.com",
 *         "auth_code": "3160"
 *      }
 *
 * @apiUse DatabaseError
 *
 * @apiUse UserNotFoundError
 *
 */
exports.update = function(request, response) {
    try {
        request.getConnection(function(connectionError, connection) {
            if (connectionError != null) {
                log.error(connectionError, "Database Connection Error (Function = User.Update)");
                json = {
                    error: "User Update failed. Database could not be reached."
                };
                return response.status(500).json(json);
            }

            connection.query('SELECT * FROM ' + config.mysql.db.name + '.user WHERE id = ?', request.params.id, function (queryError, result) {
                if (queryError != null) {
                    log.error(queryError, "Query Error. Failed To Update User Details. User ID: " + request.params.id + " (Function = User.Update)");
                    json = {
                        error: "Requested Action Failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                } else {
                    if (result[0]) {
                        if ((request.body.publickey != null) || (request.body.secret != null) || (request.body.user_id != null) || (request.body.atime != null) || (request.body.utime != null) || (request.body.ctime != null)) {
                            json = {
                                error: "Failed To Update The User Details"
                            };
                            log.info({Function: "User.Update"}, "Failed To Update The User Details. User ID: " + request.params.id);
                            return response.status(400).json(json);
                        }

                        var jsonData = {};
                        if (request.body.firstName != null) {
                            jsonData['first_name'] = request.body.firstName;
                        }
                        if (request.body.lastName != null) {
                            jsonData['last_name'] = request.body.lastName;
                        }
                        if (request.body.email != null) {
                            var emailFilter = config.emailFilterRegex;
                            if (!emailFilter.test(request.body.email)) {
                                json = {
                                    error: "Not a valid email address"
                                };
                                log.info({Function: "User.Update"}, "Not a valid email address. Email:" + request.body.email);
                                return response.status(400).json(json);
                            }
                            jsonData['email'] = request.body.email.toLowerCase();
                        }
                        if ((request.body.phone != null)) {
                            var phoneFilter = /^\d{10}$/;
                            if(request.body.phone.match(phoneFilter)) {
                                jsonData['phone'] = request.body.phone;
                            } else {
                                json = {
                                    error: "Not a valid phone number"
                                };
                                log.info({Function: "User.Update"}, "Not a valid phone number. Phone:" + request.body.phone);
                                return response.status(400).json(json);
                            }
                        }
                        if (request.body.password != null) {
                            var passwordFilter = config.passwordFilterRegex;
                            if (!passwordFilter.test(request.body.password)) {
                                json = {
                                    error: "Not a valid password. Password should be 6 characters and must contain at least one digit"
                                };
                                log.info({Function: "User.Update"}, "Not a valid password. Password:" + "REDACT");
                                return response.status(400).json(json);
                            }
                            var randomBytes = crypto.randomBytes(24);
                            var encodedPassword = crypto.pbkdf2Sync(request.body.password, randomBytes.toString("base64"), config.hashIterations, 24);
                            jsonData['password'] = config.hashIterations + ":" + randomBytes.toString("base64") + ":" + (encodedPassword.toString("base64"));
                        }
                        if (request.body.roleId != null) {
                            jsonData['role_id'] = request.body.roleId;
                        }
                        if (request.body.isActive != null) {
                            jsonData['is_active'] = request.body.isActive;
                        }
                        var utcTimeStamp = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
                        jsonData['updated_time'] = utcTimeStamp;

                        connection.query('UPDATE '+ config.mysql.db.name +'.user SET ? Where id = ?', [jsonData,request.params.id], function(queryError, result) {
                            if (queryError != null) {
                                log.error(queryError, "Query Error. Failed To Update User Details. User ID: " + request.params.id + " (Function = User.Update)");
                                json = {
                                    error: "Requested Action Failed. Database could not be reached."
                                };
                                return response.status(500).json(json);
                            } else {
                                connection.query('SELECT * FROM '+ config.mysql.db.name +'.user WHERE id = ?', request.params.id, function(queryError, user) {
                                    if (queryError != null) {
                                        log.error(queryError, "Query Error. Failed To Update User Details. User ID: " + request.params.id + " (Function = User.Update)");
                                        json = {
                                            error: "Requested Action Failed. Database could not be reached."
                                        };
                                        return response.status(500).json(json);
                                    } else {
                                        log.info({Function: "User.Update"}, "User Updated Successfully. User Id: " + request.params.id);
                                        return response.status(200).json(user[0]);
                                    }
                                });
                            }
                        });

                    } else {
                        log.info({Function: "User.Update"}, "Requested user not found");
                        return response.sendStatus(404);
                    }
                }
            });
        });
    } catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = User.Update)");
        return response.status(500).json(json);
    }
};

exports.options = function(request, response) {
    return response.sendStatus(200);
};

exports.index = function(request, response) {
    var json;
    try {
        request.getConnection(function(connectionError, connection) {
            if (connectionError != null) {
                log.error(connectionError, "Database Connection Error (Function = User.Show)");
                json = {
                    error: "User Login failed. Database could not be reached."
                };
                return response.status(500).json(json);
            }
            connection.query('SELECT user.first_name AS firstName, user.last_name AS lastName, user.email, user.phone, user.id AS userId, (SELECT name FROM ' + config.mysql.db.name + '.role WHERE id = user.role_id) AS role, user.is_active AS isActive FROM ' + config.mysql.db.name + '.user', function(queryError, list) {
                if (queryError != null) {
                    log.error(queryError, "Query Error. Failed To Create A New Student.(Function = User.Show)");
                    json = {
                        error: "Requested Action Failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                }
                else if(list) {

                    var resp = [];
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
                                userCode: userObj[obj][0].userCode,
                                email: userObj[obj][0].email,
                                phone: userObj[obj][0].phone,
                                role: userObj[obj][0].role,
                                userId: userObj[obj][0].userId,
                                isLeave: userObj[obj][0].isLeave,
                                isActive: userObj[obj][0].isActive,
                                baseOffice: {
                                    id: userObj[obj][0].baseOfficeId,
                                    title: userObj[obj][0].baseOfficeTitle
                                },
                                departmentList: [],
                                officeList: []
                            };
                            var departmentList = [];
                            var officeList = [];
                            for(var i = 0; i < userObj[obj].length; i++) {
                                var department = {
                                    id: userObj[obj][i].departmentId,
                                    name: userObj[obj][i].departmentName
                                };

                                var office = {
                                    id: userObj[obj][i].officeId,
                                    title: userObj[obj][i].officeTitle
                                };
                                departmentList.push(department);
                                officeList.push(office);
                            }
                            user.departmentList = _.uniqBy(departmentList, 'id');
                            user.officeList = _.uniqBy(officeList, 'id');

                            resp.push(user);
                        }
                    }

                    log.info({Function: "User.Show"}, "User List fetched");
                    return response.status(200).json(resp);
                }
                else {
                    json = {
                        error: "Users not found."
                    };
                    log.info({Function: "User.Show"}, "Users Not Found");
                    return response.status(404).json(json);
                }
            });
        });
    }
    catch(error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = User.Show)");
        return response.status(500).json(json);
    }
};