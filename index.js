var MongoClient = require('mongodb').MongoClient,
    logger = require("simplehelper").logger.getInstance(),
    fs = require('fs');

var replicaDB_Con = undefined;
var COLLECTION_DEVICEDETAILS = 'device_details';
var settings = JSON.parse(fs.readFileSync(__dirname + "/settings.json", 'utf8'));
var connectionString = settings.REPLICA_SET_CONN_URL_SLAVE_READ;

MongoClient.connect(connectionString, function(err, dbc) {
    if(err) throw err;
    replicaDB_Con= dbc;
});



/*

    nearestDrivers function will accept

    @type : this parameter represents from where call is coming eg ; type = "api_server" or type = "consumer_app"

    @options : this parameter has the constant values like " time_in_seconds_to_mark_signal_loss " , " login_cut_off_time " & " meter_off_cooltime_seconds "

    @conditions : this parameter has the conditions we are going to add extra;
*/



var nearest_driver = {

    generateQuery : function(type,city,conditions) {


        var time_in_seconds_to_mark_signal_loss = settings.time_in_seconds_to_mark_signal_loss;
        var login_cut_off_time = settings.login_cut_off_time;
        var meter_off_cooltime_seconds = settings.meter_off_cooltime_seconds;

        var poll_time_cutoff = parseInt(new Date().getTime() / 1000, 10) - time_in_seconds_to_mark_signal_loss;
        // Have to filter out the devices where login time is less than 5 minutes
        var today = new Date();
        var login_time_cutoff = new Date(today);
        login_time_cutoff.setMinutes(today.getMinutes() - login_cut_off_time);
        var meteoff_coolof_time = parseInt(new Date().getTime(), 10) - meter_off_cooltime_seconds * 1000;

        var query = {
            state: "Free",
            isBlocked: "false",
            isOperatorActive: true,
            isActive: true,
            updatedAt: {$gt: poll_time_cutoff.toString()},
            loggedInEpochTime: {$lt: login_time_cutoff.getTime()}
            /*,meterOffTime: {$lt:meteoff_coolof_time.toString()}*/
        };

    }

}
module.exports = nearest_driver;