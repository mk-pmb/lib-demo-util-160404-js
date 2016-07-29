/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')(), hi = 'hello';
D.expect.verbose = true;
D.hrPath.fileAliases[module.filename] = '<usage demo>';

D.result =      hi.substr(0, 4);
D.expect('===', 'hell');    //= `+ (string) "hell"`
D.expect('strlen', 4);      //= `+ (strlen) 4`
D.expect('!==', 'help');    //= `+ (string) "hell" ≠ (string) "help"`
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

D.chap('UTF-8 vs. UCS-2:');
D.result = '😇'; // U+01F607 smiling face with halo
D.expect('===', String.fromCodePoint(0x01F607));  //= `+ (string) "😇"`
D.expect('!==', '\u01F607');            //= `+ (string) "😇" ≠ (string) "Ƕ07"`
D.expect('===', '\uD83D\uDE07');        //= `+ (string) "😇"`
D.expect('strlen', D.result.length);    //= `+ (strlen) 2`

D.chap('Data containers:');
D.result = hi.split('');
D.expect('like', ['h', 'e', 'l', 'l', 'o']);
  //= `+ (array) ["h", "e", "l", "l", "o"]`
D.annot('^-- whether our human-readable description of the data looks the ' +
  'same');    // ^-- for test detection, the "+" has to be on ends of lines.
D.expect('type', 'array');
  //= `+ (array) ["h", "e", "l", "l", "o"] ∈ {array}`
D.expect('strlen', [1, 1, 1, 1, 1]);  //= `+ (strlen) [1, 1, 1, 1, 1]`

D.result = { str: ['abc', 'def'], num: [123, -456] };
D.expect('type', 'Object');
  //= `+ (Object) {"str": ["abc", "def"], "num": [123, -456]} ∈ {Object}`

D.result = function noop() { return; };
D.expect('type', 'function');
  //= `+ function noop() { return; } ∈ {function}`

D.result = process.pid;
// when testing, ignore a line:
D.expect('type', 'number');       //…
// when testing, for one line, replace all numbers with zero:
D.expect('type', 'number');       //=0 `+ (number) 0 ∈ {number}`

D.result = 'ints -> zero: -2 -1 -0 | 0 | +0 +1 +2 | 1 2 345 6789';
D.expect('type', 'string');
  //=0 `+ (string) "ints -> zero: 0 0 0 | 0 | 0 0 0 | 0 0 0 0" ∈ {string}`
D.result = 'floats -> zero: -2.2 -1.1 -0.5 -0.0 | 0.000 | +0.5 +1.1 +2.2';
D.expect('type', 'string');
  //=0 `+ (string) "floats -> zero: 0 0 0 0 | 0 | 0 0 0" ∈ {string}`
D.result = 'exp nums -> zero: -2.2e-2 -1.1E-1 -0e0 | 0.0E0 | 1.1e+1 +2.2e2';
D.expect('type', 'string');
  //=0 `+ (string) "exp nums -> zero: 0 0 0 | 0 | 0 0" ∈ {string}`

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
  //= ``
D.expect('reset_fails', 1);   //= `+ expect.failCnt = 1, reset.`
D.expect((D.result > 0), 'positive');   //= `+ (number) 42 ⇒ positive`

D.chap('Output annotations in simple comment lines are ignored:');
// D.chap('ignored chapter');      //= `? not-ignored chapter`
D.result = 'ignored expect';
// D.expect('===', 'whatever');    //= `? not-ignored expect`
// D.annot('ignored annotation');  //= `? not-ignored annotation`

D.chap('Smart display of certain characters: (using univeil)');
D.annot('control characters:');
D.result = decodeURIComponent('%00%04%07%08%09%0A%0C%0D%1B%7F');
D.expect('type', 'string');
  //= `+ (string) "\u0000\u0004\u0007\b\t\n\f\r\u001b\u007F" ∈ {string}`
D.annot('for comparison, native JSON.stringify():');
D.result = JSON.stringify(D.result);
D.expect('===', '"\\u0000\\u0004\\u0007\\b\\t\\n\\f\\r\\u001b\x7F"'); //…








D.ok(module);     //= "+OK all usage tests passed."
