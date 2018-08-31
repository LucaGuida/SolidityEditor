# SolidityRegistry


## Configuration instructions

- Manually enter "Library explorer" URL in blockly-solidity/index.html (https://lucaguida.github.io/SolidityExplorer)

- Manually set var API_mode = true; in blockly-solidity/blocks/contract.js if you want to perform the retrieval of external contracts and libraries list  from Registry REST API; on the other hand, if you want the retrieval to happen from local JSON files, set the variable to false.  
- Manually enter libraries list JSON file path in blockly-solidity/blocks/contract.js for autonomous (no Registry API) mode 



## Usage instructions

### To start the underlying Registry REST API
Assuming var API_mode = true in blockly-solidity/blocks/contract.js
```
cd ~/GitHub/SoliditySmartContractRegistry/REST_API
json-server --watch smartContractDescriptorsAPI-DB.json
```


### To use the editor
```
cd ~/GitHub
python -m http.server
```

The editor will be available at this link: http://0.0.0.0:8000/SolidityRegistry/blockly-solidity/



### Standalone mode

Set var API_mode = false in blockly-solidity/blocks/contract.js

#### To update the local smart contract descriptors DB

```
cd ~/GitHub/SolidityRegistry/standalone-mode
python smartContractDescriptorsParser.py
```




Note: If you keep getting the "Language Solidity does not know how to generate code for block type ..." error, in Safari click on "Sviluppo" > "Svuota la cache", and re-open the tab.