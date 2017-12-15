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
var socketList = require('./socketList');

// export function for listening to the socket
module.exports = function (socket) {

    socket.on('setUserId', function (userId) {
        socketList.add(userId,socket);
    });

    // Disconnect listener
    socket.on('disconnect', function() {
        socketList.remove(socket);
    });

};