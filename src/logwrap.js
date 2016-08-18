/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var describe = require('./describe.js');


function logwrap(origFunc) {
  var wrappedFunc;
  wrappedFunc = function () {
    var result;
    try {
      result = origFunc.apply(null, arguments);
      result = '-> ' + describe(result);
    } catch (err) {
      result = '!! ' + String(err);
    }
    console.log(result);
  };
  Object.keys(origFunc).forEach(function copyExtraKey(key) {
    if (wrappedFunc[key] === undefined) {
      // console.error('Copy key: ' + key);
      wrappedFunc[key] = origFunc[key];
    }
  });
  return wrappedFunc;
}








module.exports = logwrap;
