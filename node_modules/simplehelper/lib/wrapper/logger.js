/*!
 * Helper
 * Copyright(c) 2012 Ayaz Pasha
 * MIT Licensed
 */

var connect_logger = require('connect').logger;
var process = require('process');

var logTypes = {INFO:'INFO',ERROR:'ERROR', WARN:'WARN', ALERT:'ALERT', DEBUG:'DEBUG'};

var Logger = function(options) {
	var instance = this;
	instance.options = options || {root:'../log',access:'access.log', log:'simple_node.log'};
	if(instance.options.stream && instance.options.stream == 'file'){
		init();
	}
		
	function init(){
		instance.accessLogStream = fs.createWriteStream(instance.options.root + instance.options.access);
		instance.logStream = fs.createWriteStream(instance.options.root + instance.options.log);
		
		instance.logStream.log = function(logMessage){
			console.log_(logMessage);
		}
		instance.info('Simple Node Logger', 'Logger is Created successfully!!!');
	}
	
	return instance;
};

Logger.prototype.log = function(logClass, type, message){
	var args = Array.prototype.slice.call(arguments);  
	type = type || 'INFO';
	
	if(args.length == 2){
		message = args[1];
		type = args[0];
		logClass = '';
	} else if(args.length == 1){
		message = args[0];
		type = 'INFO';
		logClass = '';
	} else if(args.length == 3){
		message = args[2];
		type = args[1];
		logClass = args[0];
	}

	//var time = new Date().toUTCString();
	//var time = new Date().toString();
	//var utc = new Date().toUTCString();
	//var time = new Date(utc + (3600000*(+5.50+8))); 
	var d = new Date();
	var offset = 5.5;//for IST
	var time = new Date(d.getTime()+(d.getTimezoneOffset() * 60000)+(3600000*offset));
		
	if(logClass)
		logClass = ' [' +logClass+ '] ';
	else
		logClass = '';
	
	if(typeof message)
		message = JSON.stringify(message);

	if(process.pid)
                type =  process.pid+  ' ' +type
	
	var logMessage = time + ' ' + type + ': ' + logClass + message;

	var instance = this;
	if(instance.logStream)
		instance.logStream.log(logMessage);
	else
		console.log(logMessage);
}

Logger.prototype.info = function(module, message){
	var instance = this;
	instance.log(module, logTypes['INFO'], message);	
}

Logger.prototype.error = function(module, message){
	var instance = this;
	instance.log(module, logTypes['ERROR'], message);	
}

Logger.prototype.alert = function(module, message){
	var instance = this;
	instance.log(module, logTypes['ALERT'], message);	
}

Logger.prototype.warn = function(module, message){
	var instance = this;
	instance.log(module, logTypes['WARN'], message);	
}

Logger.prototype.debug = function(module, message){
	var instance = this;
	instance.log(module, logTypes['DEBUG'], message);	
}

Logger.prototype.accessLog = function(){
	var instance = this;
	
	if(instance.accessLogStream)
		return connect_logger({stream:instance.accessLogStream});
	else
		return connect_logger();
}

exports.Logger = Logger;
