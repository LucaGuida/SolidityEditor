# SolidityEditor


## Configuration instructions

- Manually enter "Library explorer" URL in blockly-solidity/index.html (https://lucaguida.github.io/SolidityRegistry/)

- Manually set var API_mode = true; in blockly-solidity/blocks/contract.js if you want to perform the retrieval of external contracts and libraries list  from Registry REST API; on the other hand, if you want the retrieval to happen from local JSON files, set the variable to false.  
- Manually enter libraries list JSON file path in blockly-solidity/blocks/contract.js for autonomous (no Registry API) mode 



## Usage instructions

### To start the underlying Registry REST API
Assuming var API_mode = true in blockly-solidity/blocks/contract.js
```
cd ~/GitHub/SolidityRegistry/REST_API
json-server --watch smartContractDescriptorsAPI-DB.json
```


### To use the editor
```
cd ~/GitHub
python -m http.server
```

The editor will be available at this link: http://0.0.0.0:8000/SolidityEditor/blockly-solidity/



### Standalone mode

Set var API_mode = false in blockly-solidity/blocks/contract.js

#### To update the local smart contract descriptors DB

```
cd ~/GitHub/SolidityEditor/standalone-mode
python smartContractDescriptorsParser.py
```




# SolidityEditor2RemixChromeExtension


## Installation instructions

The extension can be loaded into Google Chrome by following the following steps:
1) Open Google Chrome
2) Visit chrome://extensions
3) Enable Developer mode by clicking the toggle in the upper-right corner
4) Click on the "Load unpacked extension..." button
5) Select the "Chrome extension" folder inside the SolidityEditor2Remix directory, then click "Select".



