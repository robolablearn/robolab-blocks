/**
 * @license
 * Visual Blocks Editor
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Colour-per-pixel matrix field for the Mieo LED panel.
 */
'use strict';

goog.provide('Blockly.FieldMatrixColor');

goog.require('Blockly.FieldMatrix');
goog.require('Blockly.DropDownDiv');


/**
 * A colour-per-pixel matrix painter.
 *
 * Blockly.FieldMatrix paints one bit per cell: on or off, one colour for the
 * whole pattern. The Mieo panel is RGB, so this subclass keeps a palette index
 * per cell instead. The value is still one character per cell, row-major from
 * the top left, so everything that carries a matrix value -- project xml, the
 * shadow block, the generators -- is unchanged. '0' is off and '1'-'9' index
 * PALETTE, which means a pattern saved by the old on/off painter still loads:
 * its '1's simply come back as palette colour 1.
 *
 * Almost everything is inherited. Only the parts that care about colour are
 * overridden: how a cell is drawn, what a click paints, and the editor chrome.
 */
Blockly.FieldMatrixColor = function(matrix, width, height) {
  Blockly.FieldMatrixColor.superClass_.constructor.call(this, matrix, width, height);
  this.addArgType('matrixcolor');
  this.selected_ = '1';
  this.valueOnOpen_ = null;
  this.paletteWrappers_ = [];
  this.presetWrappers_ = [];
  this.okWrapper_ = null;
  this.cancelWrapper_ = null;
};
goog.inherits(Blockly.FieldMatrixColor, Blockly.FieldMatrix);

Blockly.FieldMatrixColor.fromJson = function(options) {
  return new Blockly.FieldMatrixColor(options['matrix'], options['width'], options['height']);
};

Blockly.FieldMatrixColor.PALETTE = [
  '#C8C8C8', '#FFFFFF', '#FFC800', '#FF0000', '#FF00FF',
  '#00FFFF', '#0000FF', '#00FF00', '#FF8C00', '#00A000'
];

Blockly.FieldMatrixColor.SWATCH_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

Blockly.FieldMatrixColor.PRESETS = [
  // Drawn as 5 rows of 7, then encoded -- typing 35 digits by hand is how
  // an earlier set ended up misaligned.
  '04404404444444044444000444000004000', // heart
  '00060000066600066666000060000006000', // arrow
  '00020002222222022222002202202000002', // star
  '00000070000070700070007070000070000', // tick
  '00050000055500055555000555000005000'  // gem
];

Blockly.FieldMatrixColor.LABEL_GUTTER = 14;

Blockly.FieldMatrixColor.prototype.colourAt_ = function(index) {
  var ch = this.matrix_.charAt(index);
  var n = Number(ch);
  if (isNaN(n) || !Blockly.FieldMatrixColor.PALETTE[n]) n = 0;
  return Blockly.FieldMatrixColor.PALETTE[n];
};

Blockly.FieldMatrixColor.prototype.updateMatrix_ = function() {
  if (!this.matrix_) return;
  for (var i = 0; i < this.matrix_.length; i++) {
    var colour = this.colourAt_(i);
    this.fillMatrixNode_(this.ledButtons_, i, colour);
    this.fillMatrixNode_(this.ledThumbNodes_, i, colour);
  }
};

Blockly.FieldMatrixColor.prototype.setLEDNode_ = function(led, state) {
  if (led < 0 || led > (this.width_ * this.height_ - 1)) return;
  var matrix = this.matrix_.substr(0, led) + state + this.matrix_.substr(led + 1);
  this.setValue(matrix);
};

Blockly.FieldMatrixColor.prototype.onMouseDown = function(e) {
  this.matrixMoveWrapper_ =
    Blockly.bindEvent_(document.body, 'mousemove', this, this.onMouseMove);
  this.matrixReleaseWrapper_ =
    Blockly.bindEvent_(document.body, 'mouseup', this, this.onMouseUp);
  var ledHit = this.checkForLED_(e);
  if (ledHit > -1) {
    this.paintStyle_ = this.matrix_.charAt(ledHit) === this.selected_ ? 'clear' : 'fill';
    this.setLEDNode_(ledHit, this.paintStyle_ === 'fill' ? this.selected_ : '0');
    this.updateMatrix_();
  } else {
    this.paintStyle_ = null;
  }
};

Blockly.FieldMatrixColor.prototype.onMouseMove = function(e) {
  e.preventDefault();
  if (!this.paintStyle_) return;
  var led = this.checkForLED_(e);
  if (led < 0) return;
  this.setLEDNode_(led, this.paintStyle_ === 'fill' ? this.selected_ : '0');
};

Blockly.FieldMatrixColor.prototype.clearMatrix_ = function(e) {
  if (e.button != 0) return;
  this.setValue(this.zeros_);
};

Blockly.FieldMatrixColor.prototype.fillMatrix_ = function(e) {
  if (e.button != 0) return;
  var filled = '';
  for (var i = 0; i < this.width_ * this.height_; i++) filled += this.selected_;
  this.setValue(filled);
};

Blockly.FieldMatrixColor.prototype.checkForLED_ = function(e) {
  var bBox = this.matrixStage_.getBoundingClientRect();
  var nodeSize = Blockly.FieldMatrix.MATRIX_NODE_SIZE;
  var nodePad = Blockly.FieldMatrix.MATRIX_NODE_PAD;
  var gutter = Blockly.FieldMatrixColor.LABEL_GUTTER;
  var dx = e.clientX - bBox.left - gutter;
  var dy = e.clientY - bBox.top - gutter;
  var min = nodePad / 2;
  var maxX = nodeSize * this.width_ + nodePad * (this.width_ + 1) - (nodePad / 2);
  var maxY = nodeSize * this.height_ + nodePad * (this.height_ + 1) - (nodePad / 2);
  if (dx < min || dx > maxX || dy < min || dy > maxY) return -1;
  var xDiv = Math.trunc((dx - nodePad / 2) / (nodeSize + nodePad));
  var yDiv = Math.trunc((dy - nodePad / 2) / (nodeSize + nodePad));
  if (xDiv < 0 || xDiv >= this.width_ || yDiv < 0 || yDiv >= this.height_) return -1;
  return xDiv + (yDiv * this.width_);
};

Blockly.FieldMatrixColor.prototype.createSwatch_ = function(index) {
  var size = Blockly.FieldMatrix.MATRIX_NODE_SIZE + 6;
  var swatch = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'version': '1.1',
    'height': size + 'px',
    'width': size + 'px'
  });
  Blockly.utils.createSvgElement('rect', {
    'x': 2, 'y': 2, 'width': size - 4, 'height': size - 4,
    'rx': (size - 4) / 2, 'ry': (size - 4) / 2,
    'fill': Blockly.FieldMatrixColor.PALETTE[Number(index)],
    'stroke': index === '1' ? '#A0A0A0' : 'rgba(0,0,0,0.35)',
    'stroke-width': 1
  }, swatch);
  if (index === '0') {
    Blockly.utils.createSvgElement('path', {
      'd': 'M6 6 L' + (size - 6) + ' ' + (size - 6) + ' M' + (size - 6) + ' 6 L6 ' + (size - 6),
      'stroke': '#6B6B6B', 'stroke-width': 2
    }, swatch);
  }
  return swatch;
};

Blockly.FieldMatrixColor.prototype.updateSwatchSelection_ = function() {
  if (!this.swatchRects_) return;
  for (var i = 0; i < Blockly.FieldMatrixColor.SWATCH_ORDER.length; i++) {
    var isOn = Blockly.FieldMatrixColor.SWATCH_ORDER[i] === this.selected_;
    this.swatchRects_[i].setAttribute('stroke', isOn ? '#4C97FF' : 'rgba(0,0,0,0.35)');
    this.swatchRects_[i].setAttribute('stroke-width', isOn ? 3 : 1);
  }
};

Blockly.FieldMatrixColor.prototype.createPreset_ = function(pattern) {
  var cell = 5;
  var svg = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'version': '1.1',
    'height': (cell * this.height_ + 4) + 'px',
    'width': (cell * this.width_ + 4) + 'px'
  });
  for (var y = 0; y < this.height_; y++) {
    for (var x = 0; x < this.width_; x++) {
      var ch = pattern.charAt(y * this.width_ + x);
      var n = Number(ch);
      if (isNaN(n) || !Blockly.FieldMatrixColor.PALETTE[n]) n = 0;
      Blockly.utils.createSvgElement('rect', {
        'x': x * cell + 2, 'y': y * cell + 2,
        'width': cell - 1, 'height': cell - 1,
        'fill': Blockly.FieldMatrixColor.PALETTE[n]
      }, svg);
    }
  }
  return svg;
};

Blockly.FieldMatrixColor.prototype.createTextButton_ = function(text, primary) {
  var button = document.createElement('button');
  button.textContent = text;
  button.style.cssText = 'margin:0 4px;padding:4px 16px;border-radius:4px;' +
    'border:1px solid rgba(0,0,0,0.2);cursor:pointer;font-size:12px;' +
    (primary ? 'background:#4C97FF;color:#fff;' : 'background:#fff;color:#575E75;');
  return button;
};

Blockly.FieldMatrixColor.prototype.makeSwatchHandler_ = function(index) {
  var self = this;
  return function(e) {
    if (e.button != 0) return;
    self.selected_ = index;
    self.updateSwatchSelection_();
  };
};

Blockly.FieldMatrixColor.prototype.makePresetHandler_ = function(pattern) {
  var self = this;
  return function(e) {
    if (e.button != 0) return;
    self.setValue(pattern);
    self.updateMatrix_();
  };
};

Blockly.FieldMatrixColor.prototype.showEditor_ = function() {
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var div = Blockly.DropDownDiv.getContentDiv();
  var self = this;

  this.valueOnOpen_ = this.matrix_;

  var nodeSize = Blockly.FieldMatrix.MATRIX_NODE_SIZE;
  var nodePad = Blockly.FieldMatrix.MATRIX_NODE_PAD;
  var gutter = Blockly.FieldMatrixColor.LABEL_GUTTER;

  var wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;align-items:flex-start;padding:4px;';

  var paletteDiv = document.createElement('div');
  paletteDiv.style.cssText = 'display:flex;flex-wrap:wrap;width:' +
    ((nodeSize + 6) * 2 + 8) + 'px;margin-right:10px;';
  this.swatchRects_ = [];
  this.paletteWrappers_ = [];
  var s, index, swatch;
  for (s = 0; s < Blockly.FieldMatrixColor.SWATCH_ORDER.length; s++) {
    index = Blockly.FieldMatrixColor.SWATCH_ORDER[s];
    swatch = this.createSwatch_(index);
    this.swatchRects_.push(swatch.childNodes[0]);
    swatch.style.cursor = 'pointer';
    paletteDiv.appendChild(swatch);
    this.paletteWrappers_.push(
      Blockly.bindEvent_(swatch, 'mousedown', this, this.makeSwatchHandler_(index)));
  }

  var toolDiv = document.createElement('div');
  toolDiv.style.cssText = 'display:flex;margin-top:8px;';
  var fillButton = this.createButton_('#FFFFFF');
  var clearButton = this.createButton_(this.sourceBlock_.colourSecondary_);
  fillButton.style.cursor = 'pointer';
  clearButton.style.cursor = 'pointer';
  toolDiv.appendChild(fillButton);
  toolDiv.appendChild(clearButton);
  paletteDiv.appendChild(toolDiv);
  wrapper.appendChild(paletteDiv);

  var gridW = nodeSize * this.width_ + nodePad * (this.width_ + 1);
  var gridH = nodeSize * this.height_ + nodePad * (this.height_ + 1);
  this.matrixStage_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'version': '1.1',
    'height': (gridH + gutter) + 'px',
    'width': (gridW + gutter) + 'px'
  }, wrapper);

  var c, t;
  for (c = 0; c < this.width_; c++) {
    t = Blockly.utils.createSvgElement('text', {
      'x': gutter + nodePad + c * (nodeSize + nodePad) + nodeSize / 2,
      'y': 10, 'fill': '#8C8C8C', 'font-size': '9pt', 'text-anchor': 'middle'
    }, this.matrixStage_);
    t.appendChild(document.createTextNode(String(c + 1)));
  }
  for (c = 0; c < this.height_; c++) {
    t = Blockly.utils.createSvgElement('text', {
      'x': gutter / 2,
      'y': gutter + nodePad + c * (nodeSize + nodePad) + nodeSize / 2 + 4,
      'fill': '#8C8C8C', 'font-size': '9pt', 'text-anchor': 'middle'
    }, this.matrixStage_);
    t.appendChild(document.createTextNode(String(c + 1)));
  }

  this.ledButtons_ = [];
  var i, n;
  for (i = 0; i < this.height_; i++) {
    for (n = 0; n < this.width_; n++) {
      this.ledButtons_.push(Blockly.utils.createSvgElement('rect', {
        'x': gutter + (nodeSize * n) + (nodePad * (n + 1)) + 'px',
        'y': gutter + (nodeSize * i) + (nodePad * (i + 1)) + 'px',
        'width': nodeSize, 'height': nodeSize,
        'rx': Blockly.FieldMatrix.MATRIX_NODE_RADIUS,
        'ry': Blockly.FieldMatrix.MATRIX_NODE_RADIUS
      }, this.matrixStage_));
    }
  }
  div.appendChild(wrapper);

  var presetDiv = document.createElement('div');
  presetDiv.style.cssText = 'display:flex;overflow-x:auto;max-width:' +
    (gridW + gutter + (nodeSize + 6) * 2 + 22) + 'px;padding:6px 4px;' +
    'border-top:1px solid rgba(0,0,0,0.12);';
  this.presetWrappers_ = [];
  var p, preset;
  for (p = 0; p < Blockly.FieldMatrixColor.PRESETS.length; p++) {
    preset = this.createPreset_(Blockly.FieldMatrixColor.PRESETS[p]);
    preset.style.cursor = 'pointer';
    preset.style.marginRight = '6px';
    presetDiv.appendChild(preset);
    this.presetWrappers_.push(
      Blockly.bindEvent_(preset, 'mousedown', this,
        this.makePresetHandler_(Blockly.FieldMatrixColor.PRESETS[p])));
  }
  div.appendChild(presetDiv);

  var actionDiv = document.createElement('div');
  actionDiv.style.cssText = 'display:flex;justify-content:flex-end;padding:6px 4px 2px;';
  var okButton = this.createTextButton_('Okay', true);
  var cancelButton = this.createTextButton_('Cancel', false);
  actionDiv.appendChild(cancelButton);
  actionDiv.appendChild(okButton);
  div.appendChild(actionDiv);

  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(),
      this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setCategory(this.sourceBlock_.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_,
      this.onEditorHide_.bind(this));

  this.matrixTouchWrapper_ =
      Blockly.bindEvent_(this.matrixStage_, 'mousedown', this, this.onMouseDown);
  this.clearButtonWrapper_ =
      Blockly.bindEvent_(clearButton, 'click', this, this.clearMatrix_);
  this.fillButtonWrapper_ =
      Blockly.bindEvent_(fillButton, 'click', this, this.fillMatrix_);
  this.okWrapper_ = Blockly.bindEvent_(okButton, 'click', this, function() {
    Blockly.DropDownDiv.hide();
  });
  this.cancelWrapper_ = Blockly.bindEvent_(cancelButton, 'click', this, function() {
    if (self.valueOnOpen_ !== null) self.setValue(self.valueOnOpen_);
    Blockly.DropDownDiv.hide();
  });

  this.updateSwatchSelection_();
  this.updateMatrix_();
};

/**
 * Drop the listeners this editor added.
 *
 * Not dispose_: that is never called on a field. The only dispose_() call in
 * Blockly is WidgetDiv's own, and FieldMatrix/FieldAngle/FieldNote/FieldSlider
 * all define one that never runs. DropDownDiv's onHide callback does run, on
 * Okay, on Cancel, and on clicking away.
 * @private
 */
Blockly.FieldMatrixColor.prototype.onEditorHide_ = function() {
  var lists = [this.paletteWrappers_, this.presetWrappers_];
  for (var l = 0; l < lists.length; l++) {
    var list = lists[l] || [];
    for (var i = 0; i < list.length; i++) {
      Blockly.unbindEvent_(list[i]);
    }
  }
  this.paletteWrappers_ = [];
  this.presetWrappers_ = [];
  var singles = ['okWrapper_', 'cancelWrapper_', 'matrixTouchWrapper_',
    'clearButtonWrapper_', 'fillButtonWrapper_'];
  for (var s = 0; s < singles.length; s++) {
    if (this[singles[s]]) {
      Blockly.unbindEvent_(this[singles[s]]);
      this[singles[s]] = null;
    }
  }
  this.swatchRects_ = null;
  this.valueOnOpen_ = null;
};

Blockly.Field.register('field_matrix_color', Blockly.FieldMatrixColor);
