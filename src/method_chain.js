/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var CF, PT, funcUtil = require('./func_util.js');

CF = function MethodChain(obj, todo, opts, then) {
  var chain = this, state;
  if ((!then) && (opts instanceof Function)) {
    then = opts;
    opts = null;
  }
  opts = (opts || false);
  chain.name = opts.name;
  if (!(then instanceof Function)) {
    throw new Error('MethodChain requires "then" to be a function, not ' +
      String(then));
  }
  state = { chain: chain, obj: obj, todo: [].concat(todo || []),
    finalTask: then, data: opts.data };
  chain.internalState = function methodChainState() { return state; };
};
PT = CF.prototype;


PT.next = function methodChain_scheduleNextTask(err, newData) {
  var chain = this, state = chain.internalState(),
    todo = state.todo, task, clbk;
  if (err) {
    return state.finalTask.call(null, err, chain);
    // do nothing else, esp. ignore potentially erroneous newData
  }
  if (newData !== undefined) { state.data = newData; }
  task = (todo.length > 0 ? todo.shift() : state.finalTask);
  task = funcUtil.bindIfMethodName(task, state.obj);
  if (!(task instanceof Function)) {
    throw new Error('Expected a function as task, not ' + String(task));
  }
  clbk = methodChain_scheduleNextTask.bind(chain);
  clbk.methodChain = chain;
  setImmediate(task, clbk);
  return;
};


PT.nq = function (task) {
  this.internalState().todo.push(task);
  return this;
};


PT.shiftTodo = function () { return this.internalState().todo.shift(); };


PT.data = function (newData) {
  var state = this.internalState(), oldData = state.data;
  if (newData !== undefined) { state.data = newData; }
  return oldData;
};


PT.peek = function (func, args, postArgs) {
  if (!(args instanceof Array)) { args = []; }
  if (postArgs !== false) { args = args.concat(this, (postArgs || [])); }
  func.apply(this.internalState(), args);
  return this;
};


PT.toString = function () {
  return '['.concat(this.constructor.name, ' ', this.name, ']');
};













module.exports = CF;
