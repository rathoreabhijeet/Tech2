var reloadpage = false;
var configreload = {};
angular.module('starter')
    .controller('EventDetailCtrl', function ($scope, $stateParams, MyServices, $location, $ionicLoading, 
                                             $ionicSlideBoxDelegate, $ionicModal,$state, $rootScope, EventsInfo, $localForage) {

        $scope.video = {};
        $scope.image = {}
        var categoryIndex = 0;

        var init = function () {
            return $ionicModal.fromTemplateUrl('templates/appView/modal-video.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;

            });
        };

        $ionicModal.fromTemplateUrl('templates/appView/modal-image.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;

        });

        $scope.showVideo = function (url) {
            console.log(url);
            init().then(function () {
                $scope.modal.show();
            });
            $scope.video.url = url + "?autoplay=1";
        };
        $scope.showImage = function (url) {
            $scope.modal.show();
            $scope.image.img = url;
        };

        $scope.closeVideo = function () {
            $scope.modal.remove()
                .then(function () {
                    $scope.modal = null;
                });
        };
        $scope.closeImage = function () {
            $scope.modal.hide();
        };

        $scope.id = $stateParams.id;

        function fetchEventDetailData() {
            $ionicLoading.show({
                template: '<ion-spinner class="spinner-positive"></ion-spinner>'
            });

            categoryIndex = _.findIndex(EventsInfo.data, function (n) {
                return n.id == $stateParams.id;
            })
            $scope.eventdetail = EventsInfo.data[categoryIndex];


            console.log(EventsInfo.data);
            console.log(categoryIndex);
            if (EventsInfo.data[categoryIndex].detail) {
                console.log('service contains the gallery');
                //binding local variable to service
                $scope.eventdetail.detail = EventsInfo.data[categoryIndex].detail;
                $ionicLoading.hide();
            }
            else {
                console.log('service does not contain the gallery');
                $localForage.getItem('events').then(function (data) {
                    if (data != null) {
                        console.log('forage exists');
                        console.log(data);
                        var index = _.findIndex(data, function (n) {
                            return n.id == $stateParams.id;
                        })
                        if (index != -1 && data[index].detail) {
                            console.log('current gallery exists in forage');
                            $scope.eventdetail.detail = angular.copy(data[index].detail);
                            $ionicLoading.hide();
                        }
                        else {
                            console.log('current gallery no exist in forage');
                            loadEventDetail(1);
                        }
                    }
                    else {
                        console.log('forage no exists');
                        loadEventDetail(2);
                    }
                })
            }

        }

        function loadEventDetail(index){
            $ionicLoading.show({
                template: '<ion-spinner class="spinner-positive"></ion-spinner>'
            });
            MyServices.getsingleevents($stateParams.id, function(data){
                if (data == "") {
                    $scope.msg = "No data found";
                    addanalytics("Event detail page");
                } else {
                    $scope.msg = "";
                    addanalytics(data.title);
                }
                if (data.eventimages && data.eventimages.length > 0) {
                    data.eventimages = _.chunk(data.eventimages, 2);
                }
                if (data.eventvideos && data.eventvideos.length > 0) {
                    data.eventvideos = _.chunk(data.eventvideos, 2);
                }
                $scope.eventdetail.detail = angular.copy(data);
                $ionicSlideBoxDelegate.update();


                if (index == 1) {
                    $localForage.getItem('events').then(function (forageData) {
                        var forageIndex = _.findIndex(forageData, function (n) {
                            return n.id == $stateParams.id;
                        })
                        forageData[forageIndex].detail = $scope.eventdetail.detail;
                        $localForage.setItem('events', forageData);
                        console.log(forageData);
                        console.log('gallery saved in existing forage');
                    })

                }
                if (index == 2) {
                    var array = [];
                    array.push(EventsInfo.data[categoryIndex]);
                    $localForage.setItem('events', array);
                    console.log('gallery saved in new forage');
                }

                $ionicLoading.hide();
            }, function (err) {
                $location.url("/access/offline");
            })
        }

        fetchEventDetailData();


    })
