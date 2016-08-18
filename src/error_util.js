/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports;


EX.extendErrMsg = function (msg, err) {
  msg = Array.prototype.slice.call(arguments);
  err = null;   // auto-detect 1st real Error if any
  msg = msg.map(function (pt) {
    if ((!err) && (pt instanceof Error)) { err = pt; }
    return String((pt || false).message || pt || '');
  }).join(' ');
  if (err) {
    err.message = msg;    // might be read-only, so check it:
    if (err.message === msg) { return err; }
  }
  return new Error(msg);
};











/*scroll*/
