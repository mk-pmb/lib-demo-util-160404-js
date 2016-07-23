/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')(), hi = 'hello';
D.expect.verbose = true;
D.hrPath.fileAliases[module.filename] = '<usage demo>';

D.result =      hi.substr(0, 4);
D.expect('===', 'hell');    //= `+ (string) "hell"`
D.expect('!==', 'help');    //= `+ (string) "hell" ≠ help`
D.expect('fails=', 0);      //= `+ expect.failCnt = 0`

D.chap('Expect violation of an expectation:');
D.expect('===', 'hel');
  //= `! (string) "hell"`
  //= '≠ (string) "hel"'
  //= "@ Object.<anonymous> (<usage demo>:15:3)"
  //= ""
D.expect('fails=', 1);      //= `+ expect.failCnt = 1`
D.result = D.expect.resetFailCnt();
D.expect('fails=', 0);      //= `+ expect.failCnt = 0`

D.chap('Data containers:');
D.result = hi.split('');
D.expect('like', ['h', 'e', 'l', 'l', 'o']);
  //= `+ (array) ["h", "e", "l", "l", "o"]`
D.annot('^-- whether our human-readable description of the data looks the ' +
  'same');    // ^-- for test detection, the "+" has to be on ends of lines.
D.expect('type', 'array');
  //= `+ (array) ["h", "e", "l", "l", "o"] ∈ {array}`

D.result = function noop() { return; };
D.expect('type', 'function');
  //= `+ function noop() { return; } ∈ {function}`

D.result = process.pid;
// ignore a line:
D.expect('type', 'number');       //…

D.chap('Synchronous runtime errors:');
D.catch(function ohNoez() { throw new Error(hi); });
D.expect('error', hi);            //= `+ (error) "hello"`
D.expect('error', /[a-z]{2}$/);   //= `+ (error) "hello" → lo`

D.chap('Custom assertions:');
D.result = 42;
D.expect((D.result > 0), 'positive');   //= `+ (number) 42 ⇒ positive`
D.expect((D.result < 0), 'negative');
  //= `! (number) 42`
  //= `⇏ negative`
  //= `@ Object.<anonymous> (<usage demo>:49:3)`
  //= ``










// D.ok(module);     //= "+OK all usage tests passed."
