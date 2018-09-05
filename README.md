# SolidityEditor


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


## Configuration instructions

- Enter a "SolidityRegistry" URL in blockly-solidity/index.html (https://lucaguida.github.io/SolidityRegistry/)
- Enter local DB JSON file path in blockly-solidity/blocks/contract.js for standalone mode 



This project was implemented starting from some pre-existing modules:
* Google Blockly (https://github.com/google/blockly - Apache License 2.0)
* Solidity for Blockly (https://github.com/rekmarks/blockly-solidity - MIT License)



# SolidityEditor2Remix Chrome Extension


## Installation instructions

The extension can be loaded into Google Chrome by following the following steps:
1) Open Google Chrome
2) Visit chrome://extensions
3) Enable Developer mode by clicking the toggle in the upper-right corner
4) Click on the "Load unpacked extension..." button
5) Select the "SolidityEditor2Remix Chrome Extension" directory, then click "Select".







