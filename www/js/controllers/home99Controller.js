var reloadpage = false;
var configreload = {};
angular.module('starter')

    .controller('Home99Ctrl', function ($scope, $window, $location, MyServices, $ionicLoading, $timeout,
        $sce, $ionicSlideBoxDelegate, HomePage5Info, RSS, $rootScope, $q,
        $http, $state, Banner, HeaderLogo, Footer, $localForage, Config,
        $stateParams, $cordovaToast, MenuData, ArticlesInfo, NewRss) {

        // ------------------------------ I N I T I A L I Z E -----------------------------

        var devH = $window.innerHeight;
        var devW = $window.innerWidth;
        $scope.sliderheight = { 'max-height': 0.44 * devH + 'px', 'height': 0.44 * devH + 'px', 'width': devW + 'px' };
        $scope.fullDim = { 'height': devH + 'px', 'width': devW + 'px' };
        $scope.RSSCat = { 'min-height': devW / 2 + 'px' };
        $scope.promo_banner = { 'max-height': 0.15 * devH + 'px', 'height': 0.15 * devH + 'px', 'width': devW + 'px' };
        $scope.visibleRSS = { 'height': (0.41 * devH) - 44 - 50 + 'px' };
        $scope.menudata = MenuData.data;
        console.log($scope.menudata);
        $scope.menuLoading = true;
        $scope.slider1Loading = true;
        $scope.slider2Loading = true;
        $scope.RSSLoading = true;
        $scope.swiper = {};

        var loginstatus = false;
        var menu = {};
        menu.setting = false;

        $scope.slides = HomePage5Info.data;
        $scope.banners = HomePage5Info.promos;

        var promises = [];
        $scope.RSS = RSS.data;
        console.log($scope.RSS);

        // ------------------------------ D I R E C T  A P I  C A L L S -----------------------------


        Footer.getfooterlinks().then(function (data) {
            // console.log(data);
            $rootScope.footerLinks = data;
        })

        // HEADER LOGO - BUSINESS IMAGE
        // HeaderLogo.getheaderlogo().then(function (data) {
        //     console.log(data);
        //     // $scope.headerLogo = "http://business.staging.appturemarket.com/uploads/header-logo/"+data;
        // },
        //     function (err) {
        //         console.log(err);
        //     })
        $rootScope.headerLogo = "img/tech2header.png";

        // ------------------------------ I N N E R  F U N C T I O N S -----------------------------

        //Checks for URL in page title, for RSS feed
        function isURL(s) {
            var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
            return regexp.test(s);
        }

        // MAIN SLIDER
        function loadMainSlider() {
            $scope.slider1Loading = true;
            if (HomePage5Info.data.length == 0) {
                // console.log('service empty');
                $localForage.getItem('mainSlider').then(function (forageData) {
                    // console.log(forageData);
                    if (forageData != null && !_.isEmpty(forageData)) {
                        // console.log('forage exists');
                        $scope.slides = angular.copy(forageData);
                        $scope.slider1Loading = false;
                        // $timeout(function() {
                        //     $ionicSlideBoxDelegate.$getByHandle('slides').update();
                        // },50);
                    }
                    else {
                        // console.log('no forage');
                        fetchInnerSliders();
                    }
                });
            }
            else {
                // console.log('from service')
                $scope.slider1Loading = false;
                // $timeout(function() {
                //     $ionicSlideBoxDelegate.$getByHandle('slides').update();
                // },50)
            }
        }

        // PROMOS SLIDER
        function loadPromoSlider() {
            $scope.slider2Loading = true;
            if (HomePage5Info.promos.length == 0) {
                $localForage.getItem('promoSlider').then(function (forageData) {
                    if (forageData != null && !_.isEmpty(forageData)) {
                        _.each(forageData, function (n) {
                            $scope.banners.push(n);
                        })
                        $scope.slider2Loading = false;
                        dataChangeHandler();
                        // $timeout(function() {
                        $ionicSlideBoxDelegate.$getByHandle('promotion').update();
                        // },50);
                    }
                    else {
                        fetchPromoSliders();
                    }
                });
            }
            else {
                // console.log('from service')
                $scope.slider2Loading = false;
                dataChangeHandler();
                // $timeout(function(){
                $ionicSlideBoxDelegate.$getByHandle('promotion').update();
                // },50)
            }
        }

        //RSS DATA
        function loadRSS() {
            //RSS data stored in service and fetched only if service is empty
            $ionicLoading.show();
            if (RSS.data.length == 0) {
                // console.log('RSS service empty');
                $scope.RSS.length = 0;
                $localForage.getItem('rssData').then(function (forageData) {
                    console.log(forageData);
                    if (forageData != null && !_.isEmpty(forageData)) {
                        _.each(forageData, function (n) {
                            $scope.RSS.push(n);
                        });
                        $ionicLoading.hide();
                    }
                    else {
                        console.log('from loadrss');
                        fetchRSSData();
                    }
                });
            }
            else {
                $ionicLoading.hide();
                $scope.RSSLoading = false;
                console.log('RSS service filled');
                console.log(RSS.data);
            }
        }


        function fetchInnerSliders() {
            //Home slider images data stored in service and fetched only if service is empty
            MyServices.getallsliders(function (data) {

                // console.log(data);
                $scope.slides = angular.copy(data);
                // _.each($scope.slides.menu, function (n) {
                //     n.fullImageLink = adminimage + n.image;
                // })
                // console.log($scope.slides);

                _.each($scope.slides.menu, function (n) {
                    switch (n.linktype) {
                        case '3':
                            n.typeid = n.event;
                            break;
                        case '6':
                            n.typeid = n.gallery;
                            break;
                        case '8':
                            n.typeid = n.video;
                            break;
                        case '10':
                            n.typeid = n.blog;
                            break;
                        case '2':
                            n.typeid = n.article;
                            break;
                        default:
                            n.typeid = 0;
                    }
                    if (n.linktypelink == 'home') {
                        n.linktypelink = $rootScope.thisIsHome;
                    }
                })

                // console.log($scope.slides);
                $localForage.setItem('mainSlider', $scope.slides);
                // console.log('slides saved in forage');
                $scope.slider1Loading = false;
                // $timeout(function() {
                //     $ionicSlideBoxDelegate.$getByHandle('slides').update();
                // },50);
            }, function (err) {
                $location.url("/access/offline");
            });
        }

        function fetchPromoSliders() {
            //Promos slider images data stored in service and fetched only if service is empty
            Banner.getAllPromotions().then(function (data) {
                _.each(data, function (n) {
                    $scope.banners.push(n);
                })
                _.each($scope.banners, function (n) {
                    switch (n.linktype) {
                        case '3':
                            n.typeid = n.event;
                            break;
                        case '6':
                            n.typeid = n.gallery;
                            break;
                        case '8':
                            n.typeid = n.video;
                            break;
                        case '10':
                            n.typeid = n.blog;
                            break;
                        case '2':
                            n.typeid = n.article;
                            break;
                        default:
                            n.typeid = 0;
                    }
                    if (n.linktypelink == 'home') {
                        n.linktypelink = $rootScope.thisIsHome;
                    }
                })
                // console.log($scope.banners);
                $localForage.setItem('promoSlider', $scope.banners);
                dataChangeHandler();
                $scope.slider2Loading = false;
                // $timeout(function() {
                $ionicSlideBoxDelegate.$getByHandle('promotion').update();
                // },50);

            });
        }

        

        function fetchConfigData() {
            MyServices.getallfrontmenu(function (data) {
                MyServices.setconfigdata(data);
                Config.data = data;
                console.log(data);
                $localForage.setItem('config', data);

                // sortRssLinks(data);
            }, function (err) {
                $state.go('access.offline');
            })
        }

        function fetchRSSData() {

            NewRss.getAllFeeds(function (data) {
                console.log(data);
                _.each(data.data, function (feed) {
                    $scope.RSS.push(feed);
                    $localForage.setItem('rssData', data.data);
                });
                $ionicLoading.hide();
            }, function (err) {
                $state.go('access.offline')
            });
        }

        // ------------------------------ S C O P E  F U N C T I O N S -----------------------------

        $scope.options = {
            loop: true,
            effect: 'slide',
            initialSlide: 1,
            speed: 500,
            pagination: false
        }

        function dataChangeHandler() {
            // call this function when data changes, such as an HTTP request, etc
            if ($scope.slider) {
                $scope.slider.updateLoop();
            }
        }

        $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
            // grab an instance of the slider
            $scope.slider = data.slider;
        });

        $rootScope.footerLink = function (links) {
            switch (links.linktype) {
                case '3':
                    links.typeid = links.event;
                    break;
                case '6':
                    links.typeid = links.gallery;
                    break;
                case '8':
                    links.typeid = links.video;
                    break;
                case '10':
                    links.typeid = links.blog;
                    break;
                case '2':
                    links.typeid = links.article;
                    break;
                default:
                    links.typeid = 0;

            }

            if (links.linktype == '2') {
                MyServices.isUrl(links.articlename).then(function (data) {
                    console.log(data);
                    if (data == 'nonRssUrl') {
                        if (window.cordova) {
                            cordova.InAppBrowser.open(links.articlename, '_blank', 'location=no');
                        }
                        else {
                            window.open(links.articlename, '_blank');
                        }
                        return;
                    }
                    else {
                        if (links.name == "Phone Call") {
                            window.open('tel:' + ('+1' + $rootScope.phoneNumber), '_system');
                        }
                        else if (links.linktypename == "Home") {
                            $state.go("app." + $rootScope.homeLink);

                        }
                        else {
                            $state.go("app." + links.linktypelink, { id: links.typeid, name: links.name });
                        }
                    }
                })
            }
            else {
                if (links.name == "Phone Call") {
                    window.open('tel:' + ('+1' + $rootScope.phoneNumber), '_system');
                }
                else if (links.linktypename == "Home") {
                    $state.go("app." + $rootScope.homeLink);

                }
                else {
                    $state.go("app." + links.linktypelink, { id: links.typeid, name: links.name });
                }
            }
        }

        $scope.goToRssSingle = function (cat, index) {
            // console.log(title);
            $state.go('app.RssNewSingle', { cat: cat, index: index });
        }

        function refreshRSS() {
            $localForage.setItem('rssData', null);
            $scope.RSS.length = 0;
            fetchRSSData();
        }

        $scope.refreshAllData = function () {
            $localForage.setItem('mainSlider', null);
            $localForage.setItem('promoSlider', null);
            // HomePage5Info.promos.length = 0;
            // HomePage5Info.data.length = 0;
            // RSS.data.length = 0;
            $scope.banners.length = 0;
            $scope.slides.length = 0;

            loadMainSlider();
            loadPromoSlider();
            refreshRSS();
        }

        function init() {
            // $scope.refreshSlider = true;
            // $timeout(function(){
            //     $scope.refreshSlider = false;
            // },100);
            loadMainSlider();
            loadPromoSlider();
            loadRSS();
        }

        $scope.$on("$ionicView.enter", function (event, data) {
            init();
            console.log('init')
        });

        if ($stateParams.trigger) {
            refreshRSS();
            if (window.cordova) {
                $cordovaToast.showShortCenter('Current feed was removed by Admin');
            }
        }
    })
    ;
