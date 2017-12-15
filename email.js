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
 * THis class is used to send email using nodemailer.
 * 
 *************************************************************************/

var nodemailer = require('nodemailer');
var config = require('./config');
var log = require('./log');
var fs = require("fs");

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.nodemailer.username,
        pass: config.nodemailer.password
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails


exports.sendEmail = function(toAddress, subject, template, data) {
    // setup e-mail data with unicode symbols

    var html = fs.readFileSync(__dirname + '/resources/email/' + template + '.html');
    var htmlContent = html.toString();

    if(template == 'welcome') {
        htmlContent = htmlContent.replace("cid:email", data.email);
        htmlContent = htmlContent.replace("cid:password", data.password);
        htmlContent = htmlContent.replace("cid:appurl", data.appUrl);
        htmlContent = htmlContent.replace("cid:appurl", data.appUrl);
    } else {
        htmlContent = htmlContent.replace("cid:executivename", data.executiveName);
        htmlContent = htmlContent.replace("cid:visitorname", data.visitorName);
        htmlContent = htmlContent.replace("cid:tokennumber", data.tokenNumber);
    }

    var mailOptions = {
        from: config.nodemailer.from,
        to: toAddress,
        subject: subject,
        html: htmlContent
    };

 // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            log.error(error, "Unable to send email (Function = Email.SendEmail)");
        }
    });
};

