/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')();

D.result = 42;
D.expect('===', 42);

D.ok(module);     //= "+OK all semi-silent-ok tests passed."
