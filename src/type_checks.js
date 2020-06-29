/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports, typeOf = require('concise-value-preview-pmb').typeOf;

EX.typeOf = function extendedTypeOf(x) { return typeOf(x); };
EX.typeOf.cls = function (Cls) { return EX.typeOf(new Cls()); };
EX.isType = function (x, t) {
  if ((typeof t) === 'function') { return (x instanceof t); }
  return (EX.typeOf(x) === t);
};
EX.notType = function (x, t) { return !EX.isType(x, t); };
EX.expectType = function (x, t, name) {
  if (EX.isType(x, t)) { return true; }
  throw new TypeError('Expected ' + (name || '<no description>') +
    ' to be of type ' + String(t.name || t));
};


EX.isSet = function (x, dflt) {
  var isSet = ((x !== undefined) && (x !== null));
  if (dflt === undefined) { return isSet; }
  return (isSet ? x : dflt);
};
EX.notSet = function (x) { return (x === undefined) || (x === null); };
















/*scroll*/
