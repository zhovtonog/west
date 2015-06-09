var system = require('system');
var page = require('webpage').create();

var fs = require('fs');


page.onConsoleMessage = function(msg, lineNum, sourceId) {
	console.log('CONSOLE: ' + msg);
	if (!fs.exists(system.args[1] + '.log')) {
	  fs.write(system.args[1] + '.log', msg + '\r\n', 'a');
	}else {
		fs.touch(system.args[1] + '.log');
		fs.write(system.args[1] + '.log', msg + '\r\n', 'a');
	}
	
};

page.onLoadFinished = function() {

	phantom.addCookie({'name' : 'user', 'value': system.args[1], 'domain' : '.the-west.ru'});
	phantom.addCookie({'name' : 'pass', 'value': system.args[2], 'domain' : '.the-west.ru'});
	phantom.addCookie({'name' : 'workType', 'value': system.args[3], 'domain' : '.the-west.ru'});
	console.log('loadFinished');
	//console.log(location.href);
	//page.injectJs('jquery.min.js');
	//page.injectJs('jquery.cookie.js');
	page.injectJs('west.js');
	//page.injectJs('wtest.js');
		
};
	
page.onLoadStarted = function() {
    console.log("page.onLoadStarted");
};


page.onUrlChanged = function() {
    console.log("page.onUrlChanged");
};
page.settings.userAgent = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36";

page.open('https://www.the-west.ru', function(status) {
	console.log('Status: ' + status);
});


