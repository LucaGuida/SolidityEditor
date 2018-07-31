# SoliditySOA


## Configuration instructions

- Manually enter "Library explorer" URL in blockly-solidity/index.html (https://lucaguida.github.io/SolidityExplorer)
- Manually enter libraries list JSON file path in blockly-solidity/blocks/contract.js for autonomous (no Registry API) mode 


## Usage instructions

`cd GitHub/`
`python -m http.server`

The editor will be available at this link: http://0.0.0.0:8000/SoliditySOA/blockly-solidity/



### Autonomous(no-API)-mode

#### To import contract descriptor from Doxity into the contract-descriptor-files directory:
`cd /Users/Guida/GitHub/SoliditySOA/autonomous(no-API)-mode`
`python DoxityContractDescriptorsImporter.py`

#### To convert in contract descriptor format generic Solidity metadata files, and import them in the contract-descriptor-files directory:
`cd /Users/Guida/GitHub/SoliditySOA/autonomous(no-API)-mode`
`python SolidityMetadata2ContractDescriptorCONVERTER.py`

#### To update the editor in such a way to use as source for external functions the descriptors stored in the contract-descriptor-files directory:
`cd /Users/Guida/GitHub/SoliditySOA/autonomous(no-API)-mode/parser-scripts`
`python LibsAndContractsDescriptorsParser.py`
`python ContractsDescriptorsParser.py`
`python LibsDescriptorsParser.py`



Note: If you keep getting the "Language Solidity does not know how to generate code for block type ..." error, in Safari click on "Sviluppo" > "Svuota la cache", and re-open the tab.