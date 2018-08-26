/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Solidity for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Solidity.logic');

goog.require('Blockly.Solidity');


Blockly.Solidity['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  do {
    conditionCode = Blockly.Solidity.valueToCode(block, 'IF' + n,
      Blockly.Solidity.ORDER_NONE) || 'false';
    branchCode = Blockly.Solidity.statementToCode(block, 'DO' + n);
    code += (n > 0 ? ' else ' : '') +
        'if (' + conditionCode + ') {\n' + branchCode + '}';

    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE')) {
    branchCode = Blockly.Solidity.statementToCode(block, 'ELSE');
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

Blockly.Solidity['controls_ifelse'] = Blockly.Solidity['controls_if'];


Blockly.Solidity['controls_for'] = function(block) {
  var variable = block.getFieldValue('NAME');
  var from = Blockly.Solidity.valueToCode(block, 'FROM',
      Blockly.Solidity.ORDER_ASSIGNMENT) || 0;
  var to = Blockly.Solidity.valueToCode(block, 'TO',
      Blockly.Solidity.ORDER_ASSIGNMENT) || 0;
  var code = Blockly.Solidity.statementToCode(block, 'CODE');

  return 'for (uint ' + variable + '=' + from + '; '+ variable + '<' + to + '; '+ variable + '++) {\n  ' + code + '\n}\n\n\n';
};


Blockly.Solidity['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      Blockly.Solidity.ORDER_EQUALITY : Blockly.Solidity.ORDER_RELATIONAL;
  var argument0 = Blockly.Solidity.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Solidity.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Solidity['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Solidity.ORDER_LOGICAL_AND :
      Blockly.Solidity.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Solidity.valueToCode(block, 'A', order);
  var argument1 = Blockly.Solidity.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Solidity['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Solidity.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.Solidity.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Solidity['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Solidity.ORDER_ATOMIC];
};

Blockly.Solidity['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Solidity.ORDER_ATOMIC];
};

Blockly.Solidity['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Solidity.valueToCode(block, 'IF',
      Blockly.Solidity.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Solidity.valueToCode(block, 'THEN',
      Blockly.Solidity.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Solidity.valueToCode(block, 'ELSE',
      Blockly.Solidity.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Solidity.ORDER_CONDITIONAL];
};


Blockly.Solidity['text'] = function(block) {
  // Text value.
  var code = block.getFieldValue('TEXT');
  return ['"' + code + '"', Blockly.Solidity.ORDER_ATOMIC];
};

Blockly.Solidity['text_length'] = function(block) {
  // String or array length.
  var text = Blockly.Solidity.valueToCode(block, 'VALUE',
      Blockly.Solidity.ORDER_FUNCTION_CALL) || '\'\'';
  return [text + '.length', Blockly.Solidity.ORDER_MEMBER];
};


