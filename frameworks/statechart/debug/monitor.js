// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

SC.StatechartMonitor = SC.Object.extend({
  
  statechart: null,
  
  sequence: null,
  
  init: function() {
    sc_super();
    this.reset();
  },
  
  reset: function() {
    this.propertyWillChange('length');
    this.sequence = [];
    this.propertyDidChange('length');
  },
  
  length: function() {
    return this.sequence.length;
  }.property(),
  
  pushEnteredState: function(state) {
    this.propertyWillChange('length');
    this.sequence.push({ entered: state });
    this.propertyDidChange('length'); 
  },
  
  pushExitedState: function(state) {
    this.propertyWillChange('length');
    this.sequence.push({ exited: state });
    this.propertyDidChange('length');
  },
  
  matchSequence: function() {
    return SC.StatechartSequenceMatcher.create({
      statechartMonitor: this
    });
  },
  
  matchEnteredStates: function() {
    var expected = SC.A(arguments.length === 1 ? arguments[0] : arguments),
        actual = this.getPath('statechart.enteredStates'),
        matched = 0,
        statechart = this.get('statechart');
    
    if (expected.length !== actual.length) return NO;
    
    expected.forEach(function(item) {
      if (SC.typeOf(item) === SC.T_STRING) item = statechart.getState(item);
      if (!item) return;
      if (statechart.stateIsEntered(item) && item.get('isEnteredState')) matched += 1;
    });
    
    return matched === actual.length;
  },
  
  toString: function() {
    var seq = "",
        i = 0,
        len = 0,
        item = null;
    
    seq += "[";    

    len = this.sequence.length;
    for (i = 0; i < len; i += 1) {
      item = this.sequence[i];
      if (item.exited) {
        seq += "exited %@".fmt(item.exited.get('fullPath'));
      } 
      else if (item.entered) {
        seq += "entered %@".fmt(item.entered.get('fullPath'));
      } 
      if (i < len - 1) seq += ", ";
    }

    seq += "]";

    return seq;
  }
  
});

SC.StatechartSequenceMatcher = SC.Object.extend({
  
  statechartMonitor: null,
  
  position: 0,
  
  match: YES,
  
  begin: function() {
    this.position = -1;
    this.match = YES;
    return this;
  },
  
  end: function() {
    return this.match;
  },
  
  entered: function() {
    return this._doCheck('entered', arguments);
  },
  
  exited: function() {
    return this._doCheck('exited', arguments);
  },
  
  _doCheck: function(event, args) {
    var i = 0,
        len = args.length,
        seqItem = null,
        arg = null,
        seq = this.statechartMonitor.sequence;
        
    for (; i < len; i += 1) {
      this.position += 1;
  
      if (this.position >= seq.length) {
        this.match = NO;
        return this;
      }
      
      seqItem = seq[this.position];
      if (!seqItem[event]) {
        this.match = NO;
        return this;
      }
      
      arg = args[i];
      if (SC.typeOf(arg) === SC.T_OBJECT) {
        if (seqItem[event] !== arg) {
          this.match = NO;
          return this;
        }
      } 
      else if (seqItem[event].get('name') !== arg) {
        this.match = NO;
        return this;
      }
    }
  
    return this;
  }
  
});