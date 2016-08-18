/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports, univeil = require('univeil');

EX.jsonify = univeil.jsonify;
EX.oneLineJSONify = function (x) { return univeil.jsonify(x, null, -1); };


EX.unslash = function (s) {
  return String(s).replace(/\\[A-Za-z0-9]+/g,
    function (m) { return JSON.parse('"' + m + '"'); });
};


EX.stripQuot = function (s) {
  if ((typeof s) !== 'string') { return s; }
  if (s.length < 2) { return s; }
  switch (s[0]) {
  case "'":
  case '"':
    break;
  default:
    return s;
  }
  if (s[s.length - 1] !== s[0]) { return s; }
  return s.substr(1, s.lenght - 2);
};


EX.rgxEsc = function (text) {
  return String(text).replace(EX.rgxEsc.slashEm, '\\$1');
};
EX.rgxEsc.slashEm = new RegExp(['([',
  'x00-x1F', 'x21-x2F', ':-@',
  'x5B-x60', 'x7B-uD7FF', 'uE000-uFFFF',
  '])'].join('').replace(/(x|u)/g, '\\$1'), 'g');
















/*scroll*/
