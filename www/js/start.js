window.APP_VERSION = '0.0';
window.APP_VERSION_CODE = 2;

Parse.initialize('F5PDVVr50MdBrdBTQqp5fuksYRixEIX4GE0gkeK7','rdiBqEdXqKZ2GuTEyvmRsIEc2lanobhTh3rScSDM');

window.LocalConfig = new LocalConfigClass('setting');
window.ParseConfig = new ParseConfigWrapperClass({

    //Links
    'link_JsonDBDownloadURL': 'http://api.yemaw.me/yangontrains/download/json.php',

    'link_FacebookPageLink'  : 'https://www.facebook.com/807409185947603',

    'link_AppStoreLink_web' : 'https://play.google.com/store/apps/details?id=me.yemaw.yangontrains&hl=en',
    'link_AppStoreLink_ios' : 'https://itunes.apple.com/us/app/yangon-trains/id931205785?ls=1&mt=8',
    'link_AppStoreLink_android' : 'market://details?id=me.yemaw.yangontrains',

    //Keys
    'key_GATrackingID_mobile' : 'UA-54766351-2',
    'key_GATrackingID_web' : 'UA-54766351-3',

    //Others
    'txt_About' : 'Yangon Trains Application သည္ ရန္ကုန္ၿမိဳ႕တြင္း ၿမိဳ႔ပါတ္ရထားျဖင့္ သြားလာရ လြယ္ကူႏိုင္ေစရန္ ေရးသားထားျခင္း ျဖစ္သည္။ ရထား၀င္ခ်ိန္၊ ထြက္ခ်ိန္မ်ားမွာ ျမန္မာ့မီးရထားမွ စံသတ္မွတ္ထားေသာ အခ်ိန္မ်ားသာျဖစ္ၿပီး အမွန္တကယ္၀င္ခ်ိန္ ထြက္ခ်ိန္တြင္ မိနစ္အနည္းငယ္ ေနာက္က်ႏိုင္ပါသည္။',
});
window.LocalizedText = new LocalizationClass({
    //Tab Titles
    'txt_RoutesTabTitle_en'   : 'Routes',
    'txt_RoutesTabTitle_mm'   : 'လမ္းေၾကာင္းရွာ',

    'txt_TrainsTabTitle_en'   : 'Trains',
    'txt_TrainsTabTitle_mm'   : 'ရထားမ်ား',

    'txt_StationsTabTitle_en' : 'Stations',
    'txt_StationsTabTitle_mm' : 'ဘူတာမ်ား',

    //Page Titles
    'txt_RoutesPageTitle_en'   : 'Yangon Trains',
    'txt_RoutesPageTitle_mm'   : 'Yangon Trains',

    'txt_TrainsPageTitle_en'   : 'Yangon Trains',
    'txt_TrainsPageTitle_mm'   : 'Yangon Trains',

    'txt_StationsPageTitle_en' : 'Yangon Trains',
    'txt_StationsPageTitle_mm' : 'Yangon Trains',

    'txt_SettingsPageTitle_en' : 'Settings' ,
    'txt_SettingsPageTitle_mm' : 'Settings',

    'txt_TrainPageTitle_en'   : 'Yangon Trains',
    'txt_TrainPageTitle_mm'   : 'Yangon Trains',

    'txt_StationPageTitle_en' : 'Yangon Trains',
    'txt_StationPageTitle_mm' : 'Yangon Trains',

    //Others
    'txt_ShowAllPath_en' : 'Show all',
    'txt_ShowAllPath_mm' : 'Show all',

    'txt_UpdatePopupTitle_en' : 'Update available',
    'txt_UpdatePopupTitle_mm' : 'Update available',
    'txt_UpdatePopupDescription_en' : 'A new version of this app is available. Do you want to update now?',
    'txt_UpdatePopupDescription_mm' : 'A new version of this app is available. Do you want to update now?',
    'txt_UpdatePopupCancle_en' : 'Later', 'txt_UpdatePopupCancle_mm' : 'Later',
    'txt_UpdatePopupYes_en' : 'Dowload', 'txt_UpdatePopupYes_mm' : 'Download'
});

window.ENV = new EnvironmentDetector();

window.JsonDB = new DatasetReaderClass(yangontrains_data);


function addPlatformSpecificClasses(){
    $('body').removeClass('is_web').removeClass('is_ios').removeClass('is_android');

    if(!ENV.getScreenType()){
        $('body').addClass('is_web');
    } else if (ENV.getScreenType() === 'ios'){
        $('body').addClass('is_mobile').addClass('is_ios');
    } else if (ENV.getScreenType() === 'android'){
        $('body').addClass('is_mobile').addClass('is_android');
    }
}

$(document).ready(function(){

    addPlatformSpecificClasses();

    /*Parse.Analytics.track('AppOpen', {
        platform: ENV.getScreenType()
    });*/
    if(!window.GA && ENV.isWeb()){
        window.GA = new GoogleUniversalAnalyticsWrapper(ParseConfig.get('key_GATrackingID_web'),'web');
    }
    //manual bootstrap
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['yangontrains']);
    });
});

document.addEventListener("deviceready", function(){
    if(ENV.isWeb()){
        return;
    }

    JsonDataFile = new LocalSyncFile('yangontrains_data.json', ParseConfig.get('link_JsonDBDownloadURL'));
    addPlatformSpecificClasses();

    if(!LocalConfig.get('APPLICATION_RUN_ONCE')){//application havn't run first time before. copy build in data into data file (in document dir)
        JsonDataFile.WriteAsTextFile(yangontrains_data,function(){
            LocalConfig.set('APPLICATION_RUN_ONCE', 'true');
        }, function(){
            //alert('write error');
        });
    } else {//application run onces before. just update the data locally
        JsonDataFile.ReadAsTextFile(function(data){
            JsonDB = new DatasetReaderClass(JSON.parse(data));
        },function(){});
    }

    //Check Database version
    window.CheckDBVersion = function(){
        if(typeof device !== 'undefined' && typeof cordova !== 'undefined'){//Ensure this is cordova app
            var latest_db_version = parseInt(ParseConfig.get('DB_LATEST_VERSION_CODE', 1));
            var current_db_version = parseInt(LocalConfig.get('DB_VERSION_CODE', 1));
            var download_url = ParseConfig.get('link_JsonDBDownloadURL');
            if (latest_db_version > current_db_version) {
                //Database Update Process
                var filepath = 'yangontrains_data.json';
                JsonDataFile.Update(function(){
                    LocalConfig.set('DB_VERSION_CODE', ParseConfig.get('DB_LATEST_VERSION_CODE', 1));
                    LocalConfig.set('DB_FILEPATH', filepath);
                    JsonDataFile.ReadAsTextFile(function(data){
                        JsonDB = new DatasetReaderClass(JSON.parse(data));//immediately update the local data copy
                        $(document).trigger('show_alert',{title:'', template:'<div class="alert_body">Database successfully updated.</div>'});
                    },function(){

                    });

                }, function(){
                    //$(document).trigger('show_alert',{title:'Database failed to update!', template:'<div class="alert_body">Database failed to update!</div>'});
                });
            } else {
                //alert('No need to update DB');
            }
        }
    };
    $(document).on('configs_refreshed',function(){//will be only in mobile
        CheckDBVersion();
    });

    //Google Analytics
    if(window.analytics){
        window.GA = new GoogleUniversalAnalyticsWrapper(ParseConfig.get('key_GATrackingID_mobile'), ENV.getPlatform());
    } else {
        //alert('Gooele Analytics not loaded');
    }

}, false);
