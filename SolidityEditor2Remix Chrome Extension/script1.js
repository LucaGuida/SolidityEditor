function goToActivityTab() {

    var code = document.getElementById('textarea').value;

    chrome.runtime.sendMessage({type: "navigate",value:code}, function(response) {
        //console.log('Contract source code saved to local storage');
    });

}

goToActivityTab();
