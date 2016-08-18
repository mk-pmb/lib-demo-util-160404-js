/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var ersatzEllip = require('./shims.js').ersatzEllip,
  quotes = require('./quotes.js'),
  typeChecks = require('./type_checks.js');


function describe(x, opts) {
  var t = (x instanceof Error ? 'error' : typeChecks.typeOf(x)),
    maxlen = (+(opts && opts.previewMaxLen) || 72);
  switch (t) {
  case 'null':
  case 'undefined':
    return t;
  case 'error':
    x = (x.message || x);
    break;
  }
  switch (t) {
  case 'function':
    x = String(x).replace(/^function\s+/, '');
    break;
  case 'array':
  case 'object':
  case 'Object':
  case 'string':
    x = quotes.oneLineJSONify(x);
    break;
  }
  x = String(x);
  if (x.length > maxlen) {
    x = ersatzEllip(x, maxlen);
    t += '…';
  }
  return '(' + t + ') ' + x;
}










module.exports = describe;
