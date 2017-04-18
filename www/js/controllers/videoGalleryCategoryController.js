var reloadpage = false;
var configreload = {};
angular.module('starter')
    .controller('VideoGalleryCategoryCtrl', function ($scope, MyServices, $ionicLoading, $state, $rootScope, VideosInfo, $localForage) {
        addanalytics("Video Gallery Page");
        // configreload.onallpage();
        $ionicLoading.show();
        $scope.videos = [];
        $scope.keepscrolling = true;
        $scope.pageno = 1;
        $scope.videos = VideosInfo.data;


        function loadVideo (pageno) {
            MyServices.getallvideogallery(pageno, function (data, status) {

                _.each(data.queryresult, function (n) {
                    $scope.videos.push(n);
                });
                console.log($scope.videos);
                if (data.queryresult == '') {
                    $scope.keepscrolling = false;
                }

                if ($scope.videos.length == 0) {
                    $scope.msg = "The gallery is empty.";
                } else {
                    $scope.msg = "";
                }

                $localForage.setItem('videos', $scope.videos);
                $ionicLoading.hide();

            }, function (err) {
                $location.url("/access/offline");
            });
        }

        // Fetch data from service OR local forage OR API
        function fetchVideoData() {
            if (VideosInfo.data.length == 0) {
                $ionicLoading.show({
                    template: '<ion-spinner class="spinner-positive"></ion-spinner>'
                });
                console.log('service empty');
                $localForage.getItem('videos').then(function (data) {
                    if (data != null) {
                        console.log('forage exists');
                        console.log(data);
                        _.each(data,function(n){
                            $scope.videos.push(n);
                        })
                        $ionicLoading.hide();
                    }
                    else {
                        console.log('forage no exists');
                        loadVideo(1);
                    }
                })
            }
            else {
                console.log('service filled');
                $ionicLoading.hide();
            }
        }

        // loader
        $scope.showloading = function () {
            $ionicLoading.show({
                template: '<ion-spinner class="spinner-positive"></ion-spinner>'
            });
            $timeout(function () {
                $ionicLoading.hide();
            }, 5000);
        };

        fetchVideoData(1);

        $scope.loadMorePolls = function () {
            $scope.loadphoto(++$scope.pageno);
        }
        

        $scope.refreshAllData = function () {
            $scope.videos.length = 0;
            loadVideo(1);
        }

    })
