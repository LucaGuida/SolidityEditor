import shutil
import os.path
from distutils.dir_util import copy_tree
import os.path


cwd = os.path.dirname(os.path.realpath(__file__))
parentCwd = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))
doxitySimpletonPath = os.path.abspath(os.path.join(parentCwd, os.pardir)) + '/SolidityExplorer/doxity-simpleton/'


# Clean /librariesDescriptors folder from current path, if existing
if os.path.exists(cwd + "/librariesDescriptors"):
  shutil.rmtree(cwd + "/librariesDescriptors")
os.makedirs(cwd + "/librariesDescriptors")


fromDirectory = doxitySimpletonPath + "/doxity/pages/docs"
toDirectory = cwd + "/librariesDescriptors"

copy_tree(fromDirectory, toDirectory)

print ("\nlibrariesDescriptors folder updated!\n")

