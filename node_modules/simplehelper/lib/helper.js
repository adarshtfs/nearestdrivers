/*!
 * Helper
 * Copyright(c) 2012 Ayaz Pasha
 * MIT Licensed
 */

var helper = module.exports = {};

var fs = require('fs');

helper.version = '0.1.0';
//helper.CRUDService = require('./wrapper/crudservice').CRUDService;

fs.readdirSync(__dirname).forEach(function(filename){
        if (/\.js$/.test(filename)) {
            if(filename != 'helper.js'){
                var name = filename.substr(0, filename.lastIndexOf('.'));
                helper.__defineGetter__(name, function(){
                        return require('./' + name);
                });
            }
        }
});

fs.readdirSync(__dirname + '/wrapper').forEach(function(filename){
    if (/\.js$/.test(filename)) {
        var name = filename.substr(0, filename.lastIndexOf('.'));
        helper.__defineGetter__(capitaliseFirstLetter(name), function(){
        	return require('./wrapper/' + name);
        });
    }
});

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}