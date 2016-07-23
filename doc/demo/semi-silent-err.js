/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')();

D.result = 42;
D.expect('===', 23);
  //= `! (number) 42`
  //= `≠ (number) 23`
  //= `@ Object.<anonymous> (…/demo/semi-silent-err.js:8:3)`
  //= ``

D.ok(module);   //= `-ERR some semi-silent-err tests failed.`
