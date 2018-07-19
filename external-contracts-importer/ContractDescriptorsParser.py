import os
import json
import shutil
from distutils.dir_util import copy_tree



def extractMethods (contractName):
	methods = []
	file=open('contract-descriptor-files/' + contractName).read()
	data = json.loads(file)

	for method in data['contract']['abi']:
		if method['type']=='function': 
			methods.append(method['name'])
		if method['type']=='constructor':
			methods.append(contractName[:-5])
	return methods

def pretty(d, indent=0):
   for key, value in d.items():
      print('\t' * indent + str(key))
      if isinstance(value, dict):
         pretty(value, indent+1)
      else:
         print('\t' * (indent+1) + str(value))


librariesMethodsMap = {}

for element in os.listdir('contract-descriptor-files'):
    if element!=".DS_Store":
    		librariesMethodsMap[element[:-5]] = extractMethods(element)


with open('BlocklyLibrariesList.json', 'w') as outfile:
    json.dump(librariesMethodsMap, outfile)

print ("\nThe following libraries and functions are ready to be imported into Blockly Solidity!\n")
pretty(librariesMethodsMap)
print("\n")

