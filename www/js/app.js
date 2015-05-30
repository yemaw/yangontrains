
//App
angular.module('yangontrains', ['ionic', 'yangontrains.controllers', 'yangontrains.services', 'yangontrains.directives'])
.run(function($ionicPlatform, $rootScope) {
  
    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $rootScope.convertTime24to12 = function (time24){
        //https://getsatisfaction.com/apperyio/topics/how_do_you_convert_24_hour_time_to_am_pm_using_javascript
        var tmpArr = time24.split(':'), time12;
        if(+tmpArr[0] == 12) {
            time12 = tmpArr[0] + ':' + tmpArr[1] + ' PM';
        } else {
          if(+tmpArr[0] == 00) {
            time12 = '12:' + tmpArr[1] + ' AM';
            } else {
                if(+tmpArr[0] > 12) {
                    time12 = (+tmpArr[0]-12) + ':' + tmpArr[1] + ' PM';
                } else {
                    time12 = (+tmpArr[0]) + ':' + tmpArr[1] + ' AM';
                }
            }
        }
        return time12;
    };

    $rootScope.getHumanReadableDuration = function(diff){
        var milliseconds = parseInt((diff%1000)/100);
        var seconds = parseInt((diff/1000)%60);
        var minutes = parseInt((diff/(1000*60))%60);
        var hours = parseInt((diff/(1000*60*60))%24);

        var duration = hours>0 ? hours+' h ' : '';
        duration+= minutes+' m ';
      
        return duration;
    };

    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            //--StatusBar.styleLightContent();
        }
    });
})
.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('yangontrains', {
        url: "/yangontrains",
        abstract: true,
        templateUrl: "templates/yangontrains.html",
        controller: 'YangonTrainsController'
    })
    .state('yangontrains.routes', {
        url: '/routes',
        views: {
            'view-routes': {
                templateUrl: 'templates/view-routes.html',
                controller: 'RoutesController'
            }
        }
    })
    .state('yangontrains.route_train', {
        url: '/route_train/:id',
        views: {
            'view-routes': {
                templateUrl: 'templates/view-train.html',
                controller: 'TrainController'
            }
        }
    })
    .state('yangontrains.stations', {
        url: '/stations',
        views: {
            'view-stations': {
                templateUrl: 'templates/view-stations.html',
                controller: 'StationsController'
            }
        }
    })
    .state('yangontrains.station', {
        url: '/station/:id',
        views: {
            'view-stations': {
                templateUrl: 'templates/view-station.html',
                controller: 'StationController'
            }
        }
    })
    .state('yangontrains.trains', {
        url: '/trains',
        views: {
            'view-trains': {
                templateUrl: 'templates/view-trains.html',
                controller: 'TrainsController'
           }
        }
    })
    .state('yangontrains.train', {
        url: '/train/:id',
        views: {
            'view-trains': {
                templateUrl: 'templates/view-train.html',
                controller: 'TrainController'
            }
        }
    });
    
    $urlRouterProvider.otherwise('/yangontrains/routes');
});


//Controllers
angular.module('yangontrains.controllers', [])
.controller('YangonTrainsController', function(JSONDB, $scope,$rootScope, $ionicModal, $ionicHistory, $ionicLoading, SettingPreference) {
    $scope.modals = {};
    $scope.data = {};
    
    $scope.data.facebook_page_link = 'https://www.facebook.com/yangonbuses';
    $scope.data.app_store_link = 'https://itunes.apple.com/us/app/yangon-trains/id931205785?ls=1&mt=8';
    
    $rootScope.current_language = SettingPreference.get('language', 'mm');

    $rootScope.touchStartOnListView = function(){
        $('.searchbox, .from-textbox, .to-textbox').focusout();
        $('.searchbox, .from-textbox, .to-textbox').blur();

        if(ENV.isCordovaApp() && cordova.plugins.Keyboard && cordova.plugins.Keyboard.close && cordova.plugins.Keyboard.isVisible){
            cordova.plugins.Keyboard.close();    
        }
        
    };

    $ionicModal.fromTemplateUrl('templates/view-setting.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modals.setting = modal;
    });

    $scope.actionOpenSetting = function(){
        $scope.modals.setting.show();
    };
    $scope.actionCloseSetting = function(){
        $scope.modals.setting.hide();
    };

    $scope.actionOpenMap = function(){

        $ionicModal.fromTemplateUrl('templates/view-map.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $ionicLoading.show();
            $scope.modals.map = modal;
            $scope.modals.map.show();

            loadGoogleMapAPI( 'AIzaSyBbKPpsv8iE4lTFY2ndSKykCXUZFZvu-Ro',  function(){
                var AppMap = new GoogleMapClass({map_div:'map'});
                $scope.data.stations = JSONDB.GetRowsContains('stations', $scope.data.search_text, ['name_en', 'name_mm']);

                var l = $scope.data.stations.length, list = [];
                
                for(var i=0;i<l;i++){
                    var station = $scope.data.stations[i];
                    var lat_lng = station.lat_long ? station.lat_long : station.lat_lng ? station.lat_lng : ''; //just in case lat_long is as lat_lng
                    var title = (SettingPreference.get('lang','mm') === 'mm' && station.name_mm) ? station.name_mm : (SettingPreference.get('lang','mm') === 'en' && station.name_en) ? station.name_en : '';
                    AppMap.AddPlacemark(lat_lng, {
                        title : title,
                        icon:'images/markers/station-alzarin-512x512.png',
                        animation: google.maps.Animation.DROP,
                    },{
                        content:'<h5>'+title+'</h5>'
                    }); 
                }

                $ionicLoading.show({duration:4000});
            }, function(){
                $ionicLoading.hide();
            }, window);
            

        });
    };

    $scope.actionCloseMap = function(){
        $scope.modals.map.remove();

    };

    $scope.actionGoBack = function(){
        $ionicHistory.goBack();
    };

    $scope.actionOpenFacebookPage = function(){

    };

    $scope.actionSetLanguage = function(lang){
        SettingPreference.set('language', lang);
        $rootScope.current_language = SettingPreference.get('language', 'mm');
        $rootScope.$broadcast("current_language_changed");
    };
})
.controller('RoutesController', function($scope, $rootScope, JSONDB, $ionicLoading, SettingPreference) {
    $ionicLoading.show();
    $scope.at_top = false;
    $scope.inputs = {route_from:'',route_to:'',show_all_route:true};
    var animate = (function(toTop, focusClassName, callback){
        var top, to_top;
        if(toTop === false){
            top = '180px';
            to_top = false;
        } else {
            top = '0px';
            to_top = true;
        }
        $('.adjust-route-wrapper').animate({
            'margin-top' : top
        }, 500, function() {
            $scope.at_top = to_top;
            $scope.safeApply();
            if(toTop === true && focusClassName){
                $('.'+focusClassName).focus();
            }
            
            if(typeof callback === 'function'){
                callback();
            }
        });
    });



    var filterStations = (function(keyword){
        if(keyword){
            $scope.data.stations = JSONDB.GetRowsContains('stations', keyword, ['name_en', 'name_mm']); 
        } else {
            $scope.data.stations = JSONDB.GetAll('stations');   
        }
        $scope.show_stations_autocomplete = true;
        $scope.safeApply();
    });

    $scope.inputsGetFocus = function(focusClassName, from_or_to){
        
        if(from_or_to === 'from') {
            $scope.inputs.route_from = '';
            $scope.current_from_id = '';
            $('.stations-autocomplete-wrapper').css({'margin-top':'63px'});
        }
        if(from_or_to === 'to') {
            $scope.inputs.route_to = '';
            $scope.current_to_id = '';
            $('.stations-autocomplete-wrapper').css({'margin-top':'106px'});
        }

        $('.'+focusClassName).slideDown('slow');
        $scope.current_from_or_to = from_or_to;
        $scope.focusClassName = focusClassName;
        $scope.show_route_results = false;
        if(!$scope.at_top){
            $scope.show_stations_autocomplete = false;
            $scope.safeApply();
            animate(true, focusClassName,function(){
                filterStations();
            }); 
        } else {
            filterStations();
        }
        
    };
    $scope.inputsGetBlur = function(from_or_to){
        $scope.data.stations = [];
        $scope.current_from_or_to = '';
        $scope.focusClassName = '';
        $scope.show_stations_autocomplete = false;

        $scope.safeApply();
        if($scope.at_top && !$scope.inputs.route_from && !$scope.inputs.route_to){
            $scope.at_top = false;
            //animate(false);
        }

        if($scope.current_from_id && $scope.current_to_id){
            $scope.show_route_results = true;
        }
        
        $scope.safeApply();

        if(ENV.isCordovaApp() && cordova.plugins.Keyboard && cordova.plugins.Keyboard.close && cordova.plugins.Keyboard.isVisible){
            cordova.plugins.Keyboard.close();    
        }
        
    };

    $scope.actionFromTextboxKeyUp = function(focusClassName){
        $scope.show_route_results = false;
        $scope.current_from_id = null;
        $scope.current_from_or_to = 'from';
        filterStations($scope.inputs.route_from);
    };
    $scope.actionToTextboxKeyUp = function(){
        $scope.show_route_results = false;
        $scope.current_to_id = null;
        $scope.current_from_or_to = 'to';
        filterStations($scope.inputs.route_to);
    };
    $scope.actionStationSelected = function(row){
        $scope.show_stations_autocomplete = false;
        if($scope.current_from_or_to === 'from'){
            $scope.inputs.route_from = row.name_mm; 
            $scope.current_from_id = row.id;
        }
        if($scope.current_from_or_to === 'to'){
            $scope.inputs.route_to = row.name_mm;   
            $scope.current_to_id = row.id;
        }

        if($scope.current_from_id && $scope.current_to_id){
            $scope.show_route_results = true;
            searchRoute();
        }
        
        $scope.safeApply();

        if(ENV.isCordovaApp() && cordova.plugins.Keyboard && cordova.plugins.Keyboard.close && cordova.plugins.Keyboard.isVisible){
            cordova.plugins.Keyboard.close();    
        }
    };


    var searchRoute = (function(){
        var pathOrderSorter = function(a,b){
            a = a.path_order;
            b = b.path_order;
            
            if (parseInt(a) < parseInt(b)){
                return -1;
            }
            else if (parseInt(a) > parseInt(b)){
                return 1;
            } else {
                return 0;    
            }
        };

        $ionicLoading.show();

        var from_id = $scope.current_from_id;
        var to_id = $scope.current_to_id;
        var from_station = $scope.from_station = JSONDB.GetRowByID('stations', from_id);
        var to_station = $scope.to_station = JSONDB.GetRowByID('stations', to_id);

        $scope.result_title  = '';
        $scope.result_title += ($rootScope.current_language == 'en') ? 'from ' : '';
        $scope.result_title += (($rootScope.current_language == 'en') && from_station.name_en) ? from_station.name_en : (from_station.name_mm) ? from_station.name_mm : from_station.name_en;
        $scope.result_title += ($rootScope.current_language == 'mm') ? ' မွ ' : '';

        $scope.result_title += ($rootScope.current_language == 'en') ? ' to ' : '';
        $scope.result_title += (($rootScope.current_language == 'en') && to_station.name_en) ? to_station.name_en : (to_station.name_mm) ? to_station.name_mm : to_station.name_en;
        $scope.result_title += ($rootScope.current_language == 'mm') ? ' ထိ' : '';

        if($scope.current_from_id === $scope.current_to_id){
            $scope.data.routes = [];
            $scope.show_route_results = true;
            $ionicLoading.hide();
            return;
        }

        var from_paths = JSONDB.GetRowsExact('paths', from_id,['station_id']);
        var to_paths = JSONDB.GetRowsExact('paths', to_id,['station_id']);
        
        var l1= from_paths.length;
        var l2 = to_paths.length;
        var trains = [];
        for(var i=0; i<l1; i++){
            for(var j=0; j<l2; j++){
                var fp = from_paths[i];
                var tp = to_paths[j];
                if( //logic
                    (fp.train_id === tp.train_id) && 
                    (parseInt(fp.path_order) < parseInt(tp.path_order)) 
                  ) 
                {
                    var train = JSONDB.GetRowByID('trains',fp.train_id);
                    var paths = JSONDB.GetRowsExact('paths', train.id,['train_id']);
                    paths = paths.sort(pathOrderSorter);//just make sure path is in order
                    
                    var l3 = paths.length;
                    var found_from = false, found_to = false;
                    for(var k=0; k<l3;k++){
                        var path = paths[k];
                        if(parseInt(from_id) === parseInt(path.station_id) && found_from === false && found_to === false){
                            found_from = true;
                            train.from_data = path;
                        }
                        if(parseInt(to_id) === parseInt(path.station_id) && found_to === false && found_from === true){
                            if(path.id == '645'){
                                console.log(path);
                            }
                            found_to = true;
                            train.to_data = path;
                        }
                    }
                    if(typeof train.from_data.departure_time === 'string' && typeof train.to_data.arrival_time === 'string'){
                        var t1 = train.from_data.departure_time.split(':');
                        var t2 = train.to_data.arrival_time.split(':'); 
                        if(t1.length === 2 && t2.length === 2){
                            var date1 = new Date(2000, 0, 1, parseInt(t1[0]), parseInt(t1[1])); // 9:00 AM
                            var date2 = new Date(2000, 0, 1, parseInt(t2[0]), parseInt(t2[1])); // 5:00 PM
                            if (date2 < date1) {
                                date2.setDate(date2.getDate() + 1);
                            }

                            train.diff = date2-date1;
                            if(train.diff>0){
                                train.duration = $rootScope.getHumanReadableDuration(train.diff);   
                            } else {
                                train.duration = '';
                            }
                            
                            train.departureTime = date1;


                            var now = new Date();
                            var next = date1 - new Date(2000, 0, 1, now.getHours(), now.getMinutes());
                            if(next > 0){
                                train.arriveIn = $rootScope.getHumanReadableDuration(next); 
                                train.available = true;
                            } else {
                                train.arriveIn = false;
                                train.available = false;
                            }
                        }
                    }
                    trains.push(train);
                }
            }
        }

        trains = _.sortBy(trains, 'departureTime');

        trains = _.sortBy(trains, 'diff');

        $scope.data.routes = trains;
        $scope.show_route_results = true;
        
        setTimeout(function(){
            $ionicLoading.hide();
        },300);
        
    });
    
    $scope.showAllRouteInputChanged = function(){
        $scope.safeApply();
    };
    $scope.availablityFilter = function(row,index, rows){
        /*console.log('row.available'+row.available);
        console.log('$scope.inputs.show_all_route'+$scope.inputs.show_all_route);*/
        if(row.available === false && $scope.inputs.show_all_route === false){
            return false;
        } else {
            return true;
        }
    };


    setTimeout(function(){
        $ionicLoading.hide();
        animate(false); 
    },500);
})
.controller('TrainsController', function($scope, JSONDB, $rootScope, $ionicLoading, SettingPreference) {
    $ionicLoading.show();
    $scope.data = {};
    
    $scope.filterRows = function(){
        $scope.data.trains = JSONDB.GetRowsContains('trains', $scope.data.search_text, ['name_en', 'name_mm']);
        var l = $scope.data.trains.length;
        for(var i=0; i<l; i++){
            var train = $scope.data.trains[i];
            var path = JSONDB.GetRowsExact('paths', train.id,['train_id']);
            var stations = JSONDB.JoinExact('stations', path, 'station_id', 'station');
            var start_station = stations[0]['station'];
            var end_station   = stations[stations.length-1]['station'];
            $scope.data.trains[i]['start_station'] = ($rootScope.current_language == 'en' && start_station.name_en) ? start_station.name_en : start_station.name_mm && start_station.name_mm;
            $scope.data.trains[i]['end_station']   = ($rootScope.current_language == 'mm' && start_station.name_mm) ? start_station.name_mm : start_station.name_en && start_station.name_en;           
        }
    }

    $scope.$on('current_language_changed',function(){
        $scope.filterRows();        
    });

    $scope.filterRows();
    
    setTimeout(function(){
        $ionicLoading.hide();
    },1000);
})
.controller('TrainController', function($scope, $stateParams, $rootScope, JSONDB, SettingPreference) {
    $scope.data = {};   
    $scope.display = {};    

    $scope.data.train = JSONDB.GetRowByID('trains', $stateParams.id);

    $scope.display.title = ($rootScope.current_language == 'en' && $scope.data.train.name_en) ? $scope.data.train.name_en : ($scope.data.train.name_mm && $scope.data.train.name_mm);
    $scope.display.name = ($rootScope.current_language == 'en' && $scope.data.train.name_en) ? $scope.data.train.name_en : ($scope.data.train.name_mm && $scope.data.train.name_mm);
    $scope.display.tagline = 'Stations';
    
    var path = JSONDB.GetRowsExact('paths', $stateParams.id,['train_id']);
    $scope.data.path = JSONDB.JoinExact('stations', path, 'station_id', 'station');
    
    $scope.safeApply();
})
.controller('StationsController', function($scope, JSONDB, $ionicLoading, SettingPreference) {
    $ionicLoading.show();
    $scope.data = {};
    
    $scope.filterRows = function(){
        $scope.data.stations = JSONDB.GetRowsContains('stations', $scope.data.search_text, ['name_en', 'name_mm']);
    }

    $scope.$on('current_language_changed',function(){
        $scope.filterRows();        
    });

    $scope.filterRows();
    
    setTimeout(function(){
        $ionicLoading.hide();
    },1000);
})
.controller('StationController', function($scope, $stateParams, $rootScope, JSONDB, SettingPreference) {
    $scope.data = {};   
    $scope.display = {};    

    $scope.data.station = JSONDB.GetRowByID('stations', $stateParams.id);

    $scope.display.title = ($rootScope.current_language == 'en' && $scope.data.station.name_en) ? $scope.data.station.name_en : ($scope.data.station.name_mm && $scope.data.station.name_mm);
    $scope.display.name = ($rootScope.current_language == 'en' && $scope.data.station.name_en) ? $scope.data.station.name_en : ($scope.data.station.name_mm && $scope.data.station.name_mm);
    $scope.display.tagline = $rootScope.current_language == 'en' ? 'Available Trains' : 'ေရာက္ရွိေသာရထားမ်ားး';
    
    var path = JSONDB.GetRowsExact('paths', $stateParams.id,['station_id']);
    $scope.data.path = JSONDB.JoinExact('trains', path, 'train_id', 'train');
    


    $scope.safeApply();
});

//Services
angular.module('yangontrains.services', [])
.service('JSONDB', function(){
    return new DatasetReader(yangontrains_data);
})
.service('SettingPreference', function(){
    return new Preference('setting');
});

//Directives
angular.module('yangontrains.directives', [])
.directive('myTouchstart', [function() {
    return function(scope, element, attr) {

        element.on('touchstart', function(event) {
            scope.$apply(function() { 
                scope.$eval(attr.myTouchstart); 
            });
        });
    };
}])
.directive('myTouchend', [function() {
    return function(scope, element, attr) {

        element.on('touchend', function(event) {
            scope.$apply(function() { 
                scope.$eval(attr.myTouchend); 
            });
        });
    };
}]);

