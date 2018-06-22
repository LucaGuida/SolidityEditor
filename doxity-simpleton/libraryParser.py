import os
import json
from lxml import html


def extractMethods (contractName):
	methods = []
	file = open('docs/docs/' + contractName + '/index.html', 'r', encoding="utf-8")
	tree = html.fromstring(file.read())
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[1]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[2]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[3]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[4]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[5]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[6]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[7]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[8]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[9]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[10]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[11]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[12]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[13]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[14]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[15]/h3/code[1]/text()'))
	methods.append(tree.xpath('//*[@id="react-mount"]/div/div[2]/div/div[2]/div/div[4]/div[16]/h3/code[1]/text()'))
	flattened_list = [y for x in methods for y in x]
	return flattened_list

def pretty(d, indent=0):
   for key, value in d.items():
      print('\t' * indent + str(key))
      if isinstance(value, dict):
         pretty(value, indent+1)
      else:
         print('\t' * (indent+1) + str(value))


librariesMethodsMap = {}

for element in os.listdir("docs/docs"):
    #if element.endswith(".txt"):
    if element!=".DS_Store":
    	librariesMethodsMap[element] = extractMethods(element)


with open('librariesList.json', 'w') as outfile:
    json.dump(librariesMethodsMap, outfile)

print ("\nThe following libraries and functions are ready to be imported into Blockly Solidity!\n")
pretty(librariesMethodsMap)
print("\n")

