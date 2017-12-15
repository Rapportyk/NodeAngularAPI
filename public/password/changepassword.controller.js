(function () {
    'use strict';

    angular
        .module('app')
        .controller('ChangePasswordController', ChangePasswordController);

    ChangePasswordController.$inject = ['$rootScope', '$scope', '$localStorage', 'UserService', "SweetAlert"];
    function ChangePasswordController($rootScope, $scope, $localStorage, UserService, SweetAlert) {
        var vm = this;

        vm.changePassword = function () {

            var jsonRequest = {};
            jsonRequest.oldPassword = vm.oldPassword;
            jsonRequest.newPassword = vm.newPassword;
            jsonRequest.userId = $localStorage.globals.userId;

            UserService.ResetPassword(jsonRequest).then(function (response) {
                if (response.status == 200) {
                    SweetAlert.swal("Success!", "Password Updated Successfully!", "success");
                    vm.reset();
                } else {
                    if (response.status == -1)
                        SweetAlert.swal("Oops!", "Unable to reach the server. Please try again later.");
                    else if (response.status == 400)
                        SweetAlert.swal("Oops!", "Bad Request");
                    else if (response.status == 401)
                        SweetAlert.swal("Oops!", "Unauthorised Request");
                    else if(response.status == 500)
                        SweetAlert.swal("Oops!", "Internal Server Error. Try Again Later");
                    else
                        SweetAlert.swal("Oops!", "Passwords not matching");
                }
            });
        };

        vm.reset = function () {
            vm.oldPassword = "";
            vm.newPassword = "";
            vm.repeatPassword = ""
        };
    }

})();
