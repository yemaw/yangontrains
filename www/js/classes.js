"use strict";


var Preference = (function (prefixIn){
    var prefix = prefixIn+'_';

    return {
        get:function(key, defaultValue){
            return localStorage.getItem(prefix+key) || defaultValue;
        },
        set:function(key, value){
            if(typeof value === 'object'){
                value = JSON.stringify(value);
            }
            localStorage.setItem(prefix+key, value);
        }
    };
});

var DatasetReader = (function (datasetIn){
    
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