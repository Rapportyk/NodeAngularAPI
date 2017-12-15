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
 * This class is used to handle socket events.
 *
 *************************************************************************/

var config = require('./config');
var log = require('./log');
var socketList = {};

Object.prototype.getKey = function(value){
    for(var key in this){
        if(this[key] == value){
            return key;
        }
    }
    return null;
};

exports.add = function (userId, socket) {
    log.info({Function: "SocketList"}, "Adding socket for the user with UserID: " + userId);
    if (!socketList[userId]) {
        socketList[userId] = socket;
    }
};

exports.remove = function (socket) {
    var i = socketList.getKey(socket);
    delete socketList[i];
    log.info({Function: "SocketList"}, "Removing socket for the user with UserId: " + i);
};

exports.getSocketList = function () {
    return socketList;
};

exports.getMainSocket = function() {
    for (var i in socketList) {
        return socketList[i];
    }
};