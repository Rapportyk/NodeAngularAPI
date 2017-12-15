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
 * This class is used to send sms using nexmo and smslane.
 * 
 *************************************************************************/

var config = require('./config');
var log = require('./log');
var Nexmo = require('simple-nexmo');
var http = require('http');

exports.sendSMS = function(recipient, text) {
    if (config.notification.sms.smsGateway === 'Nexmo') {
        var nexmo = new Nexmo(config.nexmo);
        var options = {
            from: config.nexmo.from,
            to: '+91' + recipient,
            type: 'text',
            text: text
        };
        nexmo.sendSMSMessage(options, function (err, response) {
            if (err) {
                log.error(err, "Unable to send sms (nexmo) (Function = SMS.SendSMS)");
            }
        });
    } else if (config.notification.sms.smsGateway === 'SMSLane') {
        var content = encodeURIComponent(text);
        var path = '/vendorsms/pushsms.aspx?user=' + config.smslane.username + '&password=' + config.smslane.password + '&msisdn=' + recipient + '&sid=WebSMS&msg=' + content + '&fl=0';
        console.log(path);
        var options = {
            host: "smslane.com",
            port: 80,
            path: path,
            method: 'GET'
        };

        http.request(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
        }).end();
    } else  if(config.notification.sms.smsGateway === 'pay4sms') {
        var content = encodeURIComponent(text);
        var options = {
            hostname: 'pay4sms.in',
            method: "GET",
            path: '/sendsms/?token='+ config.pay4sms.token +'&credit=1&message=' + content + '&number=' + recipient};
        var req = http.request(options, function(res) {
            res.on('data', function(chunk) {
                log.info({Function: "SMS.sendSMS"}, "SMS sent successfully. Details: " + chunk);
            });
        });
        req.end();
        req.on('error', function(error) {
            log.error(error, "Sms Error. Failed to send sms." + "(Function= SMS.sendSMS)");
        });
    }
};

