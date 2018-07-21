import os
import json
import shutil
from distutils.dir_util import copy_tree



def convertSolidityMetadata2ContractDescriptor (contractMetadataFile):

  file=open('solidity-metadata-files/' + contractMetadataFile).read()
  data = json.loads(file)

  contract = {}
  contract['name'] = list(data['settings']['compilationTarget'].values())[0]

  contract['author'] = 'Unknown' # DEFAULT VALUE
  if 'author' in data['output']['devdoc']:
    contract['author'] = data['output']['devdoc']['author']

  contract['version'] = '1.0' # DEFAULT VALUE
  contract['language'] = data['language']
  contract['contract_type'] = 'generic_contract'  # DEFAULT VALUE
  contract['abi'] = data['output']['abi']
  contract['devdoc'] = data['output']['devdoc']
  contract['userdoc'] = data['output']['userdoc']
  contract['sources'] = data['sources']
  contract['libraries'] = data['settings']['libraries']

  deployment_information = {}
  deployment_information['address'] = '0x314159265dd8dbb310642f98f50c066173c1259b'  # DEFAULT VALUE
  deployment_information['networkID'] = 1  # DEFAULT VALUE
  deployment_information['chainID'] = 1  # DEFAULT VALUE

  compiler = {}
  compiler['version'] = data['compiler']['version']
  compiler['evmVersion'] = data['settings']['evmVersion']

  descriptor = {}
  descriptor['version'] = '1.0'  # DEFAULT VALUE


  contractDescriptor = {}
  contractDescriptor['contract'] = contract
  contractDescriptor['deployment_information'] = deployment_information
  contractDescriptor['compiler'] = compiler
  contractDescriptor['descriptor'] = descriptor

  return contractDescriptor



for contractMetadataFile in os.listdir('solidity-metadata-files'): # filenames with extension
  if contractMetadataFile!=".DS_Store":
    with open('contract-descriptor-files/' + contractMetadataFile, 'w') as outfile:
      json.dump(convertSolidityMetadata2ContractDescriptor(contractMetadataFile), outfile)


print ("\nAll the metadata files in the solidity-metadata-files folder were converter to contract descriptors and were stored in the contract-descriptor-files folder!\n")
print("\n")

