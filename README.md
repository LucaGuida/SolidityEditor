# SoliditySOA


## Configuration instructions

- Manually enter "Library explorer" URL in blockly-solidity/index.html (https://lucaguida.github.io/SolidityExplorer)

- Manually set var API_mode = true; in blockly-solidity/blocks/contract.js if you want to perform the retrieval of external contracts and libraries list  from Registry REST API; on the other hand, if you want the retrieval to happen from local JSON files, set the variable to false.  
- Manually enter libraries list JSON file path in blockly-solidity/blocks/contract.js for autonomous (no Registry API) mode 



## Usage instructions

### To use the editor
```
cd GitHub/
python -m http.server
```

The editor will be available at this link: http://0.0.0.0:8000/SoliditySOA/blockly-solidity/


### To start the underlying Registry REST API
Assuming var API_mode = true:
```
cd /Users/Guida/GitHub/SolidityExplorer/REST_API
json-server --watch metadataDB.json
```



### Autonomous (no-API) mode

#### To import contract descriptor from Doxity into the contract-descriptor-files directory:
```
cd /Users/Guida/GitHub/SoliditySOA/autonomous(no-API)-mode
python DoxityContractDescriptorsImporter.py
```

#### To convert in contract descriptor format generic Solidity metadata files, and import them in the contract-descriptor-files directory:
```
cd /Users/Guida/GitHub/SoliditySOA/autonomous(no-API)-mode
python SolidityMetadata2ContractDescriptorCONVERTER.py
```

#### To update the editor in such a way to use as source for external functions the descriptors stored in the contract-descriptor-files directory:
```
cd /Users/Guida/GitHub/SoliditySOA/autonomous(no-API)-mode/parser-scripts
python LibsAndContractsDescriptorsParser.py
python ContractsDescriptorsParser.py
python LibsDescriptorsParser.py
```



Note: If you keep getting the "Language Solidity does not know how to generate code for block type ..." error, in Safari click on "Sviluppo" > "Svuota la cache", and re-open the tab.