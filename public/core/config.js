var config = angular.module('app.config', []).factory('config', function () {
    var config = {
        "isLive": true,
        "scrollDelay": 30000,
        "apiUrl": "http://localhost:3000",
        "jsonUrl": "assets/data",
        "endPoint": {
            "admin": {
                "user": "/users/v1/user",
                "role": "/users/v1/role",
                "resetPassword": "/users/v1/resetpassword"
            }
        }
    };
    return config;
});