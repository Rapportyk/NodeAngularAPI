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
 * This file contains the resource definitions for the service module
 * 
 *************************************************************************/

module.exports = {
    resources: [
        {
            name: 'user',                   // name of your service endpoint
            methods: require('./user'),     // javascript file that contain your endpoint functionality
            auth: 'bypass'                  // authentication type
        }, {
            name: 'login',
            methods: require('./login'),
            auth: 'bypass'
        }, {
            name: 'role',
            methods: require('./role'),
            auth: 'bypass'
        }, {
            name: 'resetpassword',
            methods: require('./resetpassword'),
            auth: 'bypass'
        }
    ]
};