/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var cvp = require('concise-value-preview-pmb');

function describe(x, opts) {
  return cvp(x, {
    maxlen: (opts || false).maxlen,
    showStdTypes: true,
  });
}

module.exports = describe;
