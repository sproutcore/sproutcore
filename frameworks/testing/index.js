
if (!window.$ || !window.jQuery) { // don't overwrite if already loaded
    window.$ = window.jQuery = require('../jquery/jquery-3.5.0.slim.js');
  }
  if (!window.sc_require) {
    window.sc_require = function () {};
  }
  require('./core.js');
  require('./extras.js');
  require('./system/dump.js');
  require('./system/equiv.js');
  require('./system/plan.js');
  require('./system/runner.js');
  require('./system/suite.js');
  require('./utils.js')
  
  require('./resources/additions.css');
  require('./resources/runner.css');
  require('./resources/testsuite.css');