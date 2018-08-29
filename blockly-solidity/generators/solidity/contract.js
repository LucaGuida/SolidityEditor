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
    'TYPE_BYTES': 'bytes',
    'TYPE_BYTES32': 'bytes32',
    'TYPE_STRING': 'string',
    'TYPE_BOOL_ARRAY': 'bool[]',
    'TYPE_INT_ARRAY': 'int[]',
    'TYPE_UINT_ARRAY': 'uint[]',
    'TYPE_ADDRESS_ARRAY': 'address[]',
    'TYPE_BYTES_ARRAY': 'bytes[]',
    'TYPE_BYTES32_ARRAY': 'bytes32[]',
    'TYPE_STRING_ARRAY': 'string[]',
    'TYPE_STAR': '*'
  };

  var defaultValue = {
    'TYPE_BOOL': 'false',
    'TYPE_INT': '0',
    'TYPE_UINT': '0',
    'TYPE_ADDRESS': '0x0000000000000000000000000000000000000000',
    'TYPE_BYTES': '""',
    'TYPE_BYTES32': '""',
    'TYPE_STRING': '""',
    'TYPE_BOOL_ARRAY': '[]',
    'TYPE_INT_ARRAY': '[]',
    'TYPE_UINT_ARRAY': '[]',
    'TYPE_ADDRESS_ARRAY': '[]',
    'TYPE_BYTES_ARRAY': '[]',
    'TYPE_BYTES32_ARRAY': '[]',
    'TYPE_STRING_ARRAY': '[]',
  };

Blockly.Solidity['contract'] = function(block) {

  var imports = '';
  var importsArray = [];
  var libraryCallBlocksArray = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.type == 'library_method_call' || b.type == 'library_method_call_with_return_value' || b.type == 'usingFor' || b.type == 'inherit'});
  if (typeof libraryCallBlocksArray[0] != 'undefined') {
    for (var i = 0; i < libraryCallBlocksArray.length; i++)
      if (libraryCallBlocksArray[i].getFieldValue('LIB_NAME')!='select external contract or library...' && libraryCallBlocksArray[i].getFieldValue('LIB_NAME')!='select library...' && libraryCallBlocksArray[i].getFieldValue('LIB_NAME')!='select external contract...' && !importsArray.includes(libraryCallBlocksArray[i].getFieldValue('LIB_NAME')))
        importsArray.push(libraryCallBlocksArray[i].getFieldValue('LIB_NAME'));
  }
  if (importsArray!=null) {
    for (var i = 0; i < importsArray.length; i++)
      imports = imports + 'import "./' + importsArray[i] + '.sol";\n';
    imports += '\n';
  }


  var inheritedContracts = '';
  var inheritArray = [];

  var OraclizeBlock = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return (b.type == 'oraclize_query'||b.type == 'oraclize_scheduled_query')});
  var inheritedContracts = '';
  if (typeof OraclizeBlock[0] != 'undefined' && OraclizeBlock[0].getFieldValue('URL')!='URL to query')
    {
      events =  events + '  event LogNewOraclizeQuery(string description);\n\n';
      inheritArray.push('usingOraclize');
      imports = 'import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";\n' + imports;
    }


  var inheritBlocksArray = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.type == 'inherit'});
  if (typeof inheritBlocksArray[0] != 'undefined') {
    for (var i = 0; i < inheritBlocksArray.length; i++)
      if (inheritBlocksArray[i].getFieldValue('LIB_NAME')!='select external contract...' && !inheritArray.includes(inheritBlocksArray[i].getFieldValue('LIB_NAME')))
        inheritArray.push(inheritBlocksArray[i].getFieldValue('LIB_NAME'));
  }

  if (inheritArray!=null) {
    for (var i = 0; i < inheritArray.length; i++)
      if (i!=inheritArray.length-1)
        inheritedContracts = inheritedContracts + inheritArray[i] + ', ';
      else 
        inheritedContracts = inheritedContracts + inheritArray[i];
  }

  if (inheritedContracts.length>1)
    inheritedContracts = ' is ' + inheritedContracts + ' ';


  var contract_docs = Blockly.Solidity.statementToCode(block, 'DOCS');
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

  var code = 'pragma solidity 0.4.24;\n\n'
    + imports
    + contract_docs.replace(new RegExp('  ///', 'g'), '///')
    + 'contract ' + block.getFieldValue('NAME') + inheritedContracts + ' {\n\n'
    + states
    + modifiers
    + events
    + ctor.replace(new RegExp('    ///', 'g'), '  ///')
    + methods.replace(new RegExp('    ///', 'g'), '  ///')
    + methodsWithReturn.replace(new RegExp('    ///', 'g'), '  ///')
    + '\n}\n';

  return code;
};


Blockly.Solidity['contract_state'] = function(block) {
  var name = block.getFieldValue('NAME');
  var value = Blockly.Solidity.valueToCode(block, 'VALUE', Blockly.Solidity.ORDER_ASSIGNMENT);
  var type = block.getFieldValue('TYPE');
  var visibility = block.getFieldValue('VISIBILITY');

  if (value === '') {
    value = defaultValue[type];
  }

  return types[type] + ' ' + visibility + ' ' + name + ' = ' + value + ';\n';
};

Blockly.Solidity['owner_var_declaration'] = function(block) {
  var name = block.getFieldValue('NAME');
  var visibility = block.getFieldValue('VISIBILITY');
  var code = 'address ' + visibility + ' ' + name + ';\n';
  return code;
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
  var indexedCheckbox;
  if (block.getFieldValue('INDEXED_CHECKBOX')=="TRUE") {indexedCheckbox = " indexed";}
    else {indexedCheckbox = "";}
  
  var nextBlock = block.getNextBlock();
  var sep = nextBlock && nextBlock.type == block.type ? ',' : '';

  return types[type] + ' ' + indexedCheckbox + ' ' + name + sep + '\n';
};


Blockly.Solidity['event_emission'] = function(block) {
  var eventName = block.getFieldValue('EVENT_NAME');

  var args = Blockly.Solidity.statementToCode(block, 'ARGS');

  if (typeof args == 'undefined' || args=='') 
    args = '';
  else {
    args = args.trim();
    args = args.substring(0, args.length - 1);
  }

  if (eventName == 'select event...')
    return '';
  return 'emit ' + eventName + '(' + args + ');\n';
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


Blockly.Solidity['modifier_onlyBy'] = function(block) {
  var name = block.getFieldValue('MODIFIER_NAME');
  var code = 'modifier ' + name + '(address _account)' + '\n{\n\trequire(\n\t\tmsg.sender == _account,\n\t\t"Only the specified account can call this function."\n\t);\n\t _;\n}\n\n';
  return code;
};


Blockly.Solidity['modifier_onlyOwner'] = function(block) {
  var name = block.getFieldValue('MODIFIER_NAME');
  var code = 'modifier ' + name + '\n{\n\trequire(\n\t\tmsg.sender == owner,\n\t\t"Only owner can call this function."\n\t);\n\t _;\n}\n\n';
  return code;
};


Blockly.Solidity['modifier_onlyAfter'] = function(block) {
  var name = block.getFieldValue('MODIFIER_NAME');
  var code = 'modifier ' + name + '(uint _time)' + '\n{\n\trequire(\n\t\tnow >= _time,\n\t\t"Function called too early."\n\t);\n\t _;\n}\n\n';
  return code;
};


Blockly.Solidity['modifier_usage'] = function(block) {
  var modifierName = block.getFieldValue('MODIFIER_NAME');

  var args = Blockly.Solidity.statementToCode(block, 'ARGS');

  if (typeof args == 'undefined' || args=='') 
    args = '';
  else {
    args = args.trim();
    args = args.substring(0, args.length - 1);
  }

  if (modifierName=='select modifier...')
    return '';

  return modifierName + '(' + args + ') ';
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
  var visibility = block.getFieldValue('VISIBILITY');
  var varName = block.getFieldValue('ENUM_VAR_NAME');
  if (enumType == 'select enum type...') 
    return '';

  return enumType + ' ' + visibility + ' ' + varName + ';\n';
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
  var visibility = block.getFieldValue('VISIBILITY');
  var varName = block.getFieldValue('STRUCT_VAR_NAME');
  if (structType == 'select struct type...') 
    return '';

  return structType + ' ' + visibility + ' ' + varName + ';\n';
};


Blockly.Solidity['struct_variable_set'] = function(block) {
  var variableName = block.getFieldValue('STRUCT_VARIABLE_NAME');
  var value = Blockly.Solidity.valueToCode(block, 'STRUCT_VARIABLE_VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';

  if (variableName=='select struct variable...')
    return '';

  return variableName + ' = ' + value + ';\n';
};


Blockly.Solidity['struct_variable_get'] = function(block) {
  var varName = block.getFieldValue('STRUCT_VARIABLE_NAME');
  if (variableName=='select struct variable...')
    return '';

  return [varName, Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['struct_member_set'] = function(block) {
  var variableName = block.getFieldValue('STRUCT_VARIABLE_NAME');
  var memberName = block.getFieldValue('STRUCT_MEMBER_NAME');
  var value = Blockly.Solidity.valueToCode(block, 'STRUCT_VARIABLE_VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  var index = Blockly.Solidity.valueToCode(block, 'ARRAY_INDEX',
      Blockly.Solidity.ORDER_ASSIGNMENT);

  if (typeof index != 'undefined' && variableName.substring(variableName.length-2, variableName.length)=='[]')
    return variableName.substring(0, variableName.length-2) + '[' + index + '].' + memberName + ' = ' + value + ';\n';
  else 
    return variableName + '.' + memberName + ' = ' + value + ';\n';
};


Blockly.Solidity['struct_member_get'] = function(block) {
  var variableName = block.getFieldValue('STRUCT_VARIABLE_NAME');
  var memberName = block.getFieldValue('STRUCT_MEMBER_NAME');
  var index = Blockly.Solidity.valueToCode(block, 'ARRAY_INDEX',
      Blockly.Solidity.ORDER_ASSIGNMENT);
  if (typeof index != 'undefined' && variableName.substring(variableName.length-2, variableName.length)=='[]')
    return [variableName.substring(0, variableName.length-2) + '[' + index + '].' + memberName, Blockly.Solidity.ORDER_ATOMIC];
  else 
    return [variableName + '.' + memberName, Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['mapping_definition'] = function(block) {
  var type1 = types[block.getFieldValue('TYPE1')];
  var type2 = types[block.getFieldValue('TYPE2')];
  var visibility = block.getFieldValue('VISIBILITY');

  var varName = block.getFieldValue('NAME');

  return 'mapping(' + type1 + ' => ' + type2 + ') ' + visibility + ' ' + varName + ';\n';
};


Blockly.Solidity['mapping_set'] = function(block) {
  var variableName = block.getFieldValue('MAPPING_VARIABLE_NAME');
  var arg = Blockly.Solidity.valueToCode(block, 'ARG',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  var value = Blockly.Solidity.valueToCode(block, 'VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';

  if (variableName=='select mapping variable...')
    return '';

  return variableName + '[' + arg + '] = ' + value + ';\n';
};


Blockly.Solidity['mapping_get'] = function(block) {
  var variableName = block.getFieldValue('MAPPING_VARIABLE_NAME');
  var arg = Blockly.Solidity.valueToCode(block, 'ARG',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';

  if (variableName=='select mapping variable...')
    return '';

  return [variableName + '[' + arg + ']', Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['array_variable_declare'] = function(block) {
  var arrayType = block.getFieldValue('TYPE');
  var visibility = block.getFieldValue('VISIBILITY');
  var varName = block.getFieldValue('VAR_NAME');
  if (arrayType == 'select type...') 
    return '';

  return types[arrayType] + '[] ' + visibility + ' ' + varName + ';\n';
};


Blockly.Solidity['array_variable_set'] = function(block) {
  var variableName = Blockly.Solidity.valueToCode(block, 'ARRAY_VARIABLE_NAME',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  var value = Blockly.Solidity.valueToCode(block, 'ARRAY_VARIABLE_VALUE',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  if (variableName == " ")
    return '';

  return variableName + ' = ' + value + ';\n';
};


Blockly.Solidity['array_variable_push'] = function(block) {
  var variableName = Blockly.Solidity.valueToCode(block, 'ARRAY_VARIABLE_NAME',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  var newElement = Blockly.Solidity.valueToCode(block, 'NEW_ELEMENT',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  if (variableName == ' ')
    return '';

  return variableName + '.push(' + newElement + ');\n';
};


Blockly.Solidity['array_variable_element_get'] = function(block) {
  var variableName = Blockly.Solidity.valueToCode(block, 'ARRAY_VARIABLE_NAME',
      Blockly.Solidity.ORDER_ASSIGNMENT) || ' ';
  var index = Blockly.Solidity.valueToCode(block, 'INDEX',
      Blockly.Solidity.ORDER_ASSIGNMENT) || 0;
  if (variableName == " ")
    return '';

  return [variableName + '[' + index + ']', Blockly.Solidity.ORDER_ATOMIC];
};

Blockly.Solidity['array_variable_get'] = function(block) {
  var variableName = block.getFieldValue('ARRAY_VARIABLE_NAME');
  if (variableName == "select array variable...")
    return '';

  return [variableName, Blockly.Solidity.ORDER_ATOMIC];
};

Blockly.Solidity['usingFor'] = function(block) {
  var libraryName = block.getFieldValue('LIB_NAME');
  var attachedType = block.getFieldValue('TYPE');

  if (libraryName == "select library...")
    return '';

  return 'using ' + libraryName + ' for ' + types[attachedType] + ';\n\n';
};


Blockly.Solidity['inherit'] = function(block) {
  return '';
};


Blockly.Solidity['oraclize_query'] = function(block) {
  var URL = block.getFieldValue('URL');
  var callback = Blockly.Solidity.statementToCode(block, 'CALLBACK');
  if (URL == 'URL to query')
    return '';
  return 'function __callback(bytes32 myid, string result) {\n  require(msg.sender == oraclize_cbAddress());\n' + callback + '\n  emit LogAPIUpdated(usingOraclize.strConcat("Oraclize query response received: ", result, "", "", ""));\n}\n\n\n' + 'if (oraclize_getPrice("URL") > this.balance) {\n  emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");\n} else {\n  emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");\n  bytes32 queryId = oraclize_query("URL", "' + URL + '");\n}' + '\n\n\n';
};


Blockly.Solidity['oraclize_scheduled_query'] = function(block) {
  var URL = block.getFieldValue('URL');
  var time = block.getFieldValue('TIME');
  var callback = Blockly.Solidity.statementToCode(block, 'CALLBACK');
  if (URL == 'URL to query')
    return '';
  return 'function __callback(bytes32 myid, string result) {\n  require(msg.sender == oraclize_cbAddress());\n' + callback + '\n  emit LogAPIUpdated(usingOraclize.strConcat("Oraclize query response received: ", result, "", "", ""));\n}\n\n\n' + 'if (oraclize_getPrice("URL") > this.balance) {\n  emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");\n} else {\n  emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");\n  bytes32 queryId = oraclize_query(' + time + ', "URL", "' + URL + '");\n}' + '\n\n\n';
};


Blockly.Solidity['oraclize_result'] = function(block) {
  return ['result', Blockly.Solidity.ORDER_ATOMIC];
};


Blockly.Solidity['NatSpec_contract'] = function(block) {
  var title = block.getFieldValue('TITLE');
  var author = block.getFieldValue('AUTHOR');
  var notice = block.getFieldValue('NOTICE');
  var dev = block.getFieldValue('DEV');
  var returnString = '';

  if (title!='') 
    returnString = '/// @title ' + title + '\n';
  if (author!='') 
    returnString = returnString + '/// @autor ' + author + '\n';
  if (notice!='') 
    returnString = returnString + '/// @notice ' + notice + '\n';
  if (dev!='') 
    returnString = returnString + '/// @dev ' + dev + '\n';

  return returnString;
};


Blockly.Solidity['NatSpec_function'] = function(block) {
  var author = block.getFieldValue('AUTHOR');
  var notice = block.getFieldValue('NOTICE');
  var dev = block.getFieldValue('DEV');
  var parameters = Blockly.Solidity.statementToCode(block, 'PARAMS');
  var returnValue = block.getFieldValue('RETURN');

  var returnString = '';

  if (author!='') 
    returnString = returnString + '/// @autor ' + author + '\n';
  if (notice!='') 
    returnString = returnString + '/// @notice ' + notice + '\n';
  if (dev!='') 
    returnString = returnString + '/// @dev ' + dev + '\n';
  if (typeof parameters != 'undefined' && parameters!='') 
    returnString = returnString + parameters;
  if (returnValue!='') 
    returnString = returnString + '/// @return ' + returnValue + '\n';

  return returnString.replace(new RegExp('  ///', 'g'), '///');
};


Blockly.Solidity['NatSpec_function_parameter'] = function(block) {
  var paramName = block.getFieldValue('PARAM');
  if (paramName!='') 
    return '/// @param ' + paramName + '\n';
  else return '';
};


Blockly.Solidity['ctor_owner'] = function(block) {
  // Variable setter.

  var variableId = block.getFieldValue('STATE_NAME');
  var variable = block.workspace.getVariableById(variableId);

  if (!variable) {
    return '';
  }

  return Blockly.Solidity.getVariableName(variable) + ' = msg.sender;\n\n';
};
