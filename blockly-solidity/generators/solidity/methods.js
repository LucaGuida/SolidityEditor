/**
 * @fileoverview Helper functions for generating Solidity for blocks.
 * @author jeanmarc.leroux@google.com (Jean-Marc Le Roux)
 * @author rekmarks@icloud.com  (Erik Marks)
 */
'use strict';

goog.require('Blockly.Solidity');

Blockly.Solidity['contract_method'] = function(block) {
  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
  var params = Blockly.Solidity.statementToCode(block, 'PARAMS').trim();
  var functionType = block.getFieldValue('FUNCTION_TYPE');
  var modifiers = Blockly.Solidity.statementToCode(block, 'MODIF');
  var branch = Blockly.Solidity.statementToCode(block, 'STACK');
  var code = docs + 'function ' + block.getFieldValue('NAME') + '(' + params + ')' + functionType + modifiers + '{\n' + branch + '}\n\n';

  return code;
};


Blockly.Solidity['contract_method_with_return'] = function(block) {
  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
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

  var code = docs + 'function ' + block.getFieldValue('NAME') + '(' + params + ')' + functionType + modifiers + ' returns (' + types[block.getFieldValue('RETURN_TYPE')] + ') {\n' + branch + '\n return ' + returnValue + ';\n}\n\n';

  return code;
};


Blockly.Solidity['contract_ctor'] = function(block) {
  var parent = block.getSurroundParent();

  if (!parent) {
    return '';
  }

  var docs = Blockly.Solidity.statementToCode(block, 'DOCS');
  var params = Blockly.Solidity.statementToCode(block, 'PARAMS').trim();
  var branch = Blockly.Solidity.statementToCode(block, 'STACK');
  var code = docs + 'function ' + parent.getFieldValue('NAME') + '(' + params + ') {\n' + branch + '}\n\n';

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


Blockly.Solidity['contract_intrinsic_sha3'] = function(block) {
  var argument0 = Blockly.Solidity.valueToCode(block, 'VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || '0';

  return ['sha3(' + argument0 + ')', Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['contract_method_call'] = function(block) {
  var variableId = block.getFieldValue('METHOD_NAME');
  var variable = block.workspace.getVariableById(variableId);

  //var functionName = block.getFieldValue('METHOD_NAME');

  var argsArray = []; 
  var argsString;
  var argument1 = Blockly.Solidity.valueToCode(block, 'ARG1',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument2 = Blockly.Solidity.valueToCode(block, 'ARG2',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument3 = Blockly.Solidity.valueToCode(block, 'ARG3',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  if (argument1!=null) {argsArray.push(argument1);}
  if (argument2!=null) {argsArray.push(argument2);}
  if (argument3!=null) {argsArray.push(argument3);}
  if (typeof argsArray !== 'undefined') {argsString = argsArray.join(', ');}

  if (!variable) {
    return '';
  }

  return Blockly.Solidity.getVariableName(variable) + '(' + argsString + ');\n';
};


Blockly.Solidity['contract_method_call_with_return_value'] = function(block) {
  var variableId = block.getFieldValue('METHOD_NAME');
  var variable = block.workspace.getVariableById(variableId);

  //var functionName = block.getFieldValue('METHOD_NAME');

  var argsArray = []; 
  var argsString;
  var argument1 = Blockly.Solidity.valueToCode(block, 'ARG1',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument2 = Blockly.Solidity.valueToCode(block, 'ARG2',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument3 = Blockly.Solidity.valueToCode(block, 'ARG3',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  if (argument1!=null) {argsArray.push(argument1);}
  if (argument2!=null) {argsArray.push(argument2);}
  if (argument3!=null) {argsArray.push(argument3);}
  if (typeof argsArray !== 'undefined') {argsString = argsArray.join(', ');}

  if (!variable) {
    return '';
  }

  return [Blockly.Solidity.getVariableName(variable) + '(' + argsString + ')', Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['library_method_call'] = function(block) {
  var libraryName = block.getFieldValue('LIB_NAME');
  var functionName = block.getFieldValue('LIB_FUNCT_NAME');

  var argsArray = []; 
  var argsString;
  var argument1 = Blockly.Solidity.valueToCode(block, 'ARG1',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument2 = Blockly.Solidity.valueToCode(block, 'ARG2',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument3 = Blockly.Solidity.valueToCode(block, 'ARG3',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  if (argument1!=null) {argsArray.push(argument1);}
  if (argument2!=null) {argsArray.push(argument2);}
  if (argument3!=null) {argsArray.push(argument3);}
  if (typeof argsArray !== 'undefined') {argsString = argsArray.join(', ');}

  if (typeof functionName == 'undefined' || libraryName == "select library..." || functionName == null)
    return '';

  return libraryName + '.' + functionName + '(' + argsString + ');\n\n';
};


Blockly.Solidity['library_method_call_with_return_value'] = function(block) {
  var libraryName = block.getFieldValue('LIB_NAME');
  var functionName = block.getFieldValue('LIB_FUNCT_NAME');

  var argsArray = []; 
  var argsString;
  var argument1 = Blockly.Solidity.valueToCode(block, 'ARG1',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument2 = Blockly.Solidity.valueToCode(block, 'ARG2',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument3 = Blockly.Solidity.valueToCode(block, 'ARG3',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  if (argument1!=null) {argsArray.push(argument1);}
  if (argument2!=null) {argsArray.push(argument2);}
  if (argument3!=null) {argsArray.push(argument3);}
  if (typeof argsArray !== 'undefined') {argsString = argsArray.join(', ');}

  if (typeof functionName == 'undefined' || libraryName == "select library..." || functionName == null)
    return '';

  return [libraryName + '.' + functionName + '(' + argsString + ')', Blockly.Solidity.ORDER_ATOMIC];
};


