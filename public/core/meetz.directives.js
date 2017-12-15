(function () {
    'use strict';

    angular
        .module('app')
        .directive('dateformat', dateformat)
	    .directive('inputfocus', inputfocus)
        .directive('menuClick', menuClick)
        .directive('numericOnly', numericOnly)
        .directive('lettersOnly', lettersOnly)
        .directive('ngEnter', ngEnter)
        .directive('ngFocus', ngFocus)
        .directive('passwordVerify', passwordVerify)
        .directive('leftMenu', leftMenu);

    function dateformat($filter) {
        {
            return {
                require: 'ngModel',
                link: function (scope, elm, attrs, ctrl) {

                    if (scope.isDatePickerOpen) {
                        console.log('date picker opened');
                    }

                    elm.on("focus", function (evt) {
                        $(elm).trigger(
                                jQuery.Event('keydown', { keyCode: 40, which: 40 })
                            );


                        if (scope[attrs.dateformat]) {
                            scope.oldds = scope[attrs.dateformat];
                        }
                        scope.$digest();
                    });
                    elm.on("blur", function () {
                        var dateFormats = ["DD-MM-YYYY", "DD,MM,YYYY", "DDMMYYYY", "DD.MM.YYYY", "DD/MM/YYYY", "DD MM YYYY"];

                        var date = elm[0].value;
                        if (moment(date).isValid()) {
                            scope[attrs.dateformat] = moment(date).toDate();
                        }
                        else {
                            for (var i = 0; i < dateFormats.length; i++) {
                                if (moment(date, dateFormats[i]).isValid())
                                    scope[attrs.dateformat] = moment(date, dateFormats[i]).toDate();

                                else
                                    scope[attrs.dateformat] = scope.oldds;
                            }
                        }
                    });


                }
            };
        }
    }
    function inputfocus($filter) {
        return {
            link: function (scope, elm, attrs, ctrl) {
                elm.on("keydown", ".uib-datepicker-popup", function (event) {
                    if (event.which == 9) {

                        var keys = attrs.inputfocus.split(".");
                        scope[keys[0]][keys[1]] = false;
                        if (attrs.inputfocusnext) {
                            var keys = attrs.inputfocusnext.split(".");
                            scope[keys[0]][keys[1]] = true;
                        }
                        event.preventDefault();
                    }
                    scope.$digest();
                });
            }
        }
    }

    function menuClick($filter) {
        return {
            link: function (scope, elm, attrs, ctrl) {
                elm.on("click", function (event) {
                    $('#page-container').toggleClass('page-sidebar-minified');
                    scope.$digest();
                });
            }
        }
    }

    function numericOnly() {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {

                modelCtrl.$parsers.push(function (inputValue) {
                    var transformedInput = inputValue ? inputValue.replace(/[^\d]/g, '') : null;

                    if (transformedInput != inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };
    }

    function leftMenu() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('click', '.left-menu-link', function() {

                    if (!$(this).closest('.left-menu-list-submenu').length) {
                        $('.left-menu-list-opened > a + ul').slideUp(200, function(){
                            $('.left-menu-list-opened').removeClass('left-menu-list-opened');
                        });
                    }

                });
            }
        };
    }

    function lettersOnly() {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {

                modelCtrl.$parsers.push(function (inputValue) {
                    var transformedInput = inputValue ? inputValue.replace(/[^a-zA-Z]{0,3}/g, '') : null;

                    if (transformedInput != inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };
    }

    function ngEnter() {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter, { 'event': event });
                    });

                    event.preventDefault();
                }
            });
        };
    }

    function ngFocus($timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.$watch(attrs.ngFocus, function (val) {
                    if (angular.isDefined(val) && val) {
                        $timeout(function () { element[0].focus(); });
                    }
                }, true);

                element.bind('blur', function () {
                    if (angular.isDefined(attrs.ngFocusLost)) {
                        scope.$apply(attrs.ngFocusLost);

                    }
                });
            }
        };
    }

    function passwordVerify () {
        return {
            require: "ngModel",
            scope: {
                passwordVerify: '='
            },
            link: function(scope, element, attrs, ctrl) {
                scope.$watch(function() {
                    var combined;

                    if (scope.passwordVerify || ctrl.$viewValue) {
                        combined = scope.passwordVerify + '_' + ctrl.$viewValue;
                    }
                    return combined;
                }, function(value) {
                    if (value) {
                        ctrl.$parsers.unshift(function(viewValue) {
                            var origin = scope.passwordVerify;
                            if (origin !== viewValue) {
                                ctrl.$setValidity("passwordVerify", false);
                                return undefined;
                            } else {
                                ctrl.$setValidity("passwordVerify", true);
                                return viewValue;
                            }
                        });
                    }
                });
            }
        };
    }

})();