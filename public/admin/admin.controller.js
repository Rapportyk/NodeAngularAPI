(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$rootScope', '$scope', 'Notification', 'UserService', 'RoleService', 'DTOptionsBuilder', 'DTColumnBuilder', 'DTColumnDefBuilder', "SweetAlert", '$uibModal', '$localStorage'];
    function AdminController($rootScope, $scope, Notification, UserService, RoleService, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder, SweetAlert, $uibModal, $localStorage) {
        var vm = this;

        fetchMasterData();
        fetchUserList();

        vm.userRole = $localStorage.globals.role;

        function fetchMasterData () {
            RoleService.GetAll().then(function (response) {
                vm.roleData = [];
                if (response.status == 200) {
                    vm.roleData = response.data;
                } else {
                    if (response.status == -1)
                        Notification.error("Unable to reach the server. Please try again later.");
                    else if (response.status == 400)
                        Notification.error("Bad Request.");
                    else if (response.status == 401)
                        Notification.error("Unauthorised Request.");
                    else if (response.status == 404)
                        Notification.error("No Records Found!");
                    else
                        Notification.error("Status:" + response.status + ". Search failed.");
                }
            });
        }

        /*****   User Tab   *****/
        function fetchUserList() {
            UserService.GetAll().then(function (response) {
                if (response.status == 200) {
                    vm.userData = response.data;
                } else {
                    vm.userData = [];
                    if (response.status == -1)
                        Notification.error("Unable to reach the server. Please try again later.");
                    else if (response.status == 400)
                        Notification.error("Bad Request.");
                    else if (response.status == 401)
                        Notification.error("Unauthorised Request.");
                    else if (response.status == 404)
                        Notification.error("No Records Found!");
                    else
                        Notification.error("Status:" + response.status + ". Search failed.");
                }
            });
        }

        vm.dtOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withOption('responsive', true)
                .withOption('bLengthChange', false)
                .withOption('language', {
                    emptyTable: 'No records available.',
                    zeroRecords: 'No records available.'
                });

        vm.userDTColumnDefs = [
            DTColumnDefBuilder.newColumnDef(4).notSortable(),
            DTColumnDefBuilder.newColumnDef(5).notSortable()
        ];


        vm.userAddClick = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'userModal.html',
                size: 'lg',
                controller:function($uibModalInstance ,$scope){
                    $scope.title = "Add User";
                    $scope.roleList = vm.roleData;
                    $scope.password = "chennai@2016";
                    $scope.isActive = true;
                    $scope.save = function () {
                        var json = {
                            firstName: $scope.firstName,
                            lastName: $scope.lastName,
                            email: $scope.email,
                            password: $scope.password,
                            phone: $scope.phone,
                            roleId: vm.roleData.filter(function (item) { return item.name == $scope.roleName; })[0].id,
                            isActive: $scope.isActive
                        };
                        UserService.Create(json).then(function (response) {
                            if (response.status == 200) {
                                SweetAlert.swal("Success!", "User Created Successfully!", "success");
                                $uibModalInstance.dismiss('cancel');
                                fetchUserList();
                            } else {
                                if (response.status == -1)
                                    SweetAlert.swal("Oops!", "Unable to reach the server. Please try again later.");
                                else if (response.status == 400)
                                    SweetAlert.swal("Oops!", "Bad Request");
                                else if (response.status == 401)
                                    SweetAlert.swal("Oops!", "Unauthorised Request");
                                else if (response.status == 404)
                                    Notification.error("User Not Found!");
                                else if(response.status == 500)
                                    SweetAlert.swal("Oops!", "Internal Server Error. Try Again Later");
                                else
                                    SweetAlert.swal("Oops!", "Something Went Wrong");
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                }
            });
        };

        vm.userEditClick = function(row) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'userModal.html',
                size: 'lg',
                controller:function($uibModalInstance ,$scope){
                    $scope.firstName = vm.userData[row].firstName;
                    $scope.lastName = vm.userData[row].lastName;
                    $scope.email = vm.userData[row].email;
                    $scope.password = "**********";
                    $scope.phone = vm.userData[row].phone;
                    $scope.roleName = vm.userData[row].role;
                    $scope.isActive = vm.userData[row].isActive;
                    $scope.roleList = vm.roleData;

                    $scope.title = "Edit User";
                    $scope.save = function () {
                        var json = {
                            firstName: $scope.firstName,
                            lastName: $scope.lastName,
                            email: $scope.email,
                            phone: $scope.phone,
                            roleId: vm.roleData.filter(function (item) { return item.name == $scope.roleName; })[0].id,
                            isActive: $scope.isActive
                        };
                        UserService.Update(json, vm.userData[row].userId).then(function (response) {
                            if (response.status == 200) {
                                SweetAlert.swal("Success!", "User Updated Successfully!", "success");
                                $uibModalInstance.dismiss('cancel');
                                fetchUserList();
                            } else {
                                if (response.status == -1)
                                    SweetAlert.swal("Oops!", "Unable to reach the server. Please try again later.");
                                else if (response.status == 400)
                                    SweetAlert.swal("Oops!", "Bad Request");
                                else if (response.status == 401)
                                    SweetAlert.swal("Oops!", "Unauthorised Request");
                                else if (response.status == 404)
                                    Notification.error("User Not Found!");
                                else if(response.status == 500)
                                    SweetAlert.swal("Oops!", "Internal Server Error. Try Again Later");
                                else
                                    SweetAlert.swal("Oops!", "Something Went Wrong");
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                }
            });
        };

        vm.userDeleteClick = function(row) {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to delete this user.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false},
            function (isConfirm) {
                if (isConfirm) {
                    UserService.Delete(vm.userData[row].userId).then(function (response) {
                        if (response.status == 200) {
                            SweetAlert.swal("Success!", "User Deleted Successfully!", "success");
                            fetchUserList();
                        } else {
                            if (response.status == -1)
                                SweetAlert.swal("Oops!", "Unable to reach the server. Please try again later.");
                            else if (response.status == 400)
                                SweetAlert.swal("Oops!", "Bad Request");
                            else if (response.status == 401)
                                SweetAlert.swal("Oops!", "Unauthorised Request");
                            else if (response.status == 500)
                                SweetAlert.swal("Oops!", "Internal Server Error. Try Again Later");
                            else
                                SweetAlert.swal("Oops!", "Something Went Wrong");
                        }
                    });
                }
            });
        };

        /*****   Roles Tab   *****/

        vm.roleDTColumnDefs = [
            DTColumnDefBuilder.newColumnDef(2).notSortable(),
            DTColumnDefBuilder.newColumnDef(3).notSortable()
        ];

        vm.roleAddClick = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'roleModal.html',
                controller:function($uibModalInstance ,$scope){
                    $scope.title = "Add Role";
                    $scope.save = function () {
                        var json = {
                            role: $scope.roleName
                        };
                        RoleService.Create(json).then(function (response) {
                            if (response.status == 200) {
                                SweetAlert.swal("Success!", "Role Created Successfully!", "success");
                                $uibModalInstance.dismiss('cancel');
                                fetchMasterData();
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
                                    SweetAlert.swal("Oops!", "Something Went Wrong");
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                }
            });
        };

        vm.roleEditClick = function(row) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'roleModal.html',
                controller:function($uibModalInstance ,$scope){
                    $scope.roleName = vm.roleData[row].name;
                    $scope.title = "Edit Role";
                    $scope.save = function () {
                        var json = {
                            role: $scope.roleName
                        };
                        RoleService.Update(json, vm.roleData.roleList[row].id).then(function (response) {
                            if (response.status == 200) {
                                SweetAlert.swal("Success!", "Role Updated Successfully!", "success");
                                $uibModalInstance.dismiss('cancel');
                                fetchMasterData();
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
                                    SweetAlert.swal("Oops!", "Something Went Wrong");
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                }
            });
        };

        vm.roleDeleteClick = function(row) {
            SweetAlert.swal({
                        title: "Are you sure?",
                        text: "You want to delete this role.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        closeOnConfirm: false},
                     function (isConfirm) {
                         if (isConfirm) {
                             RoleService.Delete(vm.roleData[row].id).then(function (response) {
                                 if (response.status == 200) {
                                     SweetAlert.swal("Success!", "Role Deleted Successfully!", "success");
                                     fetchMasterData();
                                 } else {
                                     if (response.status == -1)
                                         SweetAlert.swal("Oops!", "Unable to reach the server. Please try again later.");
                                     else if (response.status == 400)
                                         SweetAlert.swal("Oops!", "Bad Request");
                                     else if (response.status == 401)
                                         SweetAlert.swal("Oops!", "Unauthorised Request");
                                     else if (response.status == 500)
                                         SweetAlert.swal("Oops!", "Internal Server Error. Try Again Later");
                                     else
                                         SweetAlert.swal("Oops!", "Something Went Wrong");
                                 }
                             });
                         }
                    });
        };

    }

})();
