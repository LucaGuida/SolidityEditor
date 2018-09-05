chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

if (request.type == "navigate"){

        chrome.storage.sync.set({key: request.value}, function() {

        //console.log('Background got request for saving to local storage the following value: ' + request.value);

        chrome.tabs.create({"url":"http://remix.ethereum.org","selected":true}, function( tab) {

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			    chrome.tabs.executeScript(tabs[0].id, {file: "script2.js"});
			});

        });
    });
 }
});
