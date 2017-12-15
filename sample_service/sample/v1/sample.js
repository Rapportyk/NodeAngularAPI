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
 * This file contains the logic for the sample service.
 *
 *************************************************************************/

var config = require('./../../../config');

exports.create = function(request, response) {
    var json = {
        message: 'Create'
    };
    return response.status(200).json(json);
};

exports["delete"] = function(request, response) {
    var json = {
        message: 'Delete'
    };
    return response.status(200).json(json);
};

exports.index = function(request, response) {
    var json = {
        message: 'Index'
    };
    return response.status(200).json(json);
};

exports.show = function(request, response) {
    var json = {
        message: 'Show'
    };
    return response.status(200).json(json);
};

exports.update = function(request, response) {
    var json = {
        message: 'Update'
    };
    return response.status(200).json(json);
};

exports.options = function(request, response) {
    var json = {
        message: 'Options'
    };
    return response.status(200).json(json);
};

exports.head = function(request, response) {
    var json = {
        message: 'Head'
    };
    return response.status(200).json(json);
};