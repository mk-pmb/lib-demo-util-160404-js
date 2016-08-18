/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')(module);

D.result = 42;
D.expect('===', 42);

D.ok();   //= "+OK all semi-silent-ok tests passed."
