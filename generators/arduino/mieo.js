/**
 * Visual Blocks Language - Mieo Code Generators
 * 
 * Copyright 2024 openblock.cc
 * https://github.com/openblockcc/openblock-blocks
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
'use strict';

goog.provide('Blockly.Arduino.mieo');

goog.require('Blockly.Arduino');


/**
 * Arduino code generator for Mieo "when startup" event block
 * This is a HAT block that generates Arduino setup code structure
 */
Blockly.Arduino['mieo_whenStartup'] = function (block) {
    // Add Arduino.h include - this is essential for Arduino code
    Blockly.Arduino.includes_['arduino'] = '#include <Arduino.h>';

    // HAT blocks return empty code - they define the program structure
    // Actual statements attached to this HAT block are processed separately
    return '';
};

/**
 * Arduino code generator for Mieo set digital output
 * Block: set digital pin [PIN] to [LEVEL]
 */
Blockly.Arduino['mieo_setDigitalOutput'] = function (block) {
    // Get the argument values from shadow blocks
    var pin = Blockly.Arduino.valueToCode(block, 'PIN', Blockly.Arduino.ORDER_ATOMIC);
    var level = Blockly.Arduino.valueToCode(block, 'LEVEL', Blockly.Arduino.ORDER_ATOMIC);

    // Fallback defaults if not set
    if (!pin) pin = '13';
    if (!level) level = 'HIGH';

    // Remove quotes from the values (shadow blocks may add them)
    pin = pin.toString().replace(/^['"]|['"]$/g, '');
    level = level.toString().replace(/^['"]|['"]$/g, '');

    // Ensure pin mode is set in setup
    var setupKey = 'pinMode_' + pin;
    if (!Blockly.Arduino.setups_[setupKey]) {
        Blockly.Arduino.setups_[setupKey] = 'pinMode(' + pin + ', OUTPUT);';
    }

    var code = 'digitalWrite(' + pin + ', ' + level + ');\n';
    return code;
};


