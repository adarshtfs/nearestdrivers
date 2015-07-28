var MongoClient = require('mongodb').MongoClient,
    logger = require("simplehelper").logger.getInstance();

var replicaDB_Con = undefined;
var COLLECTION_DEVICEDETAILS = 'device_details';

/*

    nearestDrivers function will accept

    @type : this parameter represents from where call is coming eg ; type = "api_server" or type = "consumer_app"

    @options : this parameter has the constant values like " time_in_seconds_to_mark_signal_loss " , " login_cut_off_time " & " meter_off_cooltime_seconds "

    @conditions : this parameter has the conditions we are going to add extra;
*/



var nearest_driver = {

    initConnection : function(connectionString,calback){

        MongoClient.connect(connectionString, function(err, dbc) {
            if(err) throw err;
            callback(dbc);
        });
    },
    getNearestDrivers : function(type,city,Condition,cartypes,options){


        var time_in_seconds_to_mark_signal_loss = options.time_in_seconds_to_mark_signal_loss;
        var login_cut_off_time = options.login_cut_off_time;
        var meter_off_cooltime_seconds = options.meter_off_cooltime_seconds;

        var poll_time_cutoff =  parseInt(new Date().getTime()/1000, 10) - time_in_seconds_to_mark_signal_loss;
        // Have to filter out the devices where login time is less than 5 minutes
        var today = new Date();
        var login_time_cutoff = new Date(today);
        login_time_cutoff.setMinutes(today.getMinutes() - login_cut_off_time);
        var meteoff_coolof_time=parseInt(new Date().getTime(), 10) - meter_off_cooltime_seconds*1000;

        var query = {
            state: "Free",
            isBlocked: "false",
            isOperatorActive: true,
            isActive: true,
            updatedAt : {$gt: poll_time_cutoff.toString()},
            loggedInEpochTime: { $lt: login_time_cutoff.getTime()},
            city : city
        };

        /*meterOffTime: {$lt:meteoff_coolof_time.toString()}*/

        if(type === 'api_server'){


            query['$or']=conditions;

            var projection  = { "latitude": 1, "longitude": 1, "meterOffTime": 1, "dispatchPreference": 1, "blackmarkedDriver": 1, "carType": 1 };


        }else if(type === 'consumer_app'){

           var projection = { "latitude": 1, "longitude": 1, "meterOffTime": 1, "city": 1, "uuid": 1, "carType": 1, "carKind": 1 };
        }

        try {

            if(replicaDB_Con !== undefined){

                replicaDB_Con.collection(COLLECTION_DEVICEDETAILS).find(query, projection).toArray(function (err, drivers) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, drivers);
                    }
                });

            }else{

                nearest_driver.initConnection(String,function(con){

                    replicaDB_Con=con

                    replicaDB_Con.collection(COLLECTION_DEVICEDETAILS).find(query, projection).toArray(function (err, drivers) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, drivers);

                        }
                    });

                });
            }
        }
        catch(e){

            logger.error("device_details/getNearestDrivers","" +query+ " Error: "+e);
            callback();
        }
    }


}


module.exports = nearest_driver;