var EnvironmentDetector = (function(){
	//detect device type with js
	var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : null;
	
	return {
		//device
		deviceType: deviceType,
		isMobileApp : deviceType ? true : false,
		isWeb : deviceType ? false : true,
		isIPhone : deviceType && deviceType.toLowerCase() === 'iphone',
		isIPad : deviceType && deviceType.toLowerCase() === 'ipad',
		isiOS : deviceType && deviceType.toLowerCase() === 'ios',
		isAndroid : deviceType && deviceType.toLowerCase() === 'android',
		platformVersion: (window.device && window.device.version) ? window.device.version : null,
		model: (window.device && window.device.model) ? window.device.model : null,
	}

});

$(document).ready(function(){
	window.ENV = EnvironmentDetector();	
});

//--------------------------------------------------------
$.ajaxSetup({
  cache: true
});
//--------------------------------------------------------

var copyProperties = (function(obj, keys){

});

//--------------------------------------------------------

var loadGoogleMapAPI = (function (key, onSuccess, onError, global) {
    "use strict";
    
    if(!global && window){
    	var global = window;
    }
 
    if(typeof google !== 'undefined' && google.maps){
    	onSuccess();
    } else {
    	global.onGoogleMapsApiLoaded = function(){
    		onSuccess();
    	}
	 	$.getScript('https://maps.googleapis.com/maps/api/js?key='+key+'&sensor=true&callback=onGoogleMapsApiLoaded')
	 	 .fail(function(jqxhr, settings, exception){
	 	 	(typeof onError === 'function') && onError();
	 	 });
    }
    
});


//--------------------------------------------------------


var GoogleMapClass = (function(configs){
	"use strict"; 	
	if(!configs || !configs.map_div){
		alert('Please provide map_div');
	}  

	var infoWindows = [];

	configs.center = configs.center || { lat: 16.863159, lng:96.151571},
    configs.zoom   = configs.zoom || 12;
    configs.disableDefaultUI = configs.disableDefaultUI || true;
    configs.scaleControl = true;
    configs.zoomControl = true;
    configs.scaleControlOptions = {
    	position:google.maps.ControlPosition.BOTTOM_CENTER//no working
    }

	//initializations
	var map = new google.maps.Map(document.getElementById(configs.map_div), configs);
	map.data.setStyle({
	  	fillColor: 'transparent',
	  	strokeWeight: 1
	});

	//Sorry google. Just that this is annoying to user.
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
		    	google.maps.event.addListener(marker, 'click', function() {
		    		
		    		var l=infoWindows.length;
		    		for(var i=0; i<l;i++){
		    			infoWindows[i].close && infoWindows[i].close();
		    		}
		    		infoWindows = [];

			    	marker.infowindow = new google.maps.InfoWindow({
					    content: infoWindow.content || ''
				    });
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
				console.log(list[i]);
				var lat_lng = list[i].lat_lng;
				placemarks.push(this.AddPlacemark(lat_lng, list[i]));
			}
			
			return placemarks;
		}



	}
});



//--------------------------------------------------------