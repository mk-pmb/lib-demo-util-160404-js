/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')(), hi = 'hello';
D.expect.verbose = true;
D.hrPath.fileAliases[module.filename] = '<usage demo>';

D.result =      hi.substr(0, 4);
D.expect('===', 'hell');    //= `+ (string) "hell"`
D.expect('strlen', 4);      //= `+ (strlen) 4`
D.expect('!==', 'help');    //= `+ (string) "hell" ≠ help`
D.expect('fails=', 0);      //= `+ expect.failCnt = 0`

D.chap('Expect violation of an expectation:');
D.expect('===', 'hel');
  //= `! (string) "hell"`
  //= '≠ (string) "hel"'
  //= "@ Object.<anonymous> (<usage demo>:16:3)"
  //= ""
D.expect('fails=', 1);        //= `+ expect.failCnt = 1`
D.expect('reset_fails', 1);   //= `+ expect.failCnt = 1, reset.`
D.expect('fails=', 0);        //= `+ expect.failCnt = 0`

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
D.expect('type', 'number');       //=0 `+ (number) 0 ∈ {number}`

D.chap('RegExp matching:');
D.result = '404 Not Found';
D.expect('regexp', /^\d+/);       //= `+ (string) … → "404"`
D.expect('regexp', /\S+/g);       //= `+ (string) … → ["404", "Not", "Found"]`
D.expect('regexp', /^(\d+) ([\S\s]+)$|$:$2 (HTTP $1) <- $0/);
  //= `+ (string) … → Not Found (HTTP 404) <- 404 Not Found`

D.chap('Synchronous runtime errors:');
D.catch(function () { throw new Error(D.result); });
D.expect('error', '404 Not Found');   //= `+ (error) "404 Not Found"`
D.expect('error', /^\d+/);      //= `+ (error) … → "404"`
D.expect('error', /\S+/g);      //= `+ (error) … → ["404", "Not", "Found"]`
D.expect('error', /^(\d+) ([\S\s]+)$|$:$2 (HTTP $1) <- $0/);
  //= `+ (error) … → Not Found (HTTP 404) <- 404 Not Found`

D.chap('Custom assertions:');
D.result = 42;
D.expect((D.result < 0), 'negative');
  //= `! (number) 42`
  //= `⇏ negative`
  //=0 `@ Object.<anonymous> (<usage demo>:0:0)`
  // ^-- when testing this line, treat all numbers as 0.
  //= ``
D.expect('reset_fails', 1);   //= `+ expect.failCnt = 1, reset.`
D.expect((D.result > 0), 'positive');   //= `+ (number) 42 ⇒ positive`

D.chap('Output annotations in simple comment lines are ignored:');
// D.chap('ignored chapter');      //= `? not-ignored chapter`
D.result = 'ignored expect';
// D.expect('===', 'whatever');    //= `? not-ignored expect`
// D.annot('ignored annotation');  //= `? not-ignored annotation`










D.ok(module);     //= "+OK all usage tests passed."
