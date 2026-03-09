'use strict';

/* eslint-disable global-require */

const Blockly = require('openblock-blocks');

const registerMieoGenerators = () => {
    if (!Blockly || !Blockly.Arduino) {
        return false;
    }

    const Arduino = Blockly.Arduino;

    const getValue = (block, name, fallback) => {
        let value = '';
        if (Arduino.valueToCode) {
            value = Arduino.valueToCode(block, name, Arduino.ORDER_ATOMIC) || '';
        }
        if (!value && block.getFieldValue) {
            value = block.getFieldValue(name) || '';
        }
        if (!value) value = fallback;
        value = value.toString();
        return value.replace(/^['"]|['"]$/g, '');
    };

    const mieoInclude = '#include <mieo.h>';

    if (!Arduino.event_whenmieostartsup) {
        Arduino.event_whenmieostartsup = function () {
            Arduino.includes_.arduino = '#include <Arduino.h>';
            Arduino.includes_.mieo = mieoInclude;
            return '';
        };
    } else {
        const originalWhenStart = Arduino.event_whenmieostartsup;
        Arduino.event_whenmieostartsup = function () {
            Arduino.includes_.mieo = mieoInclude;
            return originalWhenStart.apply(this, arguments);
        };
    }

    if (!Arduino.arduino_mieo_event_whenmieostartsup) {
        Arduino.arduino_mieo_event_whenmieostartsup =
            Arduino.event_whenmieostartsup ||
            Arduino.mieo_whenStartup ||
            Arduino.mieo_mieo_whenStartup ||
            function () {
                Arduino.includes_.arduino = '#include <Arduino.h>';
                Arduino.includes_.mieo = mieoInclude;
                return '';
            };
    }

    if (!Arduino.arduino_mieo_mieo_setDigitalOutput) {
        Arduino.arduino_mieo_mieo_setDigitalOutput =
            Arduino.mieo_setDigitalOutput ||
            Arduino.mieo_mieo_setDigitalOutput ||
            function (block) {
                const pin = getValue(block, 'PIN', '13');
                const level = getValue(block, 'LEVEL', 'HIGH');
                const setupKey = `pinMode_${pin}`;
                if (!Arduino.setups_[setupKey]) {
                    Arduino.setups_[setupKey] = `pinMode(${pin}, OUTPUT);`;
                }
                return `digitalWrite(${pin}, ${level});\n`;
            };
    }

    if (!Arduino.arduino_mieo_mieo_setDigitalPinHighLow) {
        Arduino.arduino_mieo_mieo_setDigitalPinHighLow =
            Arduino.mieo_setDigitalPinHighLow ||
            function (block) {
                const pin = getValue(block, 'PIN', 'A5');
                const level = getValue(block, 'LEVEL', 'HIGH');
                const setupKey = `pinMode_${pin}`;
                if (!Arduino.setups_[setupKey]) {
                    Arduino.setups_[setupKey] = `pinMode(${pin}, OUTPUT);`;
                }
                return `digitalWrite(${pin}, ${level});\n`;
            };
    }

    if (!Arduino.arduino_mieo_mieo_readDigitalPin) {
        Arduino.arduino_mieo_mieo_readDigitalPin =
            Arduino.mieo_readDigitalPin ||
            function (block) {
                const pin = getValue(block, 'PIN', '13');
                const setupKey = `pinMode_${pin}`;
                if (!Arduino.setups_[setupKey]) {
                    Arduino.setups_[setupKey] = `pinMode(${pin}, INPUT);`;
                }
                return [`(digitalRead(${pin}) == HIGH)`, Arduino.ORDER_EQUALITY];
            };
    }

    if (!Arduino.arduino_mieo_mieo_readDigitalPinBoolean) {
        Arduino.arduino_mieo_mieo_readDigitalPinBoolean =
            Arduino.mieo_readDigitalPinBoolean ||
            function (block) {
                const pin = getValue(block, 'PIN', 'A5');
                const setupKey = `pinMode_${pin}`;
                if (!Arduino.setups_[setupKey]) {
                    Arduino.setups_[setupKey] = `pinMode(${pin}, INPUT);`;
                }
                return [`(digitalRead(${pin}) == HIGH)`, Arduino.ORDER_EQUALITY];
            };
    }

    if (!Arduino.arduino_mieo_mieo_readAnalogPin) {
        Arduino.arduino_mieo_mieo_readAnalogPin =
            Arduino.mieo_readAnalogPin ||
            function (block) {
                const pin = getValue(block, 'PIN', 'A0');
                return [`analogRead(${pin})`, Arduino.ORDER_FUNCTION_CALL || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieo_mieo_readAnalogSensorString) {
        Arduino.arduino_mieo_mieo_readAnalogSensorString =
            Arduino.mieo_readAnalogSensorString ||
            function (block) {
                const pin = getValue(block, 'PIN', 'A5');
                return [`analogRead(${pin})`, Arduino.ORDER_FUNCTION_CALL || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieo_mieo_setPwmOutput) {
        Arduino.arduino_mieo_mieo_setPwmOutput =
            Arduino.mieo_setPwmOutput ||
            function (block) {
                const pin = getValue(block, 'PIN', '3');
                const value = getValue(block, 'OUT', '128');
                const setupKey = `pinMode_${pin}`;
                if (!Arduino.setups_[setupKey]) {
                    Arduino.setups_[setupKey] = `pinMode(${pin}, OUTPUT);`;
                }
                return `analogWrite(${pin}, ${value});\n`;
            };
    }

    if (!Arduino.arduino_mieo_mieo_setServoOutput) {
        Arduino.arduino_mieo_mieo_setServoOutput =
            Arduino.mieo_setServoOutput ||
            function (block) {
                const pin = getValue(block, 'PIN', '3');
                const angle = getValue(block, 'OUT', '90');
                const servoVar = `servo_pin_${pin}`;
                if (!Arduino.includes_.include_servo) {
                    Arduino.includes_.include_servo = '#include <Servo.h>';
                }
                if (!Arduino.definitions_[servoVar]) {
                    Arduino.definitions_[servoVar] = `Servo ${servoVar};`;
                }
                if (!Arduino.setups_[`mieo_servo_setup_${pin}`]) {
                    Arduino.setups_[`mieo_servo_setup_${pin}`] = `${servoVar}.attach(${pin});`;
                }
                return `${servoVar}.write(${angle});\n`;
            };
    }

    if (!Arduino.arduino_mieo_mieo_showEmotion) {
        Arduino.arduino_mieo_mieo_showEmotion =
            Arduino.mieo_showEmotion ||
            function (block) {
                const emoji = getValue(block, 'EMOJI', 'EMOJI_SMILE');
                const r = getValue(block, 'R', '150');
                const g = getValue(block, 'G', '100');
                const b = getValue(block, 'B', '0');

                Arduino.includes_.mieo = '#include <mieo.h>';

                if (!Arduino.definitions_.mieo_neopixel) {
                    Arduino.definitions_.mieo_neopixel =
                        '#define MIEO_NEOPIXEL_PIN 4\n' +
                        '#define MIEO_NEOPIXEL_COUNT 35\n' +
                        '#define MIEO_NEOPIXEL_BRIGHTNESS 50\n' +
                        'Adafruit_NeoPixel mieo_strip(MIEO_NEOPIXEL_COUNT, MIEO_NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);';
                }

                if (!Arduino.setups_.mieo_neopixel) {
                    Arduino.setups_.mieo_neopixel =
                        'mieo_strip.begin();\n' +
                        'mieo_strip.setBrightness(MIEO_NEOPIXEL_BRIGHTNESS);\n' +
                        'mieo_strip.show();';
                }

                return `mieo_strip.showEmotion(${emoji}, mieo_strip.Color(${r}, ${g}, ${b}));\n`;
            };
    }

    if (!Arduino.arduino_mieodisplay_mieo_showEmotion) {
        Arduino.arduino_mieodisplay_mieo_showEmotion = Arduino.arduino_mieo_mieo_showEmotion;
    }

    if (!Arduino.arduino_mieo_mieo_showEmotionFixed) {
        Arduino.arduino_mieo_mieo_showEmotionFixed =
            Arduino.mieo_showEmotionFixed ||
            function (block) {
                const emoji = getValue(block, 'EMOJI', 'EMOJI_SMILE');
                const colorMap = {
                    EMOJI_SMILE: [150, 100, 0],
                    EMOJI_SAD: [255, 0, 0],
                    EMOJI_ANGRY: [255, 0, 0],
                    EMOJI_CRY: [100, 50, 100],
                    EMOJI_NERD: [50, 100, 100],
                    EMOJI_SURPRISE: [70, 0, 100],
                    EMOJI_THINK: [0, 0, 255],
                    EMOJI_DUDE: [70, 70, 200],
                    EMOJI_HEART: [255, 0, 0]
                };
                const [r, g, b] = colorMap[emoji] || [150, 100, 0];

                Arduino.includes_.mieo = '#include <mieo.h>';

                if (!Arduino.definitions_.mieo_neopixel) {
                    Arduino.definitions_.mieo_neopixel =
                        '#define MIEO_NEOPIXEL_PIN 4\n' +
                        '#define MIEO_NEOPIXEL_COUNT 35\n' +
                        '#define MIEO_NEOPIXEL_BRIGHTNESS 50\n' +
                        'Adafruit_NeoPixel mieo_strip(MIEO_NEOPIXEL_COUNT, MIEO_NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);';
                }

                if (!Arduino.setups_.mieo_neopixel) {
                    Arduino.setups_.mieo_neopixel =
                        'mieo_strip.begin();\n' +
                        'mieo_strip.setBrightness(MIEO_NEOPIXEL_BRIGHTNESS);\n' +
                        'mieo_strip.show();';
                }

                return `mieo_strip.showEmotion(${emoji}, mieo_strip.Color(${r}, ${g}, ${b}));\n`;
            };
    }

    if (!Arduino.arduino_mieodisplay_mieo_showEmotionFixed) {
        Arduino.arduino_mieodisplay_mieo_showEmotionFixed = Arduino.arduino_mieo_mieo_showEmotionFixed;
    }

    if (!Arduino.arduino_mieo_mieo_displayText) {
        Arduino.arduino_mieo_mieo_displayText =
            Arduino.mieo_displayText ||
            function (block) {
                let text = '';
                if (Arduino.valueToCode) {
                    text = Arduino.valueToCode(block, 'TEXT', Arduino.ORDER_ATOMIC) || '';
                }
                if (!text && block.getFieldValue) {
                    text = block.getFieldValue('TEXT') || '';
                }
                if (!text) {
                    text = '"hi"';
                } else {
                    const trimmed = text.toString().trim();
                    if (!(trimmed.startsWith('"') && trimmed.endsWith('"'))) {
                        text = `"${trimmed.replace(/^['"]|['"]$/g, '')}"`;
                    }
                }

                const r = getValue(block, 'R', '75');
                const g = getValue(block, 'G', '75');
                const b = getValue(block, 'B', '75');
                const speed = getValue(block, 'SPEED', '300');

                Arduino.includes_.mieo = '#include <mieo.h>';

                if (!Arduino.definitions_.mieo_neopixel) {
                    Arduino.definitions_.mieo_neopixel =
                        '#define MIEO_NEOPIXEL_PIN 4\n' +
                        '#define MIEO_NEOPIXEL_COUNT 35\n' +
                        '#define MIEO_NEOPIXEL_BRIGHTNESS 50\n' +
                        'Adafruit_NeoPixel mieo_strip(MIEO_NEOPIXEL_COUNT, MIEO_NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);';
                }

                if (!Arduino.setups_.mieo_neopixel) {
                    Arduino.setups_.mieo_neopixel =
                        'mieo_strip.begin();\n' +
                        'mieo_strip.setBrightness(MIEO_NEOPIXEL_BRIGHTNESS);\n' +
                        'mieo_strip.show();';
                }

                return `mieo_strip.displayText(${text}, mieo_strip.Color(${r}, ${g}, ${b}), ${speed});\n`;
            };
    }

    if (!Arduino.arduino_mieodisplay_mieo_displayText) {
        Arduino.arduino_mieodisplay_mieo_displayText = Arduino.arduino_mieo_mieo_displayText;
    }

    if (!Arduino.arduino_mieo_mieo_showNumberColor) {
        Arduino.arduino_mieo_mieo_showNumberColor =
            Arduino.mieo_showNumberColor ||
            function (block) {
                const numberValue = getValue(block, 'NUMBER', '0');
                const r = getValue(block, 'R', '255');
                const g = getValue(block, 'G', '0');
                const b = getValue(block, 'B', '0');

                Arduino.includes_.mieo = '#include <mieo.h>';

                if (!Arduino.definitions_.mieo_neopixel) {
                    Arduino.definitions_.mieo_neopixel =
                        '#define MIEO_NEOPIXEL_PIN 4\n' +
                        '#define MIEO_NEOPIXEL_COUNT 35\n' +
                        '#define MIEO_NEOPIXEL_BRIGHTNESS 50\n' +
                        'Adafruit_NeoPixel mieo_strip(MIEO_NEOPIXEL_COUNT, MIEO_NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);';
                }

                if (!Arduino.setups_.mieo_neopixel) {
                    Arduino.setups_.mieo_neopixel =
                        'mieo_strip.begin();\n' +
                        'mieo_strip.setBrightness(MIEO_NEOPIXEL_BRIGHTNESS);\n' +
                        'mieo_strip.show();';
                }

                const numberText = /^-?\d+$/.test(numberValue) ? `"${numberValue}"` : `String(${numberValue}).c_str()`;
                return `mieo_strip.displayText(${numberText}, mieo_strip.Color(${r}, ${g}, ${b}), 200);\n`;
            };
    }

    if (!Arduino.arduino_mieo_mieo_clearDisplay) {
        Arduino.arduino_mieo_mieo_clearDisplay =
            Arduino.mieo_clearDisplay ||
            function () {
                Arduino.includes_.mieo = '#include <mieo.h>';

                if (!Arduino.definitions_.mieo_neopixel) {
                    Arduino.definitions_.mieo_neopixel =
                        '#define MIEO_NEOPIXEL_PIN 4\n' +
                        '#define MIEO_NEOPIXEL_COUNT 35\n' +
                        '#define MIEO_NEOPIXEL_BRIGHTNESS 50\n' +
                        'Adafruit_NeoPixel mieo_strip(MIEO_NEOPIXEL_COUNT, MIEO_NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);';
                }

                if (!Arduino.setups_.mieo_neopixel) {
                    Arduino.setups_.mieo_neopixel =
                        'mieo_strip.begin();\n' +
                        'mieo_strip.setBrightness(MIEO_NEOPIXEL_BRIGHTNESS);\n' +
                        'mieo_strip.show();';
                }

                return 'mieo_strip.clear();\n' +
                    'mieo_strip.show();\n';
            };
    }

    if (!Arduino.arduino_mieodisplay_mieo_clearDisplay) {
        Arduino.arduino_mieodisplay_mieo_clearDisplay = Arduino.arduino_mieo_mieo_clearDisplay;
    }

    if (!Arduino.arduino_mieodisplay_mieo_showNumberColor) {
        Arduino.arduino_mieodisplay_mieo_showNumberColor = Arduino.arduino_mieo_mieo_showNumberColor;
    }

    if (!Arduino.arduino_mieorobo_mieo_runRobot) {
        Arduino.arduino_mieorobo_mieo_runRobot =
            Arduino.mieo_runRobot ||
            function (block) {
                const dir = getValue(block, 'DIR', 'FORWARD');
                const speed = getValue(block, 'SPEED', '100');

                Arduino.includes_.mieo = mieoInclude;
                if (!Arduino.setups_.mieo_motor_init) {
                    Arduino.setups_.mieo_motor_init = 'mieo_motor_init();';
                }

                return `mieo_run(${dir}, ${speed});\n`;
            };
    }

    if (!Arduino.arduino_mieorobo_mieo_goForwardFor1s) {
        Arduino.arduino_mieorobo_mieo_goForwardFor1s =
            Arduino.mieo_goForwardFor1s ||
            function (block) {
                const dir = getValue(block, 'DIR', 'FORWARD');
                const speed = getValue(block, 'SPEED', '100');
                const delaySec = getValue(block, 'DELAY', '1');

                Arduino.includes_.mieo = mieoInclude;
                if (!Arduino.setups_.mieo_motor_init) {
                    Arduino.setups_.mieo_motor_init = 'mieo_motor_init();';
                }

                return `mieo_run(${dir}, ${speed});\n` +
                    `delay(${delaySec}* 1000);\n` +
                    'stopRobot();\n';
            };
    }

    if (!Arduino.arduino_mieorobo_mieo_stopRobot) {
        Arduino.arduino_mieorobo_mieo_stopRobot =
            Arduino.mieo_stopRobot ||
            function () {
                Arduino.includes_.mieo = mieoInclude;
                if (!Arduino.setups_.mieo_motor_init) {
                    Arduino.setups_.mieo_motor_init = 'mieo_motor_init();';
                }

                return 'stopRobot();\n';
            };
    }

    if (!Arduino.arduino_mieorobo_mieo_setOrientation) {
        Arduino.arduino_mieorobo_mieo_setOrientation =
            Arduino.mieo_setOrientation ||
            function (block) {
                const orientation = getValue(block, 'ORIENTATION', '0');

                Arduino.includes_.mieo = mieoInclude;
                if (!Arduino.setups_.mieo_motor_init) {
                    Arduino.setups_.mieo_motor_init = 'mieo_motor_init();';
                }

                return `mieo_orientation = ${orientation};\n`;
            };
    }

    if (!Arduino.arduino_mieosens_mieo_isButtonPressed) {
        Arduino.arduino_mieosens_mieo_isButtonPressed =
            Arduino.mieo_isButtonPressed ||
            function (block) {
                const pin = getValue(block, 'BUTTON', '7');
                const setupKey = `mieo_button_${pin}`;
                if (!Arduino.setups_[setupKey]) {
                    Arduino.setups_[setupKey] = `pinMode(${pin}, INPUT_PULLUP);`;
                }

                return [`!digitalRead(${pin})`, Arduino.ORDER_EQUALITY || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieosens_mieo_isTouchPadPressed) {
        Arduino.arduino_mieosens_mieo_isTouchPadPressed =
            Arduino.mieo_isTouchPadPressed ||
            function (block) {
                const channel = getValue(block, 'TOUCH', '0');

                if (!Arduino.includes_.include_touchpad) {
                    Arduino.includes_.include_touchpad = '#include "touchpad.h"';
                }
                if (!Arduino.definitions_.touchpad_instance) {
                    Arduino.definitions_.touchpad_instance = 'TouchPad tp;';
                }

                return [`tp.padtouched(${channel})`, Arduino.ORDER_EQUALITY || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieosens_mieo_isInfraredActive) {
        Arduino.arduino_mieosens_mieo_isInfraredActive =
            Arduino.mieo_isInfraredActive ||
            function (block) {
                const ir = getValue(block, 'IR', 'A3');
                const threshold = ir === 'A2' ? 'ThresholdA2' : 'ThresholdA3';
                if (ir === 'A2') {
                    if (!Arduino.definitions_.mieo_ir_threshold_a2) {
                        Arduino.definitions_.mieo_ir_threshold_a2 = 'int ThresholdA2 = 512;';
                    }
                } else if (!Arduino.definitions_.mieo_ir_threshold_a3) {
                    Arduino.definitions_.mieo_ir_threshold_a3 = 'int ThresholdA3 = 512;';
                }
                return [`analogRead(${ir}) < ${threshold}`, Arduino.ORDER_EQUALITY || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieosens_mieo_setInfraredThreshold) {
        Arduino.arduino_mieosens_mieo_setInfraredThreshold =
            Arduino.mieo_setInfraredThreshold ||
            function (block) {
                const ir = getValue(block, 'IR', 'A3');
                const thresholdValue = getValue(block, 'THRESHOLD', '512');

                if (ir === 'A2') {
                    if (!Arduino.definitions_.mieo_ir_threshold_a2) {
                        Arduino.definitions_.mieo_ir_threshold_a2 = 'int ThresholdA2 = 512;';
                    }
                    return `ThresholdA2 = ${thresholdValue};\n`;
                }

                if (!Arduino.definitions_.mieo_ir_threshold_a3) {
                    Arduino.definitions_.mieo_ir_threshold_a3 = 'int ThresholdA3 = 512;';
                }
                return `ThresholdA3 = ${thresholdValue};\n`;
            };
    }

    if (!Arduino.arduino_mieosens_mieo_getInfraredValue) {
        Arduino.arduino_mieosens_mieo_getInfraredValue =
            Arduino.mieo_getInfraredValue ||
            function (block) {
                const ir = getValue(block, 'IR', 'A3');
                return [`analogRead(${ir})`, Arduino.ORDER_FUNCTION_CALL || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieomotor_mieo_runMotor) {
        Arduino.arduino_mieomotor_mieo_runMotor =
            Arduino.mieo_runMotor ||
            function (block) {
                const side = getValue(block, 'SIDE', 'L');
                const dir = getValue(block, 'DIR', 'FORWARD');
                const speed = getValue(block, 'SPEED', '100');

                Arduino.includes_.mieo = mieoInclude;
                if (!Arduino.setups_.mieo_motor_init) {
                    Arduino.setups_.mieo_motor_init = 'mieo_motor_init();';
                }

                return `mieo_runMotor("${side}", ${dir}, ${speed});\n`;
            };
    }

    if (!Arduino.arduino_mieomotor_mieo_stopMotor) {
        Arduino.arduino_mieomotor_mieo_stopMotor =
            Arduino.mieo_stopMotor ||
            function (block) {
                const side = getValue(block, 'SIDE', 'L');

                Arduino.includes_.mieo = mieoInclude;
                if (!Arduino.setups_.mieo_motor_init) {
                    Arduino.setups_.mieo_motor_init = 'mieo_motor_init();';
                }

                return `stopMotor("${side}");\n`;
            };
    }

    if (!Arduino.arduino_mieomotor_mieo_setServoAngle) {
        Arduino.arduino_mieomotor_mieo_setServoAngle =
            Arduino.mieo_setServoAngle ||
            function (block) {
                const servo = getValue(block, 'SERVO', '1');
                const angle = getValue(block, 'ANGLE', '90');

                if (!Arduino.includes_.include_servo) {
                    Arduino.includes_.include_servo = '#include <Servo.h>';
                }
                if (servo === '2') {
                    if (!Arduino.definitions_.servo_9) {
                        Arduino.definitions_.servo_9 = 'Servo myservo_9;';
                    }
                    if (!Arduino.setups_.servo_9_attach) {
                        Arduino.setups_.servo_9_attach = 'myservo_9.attach(9);';
                    }
                    return `myservo_9.write(${angle});\n`;
                }

                if (!Arduino.definitions_.servo_10) {
                    Arduino.definitions_.servo_10 = 'Servo myservo_10;';
                }
                if (!Arduino.setups_.servo_10_attach) {
                    Arduino.setups_.servo_10_attach = 'myservo_10.attach(10);';
                }

                return `myservo_10.write(${angle});\n`;
            };
    }

    if (!Arduino.arduino_mieoline_mieo_setLineThresholds) {
        Arduino.arduino_mieoline_mieo_setLineThresholds =
            Arduino.mieo_setLineThresholds ||
            function (block) {
                const left = getValue(block, 'LEFT', '512');
                const right = getValue(block, 'RIGHT', '512');

                if (!Arduino.includes_.include_mieo_line_follower) {
                    Arduino.includes_.include_mieo_line_follower = '#include "mieo_line_follower.h"';
                }
                if (!Arduino.definitions_.mieo_line_follower) {
                    Arduino.definitions_.mieo_line_follower = 'MIEOLineFollower lineFollower;';
                }
                if (!Arduino.setups_.mieo_line_follower_begin) {
                    Arduino.setups_.mieo_line_follower_begin = 'lineFollower.begin();';
                }
                if (!Arduino.definitions_.mieo_ir_threshold_a3) {
                    Arduino.definitions_.mieo_ir_threshold_a3 = 'int ThresholdA3 = 512;';
                }
                if (!Arduino.definitions_.mieo_ir_threshold_a2) {
                    Arduino.definitions_.mieo_ir_threshold_a2 = 'int ThresholdA2 = 512;';
                }

                return `ThresholdA3 = ${left};\nThresholdA2 = ${right};\nlineFollower.setThresholds(${left}, ${right});\n`;
            };
    }

    if (!Arduino.arduino_mieoline_mieo_followLine) {
        Arduino.arduino_mieoline_mieo_followLine =
            Arduino.mieo_followLine ||
            function () {
                if (!Arduino.includes_.include_mieo_line_follower) {
                    Arduino.includes_.include_mieo_line_follower = '#include "mieo_line_follower.h"';
                }
                if (!Arduino.definitions_.mieo_line_follower) {
                    Arduino.definitions_.mieo_line_follower = 'MIEOLineFollower lineFollower;';
                }
                if (!Arduino.setups_.mieo_motor_init) {
                    Arduino.setups_.mieo_motor_init = 'mieo_motor_init();';
                }
                if (!Arduino.setups_.mieo_line_follower_begin) {
                    Arduino.setups_.mieo_line_follower_begin = 'lineFollower.begin();';
                }

                return 'lineFollower.followLine();\n';
            };
    }

    if (!Arduino.arduino_mieoline_mieo_isOnTrack) {
        Arduino.arduino_mieoline_mieo_isOnTrack =
            Arduino.mieo_isOnTrack ||
            function () {
                if (!Arduino.definitions_.mieo_ir_threshold_a3) {
                    Arduino.definitions_.mieo_ir_threshold_a3 = 'int ThresholdA3 = 512;';
                }
                if (!Arduino.definitions_.mieo_ir_threshold_a2) {
                    Arduino.definitions_.mieo_ir_threshold_a2 = 'int ThresholdA2 = 512;';
                }

                return ['(analogRead(A3) < ThresholdA3) || (analogRead(A2) < ThresholdA2)', Arduino.ORDER_EQUALITY || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieoultrasonic_mieo_connectUltrasonic) {
        Arduino.arduino_mieoultrasonic_mieo_connectUltrasonic =
            Arduino.mieo_connectUltrasonic ||
            function (block) {
                const ultra = getValue(block, 'ULTRA', '1');
                const trig = getValue(block, 'TRIG', 'A5');
                const echo = getValue(block, 'ECHO', 'A4');

                if (!Arduino.includes_.include_hcsr04) {
                    Arduino.includes_.include_hcsr04 = '#include "HCSR04.h"';
                }

                if (ultra === '2') {
                    if (!Arduino.definitions_.mieo_ultra_2) {
                        Arduino.definitions_.mieo_ultra_2 = `HCSR04 hc_2(${trig}, ${echo});`;
                    }
                    return '';
                }

                if (!Arduino.definitions_.mieo_ultra_1) {
                    Arduino.definitions_.mieo_ultra_1 = `HCSR04 hc_1(${trig}, ${echo});`;
                }
                return '';
            };
    }

    if (!Arduino.arduino_mieoultrasonic_mieo_getUltrasonicDistance) {
        Arduino.arduino_mieoultrasonic_mieo_getUltrasonicDistance =
            Arduino.mieo_getUltrasonicDistance ||
            function (block) {
                const ultra = getValue(block, 'ULTRA', '1');
                if (ultra === '2') {
                    return ['hc_2.dist()', Arduino.ORDER_FUNCTION_CALL || Arduino.ORDER_ATOMIC];
                }
                return ['hc_1.dist()', Arduino.ORDER_FUNCTION_CALL || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieobuzz_mieo_playMusic) {
        Arduino.arduino_mieobuzz_mieo_playMusic =
            Arduino.mieo_playMusic ||
            function (block) {
                const song = getValue(block, 'SONG', 'HAPPY_BIRTHDAY');

                if (!Arduino.includes_.include_mieo_buzz) {
                    Arduino.includes_.include_mieo_buzz = '#include "MIEO_BUZZ.h"';
                }
                if (!Arduino.definitions_.mieo_buzzer) {
                    Arduino.definitions_.mieo_buzzer = 'MIEO_BUZZ buzzer;';
                }

                if (song === 'JINGLE_BELLS') {
                    return 'buzzer.playJingleBells();\n';
                }
                if (song === 'WE_WISH_YOU') {
                    return 'buzzer.playWeWishYou();\n';
                }
                if (song === 'TWINKLE_TWINKLE') {
                    return 'buzzer.playTwinkleTwinkle();\n';
                }
                if (song === 'ODE_TO_JOY') {
                    return 'buzzer.playOdeToJoy();\n';
                }
                if (song === 'MARY_HAD_A_LITTLE_LAMB') {
                    return 'buzzer.playMaryHadALittleLamb();\n';
                }
                if (song === 'STARTUP') {
                    return 'buzzer.playStartup();\n';
                }
                if (song === 'ERROR') {
                    return 'buzzer.playError();\n';
                }

                return 'buzzer.playHappyBirthday();\n';
            };
    }

    if (!Arduino.arduino_mieobuzz_mieo_playTone) {
        Arduino.arduino_mieobuzz_mieo_playTone =
            Arduino.mieo_playTone ||
            function (block) {
                const note = getValue(block, 'NOTE', 'C4');
                const duration = getValue(block, 'DURATION', '2');

                if (!Arduino.includes_.include_mieo_buzz) {
                    Arduino.includes_.include_mieo_buzz = '#include "MIEO_BUZZ.h"';
                }
                if (!Arduino.definitions_.mieo_buzzer) {
                    Arduino.definitions_.mieo_buzzer = 'MIEO_BUZZ buzzer;';
                }

                return `buzzer.playtone("${note}", ${duration});\n`;
            };
    }

    if (!Arduino.arduino_mieobuzz_mieo_buzzStop) {
        Arduino.arduino_mieobuzz_mieo_buzzStop =
            Arduino.mieo_buzzStop ||
            function () {
                return 'noTone(11);\n';
            };
    }

    if (!Arduino.arduino_mieoappcontrols_mieo_setupBluetooth) {
        Arduino.arduino_mieoappcontrols_mieo_setupBluetooth =
            Arduino.mieo_setupBluetooth ||
            function () {
                if (!Arduino.includes_.include_software_serial) {
                    Arduino.includes_.include_software_serial = '#include <SoftwareSerial.h>';
                }
                if (!Arduino.definitions_.mieo_bluetooth_serial) {
                    Arduino.definitions_.mieo_bluetooth_serial = 'SoftwareSerial bluetooth(2, 3);';
                }
                if (!Arduino.definitions_.mieo_bluetooth_command) {
                    Arduino.definitions_.mieo_bluetooth_command = 'char btCommand = 0;';
                }
                if (!Arduino.definitions_.mieo_bluetooth_string) {
                    Arduino.definitions_.mieo_bluetooth_string = 'String btString = "";';
                }
                if (!Arduino.setups_.mieo_bluetooth_begin) {
                    Arduino.setups_.mieo_bluetooth_begin = 'bluetooth.begin(9600);';
                }

                return '';
            };
    }

    if (!Arduino.arduino_mieoappcontrols_mieo_refreshBluetooth) {
        Arduino.arduino_mieoappcontrols_mieo_refreshBluetooth =
            Arduino.mieo_refreshBluetooth ||
            function () {
                if (!Arduino.definitions_.mieo_bluetooth_serial) {
                    Arduino.definitions_.mieo_bluetooth_serial = 'SoftwareSerial bluetooth(2, 3);';
                }
                if (!Arduino.definitions_.mieo_bluetooth_command) {
                    Arduino.definitions_.mieo_bluetooth_command = 'char btCommand = 0;';
                }
                if (!Arduino.definitions_.mieo_bluetooth_string) {
                    Arduino.definitions_.mieo_bluetooth_string = 'String btString = "";';
                }

                return 'while (bluetooth.available()) {\n' +
                    '  char c = bluetooth.read();\n' +
                    '  btCommand = c;\n' +
                    '  btString += c;\n' +
                    '}\n';
            };
    }

    if (!Arduino.arduino_mieoappcontrols_mieo_toggleSwitch) {
        Arduino.arduino_mieoappcontrols_mieo_toggleSwitch =
            Arduino.mieo_toggleSwitch ||
            function (block) {
                const state = getValue(block, 'STATE', '1');

                if (!Arduino.definitions_.mieo_bluetooth_command) {
                    Arduino.definitions_.mieo_bluetooth_command = 'char btCommand = 0;';
                }

                return [`btCommand == '${state}'`, Arduino.ORDER_EQUALITY || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieoappcontrols_mieo_isBtButton) {
        Arduino.arduino_mieoappcontrols_mieo_isBtButton =
            Arduino.mieo_isBtButton ||
            function (block) {
                const button = getValue(block, 'BUTTON', 'F');

                if (!Arduino.definitions_.mieo_bluetooth_command) {
                    Arduino.definitions_.mieo_bluetooth_command = 'char btCommand = 0;';
                }

                return [`btCommand == '${button}'`, Arduino.ORDER_EQUALITY || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieoappcontrols_mieo_btStringEquals) {
        Arduino.arduino_mieoappcontrols_mieo_btStringEquals =
            Arduino.mieo_btStringEquals ||
            function (block) {
                const text = getValue(block, 'TEXT', 'hi');

                if (!Arduino.definitions_.mieo_bluetooth_string) {
                    Arduino.definitions_.mieo_bluetooth_string = 'String btString = "";';
                }

                return [`btString == "${text}"`, Arduino.ORDER_EQUALITY || Arduino.ORDER_ATOMIC];
            };
    }

    if (!Arduino.arduino_mieoappcontrols_mieo_putToTerminal) {
        Arduino.arduino_mieoappcontrols_mieo_putToTerminal =
            Arduino.mieo_putToTerminal ||
            function (block) {
                const text = getValue(block, 'TEXT', 'hello');

                if (!Arduino.includes_.include_software_serial) {
                    Arduino.includes_.include_software_serial = '#include <SoftwareSerial.h>';
                }
                if (!Arduino.definitions_.mieo_bluetooth_serial) {
                    Arduino.definitions_.mieo_bluetooth_serial = 'SoftwareSerial bluetooth(2, 3);';
                }
                if (!Arduino.setups_.mieo_bluetooth_begin) {
                    Arduino.setups_.mieo_bluetooth_begin = 'bluetooth.begin(9600);';
                }

                return `bluetooth.println("${text}");\n`;
            };
    }

    if (!Arduino.arduino_mieoSerial_mieo_enableSerial) {
        Arduino.arduino_mieoSerial_mieo_enableSerial =
            Arduino.mieo_enableSerial ||
            function (block) {
                const baud = getValue(block, 'BAUD', '9600');

                if (!Arduino.setups_.mieo_serial_begin) {
                    Arduino.setups_.mieo_serial_begin = `Serial.begin(${baud});`;
                }

                return '';
            };
    }

    if (!Arduino.arduino_mieoSerial_mieo_writeSerial) {
        Arduino.arduino_mieoSerial_mieo_writeSerial =
            Arduino.mieo_writeSerial ||
            function (block) {
                // Try to get value from connected block
                const valueCode = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_NONE);
                const eol = block.getFieldValue('EOL') || 'warp';
                let finalValue;
                
                if (valueCode) {
                    // A block is connected - use its value as-is
                    finalValue = valueCode;
                } else {
                    // No block connected - get text field value and quote it
                    const text = block.getFieldValue('VALUE') || 'hello';
                    finalValue = Arduino.quote_ ? Arduino.quote_(text) : `"${text}"`;
                }

                const serialMethod = eol === 'warp' ? 'println' : 'print';
                return `Serial.${serialMethod}(${finalValue});\n`;
            };
    }

    if (!Arduino.arduino_mieoSerial_mieo_byteAvailable) {
        Arduino.arduino_mieoSerial_mieo_byteAvailable =
            Arduino.mieo_byteAvailable ||
            function () {
                return [`Serial.available()`, Arduino.ORDER_FUNCTION_CALL];
            };
    }

    if (!Arduino.arduino_mieoSerial_mieo_readAsString) {
        Arduino.arduino_mieoSerial_mieo_readAsString =
            Arduino.mieo_readAsString ||
            function () {
                return [`Serial.readString()`, Arduino.ORDER_FUNCTION_CALL];
            };
    }

    if (!Arduino.arduino_mieoSerial_mieo_readAsNumber) {
        Arduino.arduino_mieoSerial_mieo_readAsNumber =
            Arduino.mieo_readAsNumber ||
            function () {
                return [`Serial.parseFloat()`, Arduino.ORDER_FUNCTION_CALL];
            };
    }

    return true;
};

if (!registerMieoGenerators()) {
    Blockly.__mieoRegister = registerMieoGenerators;
}

module.exports = registerMieoGenerators;
