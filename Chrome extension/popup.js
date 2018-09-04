function injectTheScript() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

	    chrome.tabs.executeScript(tabs[0].id, {file: "script1.js"});
	    
	});
}

document.getElementById('clickactivity').addEventListener('click', injectTheScript);
