Parse.initialize('F5PDVVr50MdBrdBTQqp5fuksYRixEIX4GE0gkeK7','rdiBqEdXqKZ2GuTEyvmRsIEc2lanobhTh3rScSDM');

LocalConfig = new LocalConfigClass('setting', {
    'CURRENT_DB_VERSION': 1
});
ParseConfig = new ParseConfigClass({
    'CURRENT_DB_VERSION':1,

    //Tab Titles
    'txt_RoutesTabTitle_en'   : 'Route', 
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

    //Links
    'link_FacebookPageLink_web'  : 'https://www.facebook.com/807409185947603',
    'link_FacebookPageLink_ios'  : 'fb://page?id=807409185947603',
    'link_FacebookPageLink_android'  : 'fb://page?id=807409185947603',
    
    'link_AppStoreLink_web' : 'https://itunes.apple.com/us/app/yangon-trains/id931205785?ls=1&mt=8',
    'link_AppStoreLink_ios' : 'https://itunes.apple.com/us/app/yangon-trains/id931205785?ls=1&mt=8',
    'link_AppStoreLink_android' : 'market://details?id=com.theinhtikeaung.yangonbuses',

    //Others
    'txt_ShowAllPath_en' : 'Show All',
    'txt_ShowAllPath_mm' : 'Show All',

    'txt_About' : 'Yangon Trains Application သည္ ရန္ကုန္ၿမိဳ႕တြင္း ၿမိဳ႔ပါတ္ရထားျဖင့္ သြားလာရ လြယ္ကူႏိုင္ေစရန္ ေရးသားထားျခင္း ျဖစ္သည္။ ရထား၀င္ခ်ိန္၊ ထြက္ခ်ိန္မ်ားမွာ ျမန္မာ့မီးရထားမွ စံသတ္မွတ္ထားေသာ အခ်ိန္မ်ားသာျဖစ္ၿပီး အမွန္တကယ္၀င္ခ်ိန္ ထြက္ခ်ိန္တြင္ မိနစ္အနည္းငယ္ ေနာက္က်ႏိုင္ပါသည္။',
});
JsonDataFile = new LocalSyncFile('yangontrains_data.json', 'http://api.yemaw.me/yangontrains/download/json.php');
JsonDB = new DatasetReader(yangontrains_data);

$(document).ready(function(){
    ENV = EnvironmentDetector();
});

document.addEventListener("deviceready", function(){
    
    if(!LocalConfig.get('APPLICATION_RUN_ONCE')){//application havn't run first time before. copy build in data into data file (in document dir)
        JsonDataFile.WriteAsTextFile(yangontrains_data,function(){
            LocalConfig.set('APPLICATION_RUN_ONCE', 'true');
        }, function(){
            //alert('write error');
        });
    } else {//application run onces before. just update the data locally
        JsonDataFile.ReadAsTextFile(function(data){
            JsonDB = new DatasetReader(JSON.parse(data));
        },function(){});
    }

    //Check Database version 
    setTimeout(function(){
        window.CheckDBVersion = function(){
            if(typeof device !== 'undefined' && typeof cordova !== 'undefined'){//Ensure this is cordova app
                var latest_db_version = parseInt(ParseConfig.get('CURRENT_DB_VERSION', 1));
                var current_db_version = parseInt(LocalConfig.get('CURRENT_DB_VERSION', 1));
                var download_url = ParseConfig.get('DB_DOWNLOAD_URL', 'http://api.yemaw.me/yangontrains/download/json.php');

                if (latest_db_version > current_db_version) {
                    //Database Update Process
                    var filepath = 'yangontrains_data.json';
                    JsonDataFile.Update(function(){
                        LocalConfig.set('CURRENT_DB_VERSION', ParseConfig.get('CURRENT_DB_VERSION', 1));
                        LocalConfig.set('DB_FILEPATH', filepath);
                        JsonDataFile.ReadAsTextFile(function(data){
                            JsonDB = new DatasetReader(JSON.parse(data));//immediately update the local data copy
                            alert('Database updated to version '+latest_db_version);    
                        },function(){

                        });
                        
                    }, function(){
                        alert('Database failed to update.');
                    });
                } else {
                    //alert('No need to update DB');
                }
            }
        };
        CheckDBVersion();
    },3000);//wait for parse config to loaded lates db number

}, false);

