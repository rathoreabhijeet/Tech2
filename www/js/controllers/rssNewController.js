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
        $scope.RSSCat = {'min-height': devWidth / 2 + 'px'}

        var promises = [];
        var categories = [];
        $scope.RSS = RSS.data;

        //Checks for URL in page title, for RSS feed
        function isURL(s) {
            var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
            return regexp.test(s);
        }

        function fetchRssData(){
            $ionicLoading.show();
            $scope.RSS.length = 0;

            NewRss.getAllFeeds(function (data) {
                console.log(data);
                _.each(data.data, function (feed) {
                    $scope.RSS.push(feed);
                })
                
                $localForage.setItem('rssData', $scope.RSS);
                $localForage.getItem('rssData').then(function(data){
                    console.log(data);
                });
                $scope.RSSLoading = false;
                $ionicLoading.hide();
            }, function (err) {
                $state.go('access.offline');
            })
               
        }
        
        function sortRssLinks(data) {
            $scope.menudata = [];

            // console.log(data);
            _.each(data.menu, function (n, index) {
                if (n.linktypelink != "setting" && n.linktypelink != "contact" && n.linktypelink != "profile") {
                    var newmenu = {};
                    newmenu.id = n.id;
                    newmenu.name = n.name;

                    newmenu.order = n.order;
                    newmenu.icon = n.icon;
                    newmenu.link_type = n.linktypename;
                    newmenu.articlename = n.articlename;
                    switch (n.linktype) {
                        case '3':
                            newmenu.typeid = n.event;
                            break;
                        case '6':
                            newmenu.typeid = n.gallery;
                            break;
                        case '8':
                            newmenu.typeid = n.video;
                            break;
                        case '10':
                            newmenu.typeid = n.blog;
                            break;
                        case '2':
                            newmenu.typeid = n.article;
                            break;
                        default:
                            newmenu.typeid = 0;
                    }
                    newmenu.link = n.linktypelink;
                    // $rootScope.homeName = 'Home';

                    //If there is URL in page name, it means it contains RSS feed links
                    if (n.linktypename == "Pages" && isURL(n.articlename)) {
                        $rootScope.RSSarray.push(newmenu);
                    }
                    console.log($rootScope.RSSarray);
                }
            });
            fetchRssData();
        }

        function fetchConfigData() {
            MyServices.getallfrontmenu(function (data) {
                MyServices.setconfigdata(data);
                Config.data = data;
                console.log(data);
                $localForage.setItem('config', data);

                sortRssLinks(data);
            }, function (err) {
                $state.go('access.offline');
            })
        }

        console.log(RSS.data);
        //Checking if RSS service contains any data
        if (RSS.data.length == 0) {
            //RSS service is empty
            fetchRssData();
            if(categories.length>2 && categories[1].trim()!=''){
                $scope.showCategoryBar = true;
            }
        }
        else {
            console.log('rss service filled');
            if(categories.length>2 && categories[1].trim()!=''){
                $scope.showCategoryBar = true;
            }
            $timeout(function(){
                $scope.selectedCategory = $scope.categories[0];
            },10)
            $ionicLoading.hide();
        }
        
        $scope.refreshAllRSS = function(){
            $scope.categories.length=0;
            RSS.feeds.length = 0;
            promises = [];
            categories = [];
            fetchRssData();
            if(categories.length>2 && categories[1].trim()!=''){
                $scope.showCategoryBar = true;
            }
            console.log(RSS);
        }

        // console.log(RSS.data);

        $scope.changeCategory = function (category) {
            $scope.selectedCategory = category;
            console.log($scope.selectedCategory);
        }

        $scope.goToRssSingle = function (name, title) {
            // console.log(title);
            $state.go('app.RSSsingle', {name: name, title: title});
        }


        $scope.refreshAllData = function () {
            $localForage.setItem('rssData', null);
            $scope.RSS.length = 0;
            $scope.categories.length = 0;
            $rootScope.RSSarray = [];
            promises = [];
            categories = [];
            fetchConfigData();
        }

    })
