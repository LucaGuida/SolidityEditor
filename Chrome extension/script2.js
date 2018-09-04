function goToActivityTab() {


	//Helper for extracting substrings
	var getFromBetween = {
	    results:[],
	    string:"",
	    getFromBetween:function (sub1,sub2) {
	        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
	        var SP = this.string.indexOf(sub1)+sub1.length;
	        var string1 = this.string.substr(0,SP);
	        var string2 = this.string.substr(SP);
	        var TP = string1.length + string2.indexOf(sub2);
	        return this.string.substring(SP,TP);
	    },
	    removeFromBetween:function (sub1,sub2) {
	        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
	        var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
	        this.string = this.string.replace(removal,"");
	    },
	    getAllResults:function (sub1,sub2) {
	        // first check to see if we do have both substrings
	        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

	        // find one result
	        var result = this.getFromBetween(sub1,sub2);
	        // push it to the results array
	        this.results.push(result);
	        // remove the most recently found one from the string
	        this.removeFromBetween(sub1,sub2);

	        // if there's more substrings
	        if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
	            this.getAllResults(sub1,sub2);
	        }
	        else return;
	    },
	    get:function (string,sub1,sub2) {
	        this.results = [];
	        this.string = string;
	        this.getAllResults(sub1,sub2);
	        return this.results;
	    }
	};


/*

    var object = {};
    object['left-offset'] = 200;
    object['right-offset'] = 200;
    object['terminal-top-offset'] = 500;
    object['currentFile'] = "browser/MyContract.sol";

localStorage.setItem('sol:.remix.config', JSON.stringify(object));

localStorage.clear();

*/

// Clear local storage from 'Untitled' contracts
    Object.keys(localStorage)
    	.forEach(function (key) {
            if (!(/^sol:Untitled/.test(key))) {
            	localStorage.removeItem(key);
           	}
        });

    document.getElementsByClassName("fa fa-plus-circle")[0].click();
    document.getElementsByClassName("modalFooterOk_3lIjRo")[0].click();

    chrome.storage.sync.get(['key'], function(result) {

		// NB > Assumption: to have the Chrome Extension import all the required contracts, in addition to the contract being edited, the Registry API should be ON

		try {
			// Retrieve external contracts and libraries list from Registry API
			var jsonObjFull;
			var requestFull = new XMLHttpRequest();
			requestFull.open('GET', 'http://localhost:3000/contracts', false); 
			requestFull.send(null);
			if (requestFull.status === 200) {
				jsonObjFull = JSON.parse(requestFull.responseText);
			}

			var importsArray = [];
			var tempNestedImportsArray = [];

			if (typeof jsonObjFull != 'undefined') {

				var importsArray = getFromBetween.get(result.key,'import "./','.sol";');
					// recursion 
		    		for (var i = 0; i < importsArray.length; i++) {
				    	for(var j = 0; j < jsonObjFull.length; j++) 
							if (jsonObjFull[j]['JSON']['contract']['descriptor']['name'] == importsArray[i]) {
								tempNestedImportsArray = getFromBetween.get(jsonObjFull[j]['code'],'import "./','.sol";');
				    			for(var k = 0; k < tempNestedImportsArray.length; k++) 
				    				if (!importsArray.includes(tempNestedImportsArray[k]))
				    					importsArray.push(tempNestedImportsArray[k]);
							}
		    		}

				for(var i = 0; i < jsonObjFull.length; i++) 
					for(var j = 0; j < importsArray.length; j++)
						if (jsonObjFull[i]['JSON']['contract']['descriptor']['name'] == importsArray[j]) {
							localStorage.setItem('sol:' + importsArray[j] + '.sol', jsonObjFull[i]['code']);
						}
			}

		}
		catch(err) {
		    console.log("Solidity smart contract registry API not available!");
		}

		document.getElementsByClassName("ace_text-input")[0].value = result.key;
	    document.getElementsByClassName("ace_text-input")[0].dispatchEvent(new Event('input'));
    });

}

goToActivityTab();
