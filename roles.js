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
 * This is used to manage roles.
 * 
 *************************************************************************/

var Role = {
    User: {
        name: "User",
        rules: [
            {
                "access": "allow",
                "access_url": "/users/*/user",
                "access_verbs": ["GET", "PUT", "POST"]
            }, {
                "access": "allow",
                "access_url": "/users/*/login",
                "access_verbs": ["GET", "POST"]
            }, {
                "access": "allow",
                "access_url": "/users/*/verification",
                "access_verbs": ["GET", "POST"]
            }
        ]
    },
    Signup: {
        name: "Signup",
        rules: [
            {
                "access": "allow",
                "access_url": "/users/*/user",
                "access_verbs": ["GET", "POST"]
            }
        ]
    },
    Admin: {
        name: "Admin",
        rules: [
            {
                "access": "allow",
                "access_url": "/*",
                "access_verbs": ["*"]
            }
        ]
    }
};

module.exports = Role;