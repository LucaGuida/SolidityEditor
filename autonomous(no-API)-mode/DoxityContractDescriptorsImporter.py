import shutil
import os.path
from distutils.dir_util import copy_tree
import os.path


cwd = os.path.dirname(os.path.realpath(__file__))
parentCwd = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))
doxitySimpletonPath = os.path.abspath(os.path.join(parentCwd, os.pardir)) + '/SolidityExplorer/doxity-simpleton/'

fromDirectory = doxitySimpletonPath + "/contract-descriptor-files"
toDirectory = cwd + "/contract-descriptor-files"

copy_tree(fromDirectory, toDirectory)

print ("\ncontract-descriptor-files folder updated with contract descriptors from Doxity!\n")
