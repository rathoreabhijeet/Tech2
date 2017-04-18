var reloadpage = false;
var configreload = {};
angular.module('starter')
    .controller('RssNewCtrl', function ($scope, $rootScope, MyServices, $window, $q, $http, $state, RSS, $ionicLoading,
        $timeout, $localForage, Config, NewRss) {
        // console.log(RSS);
        $ionicLoading.show({
            template: '<ion-spinner class="spinner-positive"></ion-spinner>'
        });
        var devWidth = $window.innerWidth;
        $scope.RSSCat = { 'min-height': devWidth / 2 + 'px' }

        $scope.RSS = RSS.data;

        function fetchRssData() {
            $ionicLoading.show();
            $scope.RSS.length = 0;
            $localForage.getItem('rssData').then(function (foragedata) {
                if (foragedata) {
                    console.log(foragedata)
                    _.each(foragedata, function (feed) {
                        $scope.RSS.push(feed);
                    });
                    $ionicLoading.hide();
                }
                else {
                    NewRss.getAllFeeds(function (data) {
                        console.log(data);
                        _.each(data.data, function (feed) {
                            $scope.RSS.push(feed);
                        })

                        $localForage.setItem('rssData', $scope.RSS);
                        $localForage.getItem('rssData').then(function (data) {
                            console.log(data);
                        });
                        $scope.RSSLoading = false;
                        $ionicLoading.hide();
                    }, function (err) {
                        $state.go('access.offline');
                    })
                }
            })
        }

        //Checking if RSS service contains any data
        if (RSS.data.length == 0) {
            //RSS service is empty
            $ionicLoading.show();
            fetchRssData();
        }
        else {
            console.log('rss service filled');
            $ionicLoading.hide();
        }

        $scope.refreshAllRSS = function () {
            $scope.RSS.length = 0;
            $localForage.setItem('rssData', null);
            fetchRssData();
        }

        $scope.goToRssSingle = function (cat, index) {
            // console.log(title);
            $state.go('app.RssNewSingle', { cat: cat, index: index });
        }

    })
