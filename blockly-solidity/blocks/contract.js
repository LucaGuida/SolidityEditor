/**
 * @fileoverview Helper functions for generating Solidity for blocks.
 * @author Luca Guida
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


// List of types
var typesList = [
            [ "bool", "TYPE_BOOL" ],
            [ "int",  "TYPE_INT" ],
            [ "uint", "TYPE_UINT" ],
            [ "address", "TYPE_ADDRESS" ],
            [ "bytes32", "TYPE_BYTES32" ],
            [ "bytes", "TYPE_BYTES" ],
            [ "string", "TYPE_STRING" ],
          ];

// List of types for mappings
var typesListForMap = [
            [ "bool", "TYPE_BOOL" ],
            [ "bool[]", "TYPE_BOOL_ARRAY" ],
            [ "int",  "TYPE_INT" ],
            [ "int[]",  "TYPE_INT_ARRAY" ],
            [ "uint", "TYPE_UINT" ],
            [ "uint[]", "TYPE_UINT_ARRAY" ],
            [ "address", "TYPE_ADDRESS" ],
            [ "address[]", "TYPE_ADDRESS_ARRAY" ],
            [ "bytes32", "TYPE_BYTES32" ],
            [ "bytes32[]", "TYPE_BYTES32_ARRAY" ],
            [ "bytes", "TYPE_BYTES" ],
            [ "bytes[]", "TYPE_BYTES_ARRAY" ],
            [ "string", "TYPE_STRING" ],
            [ "string[]", "TYPE_STRING_ARRAY" ],
          ];


// List of types + '*'
var typesListWithStar = [
            [ "bool", "TYPE_BOOL" ],
            [ "int",  "TYPE_INT" ],
            [ "uint", "TYPE_UINT" ],
            [ "address", "TYPE_ADDRESS" ],
            [ "bytes32", "TYPE_BYTES32" ],
            [ "bytes", "TYPE_BYTES" ],
            [ "string", "TYPE_STRING" ],
            [ "*", "TYPE_STAR" ]            
          ];

// List of visibility classes for variables
var varVisibilityList = [
            [ "", "" ],
            [ "internal", "internal" ],
            [ "internal constant", "internal constant" ],
            [ "private",  "private" ],
            [ "private constant",  "private constant" ],
            [ "public", "public" ],
            [ "public constant", "public constant" ],
            [ "memory (only inside functions)", "memory" ]
          ];

// List of visibility classes for mappings
var mapVarVisibilityList = [
            [ "", "" ],
            [ "internal", "internal" ],
            [ "private",  "private" ],
            [ "public", "public" ],
            [ "memory (only inside functions)", "memory" ]
          ];

// List of visibility classes for functions
var funcVisibilityList = [
            [ "public", "public" ],
            [ "external", "external" ],
            [ "private",  "private" ],
            [ "internal", "internal" ]
          ];

var functionTypesList = [
            [ "none", "" ],
            [ "pure",  " pure " ],
            [ "view", " view " ],
            [ "payable", " payable " ],
          ];


//Helper for extracting substrings
var getFromBetween = {
    results:[],
    string:"",
    getFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var SP = this.string.indexOf(sub1)+sub1.length;
        var string1 = this.string.substr(0,SP);
        var string2 = this.string.substr(SP);
        var TP = string1.length + string2.indexOf(sub2);
        return this.string.substring(SP,TP);
    },
    removeFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
        this.string = this.string.replace(removal,"");
    },
    getAllResults:function (sub1,sub2) {
        // first check to see if we do have both substrings
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

        // find one result
        var result = this.getFromBetween(sub1,sub2);
        // push it to the results array
        this.results.push(result);
        // remove the most recently found one from the string
        this.removeFromBetween(sub1,sub2);

        // if there's more substrings
        if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
            this.getAllResults(sub1,sub2);
        }
        else return;
    },
    get:function (string,sub1,sub2) {
        this.results = [];
        this.string = string;
        this.getAllResults(sub1,sub2);
        return this.results;
    }
};



// If false: external contracts and libraries list retrieval from local JSON file, instead of Registry REST API >> standalone-mode
// If true: external contracts and libraries list retrieval from Registry REST API
var API_mode = false;



// API availability test
try {
	var testRequest = new XMLHttpRequest();
	testRequest.open('GET', 'http://localhost:3000/contracts', false);  // `false` makes the requestFull synchronous
	testRequest.send(null);
	
	if (testRequest.status === 200) {
		var tempJSON = JSON.parse(testRequest.responseText)
		if (tempJSON!='undefined' && tempJSON.length > 0) {
			API_mode = true;
			console.log("Successfully connected to the Solidity smart contract registry API!");
		}
	}
}
catch(err) {
    console.log("Solidity smart contract registry API not available!");
}



if (API_mode == false) { // standalone mode
  // Read JSON external contracts and libraries list 
  var jsonObjFull;
  var requestFull = new XMLHttpRequest();
  requestFull.open('GET', '/SolidityEditor/standalone-mode/smartContractDescriptorsDB.json', false);  // `false` makes the requestFull synchronous
  requestFull.send(null);
  if (requestFull.status === 200) {
    jsonObjFull = JSON.parse(requestFull.responseText);
  }
}

else { // API mode true
  // Retrieve external contracts and libraries list from Registry API
  var jsonObjFull;
  var requestFull = new XMLHttpRequest();
  requestFull.open('GET', 'http://localhost:3000/contracts', false);  // `false` makes the requestFull synchronous
  requestFull.send(null);
  if (requestFull.status === 200) {
    jsonObjFull = JSON.parse(requestFull.responseText);
  }

  // Retrieve generic_contracts from Registry API
  var jsonObjContracts;
  var requestContracts = new XMLHttpRequest();
  requestContracts.open('GET', 'http://localhost:3000/contracts?contract_type=generic_contract', false);  // `false` makes the requestFull synchronous
  requestContracts.send(null);
  if (requestContracts.status === 200) {
    jsonObjContracts = JSON.parse(requestContracts.responseText);
  } 

  // Retrieve libraries list from Registry API
  var jsonObjLibs;
  var requestLibs = new XMLHttpRequest();
  requestLibs.open('GET', 'http://localhost:3000/contracts?contract_type=library', false);  // `false` makes the requestFull synchronous
  requestLibs.send(null);
  if (requestLibs.status === 200) {
    jsonObjLibs = JSON.parse(requestLibs.responseText);
  } 

}


function dynamicLibsAndContractsList() {
    var options = [[ "select external contract or library...", "select external contract or library..." ]];
    var OraclizeBlock = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return (b.type == 'oraclize_query'||b.type == 'oraclize_scheduled_query')});
    if (typeof jsonObjFull != 'undefined') {
      for(var i = 0; i < jsonObjFull.length; i++) {
        if (typeof OraclizeBlock[0] != 'undefined')
          options.push([ jsonObjFull[i]['JSON']['contract']['descriptor']['name'],jsonObjFull[i]['JSON']['contract']['descriptor']['name'] ]);
        else if (jsonObjFull[i]['JSON']['contract']['descriptor']['name']=='usingOraclize')
          console.log();
        else 
          options.push([ jsonObjFull[i]['JSON']['contract']['descriptor']['name'],jsonObjFull[i]['JSON']['contract']['descriptor']['name'] ]);
      }

    }
    return options;
}

function dynamicLibAndContractFunctsList (libName) {

    var libFunctsList = [[ "select function...", "select function..." ]];
    if (typeof libName != 'undefined' && libName != null && libName != 'select external contract or library...') {
      if (typeof jsonObjFull != 'undefined') {
        libFunctsList = [];
        for(var i = 0; i < jsonObjFull.length; i++)
          if (jsonObjFull[i]['JSON']['contract']['descriptor']['name'] == libName)
            for (var j = 0; j < jsonObjFull[i]['JSON']['contract']['descriptor']['abi'].length; j++)
              if (jsonObjFull[i]['JSON']['contract']['descriptor']['abi'][j]['type'] == 'function')
                libFunctsList.push([  jsonObjFull[i]['JSON']['contract']['descriptor']['abi'][j]['name'],jsonObjFull[i]['JSON']['contract']['descriptor']['abi'][j]['name'] ]);
              else if (jsonObjFull[i]['JSON']['contract']['descriptor']['abi'][j]['type'] == 'constructor')
                libFunctsList.push([  libName,libName ]);
      }
    }

    if (libFunctsList.length == 0)
      libFunctsList = [[ "No functions available", "No functions available" ]];

    return libFunctsList;
  
}

function dynamicContractsList() {
  if (API_mode == false) { // standalone mode
    var options = [[ "select external contract...", "select external contract..." ]];
    if (typeof jsonObjFull != 'undefined') {
      for(var i = 0; i < jsonObjFull.length; i++)
        if (jsonObjFull[i]['JSON']['contract']['descriptor']['contract_type'] == 'generic_contract') 
          options.push([ jsonObjFull[i]['JSON']['contract']['descriptor']['name'],jsonObjFull[i]['JSON']['contract']['descriptor']['name'] ]);
    }
    return options;
  }

  else { // API mode
    var options = [[ "select external contract...", "select external contract..." ]];
    if (typeof jsonObjContracts != 'undefined') {
      for(var i = 0; i < jsonObjContracts.length; i++)
        options.push([ jsonObjContracts[i]['JSON']['contract']['descriptor']['name'],jsonObjContracts[i]['JSON']['contract']['descriptor']['name'] ]);
    }
    return options;
  }
}


function dynamicLibsList() {
  if (API_mode == false) { // standalone mode
    var options = [[ "select library...", "select library..." ]];
    if (typeof jsonObjFull != 'undefined') {
      for(var i = 0; i < jsonObjFull.length; i++)
        if (jsonObjFull[i]['JSON']['contract']['descriptor']['contract_type'] == 'library') 
          options.push([ jsonObjFull[i]['JSON']['contract']['descriptor']['name'],jsonObjFull[i]['JSON']['contract']['descriptor']['name'] ]);
    }
    return options;
  }

  else { // API mode
    var options = [[ "select library...", "select library..." ]];
    if (typeof jsonObjLibs != 'undefined') {
      for(var i = 0; i < jsonObjLibs.length; i++)
        options.push([ jsonObjLibs[i]['JSON']['contract']['descriptor']['name'],jsonObjLibs[i]['JSON']['contract']['descriptor']['name'] ]);
    }
    return options;
  }
}


/* ********************** LIBRARY_FUNCTION_MUTATOR ********************** */

/**
 * Mixin for mutator functions in the 'library_function_mutator'
 * extension.
 * @mixin
 * @augments Blockly.Block
 * @package
 */
Blockly.Solidity.LIBRARY_FUNCTION_MUTATOR_MIXIN = {
  /**
   * Create XML to represent whether the library function selector should be present.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var selectedLibrary = (this.getFieldValue('LIB_NAME') != 'select external contract or library...');
    container.setAttribute('selected_library', selectedLibrary);
    return container;
  },
  /**
   * Parse XML to restore the 'selected_library'.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var selectedLibrary = (xmlElement.getAttribute('selected_library') == 'true');
    this.updateShape_(selectedLibrary, this.getFieldValue('LIB_NAME'));
  },
  /**
   * Modify this block to have (or not have) an input for library function selection.
   * @param {boolean} selectedLibrary True if this block has a selected library, thus requiring the selection of a library function
   * @private
   * @this Blockly.Block
   */
  updateShape_: function(selectedLibrary, libName, event) {
    var functionSelectorBeingDisplayed = this.getFieldValue('LIB_FUNCT_NAME');
    if (selectedLibrary) {
      if (!functionSelectorBeingDisplayed) { // library was set for the first time, or after resetting selector
        this.appendDummyInput('LIBRARY_FUNCTION_SELECTOR')  
          .appendField(' function')
          .appendField(
          new Blockly.FieldDropdown(dynamicLibAndContractFunctsList(libName)),
          "LIB_FUNCT_NAME"
          );
        this.appendStatementInput('ARGS')
          .appendField("arguments").setCheck('argument_container');
      }

      else { // selectedLibrary, functionSelectorBeingDisplayed + library AND/OR function was changed
        if (event.name=="LIB_NAME") {// library was changed
/*
          this.removeInput('LIBRARY_FUNCTION_SELECTOR');
          this.removeInput('ARGS');

          this.appendDummyInput('LIBRARY_FUNCTION_SELECTOR')  
            .appendField(' function')
            .appendField(
            new Blockly.FieldDropdown(dynamicLibAndContractFunctsList(libName)),
            "LIB_FUNCT_NAME"
            );
          this.appendStatementInput('ARGS')
            .appendField("arguments").setCheck('argument_container');

*/
          // Force UI update
          Blockly.Events.fire(new Blockly.Events.Ui(this,null, null, null));

        }
        else if (event.name=="LIB_FUNCT_NAME") { } // function was changed, but library was NOT changed
      }

    } else {
      if (functionSelectorBeingDisplayed) { // reset
        this.removeInput('LIBRARY_FUNCTION_SELECTOR');
        this.removeInput('ARGS');
      }
    }
  }
};

/**
 * 'library_function_mutator' extension to the 'library_method_call' block that
 * can update the block shape (add/remove function selector) based on whether a library has been selected
 * @this Blockly.Block
 * @package
 */
Blockly.Solidity.LIBRARY_FUNCTION_MUTATOR_EXTENSION = function() {
  if (this.getField('LIB_NAME') != null) {
    this.getField('LIB_NAME').setValidator(function(option) {
    var selectedLibrary = (option != 'select external contract or library...');
    //this.sourceBlock_.updateShape_(selectedLibrary, 'TEMP_Library_Name');
  });

  }
};

Blockly.Extensions.registerMutator('library_function_mutator',
    Blockly.Solidity.LIBRARY_FUNCTION_MUTATOR_MIXIN,
    Blockly.Solidity.LIBRARY_FUNCTION_MUTATOR_EXTENSION);



/* ********************** STRUCT_MEMBER_MUTATOR ********************** */

/**
 * Mixin for mutator functions in the 'struct_member_mutator'
 * extension.
 * @mixin
 * @augments Blockly.Block
 * @package
 */
Blockly.Solidity.STRUCT_MEMBER_MUTATOR_MIXIN = {
  /**
   * Create XML to represent whether the struct variable member selector should be present.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var selectedStructVariable = (this.getFieldValue('STRUCT_VARIABLE_NAME') != 'select struct variable...');
    container.setAttribute('selected_struct_variable', selectedStructVariable);
    return container;
  },
  /**
   * Parse XML to restore the 'selected_struct_variable'.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var selectedStructVariable = (xmlElement.getAttribute('selected_struct_variable') == 'true');
    this.updateShape_(selectedStructVariable, this.getFieldValue('STRUCT_VARIABLE_NAME'));
  },
  /**
   * Modify this block to have (or not have) an input for struct variable member selection.
   * @param {boolean} selectedStructVariable True if this block has a selected struct variable, thus requiring the selection of a struct variable member
   * @private
   * @this Blockly.Block
   */
  updateShape_: function(selectedStructVariable, varName, event) {
    var memberSelectorBeingDisplayed = this.getFieldValue('STRUCT_MEMBER_NAME');
    if (selectedStructVariable) {
      if (!memberSelectorBeingDisplayed) {
          if (varName.substring(varName.length-2, varName.length) == "[]" && this.getInput('ARRAY_INDEX')==null) {
            this.appendValueInput('ARRAY_INDEX')
              .appendField("at array index ");
        }

        this.appendDummyInput('STRUCT_MEMBER_SELECTOR')  
          .appendField('member  ')
          .appendField(
          new Blockly.FieldDropdown(dynamicStructMembersList(varName)),
          "STRUCT_MEMBER_NAME"
          );

          if (this.type == "struct_member_set") {
            this.appendValueInput('STRUCT_VARIABLE_VALUE')
              .appendField("to");
          }
      }

      else { 
        if (event.name=="STRUCT_VARIABLE_NAME") {
/*
          this.removeInput('STRUCT_MEMBER_SELECTOR');

          if (this.type == "struct_member_set") {
            this.removeInput('STRUCT_VARIABLE_VALUE');
          }

          do {
            this.removeInput('ARRAY_INDEX', true);
          } 
          while (varName.substring(varName.length-2, varName.length) != "[]" && this.getInput('ARRAY_INDEX')!=null);

          if (varName.substring(varName.length-2, varName.length) == "[]" && this.getInput('ARRAY_INDEX')==null) {
              this.appendValueInput('ARRAY_INDEX')
                .appendField("at array index ");
          }

          this.appendDummyInput('STRUCT_MEMBER_SELECTOR')  
            .appendField('member  ')
            .appendField(
            new Blockly.FieldDropdown(dynamicStructMembersList(varName)),
            "STRUCT_MEMBER_NAME"
            );

          if (this.type == "struct_member_set") {
            this.appendValueInput('STRUCT_VARIABLE_VALUE')
              .appendField("to");
          }
*/

          // Force UI update
          Blockly.Events.fire(new Blockly.Events.Ui(this,null, null, null));

        }
        else if (event.name=="STRUCT_MEMBER_NAME") { } 
      }

    } else if (memberSelectorBeingDisplayed) {
      this.removeInput('STRUCT_MEMBER_SELECTOR');

      if (this.type == "struct_member_set") {
        this.removeInput('STRUCT_VARIABLE_VALUE');
      }

    }
  }
};

/**
 * 'struct_member_mutator' extension to the 'struct_member_set/get' block that
 * can update the block shape (add/remove function selector) based on whether a struct variable has been selected
 * @this Blockly.Block
 * @package
 */
Blockly.Solidity.STRUCT_MEMBER_MUTATOR_EXTENSION = function() {
  if (this.getField('STRUCT_VARIABLE_NAME') != null) {
    this.getField('STRUCT_VARIABLE_NAME').setValidator(function(option) {
    var selectedStructVariable = (option != 'select struct variable...');
    //this.sourceBlock_.updateShape_(selectedStructVariable, 'TEMP_Struct_Variable_Name');
  });

  }
};

Blockly.Extensions.registerMutator('struct_member_mutator',
    Blockly.Solidity.STRUCT_MEMBER_MUTATOR_MIXIN,
    Blockly.Solidity.STRUCT_MEMBER_MUTATOR_EXTENSION);


/* ********************** CONTRACT BLOCK ********************** */


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
    "message1": 'documentation %1',
    "args1": [
      {
        "type": "input_statement",
        "name": "DOCS",
        "check": "NatSpec_contract",
        "align": "RIGHT"
      }
    ],
    "message2": 'contract inheritance and library usage %1',
    "args2": [
      {
        "type": "input_statement",
        "name": "INHERIT",
        "check": "inherit",
        "align": "RIGHT"
      }
    ],
    "message3": "state variables %1",
    "args3": [
      {
        "type": "input_statement",
        "name": "STATES",
        "check": ["contract_state", "enum_definition", "enum_variable_create"],
        "align": "RIGHT"
      }
    ],
    "message4": "modifiers definition %1",
    "args4": [
      {
        "type": "input_statement",
        "name": "MODIFIERS",
        "check": ["modifier_definition"],
        "align": "RIGHT"
      }
    ],
    "message5": "events definition %1",
    "args5": [
      {
        "type": "input_statement",
        "name": "EVENTS",
        "check": ["event_definition"],
        "align": "RIGHT"
      }
    ],
    "message6": "constructor definition %1",
    "args6": [
      {
        "type": "input_statement",
        "name": "CTOR",
        "check": ["contract_ctor"],
        "align": "RIGHT"
      }
    ],
    "message7": "functions definition %1",
    "args7": [
      {
        "type": "input_statement",
        "name": "METHODS",
        "check": ["contract_method"],
        "align": "RIGHT"
      }
    ],
    "message8": "functions with return definition %1",
    "args8": [
      {
        "type": "input_statement",
        "name": "METHODS_WITH_RETURN",
        "check": ["contract_method_with_return"],
        "align": "RIGHT"
      }
    ],
    "colour": "#5EA48C",
    "tooltip": "Declares a new smart contract.",
    "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/contracts.html"
  }
]);



/* ********************** CONTRACT_STATE BLOCK ********************** */

Blockly.Blocks['contract_state'] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput('variableName');
    this.appendDummyInput()
        .appendField('declare state variable of type')
        .appendField(new Blockly.FieldDropdown(typesList),
          'TYPE'
        )
        .appendField(' visibility ')
        .appendField(new Blockly.FieldDropdown(varVisibilityList),
          'VISIBILITY'
        )
        .appendField(nameField, 'NAME');
    this.setPreviousStatement(true, 'contract_state');
    this.setNextStatement(true, 'contract_state');
    this.setColour("#1976D2");
    this.setTooltip('State variable declaration');
    this.setHelpUrl('http://solidity.readthedocs.io/en/develop/contracts.html#visibility-and-getters');

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




/* ********************** CONTRACT_STATE_GET BLOCK ********************** */

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
    this.setTooltip('State variable getter');
    this.setHelpUrl('https://solidity.readthedocs.io/en/develop/contracts.html#getter-functions');

    this.getVariableNameSelectField = function() { return this.getField('STATE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };
  }
};


/* ********************** CONTRACT_STATE_SET BLOCK ********************** */

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
    this.setHelpUrl('http://solidity.readthedocs.io/en/develop/contracts.html#visibility-and-getters');

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


/* ********************** ADDRESS_BALANCE_GET BLOCK ********************** */

function dynamicAddresses () {
  var addressList = [[ "select address variable...", "select address variable..." ]];

  //var addressVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('TYPE_ADDRESS');

  var allAddressBlocks = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return ((b.type == 'contract_state' && b.getFieldValue('TYPE') == 'TYPE_ADDRESS') || b.type == 'owner_var_declaration') });
  var addressNamePairsArray = [];
  addressNamePairsArray.push(['address(this)','address(this)']);

  if (typeof allAddressBlocks[0] != 'undefined') {
    for (var i = 0; i < allAddressBlocks.length; i++)
      addressNamePairsArray.push([allAddressBlocks[i].getFieldValue('NAME'),allAddressBlocks[i].getFieldValue('NAME')]);
  }
  
  addressList = addressNamePairsArray;
  return addressList;
}


Blockly.Blocks['address_balance_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown(dynamicAddresses),
        "ADDRESS_VARIABLE_NAME"
      )
      .appendField(".balance");
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Balance of an address variable');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/units-and-global-variables.html#address-related');

    this.getVariableNameSelectField = function() { return this.getField('ADDRESS_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ADDRESS };
  }
};


Blockly.Blocks['address_transfer'] = {
  init: function() {
    this.appendValueInput('AMOUNT').setCheck('Number')
      .appendField('transfer amount');
    this.appendValueInput('ADDRESS_VARIABLE_NAME')
      .appendField('to ');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Transfer ether to an address');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/units-and-global-variables.html#address-related');

    this.getVariableNameSelectField = function() { return this.getField('ADDRESS_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ADDRESS };
  }
};


/* ********************** OWNER_VAR_DECLARATION BLOCK ********************** */

Blockly.Blocks['owner_var_declaration'] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput('owner');
    this.appendDummyInput()
        .appendField('address')
        .appendField('visibility ')
        .appendField(new Blockly.FieldDropdown(varVisibilityList),
          'VISIBILITY'
        )
        .appendField(nameField, 'NAME');
    this.setPreviousStatement(true, 'contract_state');
    this.setNextStatement(true, 'contract_state');
    this.setColour("#1976D2");
    this.setTooltip('"Owner" state variable declaration');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html');

    this._stateNameInitialized = false;

    this.getVariableNameField = function() { return nameField; }
    this.getVariableType = function() { return 'TYPE_ADDRESS' };
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


/* ********************** CONTRACT_CTOR BLOCK ********************** */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "contract_ctor",
    "message0": "constructor",
    "message1": "documentation %1",
    "args1": [
        {
          "type": "input_statement",
          "name": "DOCS",
          "check": ["NatSpec_function"]
        },
      ],
    "message3": "visibility %1",
    "args3": [
      {
        "type": "field_dropdown",
        "name": "VISIBILITY",
        "options": funcVisibilityList
      },
    ],
    "message2": "parameters %1",
    "args2": [
      {
        "type": "input_statement",
        "name": "PARAMS",
        "check": "contract_method_parameter"
      },
    ],
    "message4": "code %1",
    "args4": [
      {
        "type": "input_statement",
        "name": "STACK"
      }
    ],
    "previousStatement": ["contract_ctor"],
    "colour": "#1976D2",
    "tooltip": "Constructor function",
    "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/contracts.html#creating-contracts"
  }
]);


/* ********************** CTOR_OWNER BLOCK ********************** */

Blockly.Blocks['ctor_owner'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("set")
      .appendField(
        new Blockly.FieldDropdown(
          [["select state variable...", Blockly.Solidity.UNDEFINED_NAME]],
          this.validate
        ),
        "STATE_NAME"
      )
      .appendField("to msg.sender");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#1976D2");
    this.setTooltip('State variable setter to msg.sender (typically used to set the owner variable)');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html'); 
    
    this.getVariableNameSelectField = function() { return this.getField('STATE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };
  },

  validate: function(stateNameVariableId) {
    var workspace = this.sourceBlock_.workspace;
    setTimeout(
      function() { Blockly.Solidity.updateWorkspaceStateTypes(workspace) },
      1
    );
    return stateNameVariableId;
  }
};


/* ********************** CONTRACT_METHOD BLOCK ********************** */

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
      "message1": "documentation %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DOCS",
          "check": ["NatSpec_function"]
        },
      ],
      "message2": "parameters %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "PARAMS",
          "check": ["contract_method_parameter"]
        },
      ],
      "message3": "visibility %1   function type %2   modifiers %3",
      "args3": [
        {
          "type": "field_dropdown",
          "name": "VISIBILITY",
          "options": funcVisibilityList
        },
        {
          "type": "field_dropdown",
          "name": "FUNCTION_TYPE",
          "options": functionTypesList
        },
        {
          "type": "input_statement",
          "name": "MODIF",
          "check": ["modifier_usage"]
        },
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
      "helpUrl": "http://solidity.readthedocs.io/en/v0.4.24/types.html#function-types"
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


/* ********************** CONTRACT_METHOD_WITH_RETURN BLOCK ********************** */

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
      "message1": "documentation %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DOCS",
          "check": ["NatSpec_function"]
        },
      ],
      "message2": "parameters %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "PARAMS",
          "check": ["contract_method_parameter"]
        }
      ],
      "message3": "visibility %1   function type %2   modifiers %3",
      "args3": [
        {
          "type": "field_dropdown",
          "name": "VISIBILITY",
          "options": funcVisibilityList
        },
        {
          "type": "field_dropdown",
          "name": "FUNCTION_TYPE",
          "options": functionTypesList
        },
        {
          "type": "input_statement",
          "name": "MODIF",
          "check": ["modifier_usage"]
        },
      ],
      "message5": "returning value %1   of type %2",
      "args5": [
        {
          "type": "input_value",
          "name": "RETURN_VALUE"
        },
        {
          "type": "field_dropdown",
          "name": "RETURN_TYPE",
          "options": typesList
        }
      ],  
      "message4": "code %1",
      "args4": [
        {
          "type": "input_statement",
          "name": "STACK"
        }
      ],
      "previousStatement": ["contract_method", "contract_method_with_return"],
      "nextStatement": ["contract_method", "contract_method_with_return"],
      "colour": "#1976D2",
      "tooltip": "Function with return value definition",
      "helpUrl": "http://solidity.readthedocs.io/en/v0.4.24/types.html#function-types"
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


/* ********************** CONTRACT_METHOD_PARAMETER BLOCK ********************** */

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
    this.setTooltip('Parameter declaration');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/contracts.html#functions');

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


/* ********************** CONTRACT_METHOD_PARAMETER_GET BLOCK ********************** */

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
    this.setTooltip('Parameter getter');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/contracts.html#functions');

    this.getVariableNameSelectField = function() { return this.getField('PARAM_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_PARAMETER };
  }
};


/* ********************** FALLBACK BLOCK ********************** */


Blockly.Blocks['fallback'] = {
  init: function() {
    this.jsonInit({
      "message0": "%1 function",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "fallback"
        },
      ],
      "message1": "documentation %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DOCS",
          "check": ["NatSpec_function"]
        },
      ],
    "message2": "visibility %1   function type %2",
    "args2": [
      {
        "type": "field_dropdown",
        "name": "VISIBILITY",
        "options": funcVisibilityList
      },
        {
          "type": "field_dropdown",
          "name": "FUNCTION_TYPE",
          "options": functionTypesList
        }      
    ],
      "message3": "code %1",
      "args3": [
        {
          "type": "input_statement",
          "name": "STACK"        
        }
      ],
      "previousStatement": "contract_method",
      "nextStatement": "contract_method",
      "colour": "#1976D2",
      "tooltip": "Function definition",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/contracts.html#fallback-function"
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


/* ********************** CHANGEOWNER_METHOD BLOCK ********************** */

Blockly.Blocks['changeOwner_method'] = {
  init: function() {
    this.jsonInit({
      "message0": "function %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "changeOwner"
        },
      ],
      "message1": "documentation %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DOCS",
          "check": ["NatSpec_function"]
        },
      ],
/*      "message2": "function type %1",
      "args2": [
        {
          "type": "field_dropdown",
          "name": "FUNCTION_TYPE",
          "options": functionTypesList
        }      
      ], */
      "message2": "modifiers %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "MODIF",
          "check": ["modifier_usage"]
        }
      ],
      "previousStatement": "contract_method",
      "nextStatement": "contract_method",
      "colour": "#1976D2",
      "tooltip": "changeOwner function definition (it allows to change the owner of the contract)",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html"
    });
    
    this.setWarningText('The "owner" variable must be defined in the contract state variables and initialized in the constructor function.\nThe usage of modifier "onlyOwner" is recommended.');
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


/* ********************** DESTROY_METHOD BLOCK ********************** */

Blockly.Blocks['destroy_method'] = {
  init: function() {
    this.jsonInit({
      "message0": "function %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "destroy"
        },
      ],
      "message1": "documentation %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DOCS",
          "check": ["NatSpec_function"]
        },
      ],
/*      "message2": "function type %1",
      "args2": [
        {
          "type": "field_dropdown",
          "name": "FUNCTION_TYPE",
          "options": functionTypesList
        }      
      ],*/
      "message2": "modifiers %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "MODIF",
          "check": ["modifier_usage"]
        }
      ],
      "previousStatement": "contract_method",
      "nextStatement": "contract_method",
      "colour": "#1976D2",
      "tooltip": "Destroy function definition (it destroys the contract and transfers the contract balance to the owner of the contract)",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html"
    });

    this.setWarningText('The "owner" variable must be defined in the contract state variables and initialized in the constructor function.\nThe usage of modifier "onlyOwner" is recommended.');

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


/* ********************** DESTROYANDSEND_METHOD BLOCK ********************** */

Blockly.Blocks['destroyAndSend_method'] = {
  init: function() {
    this.jsonInit({
      "message0": "function %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "destroyAndSend"
        },
      ],
      "message1": "documentation %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DOCS",
          "check": ["NatSpec_function"]
        },
      ],
/*      "message2": "function type %1",
      "args2": [
        {
          "type": "field_dropdown",
          "name": "FUNCTION_TYPE",
          "options": functionTypesList
        }      
      ], */
      "message2": "modifiers %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "MODIF",
          "check": ["modifier_usage"]
        }
      ],
      "previousStatement": "contract_method",
      "nextStatement": "contract_method",
      "colour": "#1976D2",
      "tooltip": "destroyAndSend function definition (it destroys the contract and transfers the contract balance to the account specified when calling the function)",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html"
    });
    
    this.setWarningText('The usage of modifier "onlyOwner" is recommended.');
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


/* ********************** CONTRACT_METHOD_CALL BLOCK ********************** */

function dynamicMethodsList () {
  var methodsList = [[ "select function...", "select function..." ]];

  var methodsVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('void');
  if (typeof methodsVariablesArray[0] != 'undefined') {
    var methodsNamePairsArray = [];
    for (var i = 0; i < methodsVariablesArray.length; i++)
      methodsNamePairsArray.push([Blockly.Solidity.getVariableName(methodsVariablesArray[i]),Blockly.Solidity.getVariableName(methodsVariablesArray[i])]);
    methodsList = methodsNamePairsArray;
  }

  return methodsList;
}


Blockly.Blocks['contract_method_call'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('call function')
      .appendField(
        new Blockly.FieldDropdown(dynamicMethodsList),
        //new Blockly.FieldDropdown([["select function...", Blockly.Solidity.UNDEFINED_NAME],]),
        "METHOD_NAME"
      );
    this.appendStatementInput('ARGS')
      .appendField("arguments").setCheck('argument_container');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Call of a function which does not return a value');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/contracts.html#visibility-and-getters');

    this.getVariableNameSelectField = function() { return this.getField('METHOD_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };

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
      }
    }); 
*/


  }
};


/* ********************** CONTRACT_METHOD_CALL_WITH_RETURN_VALUE BLOCK ********************** */


Blockly.Blocks['contract_method_call_with_return_value'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('call function')
      .appendField(
        new Blockly.FieldDropdown(dynamicMethodsList),
        //new Blockly.FieldDropdown([["select function...", Blockly.Solidity.UNDEFINED_NAME],]),
        "METHOD_NAME"
      )
      .appendField('with return value');
    this.appendStatementInput('ARGS')
      .appendField("arguments").setCheck('argument_container');
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Call of a function which returns a value');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/contracts.html#visibility-and-getters');

    this.getVariableNameSelectField = function() { return this.getField('METHOD_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };


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

        // FIXME: add/remove inputs according to the method params
      }
    });

*/

  }
};


/* ********************** ASSERT & REQUIRE BLOCKS ********************** */


Blockly.Blocks['assert'] = {
  init: function() {
    this.appendValueInput('VALUE')
          .appendField("assert ")
         ;
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Assert function call');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/control-structures.html#error-handling-assert-require-revert-and-exceptions');
    this.getVariableNameSelectField = function() { return this.getField('VALUE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };
  },
};


Blockly.Blocks['require'] = {
  init: function() {
    this.appendValueInput('VALUE')
          .appendField("require ")
          .setCheck('Boolean');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Require function call');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/control-structures.html#error-handling-assert-require-revert-and-exceptions');

    this.getVariableNameSelectField = function() { return this.getField('VALUE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };
  },
};


/* ********************** RETURN BLOCK ********************** */

Blockly.Blocks['return'] = {
  init: function() {
    this.appendDummyInput('VALUE')
      .appendField("return");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Return statement');

    this.getVariableNameSelectField = function() { return this.getField('VALUE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };
  },
};


/* ********************** LIBRARY_METHOD_CALL, LIBRARY_METHOD_CALL_WITH_RETURN_VALUE USING...FOR..., INHERIT, ORACLIZE_QUERY, ORACLIZE_SCHEDULED_QUERY, ORACLIZE_QUERYID, & ORACLIZE_RESULT BLOCKS ********************** */

Blockly.Blocks['library_method_call'] = {
  init: function() {
    this.jsonInit({
      "message0": "call external contract or library function %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "LIB_NAME",
          "options": dynamicLibsAndContractsList
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FF5252",
      "mutator": "library_function_mutator",
      "tooltip": "Call of an external contract or library function which does not return a value",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/contracts.html#libraries"
    });

    this.getVariableNameSelectField = function() { return this.getField('METHOD_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_LIBRARY };


    this.setOnChange(function(event) {
      if (this.getFieldValue('LIB_NAME')!='select external contract or library...') {

        this.updateShape_(true, this.getFieldValue('LIB_NAME'), event);
        this.setWarningText(null);

      } else {
        this.setWarningText('Select an external contract or a library from the list');
        this.updateShape_(false, this.getFieldValue('LIB_NAME'), event);
      }
    });
  },
};


Blockly.Blocks['library_method_call_with_return_value'] = {
  init: function() {
    this.jsonInit({
      "message0": "call external contract or library function %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "LIB_NAME",
          "options": dynamicLibsAndContractsList
        },
      ],
      "colour": "#757575",
      "mutator": "library_function_mutator",
      "tooltip": "Call of an external contract or a library function which returns a value",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/contracts.html#libraries",
      "output": null
    });

    this.getVariableNameSelectField = function() { return this.getField('METHOD_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_LIBRARY };


    this.setOnChange(function(event) {
      if (this.getFieldValue('LIB_NAME')!='select external contract or library...') {
        this.updateShape_(true, this.getFieldValue('LIB_NAME'), event);
        this.setWarningText(null);
      } else {
        this.setWarningText('Select an external contract or a library from the list');
        this.updateShape_(false, this.getFieldValue('LIB_NAME'), event);
      }
    });

  },
};


Blockly.Blocks['usingFor'] = {
  init: function() {
    this.jsonInit({
      "message0": "using library %1 for %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "LIB_NAME",
          "options": dynamicLibsList
        },
        {
          "type": "field_dropdown",
          "name": "TYPE",
          "options": typesListWithStar
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FF5252",
      "tooltip": "Attach functions from a specified library to a type, or to any type (*)",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/contracts.html#using-for"
    });

    this.getVariableNameSelectField = function() { return this.getField('LIB_NAME' + 'TYPE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_LIBRARY };

  },
};


Blockly.Blocks['inherit'] = {
  init: function() {
    this.jsonInit({
      "message0": "external contract %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "LIB_NAME", 
          "options": dynamicContractsList
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FF5252",
      "tooltip": "Inherit variables, events, modifiers and function from a specified external contract",
      "helpUrl": "http://solidity.readthedocs.io/en/v0.4.24/contracts.html#inheritance"
    });

  this.setDeletable(false);
  this.setWarningText('Once you have selected an external contract to inherit from, you cannot change it or remove it!');

    this.setOnChange(function(event) {


     if (this.getFieldValue('LIB_NAME')!='select external contract...') {

        //Retrieve external contract ABI and source code
        var ABI;
        var sourceCode;

		if (API_mode == false)
			jsonObjContracts = jsonObjFull;

          if (typeof jsonObjContracts != 'undefined') {
            for(var i = 0; i < jsonObjContracts.length; i++) 
              if (jsonObjContracts[i]['JSON']['contract']['descriptor']['name'] == this.getFieldValue('LIB_NAME')) {
                ABI = jsonObjContracts[i]['JSON']['contract']['descriptor']['abi'];
                sourceCode = jsonObjContracts[i]['code'];
              }
          }

        // Events, functions (and constructors)   
        if (typeof ABI != 'undefined')
          for(var i = 0; i < ABI.length; i++) {

            var scope = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.type == 'contract'})[0];

            switch(ABI[i]['type']) {
                case 'event':
                  var newVariable = Blockly.Variables.getOrCreateVariablePackage(this.workspace, null, ABI[i]['name'], 'event');
                  newVariable.group = Blockly.Solidity.LABEL_GROUP_EVENT;
                  newVariable.scope = scope;
                  break;
                case 'function':
                  var newVariable = Blockly.Variables.getOrCreateVariablePackage(this.workspace, null, ABI[i]['name'], 'void');
                  newVariable.group = Blockly.Solidity.LABEL_GROUP_METHOD;
                  newVariable.scope = scope;
                  break;
                default:
                  break;
            }
          }

            // Modifiers
            var modifiers = getFromBetween.get(sourceCode,"modifier ","() {");

            if (Array.isArray(modifiers) && modifiers.length) 
              for(var j=0;j<modifiers.length;j++) 
                {
                  var newVariable = Blockly.Variables.getOrCreateVariablePackage(this.workspace, null, modifiers[j], 'modifier');
                  newVariable.group = Blockly.Solidity.LABEL_GROUP_MODIFIER;
                  newVariable.scope = scope;
                }
     }
    });

  //console.log(Blockly.getMainWorkspace().getAllVariables());
  },
};


Blockly.Blocks['oraclize_query'] = {
  init: function() {
    this.jsonInit({
      "message0": "Oraclize query to URL %1",
      "args0": [
        {
          "type": "input_value",
          "name": "URL"
        },
      ],
      "message1": "operations to perform after response (callback) %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "CALLBACK"
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FF5252",
      "tooltip": "Query via Oraclize a given URL, which may inclued the use of JSON or XML parsing helpers. The result of the query is stored in the 'result' variable",
      "helpUrl": "http://docs.oraclize.it/#ethereum"
    });
  },
};


Blockly.Blocks['oraclize_scheduled_query'] = {
  init: function() {
    this.jsonInit({
      "message0": "Oraclize scheduled query to URL %1  with delay (in seconds or UTC timestamp) %2",
      "args0": [
        {
          "type": "input_value",
          "name": "URL"
        },
        {
          "type": "input_value",
          "name": "TIME",
          "check": "Number",
        },
      ],
      "message1": "operations to perform after response (callback) %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "CALLBACK"
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FF5252",
      "tooltip": "Schedule in the future an Oraclize query to a given URL, which may inclued the use of JSON or XML parsing helpers. The second parameter is the delay in seconds from the current time or the timestamp defining the time in the future at which the query should be performed.The result of the query is stored in the 'result' variable",
      "helpUrl": "https://docs.oraclize.it/#ethereum-quick-start-schedule-a-query-in-the-future"
    });
  },
};


Blockly.Blocks['oraclize_result'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Oraclize query result');
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Result of the Oraclize query');
    this.setHelpUrl("http://docs.oraclize.it/#ethereum");
  }
};

Blockly.Blocks['oraclize_queryId'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Oraclize query ID');
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('ID of the Oraclize query');
    this.setHelpUrl("http://docs.oraclize.it/#ethereum");
  }
};


/* ********************** EVENT_DEFINITION BLOCK ********************** */

Blockly.Blocks['event_definition'] = {
  init: function() {
    this.jsonInit({
      "message0": "event %1   arguments %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "EventName"
        },
        {
          "type": "input_statement",
          "name": "ARGS",
          "check": ["event_argument"]
        },
      ],
      "previousStatement": "event_definition",
      "nextStatement": "event_definition",
      "colour": "#1976D2",
      "tooltip": "Event definition",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/contracts.html#events"
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


/* ********************** EVENT_ARGUMENT BLOCK ********************** */

Blockly.Blocks['event_argument'] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput('argumentName');
    this.appendDummyInput()
        .appendField('event argument type')
        .appendField(new Blockly.FieldDropdown(typesList),
          'TYPE'
        )
        .appendField('indexed')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'INDEXED')
        .appendField(nameField, 'NAME');
    this.setPreviousStatement(true, 'event_argument');
    this.setNextStatement(true, 'event_argument');
    this.setColour("#1976D2");
    this.setTooltip('Event argument declaration');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/contracts.html#events');

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


/* ********************** EVENT_EMISSION BLOCK ********************** */

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
    this.appendStatementInput('ARGS')
      .appendField('emit event')
      .appendField(
        new Blockly.FieldDropdown(dynamicEventsList),
        "EVENT_NAME")
      .appendField("arguments").setCheck('argument_container');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    // this.setOutput(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Emit an event');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/contracts.html#events');

    this.getVariableNameSelectField = function() { return this.getField('EVENT_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_EVENT };

  }
};


/* ********************** MSG_GET BLOCK ********************** */

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
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/units-and-global-variables.html#block-and-transaction-properties');

    this.getVariableNameSelectField = function() { return this.getField('MSG_TYPE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ATOM };
  }
};


/* ********************** MODIFIER_DEFINITION BLOCK ********************** */

Blockly.Blocks['modifier_definition'] = {
  init: function() {
    this.jsonInit({
      "message0": "modifier %1   parameters %2",
      "args0": [
        {
          "type": "field_input",
          "name": "MODIFIER_NAME",
          "text": "modifierName"
        },
        {
          "type": "input_statement",
          "name": "PARAMS",
          "check": ["contract_method_parameter"]
        },
      ],
      "message1": "condition %1",
      "args1": [
        {
          "type": "input_value",
          "name": "CONDITION",
          //"check": ["contract_method_parameter"]
        },
      ],
      "message2": "error message %1",
      "args2": [
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
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/contracts.html#function-modifiers"
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


/* ********************** MODIFIER_ONLYBY BLOCK ********************** */

Blockly.Blocks['modifier_onlyBy'] = {
  init: function() {
    this.jsonInit({
      "message0": "modifier %1 (address _account)",
      "args0": [
        {
          "type": "field_input",
          "name": "MODIFIER_NAME",
          "text": "onlyBy"
        },
      ],
      "previousStatement": "modifier_definition",
      "nextStatement": "modifier_definition",
      "colour": "#1976D2",
      "tooltip": "onlyBy modifier (only the account passed to the modifier can call the function featuring this modifier: if the specified account calls this function, the function is executed; otherwise, an exception is thrown)",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html"
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


/* ********************** MODIFIER_ONLYOWNER BLOCK ********************** */

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
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html"
    });

    this.setWarningText('The "owner" variable must be defined in the contract state variables and initialized in the constructor function');

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


/* ********************** MODIFIER_ONLYAFTER BLOCK ********************** */

Blockly.Blocks['modifier_onlyAfter'] = {
  init: function() {
    this.jsonInit({
      "message0": "modifier %1 (uint _time)",
      "args0": [
        {
          "type": "field_input",
          "name": "MODIFIER_NAME",
          "text": "onlyAfter"
        },
      ],
      "previousStatement": "modifier_definition",
      "nextStatement": "modifier_definition",
      "colour": "#1976D2",
      "tooltip": "onlyAfter modifier (the function featuring this modifier can be called only after the specified amount of time has passed, otherwise an exception is thrown)",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html"
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


/* ********************** MODIFIER_USAGE BLOCK ********************** */

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
    this.appendStatementInput('ARGS')
      .appendField("arguments").setCheck('argument_container');
    this.setPreviousStatement(true, 'modifier_usage');
    this.setNextStatement(true, 'modifier_usage');
    // this.setOutput(true, null);
    this.setColour("#FF5252");
    this.setTooltip('Assign a previously defined modifier to the function');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html');

    this.getVariableNameSelectField = function() { return this.getField('MODIFIER_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_MODIFIER };

  }
};


/* ********************** ENUM_DEFINITION BLOCK ********************** */

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
          "check": ["enum_member"]
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#1976D2",
      "tooltip": "Enum definition",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?highlight=enum#enum-types"
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


/* ********************** ENUM_MEMBER BLOCK ********************** */

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
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?highlight=enum#enum-types"
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


/* ********************** ENUM_VARIABLE_CREATE BLOCK ********************** */

function dynamicEnumsList () {
  var enumsList = [[ "select enum type...", "select enum type..." ]];

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
      .appendField('declare enum variable of type ')
      .appendField(
        new Blockly.FieldDropdown(dynamicEnumsList),
        "ENUM_TYPE"
      )
      .appendField('visibility ')
      .appendField(new Blockly.FieldDropdown(varVisibilityList),
        'VISIBILITY'
      )
      .appendField(new Blockly.FieldTextInput('enumVariableName'), 'ENUM_VAR_NAME');
    this.setColour("#1976D2");
    this.setTooltip('Declare an enum variable');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?highlight=enum#enum-types');

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


/* ********************** ENUM_VARIABLE_SET BLOCK ********************** */

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
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?highlight=enum#enum-types');

    this.getVariableNameSelectField = function() { return this.getField('ENUM_VARIABLE_VALUE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM };
  },
};
 

/* ********************** ENUM_MEMBER_GET BLOCK ********************** */

function dynamicEnumMembersList() {
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


Blockly.Blocks['enum_member_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('enum member ')
      .appendField(
        new Blockly.FieldDropdown(dynamicEnumMembersList()),
        "ENUM_MEMBER_NAME"
      );
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Use a previously defined enum member in an enum variable assignment statement');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?highlight=enum#enum-types');

    this.getVariableNameSelectField = function() { return this.getField('ENUM_MEMBER_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM };

  }
};


/* ********************** ENUM_GET BLOCK ********************** */

Blockly.Blocks['enum_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('enum variable ')
      .appendField(
        new Blockly.FieldDropdown(dynamicEnumVariablesList()),
        "ENUM_VARIABLE_NAME"
      );
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Use a previously defined enum variable');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?highlight=enum#enum-types');

    this.getVariableNameSelectField = function() { return this.getField('ENUM_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM };

  }
};


/* ********************** STRUCT_DEFINITION BLOCK ********************** */

Blockly.Blocks['struct_definition'] = {
  init: function() {
    this.jsonInit({
      "message0": "struct %1  members %2",
      "args0": [
        {
          "type": "field_input",
          "name": "STRUCT_NAME",
          "text": "structName"
        },
        {
          "type": "input_statement",
          "name": "MEMBERS",
          "check": ["struct_member"]
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#1976D2",
      "tooltip": "Struct definition",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?#struct-types"
    });

    this.getVariableNameField = function() { return this.getField('STRUCT_NAME') };
    this.getVariableType = function() { return 'struct_definition' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_STRUCT };
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


/* ********************** STRUCT_MEMBER BLOCK ********************** */

Blockly.Blocks['struct_member'] = {
  init: function() {
    this.jsonInit({
      "message0": "member of type %1 %2",
      "args0": [
        { 
          "type": "field_dropdown",
          "name": "TYPE",
          "options": typesList
        },
        {
          "type": "field_input",
          "name": "MEMBER_NAME",
          "text": "memberName"
        },
      ],
      "previousStatement": "struct_member",
      "nextStatement": "struct_member",
      "colour": "#1976D2",
      "tooltip": "Struct member definition",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?#struct-types"
    });

    this.getVariableNameField = function() { return this.getField('MEMBER_NAME') };
    this.getVariableType = function() { return 'struct_member' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_STRUCT };
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


/* ********************** STRUCT_VARIABLE_CREATE BLOCK ********************** */

function dynamicStructTypesList () {
  var structsList = [[ "select struct type...", "select struct type..." ]];

  var structVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('struct_definition');
  if (typeof structVariablesArray[0] != 'undefined') {
    var structsNamePairsArray = [];
    for (var i = 0; i < structVariablesArray.length; i++)
      structsNamePairsArray.push([Blockly.Solidity.getVariableName(structVariablesArray[i]),Blockly.Solidity.getVariableName(structVariablesArray[i])]);
    structsList = structsNamePairsArray;
  }

  return structsList;
}


Blockly.Blocks['struct_variable_create'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('declare struct variable of type ')
      .appendField(
        new Blockly.FieldDropdown(dynamicStructTypesList),
        "STRUCT_TYPE"
      )
      .appendField('visibility ')
      .appendField(new Blockly.FieldDropdown(varVisibilityList),
        'VISIBILITY'
      )
      .appendField(new Blockly.FieldTextInput('structVariableName'), 'STRUCT_VAR_NAME');
    this.setColour("#1976D2");
    this.setTooltip('Declare a struct variable');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?#struct-types');

    this.getVariableNameField = function() { return this.getField('STRUCT_VAR_NAME') };
    this.getVariableType = function() { return 'struct_variable' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_STRUCT_VAR };
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


/* ********************** STRUCT_VARIABLE_SET BLOCK ********************** */

function dynamicStructVariablesList (includeArrays) {
  var structsList = [[ "select struct variable...", "select struct variable..." ]];

  var structVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('struct_variable');
  var structArrayBlockList = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return (b.type == 'array_variable_declare' && b.getFieldValue('TYPE').toString().includes('[STRUCT]')) });
  var structsNamePairsArray = structsList;
  if (typeof structVariablesArray[0] != 'undefined') {
    for (var i = 0; i < structVariablesArray.length; i++)
      structsNamePairsArray.push([Blockly.Solidity.getVariableName(structVariablesArray[i]),Blockly.Solidity.getVariableName(structVariablesArray[i])]);
  }
  if (typeof structArrayBlockList[0] != 'undefined' && includeArrays==true)
    for (var j = 0; j < structArrayBlockList.length; j++) {
      var newName = structArrayBlockList[j].getFieldValue('VAR_NAME') + '[]';
      structsNamePairsArray.push([newName,newName]);    
    }
  structsList = structsNamePairsArray;
  return structsList;
}


Blockly.Blocks['struct_variable_set'] = {
  init: function() {
    this.appendValueInput('STRUCT_VARIABLE_VALUE')
      .appendField('set struct variable ')
      .appendField(
        new Blockly.FieldDropdown(dynamicStructVariablesList(false)),
        "STRUCT_VARIABLE_NAME"
      )
      .appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#1976D2");
    this.setTooltip('Struct variable setter');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?#struct-types');

    this.getVariableNameSelectField = function() { return this.getField('STRUCT_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STRUCT };
  },
};


/* ********************** STRUCT_VARIABLE_GET BLOCK ********************** */

Blockly.Blocks['struct_variable_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('struct variable ')
      .appendField(
        new Blockly.FieldDropdown(dynamicStructVariablesList(false)),
        "STRUCT_VARIABLE_NAME"
      );
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Use a previously defined struct variable');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?#struct-types');

    this.getVariableNameSelectField = function() { return this.getField('STRUCT_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STRUCT };

  }
};


/* ********************** STRUCT_MEMBER_SET & STRUCT_MEMBER_GET BLOCKS ********************** */

function dynamicStructMembersList (blockName) {
  var structMembersList = [[ "select struct member...", "select struct member..." ]];

  if (typeof blockName != 'undefined' && blockName != null) {
    var structVariableBlock = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.getFieldValue('STRUCT_VAR_NAME') == blockName })[0];
    
    if (typeof structVariableBlock != 'undefined' && structVariableBlock != null) {
      var structDefinitionBlock = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.getFieldValue('STRUCT_NAME') == structVariableBlock.getFieldValue('STRUCT_TYPE') })[0];
      var membersOfGivenBlock = [];
      //var membersOfGivenBlock = structDefinitionBlock.getChildren().filter(function(b) { return b.type == 'struct_member' });
      do {
        structDefinitionBlock = structDefinitionBlock.getChildren().filter(function(b) { return b.type == 'struct_member' })[0];

        if (structDefinitionBlock) {
          membersOfGivenBlock.push(structDefinitionBlock);
        }
      } while (structDefinitionBlock)

      if (typeof membersOfGivenBlock[0] != 'undefined') {
        var membersOfGivenBlockPairs = [];
        for (var i = 0; i < membersOfGivenBlock.length; i++)
          membersOfGivenBlockPairs.push([membersOfGivenBlock[i].getFieldValue('MEMBER_NAME'),membersOfGivenBlock[i].getFieldValue('MEMBER_NAME')]);
        structMembersList = membersOfGivenBlockPairs;
      }
    }


    //Struct-Array blocks
    var arrayDeclarationBlock = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.getFieldValue('VAR_NAME') == blockName.substring(0, blockName.length - 2) })[0];
      if (typeof arrayDeclarationBlock != 'undefined' && arrayDeclarationBlock != null) {
      var structTypeName = arrayDeclarationBlock.getFieldValue('TYPE').substring(0, arrayDeclarationBlock.getFieldValue('TYPE').length - 8);
      var structDefinitionBlock = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.getFieldValue('STRUCT_NAME') == structTypeName })[0];

        var membersOfGivenBlock = [];
        do {
          structDefinitionBlock = structDefinitionBlock.getChildren().filter(function(b) { return b.type == 'struct_member' })[0];

          if (structDefinitionBlock) {
            membersOfGivenBlock.push(structDefinitionBlock);
          }
        } while (structDefinitionBlock)

        if (typeof membersOfGivenBlock[0] != 'undefined') {
          var membersOfGivenBlockPairs = [];
          for (var i = 0; i < membersOfGivenBlock.length; i++)
            membersOfGivenBlockPairs.push([membersOfGivenBlock[i].getFieldValue('MEMBER_NAME'),membersOfGivenBlock[i].getFieldValue('MEMBER_NAME')]);
          structMembersList = membersOfGivenBlockPairs;
        }
      }

  }

  return structMembersList;
}


Blockly.Blocks['struct_member_set'] = {
  init: function() {
    this.jsonInit({
      "message0": "set struct variable member %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "STRUCT_VARIABLE_NAME",
          "options": dynamicStructVariablesList(true)
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#1976D2",
      "mutator": "struct_member_mutator",
      "tooltip": "Set struct variable member",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?#struct-types"
    });

    this.getVariableNameSelectField = function() { return this.getField('STRUCT_VARIABLE_NAME'+'STRUCT_MEMBER_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STRUCT };


    this.setOnChange(function(event) {
      if (this.getFieldValue('STRUCT_VARIABLE_NAME')!='select struct variable...') {

        this.updateShape_(true, this.getFieldValue('STRUCT_VARIABLE_NAME'), event);
        //this.setWarningText(null);
      } else {
        //this.setWarningText('Select a variable from the list');
        this.updateShape_(false, this.getFieldValue('STRUCT_VARIABLE_NAME'), event);
      }
    });

  },
};


Blockly.Blocks['struct_member_get'] = {
  init: function() {
    this.jsonInit({
      "message0": "struct variable member %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "STRUCT_VARIABLE_NAME",
          "options": dynamicStructVariablesList(true)
        },
      ],
      "colour": "#757575",
      "mutator": "struct_member_mutator",
      "tooltip": "Use a previously defined struct variable member",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/structure-of-a-contract.html?#struct-types",
      "output": null
    });

    this.getVariableNameSelectField = function() { return this.getField('STRUCT_VARIABLE_NAME' + 'STRUCT_MEMBER_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_ENUM };

    this.setOnChange(function(event) {
      if (this.getFieldValue('STRUCT_VARIABLE_NAME')!='select struct variable...') {
        this.updateShape_(true, this.getFieldValue('STRUCT_VARIABLE_NAME'), event);
        //this.setWarningText(null);
      } else {
        //this.setWarningText('Select a variable from the list');
        this.updateShape_(false, this.getFieldValue('STRUCT_VARIABLE_NAME'), event);
      }
    });
  },
};


/* ********************** MAPPING_DEFINITION BLOCK ********************** */

Blockly.Blocks['mapping_definition'] = {
  init: function() {
    this.jsonInit({
      "message0": "declare mapping variable %1 => %2 visibility %3 %4",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TYPE1",
          "options": typesListForMap
        },
        {
          "type": "field_dropdown",
          "name": "TYPE2",
          "options": typesListForMap
        },
        {
          "type": "field_dropdown",
          "name": "VISIBILITY",
          "options": mapVarVisibilityList
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": "variableName"
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#1976D2",
      "tooltip": "Mapping variable declaration",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/types.html#mappings"
    });

    this.getVariableNameField = function() { return this.getField('NAME') };
    this.getVariableType = function() { return 'mapping_definition' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_MAPPING };
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


/* ********************** MAPPING_SET & MAPPING_GET BLOCKS ********************** */

function dynamicMappingVariablesList () {
  var mappingVariablesList = [[ "select mapping variable...", "select mapping variable..." ]];

  var mappingVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('mapping_definition');
  if (typeof mappingVariablesArray[0] != 'undefined') {
    var mappingNamePairsArray = [];
    for (var i = 0; i < mappingVariablesArray.length; i++)
      mappingNamePairsArray.push([Blockly.Solidity.getVariableName(mappingVariablesArray[i]),Blockly.Solidity.getVariableName(mappingVariablesArray[i])]);
    mappingVariablesList = mappingNamePairsArray;
  }

  return mappingVariablesList;
}

Blockly.Blocks['mapping_set'] = {
  init: function() {
    this.appendValueInput('ARG')
      .appendField("set")
      .appendField(
        new Blockly.FieldDropdown(dynamicMappingVariablesList),
        "MAPPING_VARIABLE_NAME"
      )
      .appendField("argument");    
    this.appendValueInput('VALUE')
      .appendField("to");    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#1976D2");
    this.setTooltip('Mapping variable setter');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/types.html#mappings');

    this.getVariableNameSelectField = function() { return this.getField('MAPPING_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_MAPPING };
  },

};


Blockly.Blocks['mapping_get'] = {
  init: function() {
    this.appendValueInput('ARG')
      .appendField("get")
      .appendField(
        new Blockly.FieldDropdown(dynamicMappingVariablesList),
        "MAPPING_VARIABLE_NAME"
      )
      .appendField("argument");    
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Mapping variable getter');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/types.html#mappings');

    this.getVariableNameSelectField = function() { return this.getField('MAPPING_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_MAPPING };
  }
};


/* ********************** ARRAY_VARIABLE_DECLARE, ARRAY_VARIABLE_SET, ARRAY_VARIABLE_PUSH & ARRAY_VARIABLE_GET BLOCKS ********************** */

function dynamicPrimitiveAndStructTypesList () {
  var structsList = [[ "select type...", "select type..." ]];
  var structsNamePairsArray = [];
  for (var j = 0; j < typesList.length; j++)
    structsNamePairsArray.push(typesList[j]);    
  var structVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('struct_definition');
  if (typeof structVariablesArray[0] != 'undefined') {
    for (var i = 0; i < structVariablesArray.length; i++) {
      var name = Blockly.Solidity.getVariableName(structVariablesArray[i])+'[STRUCT]';
      structsNamePairsArray.push([name,name]);
    }
  }
  structsList = structsNamePairsArray;
  return structsList;
}

Blockly.Blocks['array_variable_declare'] = {
  init: function() {
    this.jsonInit({
      "message0": "declare array of type %1  visibility %2  %3",
      "args0": [
        { 
          "type": "field_dropdown",
          "name": "TYPE",
          "options": dynamicPrimitiveAndStructTypesList
        },
        { 
          "type": "field_dropdown",
          "name": "VISIBILITY",
          "options": varVisibilityList
        },
        {
          "type": "field_input",
          "name": "VAR_NAME",
          "text": "arrayName"
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#1976D2",
      "tooltip": "Declare an array variable",
      "helpUrl": "https://solidity.readthedocs.io/en/v0.4.24/types.html#fixed-size-byte-arrays"
    });

    this.getVariableNameField = function() { return this.getField('VAR_NAME') };
    this.getVariableType = function() { return 'array_variable' };
    this.getVariableGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };
    this.getVariableScope = function() {
      var scope = this.getParent();
      while (!!scope && scope.type != 'contract') {
        scope = scope.getParent();
      }
      return scope;
    };

    Blockly.Extensions.apply('declare_typed_variable', this, false);

/*
    this.setOnChange(function(event) {
      var scope = Blockly.getMainWorkspace().getAllBlocks().filter(function(b) { return b.type == 'contract'})[0];
      var typeCheck = this.getFieldValue('TYPE').toString().includes('[STRUCT]');
      if (typeCheck == true) {
        var varName = this.getFieldValue('VAR_NAME') + '[]';
        var newVariable = Blockly.Variables.getOrCreateVariablePackage(this.workspace, null, varName, 'struct_variable');
        newVariable.group = Blockly.Solidity.LABEL_GROUP_STRUCT_VAR;
        newVariable.scope = scope;
      }
    });
 */
  },
};


function dynamicArrayVariablesList () {
  var arraysList = [[ "select array variable...", "select array variable..." ]];

  var arrayVariablesArray = Blockly.getMainWorkspace().getVariablesOfType('array_variable');
  if (typeof arrayVariablesArray[0] != 'undefined') {
    var arraysNamePairsArray = arraysList;
    for (var i = 0; i < arrayVariablesArray.length; i++)
      arraysNamePairsArray.push([Blockly.Solidity.getVariableName(arrayVariablesArray[i]),Blockly.Solidity.getVariableName(arrayVariablesArray[i])]);
    arraysList = arraysNamePairsArray;
  }

  return arraysList;
}


Blockly.Blocks['array_variable_set'] = {
  init: function() {
    this.appendValueInput('ARRAY_VARIABLE_NAME')
      .appendField('set ');
    this.appendValueInput('ARRAY_VARIABLE_VALUE')
      .appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#1976D2");
    this.setTooltip('Set value for whole array or array element');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/types.html#fixed-size-byte-arrays');

    this.getVariableNameSelectField = function() { return this.getField('ARRAY_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };
  },
};


Blockly.Blocks['array_variable_push'] = {
  init: function() {
    this.appendValueInput('NEW_ELEMENT')
      .appendField('push new element ');
    this.appendValueInput('ARRAY_VARIABLE_NAME')
      .appendField(" to array ");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#1976D2");
    this.setTooltip('Push new element to array variable');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/types.html#fixed-size-byte-arrays');

    this.getVariableNameSelectField = function() { return this.getField('ARRAY_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };
  },
};


Blockly.Blocks['array_variable_element_get'] = {
  init: function() {
    this.appendValueInput('INDEX').setCheck('Number')
      .appendField(' element at index');
    this.appendValueInput('ARRAY_VARIABLE_NAME')
      .appendField(" of array ");
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Get array element given its index');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/types.html#fixed-size-byte-arrays');

    this.getVariableNameSelectField = function() { return this.getField('ARRAY_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };

  }
};


Blockly.Blocks['array_variable_get'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown(dynamicArrayVariablesList),
        "ARRAY_VARIABLE_NAME"
      );    
    this.setOutput(true, null);
    this.setColour("#757575");
    this.setTooltip('Get whole array or array element');
    this.setHelpUrl('https://solidity.readthedocs.io/en/v0.4.24/types.html#fixed-size-byte-arrays');

    this.getVariableNameSelectField = function() { return this.getField('ARRAY_VARIABLE_NAME'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_STATE };

  }
};


/* ********************** NATSPEC_CONTRACT, NATSPEC_FUNCTION & NATSPEC_FUNCTION_PARAMETER BLOCKS ********************** */

Blockly.Blocks['NatSpec_contract'] = {
  init: function() {
    this.appendDummyInput()   
      .appendField("Contract documentation");
    this.appendDummyInput()   
      .appendField("@title")
      .appendField(new Blockly.FieldTextInput(''), 'TITLE');
    this.appendDummyInput()   
      .appendField("@author")
      .appendField(new Blockly.FieldTextInput(''), 'AUTHOR');
    this.appendDummyInput()   
      .appendField("@notice")
      .appendField(new Blockly.FieldTextInput(''), 'NOTICE');
    this.appendDummyInput()   
      .appendField("@dev")
      .appendField(new Blockly.FieldTextInput(''), 'DEV');
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour("#f4c741");
    this.setTooltip('Contract NatSpec documentation');
    this.setHelpUrl('https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format');

    this.getVariableNameSelectField = function() { return this.getField('TITLE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_NATSPEC };
  },
};


Blockly.Blocks['NatSpec_function'] = {
  init: function() {
    this.jsonInit({
      "message0": "Function documentation",
      "message1": "@author %1",
      "args1": [
        {
          "type": "field_input",
          "name": "AUTHOR",
          "text": ""
        },
      ],
      "message2": "@notice %1",
      "args2": [
        {
          "type": "field_input",
          "name": "NOTICE",
          "text": ""
        },
      ],
      "message3": "@dev %1",
      "args3": [
        {
          "type": "field_input",
          "name": "DEV",
          "text": ""
        },
      ],
      "message4": "parameters %1",
      "args4": [
        {
          "type": "input_statement",
          "name": "PARAMS",
          "check": ["NatSpec_function_parameter"]
        },
      ],
      "message5": "@return %1",
      "args5": [
        {
          "type": "field_input",
          "name": "RETURN",
          "text": ""
        },
      ],
      "previousStatement": ["NatSpec_function", "contract_method", "contract_method_with_return", "contract_ctor"],
      "nextStatement": "NatSpec_function",
      "colour": "#f4c741",
      "tooltip": "Function NatSpec documentation",
      "helpUrl": "https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format"
    });

    this.getVariableNameSelectField = function() { return this.getField('TITLE'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_NATSPEC };

  },
};


Blockly.Blocks['NatSpec_function_parameter'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("@parameter")
      .appendField(new Blockly.FieldTextInput(''), 'PARAM');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setOutput(false, null);
    this.setColour("#f4c741");
    this.setTooltip('Function parameter NatSpec documentation');
    this.setHelpUrl('https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format');
    
    this.getVariableNameSelectField = function() { return this.getField('PARAM'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_NATSPEC };
  },
};


/* ********************** ARGUMENT_CONTAINER BLOCK ********************** */

Blockly.Blocks['argument_container'] = {
  init: function() {
    this.appendValueInput('ARG')
          .appendField("argument ");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#5C81A6");
    this.setTooltip('Argument container');

    this.getVariableNameSelectField = function() { return this.getField('ARG'); };
    this.getVariableLabelGroup = function() { return Blockly.Solidity.LABEL_GROUP_METHOD };
  },
};


/* **********************  ********************** */

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
        "message0": "loop over variable %1 in range %2 < %3  ",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
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
          }
        ],
        "message1": "do %1",
        "args1": [{
          "type": "input_statement",
          "name": "CODE"
        }],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "%{BKY_LOGIC_HUE}",
        "helpUrl": "%{BKY_CONTROLS_FOR_HELPURL}",
      }
    );

    this.getVariableNameField = function() { return this.getField('NAME'); };
    this.getVariableType = function() { return  'TYPE_UINT'};
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
