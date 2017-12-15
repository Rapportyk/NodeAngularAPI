(function () {
    'use strict';

    angular
            .module('app')
            .factory('NotificationService', NotificationService);

    NotificationService.$inject = ['$rootScope', '$location', '$localStorage', 'config', '$window', 'SocketService', 'SweetAlert', 'Authentication'];
    function NotificationService($rootScope, $location, $localStorage, config, $window, SocketService, SweetAlert, Authentication) {
        var service = {};
        service.init = init;
        return service;

        function init() {
            if($localStorage.globals)
                SocketService.emit('setUserId', $localStorage.globals.userId);

            SocketService.on('NewAppointment', function (message) {
                if (!("Notification" in window)) {
                    alert("This browser does not support desktop notification");
                }
                else if (Notification.permission === "granted") {
                    var notification = new Notification('New Appointment!', {
                        icon: 'http://www.bluekeyinteractive.com/wp-content/themes/bki/img/icons/icon-people.png',
                        body: message
                    });

                    notification.onclick = function () {
                        window.open(config.apiUrl + "/#/appointment");
                    };
                }
                else if (Notification.permission !== 'denied') {
                    Notification.requestPermission(function (permission) {
                        if(!('permission' in Notification)) {
                            Notification.permission = permission;
                        }
                        // If the user is okay, let's create a notification
                        if (permission === "granted") {
                            var notification = new Notification('New Appointment!', {
                                icon: 'http://www.bluekeyinteractive.com/wp-content/themes/bki/img/icons/icon-people.png',
                                body: message
                            });
                            notification.onclick = function () {
                                window.open("http://localhost:3000/#/appointment");
                            };
                        }
                    });
                }
            });

            SocketService.on('disconnect', function() {
                //if($location.path() != '/login') {
                //    SweetAlert.swal("Session Expired!", "Current session is expired. Please refresh the page.", "error");
                //    Authentication.clearCredentials();
                //}
            });
        }
    }
})();