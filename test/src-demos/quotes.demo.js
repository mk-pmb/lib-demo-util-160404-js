/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')(module), eq;

eq = function (i, o) {
  if (i === eq) { i = eq.i; }
  if (eq.filler) {
    i = i.replace(eq.filler, '');
    o = o.replace(eq.filler, '');
  }
  D.expectType(eq.trans, 'function', 'eq.trans');
  D.result = eq.trans.call(D, i);
  D.expect('===', o);
};

eq.trans = D.unslash;
eq.filler = /…+/g;

eq('', '');
eq('hello', 'hello');
eq.i = "I\\'m \\a… \\s\\\\ashe\\r! Ru\\n\\ \\v…hil\\e… you s\\till can!";
eq(eq, "I\\'m \x07 \\s\\……ashe…\r! Ru…\n\\ \x0Bhil\x1B you s…\till can!");


eq.trans = D.stripQuot;
eq.filler = / +/g;

eq('   hello   ', '   hello   ');
eq('  "hello   ', '  "hello   ');
eq('   hello"  ', '   hello"  ');
eq('  "hello"  ', '   hello   ');
eq(' ."hello"  ', ' ."hello"  ');
eq(' ""hello"" ', '  "hello"  ');
eq('"""hello"" ', ' ""hello"  ');

eq("   hello   ", "   hello   ");
eq("  'hello   ", "  'hello   ");
eq("   hello'  ", "   hello'  ");
eq("  'hello'  ", "   hello   ");
eq(" .'hello'  ", " .'hello'  ");
eq(" ''hello'' ", "  'hello'  ");
eq("'''hello'' ", " ''hello'  ");







D.ok();     //= "+OK all quotes.demo tests passed."
