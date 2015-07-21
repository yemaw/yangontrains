"use strict";

var LocalConfigClass = (function (prefixIn, defaultsIn){
    var prefix = prefixIn ? prefixIn+'_' : '';

    var defaults = defaultsIn || {};

    return {
        get:function(key, defaultValue){
            key = prefix+key;
            var localValue = localStorage.getItem(key);
            if(typeof localValue !== 'undefined' && localValue !== null){
                return localValue;
            } else if(typeof defaultValue !== 'undefined'){
                return defaultValue;
            } else if (typeof defaults[key] !== 'undefined'){
                return defaults[key];
            } else {
                return;
            }
        },
        set:function(key, value){
            if(typeof value === 'object'){
                value = JSON.stringify(value);
            }
            localStorage.setItem(prefix+key, value);
        }
    };
});

var ParseConfigWrapperClass = (function (defaultsIn, pullIntervalMilliseconds){

    var defaults = defaultsIn || {};
    Parse.Config.get().then(function(config){}, function(err){});
    var pullIntervalMilliseconds = pullIntervalMilliseconds || 60 * 1000; //12 * 60 * 60 * 1000

    if(typeof parse_refresh_interval !== 'undefined' && parse_refresh_interval !== null){
        clearTimeout(parse_refresh_interval);
    }

    window.parse_refresh_interval = setInterval(function(){
        Parse.Config.get().then(function(config){
            $(document).trigger('configs_refreshed',{});
        }, function(){});
    },pullIntervalMilliseconds);

    return {
        get:function(key, defaultValue){
            var parseValue = Parse.Config.current().get(key);
            if(typeof parseValue !== 'undefined' && parseValue !== null){
                return parseValue;
            } else if(typeof defaultValue !== 'undefined'){
                return defaultValue;
            } else if (typeof defaults[key] !== 'undefined'){
                return defaults[key];
            } else {
                return;
            }
        }
    };
});

var LocalizationClass = (function(values){

    var values = values || {};

    return (function(key, fallbackValue){
        if(values[key]){
            return values[key];
        } else if(typeof fallbackValue !== 'undefined'){
            return fallbackValue;
        } else {
            return;
        }
    });
});

var DatasetReaderClass = (function (datasetIn){

    var dataset = datasetIn;
    return {
        GetAll:function(collection){
            return dataset[collection];
        },

        GetRowsContains:function(collection, search_text, search_inside, casesensitive){
            if(!collection) {
                return;
            }
            var search_text = search_text || '';
            var casesensitive = casesensitive || false;
            var search_inside = search_inside || false;
            var rows = _.filter(dataset[collection],function(row){

                if(!search_inside) {
                    search_inside = [];
                    var keys = Object.keys(row);
                    for(var i=0; i<keys.length; i++){
                        if(row.hasOwnProperty(keys[i])){
                            search_inside.push(keys[i]);
                        }
                    }
                }

                for(var i=0; i<search_inside.length; i++){
                    search_text = search_text+'';
                    var search_row = row[search_inside[i]]+'';
                    if(!casesensitive){
                        search_row = search_row.toLowerCase();
                        search_text = search_text.toLowerCase();
                    }
                    if(search_row.indexOf(search_text) >= 0){
                        return true;
                    }
                }
                return false;

            });

            return rows;
        },

        GetRowsExact:function(collection, search_text, search_inside, casesensitive){
            if(!collection) {
                return;
            }
            var search_text = search_text || '';
            var casesensitive = casesensitive || false;
            var search_inside = search_inside || false;
            var rows = _.filter(dataset[collection],function(row){

                if(!search_inside) {
                    search_inside = [];
                    var keys = Object.keys(row);
                    for(var i=0; i<keys.length; i++){
                        if(row.hasOwnProperty(keys[i])){
                            search_inside.push(keys[i]);
                        }
                    }
                }

                for(var i=0; i<search_inside.length; i++){
                    search_text = search_text+'';
                    var search_row = row[search_inside[i]]+'';
                    if(!casesensitive){
                        search_row = search_row.toLowerCase();
                        search_text = search_text.toLowerCase();
                    }
                    if(search_row === search_text){
                        return true;
                    }
                }
                return false;

            });

            return rows;
        },

        GetRowByID: function(collection, id){
            return _.findWhere(dataset[collection], {"id":id});
        },

        JoinExact:function(collection, collectionObjects, of_key, to_key){
            if(!collection || !collectionObjects || !of_key || !to_key){
                return;
            }
            var $this = this;

            var t = collectionObjects.length;
            for(var i =0; i<t; i++){
                if(collectionObjects[i][of_key]){
                    collectionObjects[i][to_key] = $this.GetRowByID(collection, collectionObjects[i][of_key]);
                }
            }
            return collectionObjects;
        }
    }
});

var GoogleMapWrapperClass = (function(configs){
    "use strict";

    if(!configs || !configs.map_div){
        alert('Please provide map_div');
    }

    var infoWindows = [];

    configs.center = configs.center || { lat: 16.863159, lng:96.151571},
    configs.zoom   = configs.zoom || 11;
    configs.disableDefaultUI = configs.disableDefaultUI || true;
    configs.scaleControl = true;
    configs.zoomControl = true;
    configs.scaleControlOptions = {
        position:google.maps.ControlPosition.BOTTOM_CENTER//not working
    }

    //initializations
    var map = new google.maps.Map(document.getElementById(configs.map_div), configs);
    map.data.setStyle({
        fillColor: 'transparent',
        strokeWeight: 1
    });

    //Sorry google. Just that this is annoying to user on small screen devices.
    function tryRemoveTaC(){
        var els = document.getElementsByClassName('gmnoprint');
        for (var i = 0, l = els.length; i < l; i++) {
            var el = els[i];
            if(el && el.style && el.style['z-index'] && (parseInt(el.style['z-index']) > 1000000) && el.style['bottom'] && (el.style['bottom'] == '0px')) {
                el.parentNode.removeChild(el);
            }
        }
    }
    setTimeout(function(){tryRemoveTaC();setTimeout(function(){tryRemoveTaC();setTimeout(function(){tryRemoveTaC();setTimeout(function(){tryRemoveTaC();},3000);},3000);},3000);},3000);

    return {
        map: map,
        GetMap: function(){
            return map;
        },
        SetZoom: function(level){
            map.setZoom(level);
        },
        SetCenter : function(lat, lng){
            var pt = new google.maps.LatLng(lat, lng);
            map.setCenter(pt);
        },
        DrawLine:function(coordinatesIn,optionsIn){
            var options = optionsIn || {};
            var l = coordinatesIn.length, coordinates = [];
            for(var i=0; i<l;i++){
                var lat_lng = coordinatesIn[i];
                if(typeof lat_lng === 'string'){
                    var latlng = lat_lng.split(',');
                    lat_lng = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
                } else if (typeof lat_lng === 'object' && lat_lng.lat && lat_lng.lng){
                    lat_lng = new google.maps.LatLng(lat_lng.lat, lat_lng.lng);
                }
                coordinates.push(lat_lng);
            }
            var path = new google.maps.Polyline({
                path: coordinates,
                strokeColor: options.strokeColor || '#2c3e50',
                strokeOpacity: options.strokeOpacity || 1.0,
                strokeWeight: options.strokeWeight || 2
            });

            path.setMap(map);
        },
        FitBounds:function(coord_1, coord_2){
            if(typeof coord_1 === 'string'){
                var latlng = coord_1.split(',');
                coord_1 = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
            } else if (typeof coord_1 === 'object' && coord_1.lat && coord_1.lng){
                coord_1 = new google.maps.LatLng(coord_1.lat, coord_1.lng);
            } else if (coord_1.length === 2){
                var lat = parseFloat(coord_1[0]);
                var lng = parseFloat(coord_1[1]);
                coord_1 = new google.maps.LatLng(lat, lng);
            }

            if(typeof coord_2 === 'string'){
                var latlng = coord_2.split(',');
                coord_2 = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
            } else if (typeof coord_2 === 'object' && coord_2.lat && coord_2.lng){
                coord_2 = new google.maps.LatLng(coord_2.lat, coord_2.lng);
            } else if (coord_2.length === 2){
                var lat = parseFloat(coord_2[0]);
                var lng = parseFloat(coord_2[1]);
                coord_2 = new google.maps.LatLng(lat, lng);
            }

            var bounds = new google.maps.LatLngBounds();
            bounds.extend(coord_1);
            bounds.extend(coord_2);
            map.fitBounds(bounds);

        },
        AddPlacemark:function(lat_lng, options, infoWindow){

            var title = title || '';
            if(typeof lat_lng === 'string'){
                var latlng = lat_lng.split(',');
                lat_lng = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
            } else if (typeof lat_lng === 'object' && lat_lng.lat && lat_lng.lng){
                lat_lng = new google.maps.LatLng(lat_lng.lat, lat_lng.lng);
            } else {
                //typeof debugErrorHandler === 'function' && debugErrorHandler('');

            }

            var options = options || {};
            options.position = lat_lng;
            options.map = map;
            if(options.icon && typeof options.icon === 'string'){
                options.icon = new google.maps.MarkerImage(
                    options.icon,
                    null, null, null,
                    new google.maps.Size(24, 24)
                );
            }

            var marker = new google.maps.Marker(options);

            if(infoWindow){
                marker.infowindow = new google.maps.InfoWindow({
                    content: infoWindow.content || ''
                });

                google.maps.event.addListener(marker, 'click', function() {

                    var l=infoWindows.length;
                    for(var i=0; i<l;i++){
                        infoWindows[i].close && infoWindows[i].close();
                    }
                    infoWindows = [];

                    marker.infowindow.open(map, marker);
                    infoWindows.push(marker.infowindow);
                });
            }

            return marker;
        },

        AddPlacemarks:function(list){
            var l = list.length;
            var placemarks = [];
            for(var i=0; i<l; i++){
                var lat_lng = list[i].lat_lng;
                placemarks.push(this.AddPlacemark(lat_lng, list[i]));
            }

            return placemarks;
        },

        SetPageTitle:function (text) {

            var titleDiv = document.createElement('div');
            titleDiv.style.marginTop = '26px';
            titleDiv.style.textAlign = 'center';

            var titleText = document.createElement('div');
            titleText.style.color = '#444444';
            titleText.style.fontSize = '18px';
            //titleText.style.fontWeight = 'bold';
            titleText.style.lineHeight = '24px';
            titleText.style.paddingLeft = '5px';
            titleText.style.paddingRight = '5px';
            titleText.innerHTML = text;
            titleDiv.appendChild(titleText);

            map.controls[google.maps.ControlPosition.TOP_CENTER].push(titleDiv);
        }
    }
});

var loadGoogleMapAPI = (function (key, onSuccess, onError, global) {
    "use strict";

    $.ajaxSetup({cache: true});

    if(!global && window){
        var global = window;
    }

    if (typeof google !== 'undefined' && google.maps){//already loaded
        onSuccess();
    } else {
        global.onGoogleMapsApiLoaded = (function(){
            onSuccess();
        });
        $.getScript('https://maps.googleapis.com/maps/api/js?key='+key+'&sensor=true&callback=onGoogleMapsApiLoaded')
        .fail(function(jqxhr, settings, exception){
            (typeof onError === 'function') && onError();
        });
    }
});

var EnvironmentDetector = (function(){

    var $this = this;

    $this.getScreenType =  function(){
        try{
            return (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "Web";
        } catch(e){}
        return null;
    };

    $this.isCordovaApp =  function(){
        return (typeof cordova !== 'undefined' && cordova.plugins) ? true : false;
    };

    $this.isWeb  =  function(){
        return !$this.isCordovaApp();
    };

    /*isIPhone : screenType && screenType.toLowerCase() === 'iphone',
    isIPad : screenType && screenType.toLowerCase() === 'ipad',*/

    $this.isIOS  =  function(){
        return typeof device !== 'undefined' && device.platform && device.platform.toLowerCase() === 'ios';
    };

    $this.isAndroid  =  function(){
        return typeof device !== 'undefined' && device.platform && device.platform.toLowerCase() === 'android';
    };

    /*platformVersion: (window.device && window.device.version) ? window.device.version : null,
    model: (window.device && window.device.model) ? window.device.model : null,*/

    $this.getPlatform = function(){
        return $this.isIOS() ? 'ios' : $this.isAndroid() ? 'android' : $this.isWeb() ? 'web' : '';
    };

    return $this;
});

var LocalSyncFile = (function(filepath, url){

    var $this = this;

    $this.filePath = filepath;
    $this.url = url;

    $this.ReadAsTextFile = function(onSuccess, onError){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
            fileSystem.root.getFile(filepath, null, function(fileEntry){
                fileEntry.file(function(file){
                    var fileReader = new FileReader();
                    fileReader.onloadend = function(evt) {
                        var content = evt.target.result;
                        typeof onSuccess === 'function' && onSuccess(content);
                    };
                    fileReader.readAsText(file);
                }, function(){
                    typeof onError === 'function' && onError();
                });

            }, function(){
                typeof onError === 'function' && onError();
            });
        },function(){
            typeof onError === 'function' && onError();
        });
    };

    $this.WriteAsTextFile = function(content, onSuccess, onError){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
            fileSystem.root.getFile(filepath, {create: true}, function(file){
                file.createWriter(function(fileWriter) {
                    fileWriter.onwrite = function(evt) {
                        typeof onSuccess === 'function' && onSuccess();
                    };
                    if(typeof content === 'object'){
                        content = JSON.stringify(content);
                    }
                    fileWriter.write(content);
                },function(){
                    typeof onError === 'function' && onError();
                });
            },function(){
                typeof onError === 'function' && onError();
            });
        }, function(){
            typeof onError === 'function' && onError();
        });
    };

    $this.Update = function(onSuccess, onError){
        $.getJSON(url, function(data, status){
            if(status === 'success'){
                $this.WriteAsTextFile(data,function(){
                    typeof onSuccess === 'function' && onSuccess();
                }, function(){
                    typeof onError === 'function' && onError();
                });
            }
        }).fail(function() {
            typeof onError === 'function' && onError();
        });
    };


    return $this;
});

/*
 Dependencies = https://github.com/danwilson/google-analytics-plugin
 */

var GoogleUniversalAnalyticsWrapper = (function(trackingId, platform){
    var $this = this,
        $analytics;

    $this.platform = platform;

    if(platform === 'web'){

    } else {
        if(window.analytics){
            $analytics = window.analytics;
            $analytics.startTrackerWithId(trackingId);
        }
    }

    $this.trackView = function(viewName){
        if((platform === 'ios' || platform === 'android') && $analytics && typeof $analytics.trackView === 'function'){
            $analytics.trackView(viewName+'.'+platform);
        }
    };

    $this.trackEvent = function(category, action, label, value){
        if((platform === 'ios' || platform === 'android') && $analytics && typeof $analytics.trackEvent === 'function'){
            $analytics.trackEvent(category, action, label, value);
        }
    };

    return $this;
});
