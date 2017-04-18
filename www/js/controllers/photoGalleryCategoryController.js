var reloadpage = false;
var configreload = {};
angular.module('starter')
    .controller('PhotoGalleryCategoryCtrl', function ($scope, MyServices, $location, $ionicLoading,
                                                      $state, $rootScope, ImagesInfo, $localForage) {
        addanalytics("Photo gallery");
        // configreload.onallpage();
        $ionicLoading.show();
        $scope.msg = "Loading....";
        $scope.pageno = 1;
        // $scope.photos = [];
        $scope.keepscrolling = true;
        $scope.photos = ImagesInfo.data;
        $scope.showloading = function () {
            $ionicLoading.show({
                template: '<ion-spinner class="spinner-positive"></ion-spinner>'
            });
            $timeout(function () {
                $ionicLoading.hide();
            }, 5000);
        };

        $scope.sendphotoid = function (id) {
            $location.url("app/photogallery/" + id);
        }


        // Fetch data from service OR local forage OR API
        function fetchImageData() {
            if (ImagesInfo.data.length == 0) {
                $ionicLoading.show({
                    template: '<ion-spinner class="spinner-positive"></ion-spinner>'
                });
                console.log('service empty');
                $localForage.getItem('images').then(function (data) {
                    if (data != null) {
                        console.log('forage exists');
                        console.log(data);
                        _.each(data,function(n){
                            $scope.photos.push(n);
                        })
                        $ionicLoading.hide();
                    }
                    else {
                        console.log('forage no exists');
                        loadgallery(1);
                    }
                })
            }
            else {
                console.log('service filled');
                $ionicLoading.hide();
            }
        }


        function loadgallery (pageno) {
            MyServices.getallgallery(pageno, function (data, status) {

                _.each(data.queryresult, function (n) {
                    $scope.photos.push(n);
                });

                if (data.queryresult == '') {
                    $scope.keepscrolling = false;
                }

                if ($scope.photos.length == 0) {
                    $scope.msg = "The gallery is empty.";
                } else {
                    $scope.msg = "";
                }
                console.log($scope.photos);
                $localForage.setItem('images', $scope.photos);
                $ionicLoading.hide();

            }, function (err) {
                $location.url("/access/offline");
            });
        }

        $scope.loadMorePolls = function () {
            loadgallery(++$scope.pageno);
        }

        fetchImageData();

        $scope.refreshAllData = function () {
            $scope.photos.length = 0;
            loadgallery(1);
        }
    })
