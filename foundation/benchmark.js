// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('foundation/date');
require('foundation/string') ;

/** @namespace SC.Benchmark

  This bit of meta-programming magic can install a benchmark handler on any
  object method.  When a benchmark is installed, the time required to execute
  the method will be printed to the console log everytime the method is 
  called.

  This class can be used to implement benchmarking.  To use this object, just
  call start() with a key name and end() with a keyname.  The benchmark will 
  be logged.  If you set verbose = true, then benchmark will log everytime it 
  saves a bench.  Otherwise, it just keeps stats.  You can get the stats by
  calling report().

  Benchmark does not require anything other than the date.js class.  It also
  does not rely on SC.Object so that you can benchmark code in that area as
  well.

*/
SC.Benchmark = {

  /**
    If true, then benchmarks will be logged to the console as they are 
    recorded.
  
    @type bool
  */
  verbose: NO,
  
  /**
    If false, benchmarking will be disabled.  You might want to disable this
    during production to maximize performance.
  
    @type bool
  */
  enabled: YES,
  
/**
   This hash stores collected stats.  It contains key value pairs.  The value
   will be a hash with the following properties:
   
  * * *runs*: the number of times this stat has run
  * * *amt*: the total time consumed by this (divide by runs to get avg)
  * * *name*: an optional longer name you assigned to the stat key.  Set this  using name().
  * * *_starts*: this array is used internally. 
*/
  stats: {},

  /**
    Call this method at the start of whatever you want to collect.
    if topLevelOnly is passed, then recursive calls to the start will be 
    ignored and only the top level call will be benchmarked.
    
    @param key {String} A unique key that identifies this benchmark.  All calls to start/end with the same key will be groups together.
    @param topLevelOnly {Boolean} If true then recursive calls to this method with the same key will be ignored.  
    @param time {Integer} Only pass if you want to explicitly set the start time.  Otherwise the start time is now.
  */
  start: function(key, topLevelOnly, time) {
    if (!this.enabled) return ;
    var stat = this._statFor(key) ;
    
    if (topLevelOnly && stat._starts.length > 0) {
      stat._starts.push('ignore') ;
    } else {
      stat._starts.push(time || Date.now()) ;
    }
  },
  
  /**
    Call this method at the end of whatever you want to collect.  This will
    save the collected benchmark.
    
    @param key {String} The benchmark key you used when you called start()
    @param time {Integer} Only pass if you want to explicitly set the end time.  Otherwise start time is now.
  */
  end: function(key, time, runs) {
    if (!this.enabled) return ;
    var stat = this._statFor(key) ;
    var start = stat._starts.pop() ;
    if (!start) {
      console.log('SC.Benchmark "%@" ended without a matching start.  No information was saved.'.fmt(key));
      return ;
    }

    // top level only.
    if (start == 'ignore') return ; 
    
    stat.amt += (time || Date.now()) - start ;
    stat.runs += (runs || 1) ;
    
    if (this.verbose) this.log(key) ;
  },

  /**
    This is a simple way to benchmark a function.  The function will be 
    run with the name you provide the number of times you indicate.  Only the
    function is a required param.
  */  
  bench: function(func, key, reps, context) {
    if (!key) key = "bench%@".fmt(this._benchCount++) ;
    if (!reps) reps = 1 ;
    var ret ;
    
    var runs = reps; 
    SC.Benchmark.start(key) ;
    while(--reps >= 0) {
      ret = func(context);
    }
    SC.Benchmark.end(key, null, runs) ; 
    
    return ret ;
  },
  
  /**  
    This bit of metaprogramming magic install a wrapper around a method and
    benchmark it whenever it is run.
  */  
  install: function(object,method, topLevelOnly) {
    
    // vae the original method.
    var __func = object['b__' + method] = object[method] ;
    
    // replace with this helper.
    object[method] = function() {
      var key = '%@(%@)'.fmt(method, SC.$A(arguments).join(', ')) ;
      SC.Benchmark.start(key, topLevelOnly) ;
      var ret = __func.apply(this, arguments) ;
      SC.Benchmark.end(key) ;
      return ret ;
    } ;
  },
  
  /**
    Restore the original method, deactivating the benchmark.
  
    @param {object} object the object to change
    @param {string} method the method name as a string.
  
  */  
  restore: function(object,method) {
    object[method] = object['b__' + method] ;
  },
  
  /**
    This method will return a string containing a report of the stats
    collected so far.  If you pass a key, only the stats for that key will
    be returned.  Otherwise, all keys will be used.
  */
  report: function(key) {
    if (key) return this._genReport(key) ;
    var ret = [] ;
    
    // find the longest stat name...
    var maxLen = 0 ;
    for(var key in this.stats) {
      if (!this.stats.hasOwnProperty(key)) continue ;
      if (key.length > maxLen) maxLen = key.length;
    }
    
    // now gen report...
    var keys = [] ;
    for(var key in this.stats) {
      if (!this.stats.hasOwnProperty(key)) continue ;
      keys.push(key) ;
    }
    keys = keys.sort() ;
    var max = keys.length ;
    for(var idx=0;idx<max;idx++) {
      ret.push(this._genReport(keys[idx], maxLen)) ;
    }
    return ret.join("\n") ;
  },

  /**
    This method is just like report() except that it will log the results to
    the console.
  */  
  log: function(key) {
    console.log(this.report(key)) ;
  },
  
  /**
    This will activate profiling if you have Firebug installed.  Otherwise
    does nothing.
  */
  startProfile: function(key) {
    if (!this.enabled) return ;
    if (console && console.profile) console.profile(key) ;
  },
  
  endProfile: function(key) {
    if (!this.enabled) return ;
    if (console && console.profileEnd) console.profileEnd(key) ;
  },
  
  // PRIVATE METHODS
  
  _genReport: function(key, nameLength) {
    var stat = this._statFor(key) ;
    var avg = (stat.runs > 0) ? (Math.floor(stat.amt * 100000 / stat.runs) / 100000) : 0 ;
     
    // Generate the name, adding padding spaces if needed.
    var name = (stat.name || key)  ;
    nameLength = (nameLength) ? nameLength : 0; 
    if (nameLength > name.length) {
      var toJoin = [name] ;
      nameLength -= name.length ;
      while(--nameLength >= 0) toJoin.push(' ') ;
      name = toJoin.join('') ;
    }
    
    return 'BENCH | %@1 | avg: %@4 msec | total: %@2 msec | reps: %@3x '.fmt(name, stat.amt, stat.runs, avg) ;  
  },
  
  // @private
  // returns a stats hash for the named key.  If the hash does not exist yet,
  // creates it.
  _statFor: function(key) {
    var ret = this.stats[key] ;
    if (!ret) ret = this.stats[key] = {
      runs: 0, amt: 0, name: key, _starts: []      
    };
    return ret ;
  },
  
  reset: function() { this.stats = {} ;  /*debugger;*/},
  
  // This is private, but it is used in some places, so we are keeping this for
  // compatibility.
  _bench: function(func, name) {
    SC.Benchmark.bench(func, name, 1) ;
  },
  
  _benchCount: 1
  
} ;
