'use strict';

goog.provide('Blockly.Arduino.mieo_device');

goog.require('Blockly.Arduino');

// Register device-scoped Mieo generators once Blockly.Arduino exists.
// This keeps the implementation in CommonJS for compatibility with the current build.
try {
  require('./mieo-device')();
} catch (e) {
  // Ignore load-order issues in generated bundles; registration is deferred there.
}
