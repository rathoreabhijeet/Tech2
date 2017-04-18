var reloadpage = false;
var configreload = {};
angular.module('starter')

    .controller('youtubeChannelCtrl', function ($scope, $stateParams, MyServices, $ionicLoading, RSS, $state, $window,
        $ionicSlideBoxDelegate, $ionicHistory, $rootScope, $timeout, Config, $localForage,
        $ionicScrollDelegate, YoutubeRss, YoutubeFeeds, $cordovaToast) {

        // $scope.loading = true;
        var devH = $window.innerHeight;
        var devW = $window.innerWidth;
        $scope.fullDim = { 'height': devH + 'px', 'width': devW + 'px' };

        var feedObject = {};
        var feedExists = false;
        var feedIndex = parseInt($stateParams.index);
        var prevFeedIndex = 0;
        var title;
        var name;
        var firstload = true;
        $scope.showList = false;
        $scope.channelVideos = [];
        $scope.channels = YoutubeFeeds.data;
        console.log($scope.channels);

        function fetchVideos() {
            console.log(feedIndex);
            $scope.title = YoutubeFeeds.data[feedIndex].channel_title;

            // feedIndex = index;
            $ionicSlideBoxDelegate.slide(feedIndex, 700);
            console.log(YoutubeFeeds.data);
            //Check for data in service service 
            if (YoutubeFeeds.data[feedIndex].feeds.length) {
                $scope.channelVideos = YoutubeFeeds.data[feedIndex].feeds;
                $ionicLoading.hide();
            }
            else {
                //Check data in local forage
                $scope.channelVideos.length = 0;
                $ionicLoading.show();
                checkLocalForageData();
            }
        }

        $scope.goToRssArticle = function (index) {
            $state.go('app.RSSarticle', { index: index, parent: feedIndex });
        }


        $scope.goToNextRSS = function () {
            if (feedIndex < $scope.channels.length - 1) {
                feedIndex = feedIndex + 1;
                fetchVideos();
            }
            else {
                console.log('no more slides');
                if (window.cordova) {
                    $cordovaToast.showShortBottom('This is the last channel');
                }
            }
        };

        $scope.goToPreviousRSS = function () {
            if (feedIndex > 0) {
                feedIndex = feedIndex - 1;
                fetchVideos();
            }
            else {
                //toast
                console.log('no more slides');
                if (window.cordova) {
                    $cordovaToast.showShortBottom('This is the first channel');
                }
            }
        };

        function checkLocalForageData() {
            $localForage.getItem('youtubeRssData').then(function (data) {
                if (data != null) {
                    if (data[feedIndex].feeds.length) {
                        $scope.channelVideos = angular.copy(data[feedIndex].feeds);
                        YoutubeFeeds.data[feedIndex].feeds = $scope.channelVideos;
                        console.log(data);
                        console.log($scope.channelVideos);
                        console.log(feedIndex);
                        console.log(YoutubeFeeds.data);
                        console.log(YoutubeFeeds.data[feedIndex].feeds);
                        $ionicLoading.hide();
                    }
                    else {
                        $scope.fetchVideoData();
                    }
                }
                else {
                    $scope.fetchVideoData();
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
            fetchVideos();
        };

        function checkRefresh() {
            var index = _.findIndex($rootScope.RSSarray, function (n) {
                return n.articlename == $stateParams.title;
            })

            if (index == -1) {
                $ionicHistory.backView().stateParams = { trigger: false };
                $ionicHistory.goBack();
            }
            else {
                RSS.feeds[feedIndex].feed.length = 0;
                init(RSS.data[feedIndex].title, RSS.data[feedIndex].name);
            }
        }


        $scope.fetchVideoData = function () {
            // YoutubeFeeds.data = [];

            var index = YoutubeFeeds.data[feedIndex].channel_id;
            console.log(index);
            YoutubeRss.getSingleFeed(parseInt(index), function (data) {
                console.log(data);
                $scope.channelVideos = angular.copy(data.data[0].videos);
                YoutubeFeeds.data[feedIndex].feeds = $scope.channelVideos;
                $localForage.setItem('youtubeRssData', YoutubeFeeds.data);
                $localForage.getItem('youtubeRssData').then(function (data) {
                    console.log(data);
                    $ionicLoading.hide();
                });
                console.log($scope.channelVideos);
            }, function (err) {
                $state.go('access.offline');
            })
        }

    })
