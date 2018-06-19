/**
 * @fileoverview Helper functions for generating Solidity for blocks.
 * @author jeanmarc.leroux@google.com (Jean-Marc Le Roux)
 * @author rekmarks@icloud.com  (Erik Marks)
 */

'use strict';

goog.provide('Blockly.Solidity.contract');

Blockly.Extensions.register(
  'declare_typed_variable',
  function() {
    var block = this;

    if (!this.getVariableNameField) {
      throw 'missing getVariableNameField method';
    }

    if (!this.getVariableType) {
      throw 'missing getVariableType method';
    }

    if (!this.getVariableGroup) {
      throw 'missing getVariableGroup method';
    }

    if (!this.getVariableScope) {
      throw 'missing getVariableScope method';
    }

    this.declareOrUpdateVariable = function(name, force = false) {
      var oldName = this.getVariableNameField().getValue();

      if (!this.getParent()) {
        return oldName;
      }

      if (!force && (!this.getParent() || oldName == name)) {
        return oldName;
      }

      var group = this.getVariableGroup();
      var scope = this.getVariableScope();
      var type = this.getVariableType();

      if (!Blockly.Solidity.getVariableByNameAndScope(name, scope, group)) {
        newName = name;
      } else {
        var count = 2;
        var newName = name + count;
        while (Blockly.Solidity.getVariableByNameAndScope(newName, scope, group)) {
          count++;
          newName = name + count;
        }
      }

      var variable = Blockly.Solidity.getVariableById(this.workspace, this.id);
      if (!variable) {
        Blockly.Solidity.createVariable(this.workspace, group, type, newName, scope, this.id);
      } else {
        variable.name = newName;
      }

      if (force) {
        this.getVariableNameField().setText(newName);
      }

      Blockly.Solidity.updateWorkspaceNameFields(this.workspace);

      return newName;
    };

    this.getVariableNameField().setValidator(function(name) {
      return block.declareOrUpdateVariable(name);
    });

    var onchange = null;
    if (goog.isFunction(this.onchange)) {
      onchange = this.onchange;
    }

    this.setOnChange(function(event) {
      Blockly.Solidity.updateWorkspaceNameFields(this.workspace);
      Blockly.Solidity.updateWorkspaceStateTypes(this.workspace);
      Blockly.Solidity.updateWorkspaceParameterTypes(this.workspace);

      if (event.blockId != this.id) {
        return;
      }

      if (event.type == "move" && !!event.oldParentId) {
        if (!!Blockly.Solidity.getVariableById(this.workspace, this.id)) {
          Blockly.Solidity.deleteVariableById(this.workspace, this.id);
        }
      }
      if (event.type == "move" && !!event.newParentId) {
        if (!this.workspace.getVariableById(this.id)) {
          this.declareOrUpdateVariable(this.getVariableNameField().getValue(), true);
        }
      }
      if (event.element == "field" && event.name == "TYPE") {
        var variable = this.workspace.getVariableById(this.id);

        variable.type = this.getVariableType();
        Blockly.Solidity.updateWorkspaceStateTypes(this.workspace);
      }

      if (!!onchange) {
        onchange.call(block, event);
      }
    });
  }
);

Blockly.defineBlocksWithJsonArray([
  {
    "type": "contract",
    "message0": 'smart contract %1',
    "args0": [
      {
        "type": "field_input",
        "name": "NAME",
        "check": "String",
        "text": "MyContract",
      }
    ],
    "message1": "imports %1",
    "args1": [
      {
        "type": "input_statement",
        "name": "IMPORTS",
        "check": ["contract_import"],
        "align": "RIGHT"
      }
    ],
    "message2": "state variables & enums %1",
    "args2": [
      {
        "type": "input_statement",
        "name": "STATES",
        "check": ["contract_state", "enum_definition", "enum_variable_create"],
        "align": "RIGHT"
      }
    ],
    "message3": "modifiers definition %1",
    "args3": [
      {
        "type": "input_statement",
        "name": "MODIFIERS",
        "check": ["modifier_definition"],
        "align": "RIGHT"
      }
    ],
    "message4": "events definition %1",
    "args4": [
      {
        "type": "input_statement",
        "name": "EVENTS",
        "check": ["event_definition"],
        "align": "RIGHT"
      }
    ],
    "message5": "constructor definition %1",
    "args5": [
      {
        "type": "input_statement",
        "name": "CTOR",
        "check": ["contract_ctor"],
        "align": "RIGHT"
      }
    ],
    "message6": "functions definition %1",
    "args6": [
      {
        "type": "input_statement",
        "name": "METHODS",
        "check": ["contract_method"],
        "align": "RIGHT"
      }
    ],
    "message7": "functions with return definition %1",
    "args7": [
      {
        "type": "input_statement",
        "name": "METHODS_WITH_RETURN",
        "check": ["contract_method_with_return"],
        "align": "RIGHT"
      }
    ],
    "colour": 160,
    "tooltip": "Declares a new smart contract."
  }
]);

// List of types
var typesList = [
            [ "bool", "TYPE_BOOL" ],
            [ "int",  "TYPE_INT" ],
            [ "uint", "TYPE_UINT" ],
            [ "address", "TYPE_ADDRESS" ],
            [ "bytes", "TYPE_BYTES_ARRAY" ],
            [ "string", "TYPE_STRING" ],
          ];


// List of default libraries TEMP
var librariesList = [
            [ "demo-lib1", "lib1" ],
            [ "demo-lib2",  "lib2" ]
          ];


// Read JSON libraries list 
var jsonObj;
var request = new XMLHttpRequest();
request.open('GET', 'librariesList.json', false);  // `false` makes the request synchronous
request.send(null);
if (request.status === 200) {
  jsonObj = JSON.parse(request.responseText);
  var librariesArray = [];
  for(var lib in jsonObj) librariesArray.push(lib);

  librariesList = [];
  librariesArray.forEach(function(entry) {
    librariesList.push([entry,entry]);
  });
  //console.log(librariesList);
}


Blockly.Blocks['contract_import'] = {

  init: function() {

    this.appendDummyInput()
        .appendField("import")
        .appendField(new Blockly.FieldDropdown(librariesList),
          'LIB_NAME'
        )
        //.appendField(new Blockly.FieldTextInput('libraryName'), 'LIB_NAME'); //text input field instead of dropdown menu
    this.setColour("#1976D2");
    this.setTooltip('Name of an external contract/library to import into the contract.');

    this.setPreviousStatement(true, 'contract_import');
    this.setNextStatement(true, 'contract_import');

    this.setDisabled(false);


    this._stateNameInitialized = false;

    this.getVariableNameField = function() { return nameField; }
    this.getVariableType = function() { return this.getFieldValue('TYPE') };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_IMPORT };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    //Blockly.Extensions.apply('declare_typed_variable', this, false);
  }
};


Blockly.Blocks['contract_state'] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput('variableName');
    this.appendDummyInput()
        .appendField('State variable type')
        .appendField(new Blockly.FieldDropdown(typesList),
          'TYPE'
        )
        .appendField(nameField, 'NAME');
    this.setPreviousStatement(true, 'contract_state');
    this.setNextStatement(true, 'contract_state');
    this.setColour("#1976D2");
    this.contextMenu = false;
    this.setTooltip('State variable declaration');

    this._stateNameInitialized = false;

    this.getVariableNameField = function() { return nameField; }
    this.getVariableType = function() { return this.getFieldValue('TYPE') };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};

Blockly.Blocks['contract_state_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ["select state variable...", Blockly.Solidity.UNDEFINED_NAME],
        ]),
        "STATE_NAME"
      );
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('State variable selector');

    this.getVariableNameSelectField = function() { return this.getField('STATE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };
  }
};

Blockly.Blocks['contract_state_set'] = {
  init: function() {
    this.appendValueInput('STATE_VALUE')
      .appendField("set")
      .appendField(
        new Blockly.FieldDropdown(
          [["select state variable...", Blockly.Solidity.UNDEFINED_NAME]],
          this.validate
        ),
        "STATE_NAME"
      )
      .appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#1976D2");
    this.setTooltip('State variable setter');

    this.getVariableNameSelectField = function() { return this.getField('STATE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };
  },

  validate: function(stateNameVariableId) {
    var workspace = this.sourceBlock_.workspace;
    // FIXME: dirty hack to make sure updateWorkspaceStateTypes is called right after validate
    setTimeout(
      function() { Blockly.Solidity.updateWorkspaceStateTypes(workspace) },
      1
    );
    return stateNameVariableId;
  }
};

Blockly.Blocks['contract_method'] = {
  init: function() {
    this.jsonInit({
      "message0": "function %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "myFunction"
        },
      ],
      "message1": "parameters %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "PARAMS",
          "check": ["contract_method_parameter"],
          "align": "RIGHT"
        },
      ],
      "message2": "public %1  payable %2",
      "args2": [
        {
          "type": "field_checkbox",
          "name": "PUBLIC_CHECKBOX",
          "checked": false
        },
        {
          "type": "field_checkbox",
          "name": "PAYABLE_CHECKBOX",
          "checked": false
        }
      ],
      "message3": "modifiers %1",
      "args3": [
        {
          "type": "input_statement",
          "name": "MODIF",
          "check": ["modifier_usage"]
        }
      ],
      "message4": "code %1",
      "args4": [
        {
          "type": "input_statement",
          "name": "STACK"        
        }
      ],
      "previousStatement": "contract_method",
      "nextStatement": "contract_method",
      "colour": "#1976D2",
      "tooltip": "Function definition",
      "helpUrl": ""
    });

    this.getVariableNameField = function() { return this.getField('NAME') };
    this.getVariableType = function() { return 'void' }; //contract_method
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};


Blockly.Blocks['contract_method_with_return'] = {
  init: function() {
    this.jsonInit({
      "message0": "function %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "myFunction"
        }
      ],
      "message1": "parameters %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "PARAMS",
          "check": ["contract_method_parameter"],
          "align": "RIGHT"
        }
      ],
      "message2": "public %1  payable %2",
      "args2": [
        {
          "type": "field_checkbox",
          "name": "PUBLIC_CHECKBOX",
          "checked": false
        },
        {
          "type": "field_checkbox",
          "name": "PAYABLE_CHECKBOX",
          "checked": false
        }
      ],
      "message3": "modifiers %1",
      "args3": [
        {
          "type": "input_statement",
          "name": "MODIF",
          "check": ["modifier_usage"]
        }
      ],
      "message4": "returning value of type %1",
      "args4": [
        {
          "type": "field_dropdown",
          "name": "RETURN_TYPE",
          "options": typesList
        }
      ],  
      "message5": "code %1",
      "args5": [
        {
          "type": "input_statement",
          "name": "STACK"
        }
      ],
      "message6": "return value %1",
      "args6": [
        {
          "type": "input_value",
          "name": "RETURN_VALUE"
        }
      ],
      "previousStatement": "contract_method_with_return",
      "nextStatement": "contract_method_with_return",
      "colour": "#1976D2",
      "tooltip": "Function with return value definition",
      "helpUrl": ""
    });



    this.getVariableNameField = function() { return this.getField('NAME') };
    this.getVariableType = function() { return 'void' }; //contract_method_with_return
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);

  },
};


Blockly.Blocks['contract_method_parameter'] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput('parameterName');
    this.appendDummyInput()
        .appendField('Parameter type')
        .appendField(new Blockly.FieldDropdown(typesList),
          'TYPE'
        )
        .appendField(nameField, 'NAME');
    this.setPreviousStatement(true, 'contract_method_parameter');
    this.setNextStatement(true, 'contract_method_parameter');
    this.setColour("#1976D2");
    this.contextMenu = false;
    this.setTooltip('Parameter declaration');

    this.getVariableNameField = function() { return nameField };
    this.getVariableType = function() { return this.getFieldValue('TYPE') };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_PARAMETER };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && (scope.type != 'contract_method' && scope.type != 'contract_method_with_return' && scope.type != 'contract_ctor' && scope.type != 'modifier_definition')) {        
        scope = scope.getParent();
      }
      return scope; // return block representing the scope of the parameter
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};


Blockly.Blocks['contract_method_parameter_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ["select param...", Blockly.Solidity.UNDEFINED_NAME],
        ]),
        "PARAM_NAME"
      );
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Parameter selector');

    this.getVariableNameSelectField = function() { return this.getField('PARAM_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_PARAMETER };
  }
};


/* function dynamicFunctionsList () {
  var functionsList = [[ "select function...", "select function..." ]];

  var functionVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('contract_method');
  if (typeof functionVariablesArray[0] != 'undefined') {
    var functionsNamePairsArray = [];
    for (var i = 0; i < functionVariablesArray.length; i++)
      functionsNamePairsArray.push([Blockly.Solidity.getVariableName(functionVariablesArray[i]),Blockly.Solidity.getVariableName(functionVariablesArray[i])]);
    functionsList = functionsNamePairsArray;
  }

  return functionsList;
} */


Blockly.Blocks['contract_method_call'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('call function')
      .appendField(
        new Blockly.FieldDropdown([["select function...", Blockly.Solidity.UNDEFINED_NAME],]),
        /*new Blockly.FieldDropdown(dynamicFunctionsList),*/
        "METHOD_NAME"
      );
    this.appendValueInput('ARG1')
      .appendField("argument 1")
    this.appendValueInput('ARG2')
      .appendField("argument 2")
    this.appendValueInput('ARG3')
      .appendField("argument 3")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    // this.setOutput(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Call of a function which does not return a value');

    this.getVariableNameSelectField = function() { return this.getField('METHOD_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };


    this.setOnChange(function(event) {
      if (event.blockId != this.id) {
        return;
      }

      if (event.element == 'field' && event.name == 'METHOD_NAME') {
        var methodId = this.getFieldValue('METHOD_NAME');
        var methodBlock = this.workspace.getBlockById(methodId);
        var params = [];

        var block = methodBlock;
        do {
          block = block.getChildren()
            .filter(function(c) { return c.type == 'contract_method_parameter' })[0];

          if (block) {
            params.push(block);
          }
        } while (block)

        //console.log(params);
        // FIXME: add/remove inputs according to the method params
      }
    }); 
  }
};



/* function dynamicFunctionsWithReturnList () {
  var functionsWithReturnList = [[ "select function with return value...", "select function with return value..." ]];

  var functionWithReturnVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('contract_method_with_return');
  if (typeof functionWithReturnVariablesArray[0] != 'undefined') {
    var functionsWithReturnNamePairsArray = [];
    for (var i = 0; i < functionWithReturnVariablesArray.length; i++)
      functionsWithReturnNamePairsArray.push([Blockly.Solidity.getVariableName(functionWithReturnVariablesArray[i]),Blockly.Solidity.getVariableName(functionWithReturnVariablesArray[i])]);
    functionsWithReturnList = functionsWithReturnNamePairsArray;
  }

  return functionsWithReturnList;
} */



Blockly.Blocks['contract_method_call_with_return_value'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('call function')
      .appendField(
        /*new Blockly.FieldDropdown(dynamicFunctionsWithReturnList),*/
        new Blockly.FieldDropdown([["select function...", Blockly.Solidity.UNDEFINED_NAME],]),
        "METHOD_NAME"
      )
      .appendField('with return value');
    this.appendValueInput('ARG1')
      .appendField("argument 1")
    this.appendValueInput('ARG2')
      .appendField("argument 2")
    this.appendValueInput('ARG3')
      .appendField("argument 3")
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Call of a function which returns a value');

    this.getVariableNameSelectField = function() { return this.getField('METHOD_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };


    this.setOnChange(function(event) {
      if (event.blockId != this.id) {
        return;
      }

      if (event.element == 'field' && event.name == 'METHOD_NAME') {
        var methodId = this.getFieldValue('METHOD_NAME');
        var methodBlock = this.workspace.getBlockById(methodId);
        var params = [];

        var block = methodBlock;
        do {
          block = block.getChildren()
            .filter(function(c) { return c.type == 'contract_method_parameter' })[0];

          if (block) {
            params.push(block);
          }
        } while (block)

        //console.log(params);
        // FIXME: add/remove inputs according to the method params
      }
    });
  }
};


function dynamicLibFunctsList() {
  var options = [['demo-func1', 'Func1'],['demo-func2', 'Func2'],['demo-func3', 'Func3']];

  if (typeof jsonObj != 'undefined') {
    options = [];
    for(var lib in jsonObj) 
      for (var i = 0; i < jsonObj[lib].length; i++)
        options.push([lib + ' > ' + jsonObj[lib][i], lib + '.' + jsonObj[lib][i]]);
  }
  return options;
}

Blockly.Blocks['library_method_call'] = {
  init: function() {
    this.appendDummyInput()  
      .appendField('call library function')
      .appendField(
        new Blockly.FieldDropdown(dynamicLibFunctsList),
        "LIB_FUNCT_NAME"
      );
    this.appendValueInput('ARG1')
      .appendField("argument 1")
    this.appendValueInput('ARG2')
      .appendField("argument 2")
    this.appendValueInput('ARG3')
      .appendField("argument 3")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    // this.setOutput(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Call of a library function which does not return a value');

    this.getVariableNameSelectField = function() { return this.getField('METHOD_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_LIBRARY };

/*
    this.setOnChange(function(event) {
      if (event.blockId != this.id) {
        return;
      }

      if (event.element == 'field' && event.name == 'METHOD_NAME') {
        var methodId = this.getFieldValue('METHOD_NAME');
        var methodBlock = this.workspace.getBlockById(methodId);
        var params = [];

        var block = methodBlock;
        do {
          block = block.getChildren()
            .filter(function(c) { return c.type == 'contract_method_parameter' })[0];

          if (block) {
            params.push(block);
          }
        } while (block)

        //console.log(params);
        // FIXME: add/remove inputs according to the method params
      }
    });

*/    
  }
};

Blockly.Blocks['library_method_call_with_return_value'] = {
  init: function() {
    /*this.appendDummyInput()
      .appendField('call library')
      .appendField(
        new Blockly.FieldDropdown(librariesList),
        "LIB_NAME"
      );*/
    this.appendDummyInput()  
      .appendField('call library function')
      .appendField(
        new Blockly.FieldDropdown(dynamicLibFunctsList),
        "LIB_FUNCT_NAME"
      )
      .appendField('with return value');
    this.appendValueInput('ARG1')
      .appendField("argument 1")
    this.appendValueInput('ARG2')
      .appendField("argument 2")
    this.appendValueInput('ARG3')
      .appendField("argument 3")
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Call of a library function which returns a value');

    this.getVariableNameSelectField = function() { return this.getField('METHOD_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_LIBRARY };

/*
    this.setOnChange(function(event) {
      if (event.blockId != this.id) {
        return;
      }

      if (event.element == 'field' && event.name == 'METHOD_NAME') {
        var methodId = this.getFieldValue('METHOD_NAME');
        var methodBlock = this.workspace.getBlockById(methodId);
        var params = [];

        var block = methodBlock;
        do {
          block = block.getChildren()
            .filter(function(c) { return c.type == 'contract_method_parameter' })[0];

          if (block) {
            params.push(block);
          }
        } while (block)

        //console.log(params);
        // FIXME: add/remove inputs according to the method params
      }
    });
*/
  }
};


Blockly.Blocks['event_definition'] = {
  init: function() {
    this.jsonInit({
      "message0": "event %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "EventName"
        },
      ],
      "message1": "arguments %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "ARGS",
          "check": ["event_argument"],
          "align": "RIGHT"
        },
      ],
      "previousStatement": "event_definition",
      "nextStatement": "event_definition",
      "colour": "#1976D2",
      "tooltip": "Event definition",
      "helpUrl": ""
    });

    this.getVariableNameField = function() { return this.getField('NAME') };
    this.getVariableType = function() { return 'event' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_EVENT };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    // The following command registers the current block as a variable of the type defined above in line "this.getVariableType = function() { return"
    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};

Blockly.Blocks['event_argument'] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput('argumentName');
    this.appendDummyInput()
        .appendField('event type')
        .appendField(new Blockly.FieldDropdown(typesList),
          'TYPE'
        )
        .appendField('indexed')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'INDEXED');
    this.appendDummyInput()
        .appendField(nameField, 'NAME');
    this.setPreviousStatement(true, 'event_argument');
    this.setNextStatement(true, 'event_argument');
    this.setColour("#1976D2");
    this.setTooltip('Event argument declaration');

    this._stateNameInitialized = false;

    this.getVariableNameField = function() { return nameField; }
    //this.getVariableType = function() { return this.getFieldValue('TYPE') };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_EVENT };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    //Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};


function dynamicEventsList () {
  var eventsList = [[ "select event...", "select event..." ]];

  var eventVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('event');
  if (typeof eventVariablesArray[0] != 'undefined') {
    var eventsNamePairsArray = [];
    for (var i = 0; i < eventVariablesArray.length; i++)
      eventsNamePairsArray.push([Blockly.Solidity.getVariableName(eventVariablesArray[i]),Blockly.Solidity.getVariableName(eventVariablesArray[i])]);
    eventsList = eventsNamePairsArray;
  }

  return eventsList;
}


Blockly.Blocks['event_emission'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('emit event')
      .appendField(
        new Blockly.FieldDropdown(dynamicEventsList),
        "EVENT_NAME"
      );
    this.appendValueInput('ARG1')
      .appendField("argument 1")
    this.appendValueInput('ARG2')
      .appendField("argument 2")
    this.appendValueInput('ARG3')
      .appendField("argument 3")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    // this.setOutput(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Emit an event');

    this.getVariableNameSelectField = function() { return this.getField('EVENT_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_EVENT };

/*
    this.setOnChange(function(event) {
      if (event.blockId != this.id) {
        return;
      }

      if (event.element == 'field' && event.name == 'EVENT_NAME') {
        var eventId = this.getFieldValue('EVENT_NAME');
        var eventBlock = this.workspace.getBlockById(eventId);
        var args = [];

        var block = eventBlock;
        do {
          block = block.getChildren()
            .filter(function(c) { return c.type == 'event_argument' })[0];

          if (block) {
            args.push(block);
          }
        } while (block)

        //console.log(args);
        // FIXME: add/remove inputs according to the method params
      }
    });
*/    
  }
};


Blockly.Blocks['msg_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('msg.')
      .appendField(new Blockly.FieldDropdown([
          [ "data", "data" ],
          [ "sender",  "sender" ],
          [ "value", "value" ],
        ]),
        'MSG_TYPE'
      );
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Get current call property (calldata, address of the sender of the message call, number of wei sent with the message call)');

    this.getVariableNameSelectField = function() { return this.getField('MSG_TYPE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ATOM };
  }
};

Blockly.Blocks['modifier_definition'] = {
  init: function() {
    this.jsonInit({
      "message0": "modifier %1",
      "args0": [
        {
          "type": "field_input",
          "name": "MODIFIER_NAME",
          "text": "modifierName"
        },
      ],
      "message1": "parameters %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "PARAMS",
          "check": ["contract_method_parameter"],
          "align": "RIGHT"
        },
      ],
      "message2": "condition %1",
      "args2": [
        {
          "type": "input_value",
          "name": "CONDITION",
          //"check": ["contract_method_parameter"],
          "align": "RIGHT"
        },
      ],
      "message3": "error message %1",
      "args3": [
        {
          "type": "field_input",
          "name": "MESSAGE",
          "text": "Your message"
        },
      ],
      "previousStatement": "modifier_definition",
      "nextStatement": "modifier_definition",
      "colour": "#1976D2",
      "tooltip": "Modifier definition",
      "helpUrl": ""
    });

    this.getVariableNameField = function() { return this.getField('MODIFIER_NAME') };
    this.getVariableType = function() { return 'modifier' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_MODIFIER };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};


Blockly.Blocks['modifier_onlyOwner'] = {
  init: function() {
    this.jsonInit({
      "message0": "modifier %1",
      "args0": [
        {
          "type": "field_input",
          "name": "MODIFIER_NAME",
          "text": "onlyOwner"
        },
      ],
      "previousStatement": "modifier_definition",
      "nextStatement": "modifier_definition",
      "colour": "#1976D2",
      "tooltip": "onlyOwner modifier (only the contract owner can call the function featuring this modifier: if the owner calls this function, the function is executed; otherwise, an exception is thrown)",
      "helpUrl": ""
    });

    this.getVariableNameField = function() { return this.getField('MODIFIER_NAME') };
    this.getVariableType = function() { return 'modifier' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_MODIFIER };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};

function dynamicModifiersList () {
  var modifiersList = [[ "select modifier...", "select modifier..." ]];

  var modifierVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('modifier');
  if (typeof modifierVariablesArray[0] != 'undefined') {
    var modifiersNamePairsArray = [];
    for (var i = 0; i < modifierVariablesArray.length; i++)
      modifiersNamePairsArray.push([Blockly.Solidity.getVariableName(modifierVariablesArray[i]),Blockly.Solidity.getVariableName(modifierVariablesArray[i])]);
    modifiersList = modifiersNamePairsArray;
  }

  return modifiersList;
}


Blockly.Blocks['modifier_usage'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('modifier')
      .appendField(
        new Blockly.FieldDropdown(dynamicModifiersList),
        "MODIFIER_NAME"
      );
    this.appendValueInput('ARG1')
      .appendField("argument 1")
    this.appendValueInput('ARG2')
      .appendField("argument 2")
    this.appendValueInput('ARG3')
      .appendField("argument 3")
    this.setPreviousStatement(true, 'modifier_usage');
    this.setNextStatement(true, 'modifier_usage');
    // this.setOutput(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Assign a previously defined modifier to the function');

    this.getVariableNameSelectField = function() { return this.getField('MODIFIER_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_MODIFIER };

  }
};


Blockly.Blocks['enum_definition'] = {
  init: function() {
    this.jsonInit({
      "message0": "enum %1",
      "args0": [
        {
          "type": "field_input",
          "name": "ENUM_NAME",
          "text": "enumName"
        },
      ],
      "message1": "members %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "MEMBERS",
          "check": ["enum_member"],
          "align": "RIGHT"
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#1976D2",
      "tooltip": "Enum definition",
      "helpUrl": ""
    });

    this.getVariableNameField = function() { return this.getField('ENUM_NAME') };
    this.getVariableType = function() { return 'enum_definition' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};


Blockly.Blocks['enum_member'] = {
  init: function() {
    this.jsonInit({
      "message0": "member %1",
      "args0": [
        {
          "type": "field_input",
          "name": "MEMBER_NAME",
          "text": "memberName"
        },
      ],
      "previousStatement": "enum_member",
      "nextStatement": "enum_member",
      "colour": "#1976D2",
      "tooltip": "Enum member definition",
      "helpUrl": ""
    });

    this.getVariableNameField = function() { return this.getField('MEMBER_NAME') };
    this.getVariableType = function() { return 'enum_member' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};

function dynamicEnumsList () {
  var enumsList = [[ "select enum...", "select enum..." ]];

  var enumVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('enum_definition');
  if (typeof enumVariablesArray[0] != 'undefined') {
    var enumsNamePairsArray = [];
    for (var i = 0; i < enumVariablesArray.length; i++)
      enumsNamePairsArray.push([Blockly.Solidity.getVariableName(enumVariablesArray[i]),Blockly.Solidity.getVariableName(enumVariablesArray[i])]);
    enumsList = enumsNamePairsArray;
  }

  return enumsList;
}


Blockly.Blocks['enum_variable_create'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Enum variable of type ')
      .appendField(
        new Blockly.FieldDropdown(dynamicEnumsList),
        "ENUM_TYPE"
      )
      .appendField(new Blockly.FieldTextInput('enumVariableName'), 'ENUM_VAR_NAME');
    this.setColour("#1976D2");
    this.setTooltip('Declare an enum variable');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);

    this.getVariableNameField = function() { return this.getField('ENUM_VAR_NAME') };
    this.getVariableType = function() { return 'enum_variable' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM_VAR };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);

  }
};

function dynamicEnumVariablesList () {
  var enumVariablesList = [[ "select enum variable...", "select enum variable..." ]];

  var enumVariablesArray2 = Blockly.getMainWorkspace().getVariablesOfType('enum_variable');
  if (typeof enumVariablesArray2[0] != 'undefined') {
    var enumsNamePairsArray2 = [];
    for (var i = 0; i < enumVariablesArray2.length; i++)
      enumsNamePairsArray2.push([Blockly.Solidity.getVariableName(enumVariablesArray2[i]),Blockly.Solidity.getVariableName(enumVariablesArray2[i])]);
    enumVariablesList = enumsNamePairsArray2;
  }

  return enumVariablesList;
}

Blockly.Blocks['enum_variable_set'] = {
  init: function() {
    this.appendValueInput('ENUM_VARIABLE_VALUE')
      .appendField('set enum variable ')
      .appendField(
        new Blockly.FieldDropdown(dynamicEnumVariablesList),
        "ENUM_VARIABLE_NAME"
      )
      .appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#1976D2");
    this.setTooltip('Enum variable setter');

    this.getVariableNameSelectField = function() { return this.getField('ENUM_VARIABLE_VALUE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM };
  },
};
 



function dynamicEnumMembersList(block) {
  var enumsList = [[ "select enum member...", "select enum member..." ]];

  var enumMembersArray = Blockly.getMainWorkspace().getVariablesOfType('enum_member');
  if (typeof enumMembersArray[0] != 'undefined') {
    var enumsMemberPairsArray = [];
    for (var i = 0; i < enumMembersArray.length; i++)
      enumsMemberPairsArray.push([Blockly.Solidity.getVariableName(enumMembersArray[i]),Blockly.Solidity.getVariableName(enumMembersArray[i])]);
    enumsList = enumsMemberPairsArray;
  }

/*
  var enumTypesArray = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.type == 'enum_definition' }); // get all enum definition blocks

  if (typeof enumTypesArray[0] != 'undefined') {
    var enumTypeAndMemberPairsArray = [];
    for (var i = 0; i < enumTypesArray.length; i++) // for each enum type
      for (var j = 0; j < enumTypesArray[i].getFieldValue; j++) // go through its members


      enumsNamePairsArray2.push([Blockly.Solidity.getVariableName(enumVariablesArray2[i]),Blockly.Solidity.getVariableName(enumVariablesArray2[i])]);
    enumVariablesList = enumsNamePairsArray2;
  }
 */ 

  return enumsList;
}


Blockly.Blocks['enum_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('enum member ')
      .appendField(
        new Blockly.FieldDropdown(dynamicEnumMembersList(this)),
        "ENUM_MEMBER_NAME"
      );
    this.setOutput(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Use a previously defined enum');

    this.getVariableNameSelectField = function() { return this.getField('ENUM_MEMBER_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM };

  }
};


Blockly.defineBlocksWithJsonArray([
  {
    "type": "contract_ctor",
    "message0": "constructor",
    "message1": "parameters %1",
    "args1": [
      {
        "type": "input_statement",
        "name": "PARAMS",
        "check": "contract_method_parameter",
        "align": "RIGHT"
      },
    ],
    "message2": "code %1",
    "args2": [
      {
        "type": "input_statement",
        "name": "STACK",
        "align": "RIGHT"
      }
    ],
    "previousStatement": ["contract_ctor"],
    "colour": "#1976D2",
    "tooltip": "Constructor function",
    "helpUrl": ""
  }
]);

Blockly.defineBlocksWithJsonArray([
  {
    "type": "contract_intrinsic_sha3",
    "message0": "sha3 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "VALUE",
      },
    ],
    "output": null,
    "colour": 60,
    "tooltip": "",
    "helpUrl": ""
  }
]);

Blockly.Blocks['controls_for'] = {
  init: function() {
    this.jsonInit(
      {
        "message0": "%{BKY_CONTROLS_FOR_TITLE}",
        "args0": [
          {
            "type": "field_input",
            "name": "VAR",
            "text": "i",
          },
          {
            "type": "input_value",
            "name": "FROM",
            "check": "Number",
            "align": "RIGHT"
          },
          {
            "type": "input_value",
            "name": "TO",
            "check": "Number",
            "align": "RIGHT"
          },
          {
            "type": "input_value",
            "name": "BY",
            "check": "Number",
            "align": "RIGHT"
          }
        ],
        "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
        "args1": [{
          "type": "input_statement",
          "name": "DO"
        }],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "%{BKY_LOOPS_HUE}",
        "helpUrl": "%{BKY_CONTROLS_FOR_HELPURL}",
      }
    );

    this.getVariableNameField = function() { return this.getField('VAR'); };
    this.getVariableType = function() { return 'TYPE_UINT'; };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_VARIABLE };
    this.getVariableScope = function() { return this };

    Blockly.Extensions.apply('declare_typed_variable', this, false);
  },
};
