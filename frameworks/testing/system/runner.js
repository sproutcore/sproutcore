// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*globals CoreTest Q$ */

sc_require('jquery');
sc_require('system/plan');

/** @static
  The runner will automatically run the default CoreTest.plan when the 
  document is fully loaded.  It will also act as a delegate on the plan, 
  logging the output to the screen or console.

  @since SproutCore 1.0
*/
CoreTest.Runner = {
  
  /**
    The CoreTest plan.  If not set, a default plan will be created.
  */
  plan: null,
  
  create: function() {
    var len = arguments.length,
        ret = CoreTest.beget(this),
        idx ;
        
    for(idx=0;idx<len;idx++) CoreTest.mixin(ret, arguments[len]);
    if (!ret.plan) ret.plan = CoreTest.Plan.create({ delegate: ret });
    Q$(window).load(function() { ret.begin(); });      
    return ret ;
  },
  
  begin: function() {
    var plan = CoreTest.plan;
    plan.delegate = this;
    plan.run();
  },
  
  planDidBegin: function(plan) {
    // setup the report DOM element.
    this.report = Q$(['<div class="core-test">',
      '<div class="useragent">UserAgent</div>',
      '<p class="testresult">Running...</p>',
      '<div class="detail">',
        '<table>',
          '<thead><tr>',
            '<th class="desc">Test</th><th>Result</th>',
          '</tr></thead>',
          '<tbody><tr></tr></tbody>',
        '</table>',
      '</div>',
    '</div>'].join(''));

      
    this.report.find('.useragent').html(navigator.userAgent);
    this.logq = this.report.find('tbody');
    
    Q$('body').append(this.report);
  },
  
  planDidFinish: function(plan, r) {
    var result = this.report.find('.testresult');
    var str = CoreTest.fmt('Completed %@ tests in %@ msec. <em><span class="total">%@</span> total assertions: ', r.tests, r.runtime, r.total);
    
    if (r.passed > 0) {
      str += CoreTest.fmt('&nbsp;<span class="passed">%@ passed</span>', r.passed);
    }
    
    if (r.failed > 0) {
      str += CoreTest.fmt('&nbsp;<span class="failed">%@ failed</span>', r.failed);
    }

    if (r.errors > 0) {
      str += CoreTest.fmt('&nbsp;<span class="errors">%@ error%@</span>', r.failed, (r.failed !== 1 ? 's' : ''));
    }

    if (r.warnings > 0) {
      str += CoreTest.fmt('&nbsp;<span class="warnings">%@ warnings%@</span>', r.warnings, (r.warnings !== 1 ? 's' : ''));
    }

    result.html(str);
  },
  
  planDidRecord: function(plan, module, test, assertions) {
    var name = test, 
        s    = { passed: 0, failed: 0, errors: 0, warnings: 0 }, 
        len  = assertions.length, 
        idx, cur, q;
    
    for(idx=0;idx<len;idx++) s[assertions[idx].result]++;
    
    if (module) name = module + " module: " + test ;
    q = Q$(CoreTest.fmt('<tr class="test"><th class="desc" colspan="2">%@ (<span class="passed">%@</span>, <span class="failed">%@</span>, <span class="errors">%@</span>, <span class="warnings">%@</span>)</th></tr>', name, s.passed, s.failed, s.errors, s.warnings));
    
    //debugger ;
    this.logq.append(q);
    
    len = assertions.length;
    for(idx=0;idx<len;idx++) {
      cur = assertions[idx];
      q = Q$(CoreTest.fmt('<tr><td class="desc">%@</td><td class="action %@">%@</td></tr>', cur.message, cur.result, cur.result.toUpperCase()));
      this.logq.append(q);
    }
  }
  
};
