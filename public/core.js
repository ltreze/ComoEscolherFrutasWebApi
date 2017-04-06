(function () {

    var app = angular.module('app', ['ngRoute']);

    app.config(function ($routeProvider, $locationProvider) {

        $routeProvider
            .when('/', { templateUrl: 'pages/lista.html', controller: 'homeController' })
            .when('/nova-dica', { templateUrl: 'pages/upsert.html', controller: 'homeController' })
            .when('/imagens', { templateUrl: 'pages/imagens.html', controller: 'homeController' })
            .when('/editar/:idDica', { templateUrl: 'pages/upsert.html', controller: 'homeController' })
            .otherwise({redirectTo: '/'});

        $locationProvider
            .html5Mode(true);
    });

    app.controller('homeController', ['$scope', '$http', '$location', '$routeParams', function ($scope, $http, $location, $routeParams) {
        
        if ($routeParams.idDica != null) {
            var idDica = $routeParams.idDica;
            
            $scope.idDica = idDica;
            console.log('$routeParams.idDica');
            console.log($routeParams.idDica);

            $http.post('/api/obterdica', { idDica: idDica})
                .then(function successCallback(response) {
                    console.log('retorno da obtenção de dica');
                    console.log(response.data);

                    $scope.edicao = true;
                    
                    $scope.descricao = response.data.descricao;
                    $scope.idDica = response.data.idDica;
                    $scope.nomeArquivo = response.data.nomeArquivo;
                    $scope.nomeFruta = response.data.nomeFruta;                    

                }, function erroCallback(response) {
                    console.log('Error');
                    console.log(response);
                });
        }

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
            //console.log(response.data[0]);
            $scope.imagens = response.data;
        }, function erroCallback(response) {
            console.log('Error');
            console.log(response);
        });

    }]);


})();