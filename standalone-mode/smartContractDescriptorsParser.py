import os
import json
import shutil
from distutils.dir_util import copy_tree


cwd = os.path.dirname(os.path.realpath(__file__))
parentCwd = os.path.abspath(os.path.join(cwd, os.pardir))


JSONfileForStandaloneMode = {}
JSONstandaloneModeArray = []

for contractMetadataFile in os.listdir('contract-descriptor-files'): # filenames with extension
  if contractMetadataFile!=".DS_Store":
    file=open('contract-descriptor-files/' + contractMetadataFile).read()
    contractDescriptorJSON = json.loads(file)
    sourceCode = open('contracts/' + contractMetadataFile.replace('.json','.sol')).read()

    contractDescriptorJSONforStandaloneMode = {}
    contractDescriptorJSONforStandaloneMode['name'] = contractDescriptorJSON['contract']['descriptor']['name']
    contractDescriptorJSONforStandaloneMode['contract_type'] = contractDescriptorJSON['contract']['descriptor']['contract_type']
    contractDescriptorJSONforStandaloneMode['JSON'] = contractDescriptorJSON
    contractDescriptorJSONforStandaloneMode['code'] = sourceCode
    JSONstandaloneModeArray.append(contractDescriptorJSONforStandaloneMode)

# Generation of the DB file for the StandaloneMode      
with open('smartContractDescriptorsDB.json', 'w') as outfile:
  json.dump(JSONstandaloneModeArray, outfile)


print ("All the contract descriptors were merged and stored in the smartContractDescriptorsDB!\n\n")


