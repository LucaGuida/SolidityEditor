import os
import json
import shutil
from distutils.dir_util import copy_tree



def convertSolidityMetadata2ContractDescriptor (contractMetadataFile):

  file=open('solidity-metadata-files/' + contractMetadataFile).read()
  data = json.loads(file)



  # DESCRIPTOR
  descriptor = {}
  descriptor['name'] = list(data['settings']['compilationTarget'].values())[0]

  descriptor['author'] = 'Unknown' # DEFAULT VALUE
  if 'author' in data['output']['devdoc']:
    descriptor['author'] = data['output']['devdoc']['author']

  descriptor['language'] = data['language']
  descriptor['contract_type'] = 'generic_contract'  # DEFAULT VALUE
  descriptor['contract_version'] = '1.0' # DEFAULT VALUE
  descriptor['descriptor_version'] = '1.0'  # DEFAULT VALUE
  descriptor['abi'] = data['output']['abi']
  descriptor['userdoc'] = data['output']['userdoc']



  # ENDPOINT
  endpoint = {}
  endpoint['address'] = '0x314159265dd8dbb310642f98f50c066173c1259b'  # DEFAULT VALUE
  endpoint['networkID'] = 1  # DEFAULT VALUE
  endpoint['chainID'] = 1  # DEFAULT VALUE



  # DEV
  dev = {}
  dev['devdoc'] = data['output']['devdoc']
  dev['sources'] = data['sources']
  dev['libraries'] = data['settings']['libraries']

  compiler = {}
  compiler['version'] = data['compiler']['version']
  compiler['evmVersion'] = data['settings']['evmVersion']

  dev['compiler'] = compiler



  # CONTRACT
  contractDescriptor = {}
  contractDescriptor['contract'] = {}
  contractDescriptor['contract']['descriptor'] = descriptor
  contractDescriptor['contract']['endpoint'] = endpoint
  contractDescriptor['contract']['dev'] = dev

  return contractDescriptor



for contractMetadataFile in os.listdir('solidity-metadata-files'): # filenames with extension
  if contractMetadataFile!=".DS_Store":
    with open('contract-descriptor-files/' + contractMetadataFile, 'w') as outfile:
      json.dump(convertSolidityMetadata2ContractDescriptor(contractMetadataFile), outfile)


print ("\nAll the metadata files in the solidity-metadata-files folder were converter to contract descriptors and were stored in the contract-descriptor-files folder!\n")
print("\n")

