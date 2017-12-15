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
 * This file contains the logic for the role service.
 *
 *************************************************************************/

var config = require('./../../../config');
var log = require('./../../../log');

/**
 * @apiDefine RoleNotFoundError
 *
 * @apiError RoleNotFound The requested role was not found.
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
 * @api {post} /role Create a new role
 * @apiSampleRequest http://localhost:3000/users/v1/role
 * @apiVersion 0.1.0
 * @apiName CreateRole
 * @apiGroup Users
 *
 * @apiParam {String} role Role.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *            "role": "admin"
 *      }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *
 * @apiUse DatabaseError
 *
 * @apiError RoleAlreadyExists
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Role already exists"
 *     }
 *
 */

exports.create = function(request, response) {
    var json;
    try{
        if(request.body.role != null){
            request.getConnection(function(connectionError, connection){
                if(connectionError != null) {
                    log.error(connectionError, "Database connection error (Function = Role.Create");
                    json = {
                        error: "Role Create failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                }
                connection.query('SELECT * FROM '+ config.mysql.db.name +'.role WHERE name = ?', [request.body.role], function(queryError, item) {
                    if (queryError != null) {
                        log.error(queryError, "Query error. Failed to create a new role. Role Details: " + JSON.stringify(request.body.role) + "(Function = Role.Create)");
                        json = {
                            error: "Requested action failed. Database could not be reached."
                        };
                        return response.status(500).json(json);
                    }
                    if (item[0]){
                        json = {
                            error: "Role already exists!"
                        };
                        log.info({Function: "Role.Create"},"Role already exists. Role ID: " + item[0].id);
                        return response.status(400).json(json);
                    }
                    else {
                        connection.query('INSERT INTO '+ config.mysql.db.name +'.role (name) VALUES(?)',request.body.role, function(queryError, result){
                            if (queryError != null) {
                                log.error(queryError, "Query error. Failed to create a new role. Role details " + JSON.stringify(request.body.role) + "(Function = Role.Create)");
                                json = {
                                    error: "Requested action failed. Database could not be reached."
                                };
                                return response.status(500).json(json);
                            }
                            else{
                                json = {
                                    id: result.insertId
                                };
                                log.info({Function: "Role.Create"}, "New Role created successfully. Role ID: " + result.insertId);
                                return response.status(200).json(json);
                            }
                        });
                    }
                });
            });
        }

    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = Role.Create)");
        return response.status(500).json(json);
    }
};

/**
 * @api {put} /role/:id Update Role
 * @apiSampleRequest http://localhost:3000/users/v1/role/:id
 * @apiVersion 0.1.0
 * @apiName UpdateRole
 * @apiGroup Users
 *
 *@apiParam {String} role User's role.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *            "role": "admin"
 *      }
 *
 * @apiSuccessExample Success-Response:
 *     [
 *          "waiting"
 *     ]
 *
 * @apiUse DatabaseError
 *
 * @apiUse RoleNotFoundError
 *
 *  @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Role already exists"
 *     }
 *
 */

exports.update = function(request, response) {
    var json;
    try {
        request.getConnection(function(connectionError, connection) {
            if (connectionError != null) {
                log.error(connectionError, "Role connection error (Function = Role.Update");
                json = {
                    error: "Role Update failed. Database could not be reached."
                };
                return response.status(500).json(json);
            }
            connection.query('SELECT * FROM '+ config.mysql.db.name +'.role WHERE name = ?', [request.body.role], function(queryError, item) {
                if (queryError != null) {
                    log.error(queryError, "Query error. Failed to update a role. Role Details: " + JSON.stringify(request.body.role) + "(Function = Role.Update)");
                    json = {
                        error: "Requested action failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                }
                if (item[0]) {
                    var roleOBJ = item[0];
                    var roleID = roleOBJ[0];
                    json = {
                        error: "Role already exists!"
                    };
                    log.info({Function: "Role.Update"}, "Role already exists. Role ID: " + roleID);
                    return response.status(400).json(json);
                }
                else{
                    connection.query('SELECT * FROM ' + config.mysql.db.name + '.role WHERE id = ?', [request.params.id], function (queryError, entry) {
                        if (queryError != null) {
                            log.error(queryError, "Query error. Failed to update the requested role. Role Details: " + JSON.stringify(request.params.id) + "(Function = Role.Update)");
                            json = {
                                error: "Requested action failed. Database could not be reached."
                            };
                            return response.status(500).json(json);
                        }
                        if(!entry[0]){
                            json = {
                                error: "Requested role not found."
                            };
                            log.info({Function: "Role.Update"},"Requested role not found. Role ID: " + request.params.id);
                            return response.status(404).json(json);
                        }
                        else {
                            if(request.body.role != null){
                                connection.query('UPDATE '+ config.mysql.db.name + '.role SET name = ? WHERE id = ?', [request.body.role, request.params.id], function(queryError, none){
                                    if (queryError != null) {
                                        log.error(queryError, "Query error. Failed to update role. Role ID: " + JSON.stringify(request.params.id) + "(Function = Role.Update)");
                                        json = {
                                            error: "Requested action failed. Database could not be reached."
                                        };
                                        return response.status(500).json(json);
                                    }
                                    else {
                                        connection.query('SELECT * FROM '+ config.mysql.db.name +'.role WHERE id = ?', request.params.id, function(queryError, result) {
                                            if (queryError != null) {
                                                log.error(queryError, "Query Error. Failed to update role. Role ID: " + request.params.id + " (Function = Role.Update)");
                                                json = {
                                                    error: "Requested Action Failed. Database could not be reached."
                                                };
                                                return response.status(500).json(json);
                                            } else {
                                                log.info({Function: "Role.Update"}, "Role Updated Successfully. Role ID: " + request.params.id);
                                                return response.status(200).json(result[0]);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });

        });
    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = Role.Update)");
        return response.status(500).json(json);
    }
};

/**
 * @api {get} /role Show Role
 * @apiSampleRequest http://localhost:3000/users/v1/role
 * @apiVersion 0.1.0
 * @apiName IndexUserRole
 * @apiGroup Users
 *
 *
 * @apiSuccessExample Success-Response:
 *     [
 *          "Admin",
 *          "Executive"
 *     ]
 *
 * @apiUse DatabaseError
 *
 * @apiUse RoleNotFoundError
 *
 */

exports.index = function(request, response) {
    var json;
    try {
        request.getConnection(function(connectionError, connection) {
            if(connectionError) {
                log.error(connectionError, "Database connection error (Function = Role.Index");
                json = {
                    error: "Role Index failed. Database could not be reached."
                };
                return response.status(500).json(json);
            }
            else {
                connection.query('SELECT id, name FROM '+ config.mysql.db.name +'.role', function(queryError, result) {
                    if (queryError != null) {
                        log.error(queryError, "Query Error. Failed to fetch role. (Function = Role.Index)");
                        json = {
                            error: "Requested Action Failed. Database could not be reached."
                        };
                        return response.status(500).json(json);
                    } else {
                        if (result != null) {
                            log.info({Function: "Role.Index"}, "Fetched role.");
                            return response.status(200).json(result);
                        }
                        else {
                            log.info({Function: "Role.Index"}, "No role found");
                            return response.sendStatus(404);
                        }
                    }
                });
            }
        });
    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = Role: Index)");
        return response.status(500).json(json);
    }
};

/**
 * @api {delete} /role/:id Delete a role
 * @apiSampleRequest http://localhost:3000/users/v1/role/:id
 * @apiVersion 0.1.0
 * @apiName DeleteRole
 * @apiGroup Users
 *
 * @apiParam {Number} id Role ID.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiUse DatabaseError
 *
 * @apiUse RoleNotFoundError
 *
 */

exports["delete"] = function(request, response) {
    var json;
    try {
        request.getConnection(function(connectionError, connection) {
            if (connectionError != null) {
                log.error(connectionError, "Database Connection Error (Function = Role.Delete)");
                json = {
                    error: "Role delete failed. Database could not be reached."
                };
                return response.status(500).json(json);
            }

            connection.query('DELETE FROM ' + config.mysql.db.name + '.role WHERE id = ?', request.params.id, function (queryError, result) {
                if (queryError != null) {
                    log.error(queryError, "Query Error. Failed to delete a role. Role ID: " + request.params.id + " (Function = Role.Delete)");
                    json = {
                        error: "Requested Action Failed. Database could not be reached."
                    };
                    return response.status(500).json(json);
                }
                else {
                    if (result.affectedRows != 0) {
                        log.info({Function: "Role.Delete"}, "Role deleted successfully. Role ID: " + request.params.id);
                        return response.sendStatus(200);
                    }
                    else {
                        log.info({Function: "Role.Delete"}, "Requested role not found. Role ID: " + request.params.id );
                        return response.sendStatus(404);
                    }
                }
            });
        });
    } catch (error) {
        json = {
            error: "Error: " + error.message
        };
        log.error(error, "Exception Occurred (Function = Role.Delete)");
        return response.status(500).json(json);
    }
};

exports.options = function(request, response) {
    return response.sendStatus(200);
};

