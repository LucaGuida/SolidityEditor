/**
 * @fileoverview Helper functions for generating Solidity for blocks.
 * @author jeanmarc.leroux@google.com (Jean-Marc Le Roux)
 * @author rekmarks@icloud.com  (Erik Marks)
 */
'use strict';

goog.require('Blockly.Solidity');

Blockly.Solidity['contract'] = function(block) {
  var imports = Blockly.Solidity.statementToCode(block, 'IMPORTS');
  if (imports.length > 0) {imports += '\n'};

  var states = Blockly.Solidity.statementToCode(block, 'STATES');
  if (states.length > 0) {states += '\n'};
  var modifiers = Blockly.Solidity.statementToCode(block, 'MODIFIERS');
  var events = Blockly.Solidity.statementToCode(block, 'EVENTS');
  var ctor = Blockly.Solidity.statementToCode(block, 'CTOR');
  var methods = Blockly.Solidity.statementToCode(block, 'METHODS');
  var methodsWithReturn = Blockly.Solidity.statementToCode(block, 'METHODS_WITH_RETURN');


  // trim newline before ultimate closing curly brace
  if (methods.length > 0) {
    methods = methods.slice(0, -2);
  } else if (ctor.length > 0) {
    ctor = ctor.slice(0, -2);
  }

  var code = 'pragma solidity ^0.4.24;\n\n'
    + imports
    + 'contract ' + block.getFieldValue('NAME') + ' {\n\n'
    + states
    + modifiers
    + events
    + ctor
    + methods
    + methodsWithReturn
    + '}\n';

  return code;
};


Blockly.Solidity['contract_import'] = function(block) {
  var libName = block.getFieldValue('LIB_NAME');
  return 'import "../' + libName + '.sol";\n';
};

  var types = {
    'TYPE_BOOL': 'bool',
    'TYPE_INT': 'int',
    'TYPE_UINT': 'uint',
    'TYPE_ADDRESS': 'address',
    'TYPE_BYTES_ARRAY': 'bytes',
    'TYPE_STRING': 'string',
  };

  var defaultValue = {
    'TYPE_BOOL': 'false',
    'TYPE_INT': '0',
    'TYPE_UINT': '0',
    'TYPE_ADDRESS': '0x0000000000000000000000000000000000000000',
    'TYPE_BYTES_ARRAY': '""',
    'TYPE_STRING': '""',
  };

Blockly.Solidity['contract_state'] = function(block) {
  var name = block.getFieldValue('NAME');
  var value = Blockly.Solidity.valueToCode(block, 'VALUE', Blockly.Solidity.ORDER_ASSIGNMENT);
  var type = block.getFieldValue('TYPE');

  if (value === '') {
    value = defaultValue[type];
  }

  return types[type] + ' ' + name + ' = ' + value + ';\n';
};

Blockly.Solidity['contract_state_get'] = function(block) {
  var variableId = block.getFieldValue('STATE_NAME');
  var variable = block.workspace.getVariableById(variableId);

  if (!variable) {
    return '';
  }

  return [Blockly.Solidity.getVariableName(variable), Blockly.Solidity.ORDER_ATOMIC];
};

Blockly.Solidity['contract_state_set'] = function(block) {
  // Variable setter.

  var variableId = block.getFieldValue('STATE_NAME');
  var variable = block.workspace.getVariableById(variableId);

  if (!variable) {
    return '';
  }

  var varType = variable.type;
  var defaultVal = '0';
  if (typeof defaultValue[varType] != 'undefined')
    {defaultVal = defaultValue[varType];}

  var argument0 = Blockly.Solidity.valueToCode(block, 'STATE_VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || defaultVal;

  return Blockly.Solidity.getVariableName(variable) + ' = ' + argument0 + ';\n';
};


Blockly.Solidity['event_definition'] = function(block) {
  var args = Blockly.Solidity.statementToCode(block, 'ARGS');
  var code = 'event ' + block.getFieldValue('NAME') + '(\n' + args + ');\n\n';

  return code;
};


Blockly.Solidity['event_argument'] = function(block) {
  var name = block.getFieldValue('NAME');
  var type = block.getFieldValue('TYPE');
  var types = {
    'TYPE_BOOL': 'bool',
    'TYPE_INT': 'int',
    'TYPE_UINT': 'uint',
  };
  var indexedCheckbox;
  if (block.getFieldValue('INDEXED_CHECKBOX')=="TRUE") {indexedCheckbox = " indexed";}
    else {indexedCheckbox = "";}
  
  var nextBlock = block.getNextBlock();
  var sep = nextBlock && nextBlock.type == block.type ? ',' : '';

  return types[type] + ' ' + indexedCheckbox + ' ' + name + sep + '\n';
};


Blockly.Solidity['event_emission'] = function(block) {
  var eventName = block.getFieldValue('EVENT_NAME');
  var argsArray = []; 
  var argsString;
  var argument1 = Blockly.Solidity.valueToCode(block, 'ARG1',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument2 = Blockly.Solidity.valueToCode(block, 'ARG2',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument3 = Blockly.Solidity.valueToCode(block, 'ARG3',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  if (argument1!=null) {argsArray.push(argument1);}
  if (argument2!=null) {argsArray.push(argument2);}
  if (argument3!=null) {argsArray.push(argument3);}
  if (typeof argsArray !== 'undefined') {argsString = argsArray.join(', ');}

  return 'emit ' + eventName + '(' + argsString + ');\n';
};


Blockly.Solidity['msg_get'] = function(block) {
  var messageType = block.getFieldValue('MSG_TYPE');
  return ['msg.' + messageType, Blockly.Solidity.ORDER_ATOMIC];
};

Blockly.Solidity['modifier_definition'] = function(block) {
  var name = block.getFieldValue('MODIFIER_NAME');
  var params = Blockly.Solidity.statementToCode(block, 'PARAMS').trim();
  //var condition = Blockly.Solidity.statementToCode(block, 'CONDITION');
  var condition = Blockly.Solidity.valueToCode(block, 'CONDITION',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var message = block.getFieldValue('MESSAGE');
  var code = 'modifier ' + name + '(' + params + ')\n{\n\trequire(\n\t\t' + condition + ',\n\t\t"' + message + '"\n\t);\n\t_;\n}\n\n';

  return code;
};


Blockly.Solidity['modifier_onlyOwner'] = function(block) {
  var name = block.getFieldValue('MODIFIER_NAME');
  var code = 'modifier ' + name + '\n{\n\trequire(\n\t\tmsg.sender == owner,\n\t\t"Only owner can call this function."\n\t);\n\t _;\n}\n\n';
  return code;
};


Blockly.Solidity['modifier_usage'] = function(block) {
  var modifierName = block.getFieldValue('MODIFIER_NAME');

  var argsArray = []; 
  var argsString;
  var argument1 = Blockly.Solidity.valueToCode(block, 'ARG1',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument2 = Blockly.Solidity.valueToCode(block, 'ARG2',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  var argument3 = Blockly.Solidity.valueToCode(block, 'ARG3',Blockly.Solidity.ORDER_ASSIGNMENT) || null;  
  if (argument1!=null) {argsArray.push(argument1);}
  if (argument2!=null) {argsArray.push(argument2);}
  if (argument3!=null) {argsArray.push(argument3);}
  if (typeof argsArray !== 'undefined') {argsString = argsArray.join(', ');}

  return modifierName + '(' + argsString + ') ';
};

