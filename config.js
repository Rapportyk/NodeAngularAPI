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
 * Main config file.
 * 
 *************************************************************************/

var cafile, cafiles, config, fs;

fs = require('fs');

config = {
    name: 'Node Service Manager',
    version: '0.1.0',
    appUrl: 'http://propozal.com/',
    hashIterations: 1000,
    emailFilterRegex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    passwordFilterRegex: /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,16}$/,
    enableConsole: true,
    http: {
        enabled: true,
        port: 3000
    },
    https: {
        enabled: false,
        port: 443,
        options: {
            key: '',
            cert: '',
            ca: ''
        }
    },
    mysql: {
        server: {
            host: 'localhost',
            port: 3306
        },
        db: {
            name: 'propozal',
            username: 'root',
            password: ''
        }
    },
    notification: {
        enabled: true,
        sms: {
            enabled: true,
            smsGateway: 'pay4sms' // SMSLane or Nexmo or pay4sms
        },
        email: {
            enabled: true
        }
    },
    nexmo: {
        apiKey: '',
        apiSecret: '',
        baseUrl: 'rest.nexmo.com',
        useSSL: true,
        from: '',
        message: ''
    },
    nodemailer: {
        username: '',
        password: '',
        from: ''
    },
    smslane: {
        username: '',
        password: ''
    },
    pay4sms: {
        token: ''
    }
};

if(process.env.environment == 'production') {      // Aquillae Environment
    // Database Connection
    config.mysql.server.host = 'localhost';
    config.mysql.server.port = 3306;
    config.mysql.db.name = 'propozal';
    config.mysql.db.username = 'root';
    config.mysql.db.password = 'sasa';

    // Server Config
    config.port = 80;
    config.http.port = 80;
    config.https.enabled = false;
} else if(process.env.environment == 'uat') {      // Amazon Environment

    // Database Connection
    config.mysql.server.host = '';
    config.mysql.server.port = 3306;
    config.mysql.db.name = 'propozal';
    config.mysql.db.username = '';
    config.mysql.db.password = '';

    // Server Config
    config.port = 80;
    config.http.port = 80;
    config.https.enabled = false;
} else {
    // Database Connection
    config.mysql.server.host = 'localhost';
    config.mysql.server.port = 3306;
    config.mysql.db.name = 'propozal';
    config.mysql.db.username = 'root';
    config.mysql.db.password = '';

    // Server Config
    config.port = 3000;
    config.http.port = 3000;
    config.https.enabled = false;
}

module.exports = config;