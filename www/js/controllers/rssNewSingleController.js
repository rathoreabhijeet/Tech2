var reloadpage = false;
var configreload = {};
angular.module('starter')

    .controller('RssNewSingleCtrl', function ($scope, $stateParams, MyServices, $ionicLoading, RSS, $state, $window,
        $ionicSlideBoxDelegate, $ionicHistory, $rootScope, $timeout, Config, $localForage,
        $ionicScrollDelegate, NewRss) {

        // $scope.loading = true;
        var devH = $window.innerHeight;
        var devW = $window.innerWidth;
        $scope.fullDim = { 'height': devH + 'px', 'width': devW + 'px' };

        var feedObject = {};
        var feedExists = false;
        $scope.feedIndex = parseInt($stateParams.index);
        var prevFeedIndex = 0;
        var title;
        var name;
        var firstload = true;
        $scope.showList = false;
        // $scope.feedItems = [];
        $scope.RssFeeds = RSS.data;

        // $scope.feedItems = RSS.data[$scope.feedIndex].articles;
        console.log($scope.RssFeeds);

        function fetchRss() {
            prevFeedIndex = $scope.feedIndex;
            console.log($scope.feedIndex);
            $scope.title = RSS.data[$scope.feedIndex].category_title;

            // $scope.feedIndex = index;
            $ionicSlideBoxDelegate.slide($scope.feedIndex, 700);
            console.log(RSS.data);
            //Check for data in service service 
            if (RSS.data[$scope.feedIndex].articles.length) {
                // $scope.feedItems = RSS.data[$scope.feedIndex].articles;
                $ionicLoading.hide();
            }
            else {
                //Check data in local forage
                // $scope.feedItems.length = 0;
                $ionicLoading.show();
                checkLocalForageData();
            }
        }

        $scope.goToRssArticle = function (index) {
            $state.go('app.RSSarticle', { index: index, parent: $scope.feedIndex });
        }


        $scope.goToNextRSS = function () {
            if ($scope.feedIndex < $scope.RssFeeds.length - 1) {
                $scope.feedIndex = $scope.feedIndex + 1;
                fetchRss();
            }
            else {
                console.log('no more slides');
                if (window.cordova) {
                    $cordovaToast.showShortBottom('This is the last channel');
                }
            }
        };

        $scope.goToPreviousRSS = function () {
            if ($scope.feedIndex > 0) {
                $scope.feedIndex = $scope.feedIndex - 1;
                fetchRss();
            }
            else {
                //toast
                console.log('no more slides');
                if (window.cordova) {
                    $cordovaToast.showShortBottom('This is the first channel');
                }
            }
        };

        $scope.nextOrPrev = function () {
            $ionicScrollDelegate.$getByHandle('main').scrollTop();
            if (!$scope.buttonClicked && !firstload) {
                console.log('next or prev');
                console.log(prevFeedIndex);
                $timeout(function () {
                    console.log($ionicSlideBoxDelegate.currentIndex());
                    if (prevFeedIndex < $ionicSlideBoxDelegate.currentIndex()) {
                        $scope.goToNextRSS();
                    }
                    else {
                        $scope.goToPreviousRSS();
                    }
                }, 500);

            }
        }

        function checkLocalForageData() {
            $localForage.getItem('rssData').then(function (data) {
                if (data != null) {
                    if (data[$scope.feedIndex].articles.length) {
                        // $scope.feedItems = angular.copy(data[$scope.feedIndex].articles);
                        RSS.data[$scope.feedIndex].articles = data[$scope.feedIndex].articles;
                        console.log(data);
                        // console.log($scope.feedItems);
                        console.log($scope.feedIndex);
                        console.log(RSS.data);
                        console.log(RSS.data[$scope.feedIndex].articles);
                        $ionicLoading.hide();
                    }
                    else {
                        $scope.fetchFeedData();
                    }
                }
                else {
                    $scope.fetchFeedData();
                }

            });
        }

        $scope.lockSlide = function () {
            console.log('lockslide');
            // Initialize slide-box with number of slides
            // Auto initialized by service
            $ionicSlideBoxDelegate.update();
            $timeout(function () {
                console.log($ionicSlideBoxDelegate.slidesCount());
            }, 100)
            $ionicSlideBoxDelegate.enableSlide(false);

            $ionicLoading.show();
            fetchRss();
        };

        $scope.fetchFeedData = function () {
            // YoutubeFeeds.data = [];

            var index = RSS.data[$scope.feedIndex].category_id;
            console.log(index);
            NewRss.getSingleFeed(parseInt(index), function (data) {
                console.log(data);
                _.each(data.data[0].articles, function (n) {
                    var fullTitle = n.title;
                    if (fullTitle.indexOf('-') != -1) {
                        n.title = fullTitle.substring(0, fullTitle.indexOf('-') - 1);
                        n.subTitle = fullTitle.substring(fullTitle.indexOf('-') + 1);
                    }
                })
                // $scope.feedItems = angular.copy(data.data[0].articles);
                RSS.data[$scope.feedIndex].articles = data.data[0].articles;
                $localForage.setItem('rssData', RSS.data);
                $localForage.getItem('rssData').then(function (data) {
                    console.log(data);
                    $ionicLoading.hide();
                });
                // console.log($scope.feedItems);
                console.log($scope.RssFeeds);
            }, function (err) {
                $state.go('access.offline');
            })
        }

    })
