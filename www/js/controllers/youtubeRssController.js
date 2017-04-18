var reloadpage = false;
var configreload = {};
angular.module('starter')
    .controller('youtubeRssCtrl', function ($scope, $rootScope, MyServices, $window, $q, $http, $state, RSS, $ionicLoading,
        $timeout, $localForage, Config, YoutubeRss, YoutubeFeeds) {
        // console.log(RSS);
        $ionicLoading.show({
            template: '<ion-spinner class="spinner-positive"></ion-spinner>'
        });
        var devWidth = $window.innerWidth;
        $scope.RSSCat = { 'height': devWidth / 2 + 'px' }
        $scope.youtubeRss = YoutubeFeeds.data;

        function fetchRssData() {
            $ionicLoading.show();
            YoutubeRss.getAllFeeds(function (data) {
                console.log(data);
                _.each(data.data, function (channel) {
                    $scope.youtubeRss.push(channel);
                })
                $ionicLoading.hide();
            }, function (err) {
                $state.go('access.offline');
            })
        }

        function init() {
            //Checking if RSS service contains any data
            if ($scope.youtubeRss.length == 0) {
                //RSS service is empty
                fetchRssData();
            }
            else {
                console.log('rss service filled');
                $ionicLoading.hide();
            }
        }

        $scope.refreshRss = function () {
            YoutubeFeeds.data.length = 0;
            init();
        }

        $scope.goToRssSingle = function(channel,index){
            $state.go('app.youtubeChannel',{channel:channel,index:index})
        }

        init();


    })
