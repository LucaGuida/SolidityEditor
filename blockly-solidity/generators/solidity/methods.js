/**
 * @fileoverview Helper functions for generating Solidity for blocks.
 * @author jeanmarc.leroux@google.com (Jean-Marc Le Roux)
 * @author rekmarks@icloud.com  (Erik Marks)
 */
'use strict';

goog.require('Blockly.Solidity');

Blockly.Solidity['contract_method'] = function(block) {
  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
  var visibility = block.getFieldValue('VISIBILITY');
  var params = Blockly.Solidity.statementToCode(block, 'PARAMS').trim();
  var functionType = block.getFieldValue('FUNCTION_TYPE');
  var modifiers = Blockly.Solidity.statementToCode(block, 'MODIF');
  var branch = Blockly.Solidity.statementToCode(block, 'STACK');
  var code = docs + 'function ' + block.getFieldValue('NAME') + '(' + params + ') ' + visibility + functionType + modifiers + '{\n' + branch + '}\n\n';

  return code;
};


Blockly.Solidity['contract_method_with_return'] = function(block) {
  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
  var visibility = block.getFieldValue('VISIBILITY');
  var params = Blockly.Solidity.statementToCode(block, 'PARAMS').trim();
  var functionType = block.getFieldValue('FUNCTION_TYPE');
  var modifiers = Blockly.Solidity.statementToCode(block, 'MODIF');
  var branch = Blockly.Solidity.statementToCode(block, 'STACK');
  var returnValue = Blockly.Solidity.valueToCode(block, 'RETURN_VALUE',Blockly.Solidity.ORDER_ASSIGNMENT);

  var types = {
    'TYPE_BOOL': 'bool',
    'TYPE_INT': 'int',
    'TYPE_UINT': 'uint',
  };

  var code = docs + 'function ' + block.getFieldValue('NAME') + '(' + params + ') ' + visibility + functionType + modifiers + ' returns (' + types[block.getFieldValue('RETURN_TYPE')] + ') {\n' + branch + '\n return ' + returnValue + ';\n}\n\n';

  return code;
};


Blockly.Solidity['contract_ctor'] = function(block) {
  var parent = block.getSurroundParent();

  if (!parent) {
    return '';
  }

  var visibility = block.getFieldValue('VISIBILITY');

  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
  var params = Blockly.Solidity.statementToCode(block, 'PARAMS').trim();
  var branch = Blockly.Solidity.statementToCode(block, 'STACK');
  var code = docs + parent.getFieldValue('NAME') + '(' + params + ') ' + visibility + ' {\n' + branch + '}\n\n';

  return code;
};


Blockly.Solidity['contract_method_parameter'] = function(block) {
  var name = block.getFieldValue('NAME');
  var nextBlock = block.getNextBlock();
  var sep = nextBlock && nextBlock.type == block.type ? ', ' : '';
  var types = {
    'TYPE_BOOL': 'bool',
    'TYPE_INT': 'int',
    'TYPE_UINT': 'uint',
  };

  return types[block.getFieldValue('TYPE')] + ' ' + name + sep;
};


Blockly.Solidity['contract_method_parameter_get'] = function(block) {
  var variableId = block.getFieldValue('PARAM_NAME');
  var variable = block.workspace.getVariableById(variableId);

  if (!variable) {
    return '';
  }

  return [Blockly.Solidity.getVariableName(variable), Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['changeOwner_method'] = function(block) {
  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
  //var functionType = block.getFieldValue('FUNCTION_TYPE');
  var modifiers = Blockly.Solidity.statementToCode(block, 'MODIF');
  var code = docs + 'function ' + block.getFieldValue('NAME') + '(address _newOwner) public ' /*+ functionType*/ + modifiers + '{\n' + '\towner = _newOwner;\n' + '}\n\n';

  return code;
};


Blockly.Solidity['destroy_method'] = function(block) {
  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
  //var functionType = block.getFieldValue('FUNCTION_TYPE');
  var modifiers = Blockly.Solidity.statementToCode(block, 'MODIF');
  var code = docs + 'function ' + block.getFieldValue('NAME') + '(' + ') public ' /*+ functionType*/ + modifiers + '{\n' + '\tselfdestruct(owner);\n' + '}\n\n';

  return code;
};


Blockly.Solidity['destroyAndSend_method'] = function(block) {
  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
  //var functionType = block.getFieldValue('FUNCTION_TYPE');
  var modifiers = Blockly.Solidity.statementToCode(block, 'MODIF');
  var code = docs + 'function ' + block.getFieldValue('NAME') + '(address _recipient) public ' /*+ functionType*/ + modifiers + '{\n' + '\tselfdestruct(_recipient);\n' + '}\n\n';

  return code;
};


Blockly.Solidity['contract_intrinsic_sha3'] = function(block) {
  var argument0 = Blockly.Solidity.valueToCode(block, 'VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || '0';

  return ['sha3(' + argument0 + ')', Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['argument_container'] = function(block) {
  var argument = Blockly.Solidity.valueToCode(block, 'ARG',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  
  if (typeof argument != 'undefined' && argument!='' && argument!='null' && argument!=null)
  {
    if (!argument.includes("null"))
      return argument + ',';
    else return '';
  } else return '';

};


Blockly.Solidity['contract_method_call'] = function(block) {
  var variableId = block.getFieldValue('METHOD_NAME');
  var variable = block.workspace.getVariableById(variableId);

  var args = Blockly.Solidity.statementToCode(block, 'ARGS');

  if (typeof args == 'undefined' || args=='') 
    args = '';
  else {
    args = args.trim();
    args = args.substring(0, args.length - 1);
  }


  if (!variable) {
    return '';
  }

  return Blockly.Solidity.getVariableName(variable) + '(' + args + ');\n';
};


Blockly.Solidity['contract_method_call_with_return_value'] = function(block) {
  var variableId = block.getFieldValue('METHOD_NAME');
  var variable = block.workspace.getVariableById(variableId);

  var args = Blockly.Solidity.statementToCode(block, 'ARGS');

  if (typeof args == 'undefined' || args=='') 
    args = '';
  else {
    args = args.trim();
    args = args.substring(0, args.length - 1);
  }

  if (!variable) {
    return '';
  }

  return [Blockly.Solidity.getVariableName(variable) + '(' + args + ')', Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['library_method_call'] = function(block) {
  var libraryName = block.getFieldValue('LIB_NAME');
  var functionName = block.getFieldValue('LIB_FUNCT_NAME');

  var args = Blockly.Solidity.statementToCode(block, 'ARGS');

  if (typeof args == 'undefined' || args=='') 
    args = '';
  else {
    args = args.trim();
    args = args.substring(0, args.length - 1);
  }

  if (typeof functionName == 'undefined' || libraryName == "select library..." || functionName == null)
    return '';

  return libraryName + '.' + functionName + '(' + args + ');\n\n';
};


Blockly.Solidity['library_method_call_with_return_value'] = function(block) {
  var libraryName = block.getFieldValue('LIB_NAME');
  var functionName = block.getFieldValue('LIB_FUNCT_NAME');

  var args = Blockly.Solidity.statementToCode(block, 'ARGS');

  if (typeof args == 'undefined' || args=='') 
    args = '';
  else {
    args = args.trim();
    args = args.substring(0, args.length - 1);
  }

  if (typeof functionName == 'undefined' || libraryName == "select library..." || functionName == null)
    return '';

  return [libraryName + '.' + functionName + '(' + args + ')', Blockly.Solidity.ORDER_ATOMIC];
};


