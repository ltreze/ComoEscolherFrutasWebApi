(function () {

    var app = angular.module('app', ['ngRoute']);

    app.config(function ($routeProvider, $locationProvider) {

        $routeProvider
            .when('/', {
                templateUrl: 'pages/lista.html', controller: 'homeController'
            })
            .when('/upsert', {
                templateUrl: 'pages/upsert.html', controller: 'homeController'
            })
            .when('/imagens', {
                templateUrl: 'pages/imagens.html', controller: 'homeController'
            });
        /*.otherwise({redirectTo: '/'});*/

        $locationProvider.html5Mode(true);
    });

    app.controller('homeController', ['$scope', '$http', '$location', function ($scope, $http, $location) {

        //console.log('iniciando controller');

        $http({
            method: 'GET',
            url: '/api/obterdicas'
        }).then(function successCallback(response) {
            //console.log(response);
            $scope.dicas = response.data;
        }, function erroCallback(response) {
            console.log('Error');
            console.log(response);
        });

        $http({
            method: 'GET',
            url: '/api/imagens'
        }).then(function successCallback(response) {
            console.log(response.data[0]);
            $scope.imagens = response.data;
        }, function erroCallback(response) {
            console.log('Error');
            console.log(response);
        });

    }]);


})();