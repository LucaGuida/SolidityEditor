/**
 * @fileoverview Helper functions for generating Solidity for blocks.
 * @author jeanmarc.leroux@google.com (Jean-Marc Le Roux)
 * @author rekmarks@icloud.com  (Erik Marks)
 */
'use strict';

goog.require('Blockly.Solidity');

  var types = {
    'TYPE_BOOL': 'bool',
    'TYPE_INT': 'int',
    'TYPE_UINT': 'uint',
    'TYPE_ADDRESS': 'address',
    'TYPE_BYTES_ARRAY': 'bytes',
    'TYPE_STRING': 'string',
    'TYPE_STAR': '*'
  };

  var defaultValue = {
    'TYPE_BOOL': 'false',
    'TYPE_INT': '0',
    'TYPE_UINT': '0',
    'TYPE_ADDRESS': '0x0000000000000000000000000000000000000000',
    'TYPE_BYTES_ARRAY': '""',
    'TYPE_STRING': '""',
  };

Blockly.Solidity['contract'] = function(block) {

  var imports = '';
  var importsArray = [];
  var libraryCallBlocksArray = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.type == 'library_method_call' || b.type == 'library_method_call_with_return_value' || b.type == 'usingFor'});
  if (typeof libraryCallBlocksArray[0] != 'undefined') {
    for (var i = 0; i < libraryCallBlocksArray.length; i++)
      if (libraryCallBlocksArray[i].getFieldValue('LIB_NAME')!='select library...' && !importsArray.includes(libraryCallBlocksArray[i].getFieldValue('LIB_NAME')))
        importsArray.push(libraryCallBlocksArray[i].getFieldValue('LIB_NAME'));
  }
  if (importsArray!=null) {
    for (var i = 0; i < importsArray.length; i++)
      imports = imports + 'import "../' + importsArray[i] + '.sol";\n';
    imports += '\n';
  }
  
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

  if (varType == 'TYPE_ADDRESS' && argument0.length!=40 && argument0.length!=42) 
    argument0 = "0x0000000000000000000000000000000000000000";

  return Blockly.Solidity.getVariableName(variable) + ' = ' + argument0 + ';\n';
};

Blockly.Solidity['address_balance_get'] = function(block) {
  var addressVariable = block.getFieldValue('ADDRESS_VARIABLE_NAME');

  return [addressVariable + '.balance', Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['address_transfer'] = function(block) {
  var addressVariable = block.getFieldValue('ADDRESS_VARIABLE_NAME');
  var defaultVal = '0';
  var amount = Blockly.Solidity.valueToCode(block, 'AMOUNT',
      Blockly.Solidity.ORDER_ASSIGNMENT) || defaultVal;
  return addressVariable + '.transfer(' + amount + ');\n\n';
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


Blockly.Solidity['enum_definition'] = function(block) {
  var name = block.getFieldValue('ENUM_NAME');
  var members = Blockly.Solidity.statementToCode(block, 'MEMBERS').trim();
  var code = 'enum ' + name + ' {' + members + '}\n\n';

  return code;
};

Blockly.Solidity['enum_member'] = function(block) {
  var name = block.getFieldValue('MEMBER_NAME');
  var nextBlock = block.getNextBlock();
  var sep = nextBlock && nextBlock.type == block.type ? ', ' : '';
  var code = name + sep;

  return code;
};

Blockly.Solidity['enum_variable_create'] = function(block) {
  var enumType = block.getFieldValue('ENUM_TYPE');
  var varName = block.getFieldValue('ENUM_VAR_NAME');

  return enumType + ' ' + varName + ';\n';
};

Blockly.Solidity['enum_variable_set'] = function(block) {
  // Enum variable setter
  var variableName = block.getFieldValue('ENUM_VARIABLE_NAME');

  var value = Blockly.Solidity.valueToCode(block, 'ENUM_VARIABLE_VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';

  return variableName + ' = ' + value + ';\n';
};


Blockly.Solidity['enum_member_get'] = function(block) {
  var memberName = block.getFieldValue('ENUM_MEMBER_NAME');
  return [memberName, Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['enum_get'] = function(block) {
  var varName = block.getFieldValue('ENUM_VARIABLE_NAME');
  return [varName, Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['struct_definition'] = function(block) {
  var name = block.getFieldValue('STRUCT_NAME');
  var members = Blockly.Solidity.statementToCode(block, 'MEMBERS').trim();
  var code = 'struct ' + name + ' {\n' + members + '\n}\n\n';

  return code;
};


Blockly.Solidity['struct_member'] = function(block) {
  var type = block.getFieldValue('TYPE');
  var name = block.getFieldValue('MEMBER_NAME');
  var code = '\t' + types[type] + ' ' + name + ';\n';

  return code;
};


Blockly.Solidity['struct_variable_create'] = function(block) {
  var structType = block.getFieldValue('STRUCT_TYPE');
  var varName = block.getFieldValue('STRUCT_VAR_NAME');

  return structType + ' ' + varName + ';\n';
};


Blockly.Solidity['struct_variable_set'] = function(block) {
  var variableName = block.getFieldValue('STRUCT_VARIABLE_NAME');
  var value = Blockly.Solidity.valueToCode(block, 'STRUCT_VARIABLE_VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';

  return variableName + ' = ' + value + ';\n';
};


Blockly.Solidity['struct_variable_get'] = function(block) {
  var varName = block.getFieldValue('STRUCT_VARIABLE_NAME');
  return [varName, Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['struct_member_set'] = function(block) {
  var variableName = block.getFieldValue('STRUCT_VARIABLE_NAME');
  var memberName = block.getFieldValue('STRUCT_MEMBER_NAME');
  var value = Blockly.Solidity.valueToCode(block, 'STRUCT_VARIABLE_VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';

  return variableName + '.' + memberName + ' = ' + value + ';\n';
};


Blockly.Solidity['struct_member_get'] = function(block) {
  var variableName = block.getFieldValue('STRUCT_VARIABLE_NAME');
  var memberName = block.getFieldValue('STRUCT_MEMBER_NAME');
  return [variableName + '.' + memberName, Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['mapping_definition'] = function(block) {
  var type1 = types[block.getFieldValue('TYPE1')];
  var type2 = types[block.getFieldValue('TYPE2')];
  var publicCheckbox = '';
  if (block.getFieldValue('PUBLIC_CHECKBOX') == 'TRUE') 
    publicCheckbox = 'public ';
  var varName = block.getFieldValue('NAME');

  return 'mapping(' + type1 + ' => ' + type2 + ') ' + publicCheckbox + varName + ';\n';
};


Blockly.Solidity['mapping_set'] = function(block) {
  var variableName = block.getFieldValue('MAPPING_VARIABLE_NAME');
  var arg = Blockly.Solidity.valueToCode(block, 'ARG',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  var value = Blockly.Solidity.valueToCode(block, 'VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';

  return variableName + '[' + arg + '] = ' + value + ';\n';
};


Blockly.Solidity['mapping_get'] = function(block) {
  var variableName = block.getFieldValue('MAPPING_VARIABLE_NAME');
  var arg = Blockly.Solidity.valueToCode(block, 'ARG',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  return [variableName + '[' + arg + ']', Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['usingFor'] = function(block) {
  var libraryName = block.getFieldValue('LIB_NAME');
  var attachedType = block.getFieldValue('TYPE');

  if (libraryName == "select library...")
    return '';

  return 'using ' + libraryName + ' for ' + types[attachedType] + ';\n\n';
};



