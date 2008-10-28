// ==========================================================================
// SproutCore
// Author: Erich Ocean
// copyright 2006-2008, Sprout Systems, Inc.
// ==========================================================================

require('core');

// code originally taken from http://pastie.org/253058, modified since
// found via: http://eriwen.com/javascript/js-stack-trace/

// Prints a stack trace to console.
// Pass true to print actual function definitions instead.
$trace = (function () {

  var mode;
  try {(0)()} catch (e) {
      mode = e.stack ? 'Firefox' : window.opera ? 'Opera' : 'Other';
  }

  switch (mode) {
      case 'Firefox' : return function (full) {
          var full = full || false;
          try {(0)()} catch (e) {
              console.log(e.stack.replace(/^.*?\n/,'').
                             replace(/(?:\n@:0)?\s+$/m,'').
                             replace(/^\(/gm,'{anonymous}(').
                             split("\n").join('\n\n'));
          }
      };

      case 'Opera' : return function (full) {
          var full = full || false;
          try {(0)()} catch (e) {
              var lines = e.message.split("\n"),
                  ANON = '{anonymous}',
                  lineRE = /Line\s+(\d+).*?in\s+(http\S+)(?:.*?in\s+function\s+(\S+))?/i,
                  i,j,len;

              for (i=4,j=0,len=lines.length; i<len; i+=2) {
                  if (lineRE.test(lines[i])) {
                      lines[j++] = (RegExp.$3 ?
                          RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 :
                          ANON + RegExp.$2 + ':' + RegExp.$1) +
                          ' -- ' + lines[i+1].replace(/^\s+/,'');
                  }
              }

              lines.splice(j,lines.length-j);
              console.log(lines.join('\n\n'));
          }
      };

      default : return function (full) {
          var full = full || false;
          var curr  = arguments.callee.caller,
              FUNC  = 'function', ANON = "{anonymous}",
              fnRE  = /function\s*([\w\-$]+)?\s*\(/i,
              stack = [],j=0,
              fn,args,i;

          while (curr) {
              fn    = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
              args  = stack.slice.call(curr.arguments);
              i     = args.length;

              while (i--) {
                  switch (typeof args[i]) {
                      case 'string'  : args[i] = '"'+args[i].replace(/"/g,'\\"')+'"'; break;
                      case 'function': args[i] = FUNC; break;
                  }
              }

              stack[j++] = (full) ? curr.toString() : fn + '(' + args.join() + ')';
              curr = curr.caller;
          }

          console.log(stack.join('\n\n'));
      };
  }
})();
