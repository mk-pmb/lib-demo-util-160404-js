/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')(module);
D.expect.maxFails = 3;
D.result = 42;

D.expect('===', 23);
  //= `! number 42`
  //= `≠ number 23`
  //= /$:expectFail@/
D.expect('===', 5);
  //= `! number 42`
  //= `≠ number 5`
  //= /$:expectFail@/
D.expect('===', 0);
  //= `! number 42`
  //= `≠ number 0`
  //= /$:expectFail@/
  //= `-ERR some expect-maxfails tests failed.`

D.expect('===', 1337);    // won't be called anymore
  ///= `! number 42`
  ///= `≠ number 1337`
  ///= /$:expectFail@/

D.ok();     // neither
