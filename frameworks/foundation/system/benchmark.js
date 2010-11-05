// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals $A*/

sc_require('core') ;
 
/** @namespace

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
  
  The benchmark has three types of reports.
  
  report(): Returns an abbreviated list with just the durations of the bench. 
            Also, it averages multiple runs. Everything is reported on the top
            level only.
            
  timelineReport(): Returns an list of benchmarks and sub-benchmarks. If the
                    the globalStartTime is set, then it will show relative
                    time from that time.
  
  timelineChart(): Displays a chart of all the benchmarks (not sub-benchmarks)
                   relative to the first time capture or to the globalStartTime.
                   Hide this by calling hideChart()
*/
SC.Benchmark = {

  /**
    If true, then benchmarks will be logged to the console as they are 
    recorded.
  
    @property {Boolean}
  */
  verbose: NO,
  
  /**
    If false, benchmarking will be disabled.  You might want to disable this
    during production to maximize performance.
  
    @property {Boolean}
  */
  enabled: YES,
  
  /** 
     This hash stores collected stats.  It contains key value pairs.  The value
     will be a hash with the following properties:
   
    * * *runs*: the number of times this stat has run
    * * *amt*: the total time consumed by this (divide by runs to get avg)
    * * *name*: an optional longer name you assigned to the stat key.  Set this  using name().
    * * *_starts*: this array is used internally.
    * * *_times*: this array is used internally.
    
    @property {Object}
  */
  stats: {},

  /**
    If set, one can tell when the benchmark is started relatively to the global start time.
    
    This property is set to a default automatically (from HTML5 NavigationTiming if possible,
    otherwise the SC bootstrap).
  
    @property {Number}
  */
  globalStartTime: null,

   /**
    Call this method at the start of whatever you want to collect.
    If a parentKey is passed, then you will attach the stat to the parent, 
    otherwise it will be on the top level. If topLevelOnly is passed, then 
    recursive calls to the start will be ignored and only the top level call 
    will be benchmarked.
    
    @param {String} key 
      A unique key that identifies this benchmark.  All calls to start/end 
      with the same key will be groups together.
    
    @param {String} parentKey
      A unique key that identifies the parent benchmark.  All calls to 
      start/end with the same key will be groups together.
    
    @param {Boolean} topLevelOnly
      If true then recursive calls to this method with the same key will be 
      ignored.  
    
    @param {Number} time
      Only pass if you want to explicitly set the start time.  Otherwise the 
      start time is now.
      
    @returns {String} the passed key
  */
  start: function(key, parentKey, time, topLevelOnly) {
    if (!this.enabled) return ;

    var start = (time || Date.now()), stat;

    if (parentKey) stat = this._subStatFor(key, parentKey) ;
    else stat = this._statFor(key) ;
    
    if (topLevelOnly && stat._starts.length > 0) stat._starts.push('ignore');
    else stat._starts.push(start) ;

    stat._times.push({start: start, _subStats: {}});
    return key;
  },

  /**
    Call this method at the end of whatever you want to collect.  This will
    save the collected benchmark.
    
    @param {String} key
      The benchmark key you used when you called start()
    
    @param {String} parentKey
      The benchmark parent key you used when you called start()
    
    @param {Number} time
      Only pass if you want to explicitly set the end time.  Otherwise start 
      time is now.
  */
  end: function(key, parentKey, time) {
    var stat;
    if (!this.enabled) return ;
    if(parentKey)
    {
      stat = this._subStatFor(key, parentKey) ;
    }
    else
    {
      stat = this._statFor(key) ;
    }
    var start = stat._starts.pop() ;
    if (!start) {
      console.log('SC.Benchmark "%@" ended without a matching start.  No information was saved.'.fmt(key));
      return ;
    }

    // top level only.
    if (start == 'ignore') return ; 
    
    var end = (time || Date.now()) ;
    var dur = end - start;

    stat._times[stat._times.length-1].end = end;
    stat._times[stat._times.length-1].dur = dur;

    stat.amt += dur ;
    stat.runs++ ;
    
    if (this.verbose) this.log(key) ;
  },
  
  /* 
    Set the inital global start time.
  */
  setGlobalStartTime: function(time)
  {
    this.globalStartTime = time;
  },

  /**
    This is a simple way to benchmark a function.  The function will be 
    run with the name you provide the number of times you indicate.  Only the
    function is a required param.
  */  
  bench: function(func, key, reps) {
    if (!key) key = "bench%@".fmt(this._benchCount++) ;
    if (!reps) reps = 1 ;
    var ret ;
    
    while(--reps >= 0) {
      var timeKey = SC.Benchmark.start(key) ;
      ret = func();
      SC.Benchmark.end(timeKey) ; 
    }
    
    return ret ;
  },
  
  /**  
    This bit of metaprogramming magic install a wrapper around a method and
    benchmark it whenever it is run.
  */  
  install: function(object,method, topLevelOnly) {
    
    // vae the original method.
    object['b__' + method] = object[method] ;
    var __func = object['b__' + method];
    
    // replace with this helper.
    object[method] = function() {
      var key = '%@(%@)'.fmt(method, $A(arguments).join(', ')) ;
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
    for(var k in this.stats) {
      if (!this.stats.hasOwnProperty(k)) continue ;
      ret.push(this._genReport(k)) ;
    }
    return ret.join("\n") ;
  },

  /**
    Generate a human readable benchmark report. Pass in appName if you desire.

    @param {string} application name.
  */
  timelineReport: function(appName) 
  {
    appName = (appName) ? 'SproutCore Application' : appName;
    var ret = [appName, 'User-Agent: %@'.fmt(navigator.userAgent), 'Report Generated: %@ (%@)'.fmt(new Date().toString(), Date.now()), ''] ;

    var chart = this._compileChartData(true);
    for(var i=0; i<chart.length; i++)
    {
      if(chart[i][4])
      {
        ret.push(this._timelineGenSubReport(chart[i]));
      }
      else
      {
        ret.push(this._timelineGenReport(chart[i]));
      }
    }
    return ret.join("\n") ;
  },

  /**
    Generate a human readable benchmark chart. Pass in appName if you desire.

  */
  timelineChart: function(appName) {
    var i=0;
    // Hide the chart if there is an existing one.
    this.hideChart();
    
    // Compile the data.
    var chart = this._compileChartData(false);
    var chartLen = chart.length;
    
    // Return if there is nothing to draw.
    if(chartLen === 0) return;
    
    // Get the global start of the graph.
    var gStart = this.globalStartTime ? this.globalStartTime : chart[0][1];
    var maxDur = chart[chartLen-1][2]-gStart;
    var maxHeight = 25+chartLen*30;
    var incr = Math.ceil(maxDur/200)+1;
    var maxWidth = incr*50;
    
    this._benchmarkChart = SC.Pane.create({
      classNames: "sc-benchmark-pane".w(),
      layout: { left: 20, right: 20, bottom: 20, top: 20 },
      childViews: "title scroll exit".w(),
      exit: SC.ButtonView.extend({
        layout: { right: 20, top: 20, width: 100, height: 30 },
        title: "Hide Chart",
        target: this,
        action: "hideChart"
      }),
      
      title: SC.LabelView.extend({
        classNames: 'sc-benchmark-title'.w(),
        layout: { left: 20, top: 23, right: 200, height: 30 },
        value: ((appName) ? appName : 'SproutCore Application') + (' - Total Captured Time: ' + maxDur +' ms - Points Captured: ' + chartLen),
        fontWeight: 'bold'
      }),
      
      scroll: SC.ScrollView.extend({
        layout: { left: 20, top: 60, bottom: 20, right: 20 },
        contentView: SC.StaticContentView.extend({
          
        })
      })
    }).append();

    // Create the basic graph element.
    var graph = this._benchmarkChart.scroll.contentView.get('layer');
    graph.className += ' sc-benchmark-graph';
    graph.style.height = maxHeight + 'px';
    graph.style.width = maxWidth + 'px';

    var topBox = document.createElement('div');
    topBox.className = 'sc-benchmark-top'; 
    graph.appendChild(topBox);

    // Draw the tick marks.
    for(i=0;i<incr; i++)
    {
      var tick = document.createElement('div');
      tick.className = 'sc-benchmark-tick';
      tick.style.left = (i*50)+'px';
      tick.style.height = maxHeight+'px';
      var tickLabel = document.createElement('div');
      tickLabel.className = 'sc-benchmark-tick-label';
      tickLabel.style.left = (i*50)+'px';
      tickLabel.innerHTML = i*200+" ms";
      graph.appendChild(tick);
      graph.appendChild(tickLabel);
    }
    
    // For each item in the chart, print it out on the screen.
    for(i=0;i<chartLen; i++)
    {
    	var row = document.createElement('div');
    	row.style.top = (50+(i*30))+'px';
    	row.className = (i%2===0) ? 'sc-benchmark-row even' : 'sc-benchmark-row';
    	graph.appendChild(row);

      var div = document.createElement('div');
      var start = chart[i][1];
      var end = chart[i][2];
      var duration = chart[i][3];
      
      var html = '&nbsp;' + chart[i][0] + " <span class='sc-benchmark-emphasis'>";
      html += duration + "ms (start: " + (start - gStart) + "ms)";
      html += "</span>";
      
      div.innerHTML = html;

      
      div.className = 'sc-benchmark-bar';
      div.style.cssText = 'left:'+ (((start-gStart)/4))+'px; width: '+((duration/4))+
                          'px; top: '+(28+(i*30))+'px;';
      div.title = "start: " + (start-gStart) + " ms, end: " + (end-gStart) + ' ms, duration: ' + duration + ' ms';
      graph.appendChild(div);
    }

    // Save the graph.
    this._graph = graph;
    
    
    SC.RunLoop.invokeLater(SC.Benchmark, function() {
      graph.notifyPropertyChange('frame');      
    });
    
  },
  
  /*
    Hide chart.
    
  */
  hideChart: function()
  {
    if(this._benchmarkChart) {
      this._benchmarkChart.remove();
      this._benchmarkChart = null;
    }
    
    return YES;
  },
  
  /**
    Because we show a pane to display the chart...
  */
  tryToPerform: function(action, sender) {
    if (this[action]) return this[action](sender);
    return NO;
  },

  /**
    This method is just like report() except that it will log the results to
    the console.
  */  
  log: function(key) {
    // log each line to make this easier to read on an iPad
    var lines = this.report(key).split('\n'),
        len   = lines.length, idx;
    for(idx=0;idx<len;idx++) console.log(lines[idx]);
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

  // @private
  
  
  // Loads data from both the browser's own event hash and SC's pre-load event hash.
  _loadSCPerfData: function() {
    var sc_perf = SC._performanceEvents, events = [], idx, len, evt;
    
    if (typeof webkitPerformance !== "undefined") SC.mixin(sc_perf, webkitPerformance.timing);
    
    // figure out globalStartTime
    if (!this.globalStartTime) {
      var globalStartEvents = "navigation navigationStart headStart".w();
      len = globalStartEvents.length;
      for (idx = 0; idx < len; idx++) {
        if (sc_perf[globalStartEvents[idx]]) {
          this.globalStartTime = sc_perf[globalStartEvents[idx]];
          break;
        }
      }
    }
    
    this.javascriptStartTime = SC._performanceEvents['headStart'];
    
    // it is unfortunate, but because SC.Benchmark catalogues data in start/end blocks,
    // and does not have a facility for cataloguing just plain events, we can only understand
    // blocks that have both a start and an end.
    
    // automatically handle any that have Start/End
    for (var eventName in sc_perf) {
      if (eventName.substr(-3) === "End") {
        var st = sc_perf[eventName.substr(0, eventName.length - 3) + "Start"];
        if (!st) continue;
        
        events.push({ 
          name: eventName.substr(0, eventName.length - 3), 
          start: st, 
          end: sc_perf[eventName] 
        });
      }
    }
    
    events = events.sort(function(a, b) {
      return a.time - b.time;
    });
    
    // add all of the events to the benchmarks so they'll show up on graphs.
    len = events.length;
    for (idx = 0; idx < len; idx++) {
      evt = events[idx];
      SC.Benchmark.start(evt.name, undefined, evt.start);
      SC.Benchmark.end(evt.name, undefined, evt.end);
    }
  },
  
  // Generates, sorts, and returns the array of all the data that has been captured.
  _compileChartData: function(showSub)
  {
    var chart = [], dispKey;
    for(var key in this.stats) 
    {
      var stat = this.stats[key];
      for(var i=0; i<stat._times.length; i++)
      {
        var st = stat._times[i];
        dispKey = (stat._times.length > 1) ? (i+1)+' - '+key : key;
        chart.push([dispKey, st.start, st.end, st.dur, false]);
        if(showSub)
        {
          var subStats = st._subStats;
          for(var k in subStats) 
          {
           
            var subStat = subStats[k];
            for(var j=0; j<subStat._times.length; j++)
            {
              var s = subStat._times[j];
              dispKey = (subStat._times.length > 1) ? (j+1)+' - '+k : k;
              chart.push([dispKey, s.start, s.end, s.dur, true]);
         
            }
          }
        }
      }
    }
    
    chart.sort(function(a,b)
    {
      if(a[1] < b[1]) 
      {
        return -1;
      }
      else if(a[1] == b[1])
      {
        if(a[3] && !b[3]) return -1;
        if(!a[3] && b[3]) return 1;
        return 0;
      }
      return 1;
    });

    return chart;
  },
  
  // Generate the traditional report show multiple runs averaged.
  _genReport: function(key) {
    var stat = this._statFor(key) ;
    var avg = (stat.runs > 0) ? (Math.floor(stat.amt * 1000 / stat.runs) / 1000) : 0 ;
    var last = stat._times[stat._times.length - 1];
    
    return 'BENCH %@ msec: %@ (%@x); latest: %@'.fmt(avg, (stat.name || key), stat.runs, last.end - last.start);        
  },

  // Generate the report in the form of at time line. This returns the parent.
  _timelineGenReport: function(val) 
  {
    if(this.globalStartTime)
    {
      return 'BENCH start: %@ msec, duration: %@ msec,  %@'.fmt((val[1]-this.globalStartTime), val[3], val[0]) ;  
    } 
    else
    {
      return 'BENCH duration: %@ msec, %@'.fmt( val[3],  val[0]) ;  
    }
  },
  
  // Generate the report in the form of at time line. This returns the children.
  _timelineGenSubReport: function(val) 
  {
    if(this.globalStartTime)
    {
      return '   CHECKPOINT BENCH start: %@ msec, duration: %@ msec,  %@'.fmt((val[1]-this.globalStartTime), val[3], val[0]) ;  
    } 
    else
    {
      return '   CHECKPOINT BENCH duration: %@ msec, %@'.fmt( val[3], val[0]) ;  
    }
  },
  
  // returns a stats hash for the named key and parent key.  If the hash does not exist yet,
  // creates it.
  _subStatFor: function(key, parentKey) {
    var parentTimeLen = this.stats[parentKey]._times.length;
    if(parentTimeLen === 0) return;
    var parentSubStats = this.stats[parentKey]._times[this.stats[parentKey]._times.length-1]._subStats;
    var ret = parentSubStats[key] ;
    if (!ret) {
      parentSubStats[key] = {
        runs: 0, amt: 0, name: key, _starts: [], _times: []      
      };
      ret = parentSubStats[key];
    }
    return ret ;
  },

  // returns a stats hash for the named key.  If the hash does not exist yet,
  // creates it.
  _statFor: function(key) {
    var ret = this.stats[key] ;
    if (!ret) {
      ret = this.stats[key] = {
        runs: 0, amt: 0, name: key, _starts: [], _times: []      
      };
      ret = this.stats[key];
    }
    return ret ;
  },
  
  reset: function() { this.stats = {} ; },
  
  // This is private, but it is used in some places, so we are keeping this for
  // compatibility.
  _bench: function(func, name) {
    SC.Benchmark.bench(func, name, 1) ;
  },
  
  _benchCount: 1
  
} ;

SC.Benchmark = SC.Benchmark;
