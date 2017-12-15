(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$rootScope', '$scope', 'Authentication', 'Notification'];
    function LoginController($rootScope, $scope, Authentication, Notification) {
        var vm = this;

        // Hiding the top side bar
        $rootScope.hideLeftMenu = true;
        $rootScope.hideTopMenu = true;
        $rootScope.showFooter = false;

        vm.login = login;

        function login() {
            Authentication.login(vm.email, vm.password, function (response) {
                if(response.status == 401) {
                    Notification.error("Email/Password Incorrect. Please enter the correct credentials");
                }
                else {
                    Notification.error("Login Failed. Status - " + response.status + ": " + response.statusText);
                }
            });
        }
    }

})();
