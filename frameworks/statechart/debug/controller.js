// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

StatechartDebugger = SC.Object.create({
  
  addObject: function() {
    this.statecharts.pushObject('string') ;
  },
  
  statecharts: [] // holds references to statechart-enabled objects
  
});

StatechartDebugger.statechartsController = SC.ArrayController.create({
  
  // contentBinding: 'StatechartDebugger.statecharts',
  allowsMultipleSelection: NO,
  allowsEmptySelection: NO
  
});

StatechartDebugger.statechartController = SC.ObjectController.create({
  
  contentBinding: 'StatechartDebugger.statechartsController.selection',
  contentBindingDefault: SC.Binding.single(),
  
  /** @private
    Note: this currently only works if the current state is stored in 'state'.
  */
  sc_statePath: function() {
    var content = this.get('content') ;
    if (!content) return null ;
    
    if (!content.get) return '(not a SproutCore object)' ;
    
    var initialStateKey = content.get('initialStateKey') ;
    if (!content.get(initialStateKey)) return '(no state handlers)' ;
    
    var ary = [] ;
    var state = content.get('state') ;
    
    // debugger ;
    
    ary.push(state) ;
    while (state && (state = content[state].superstateKey)) {
      ary.push(state) ;
    }
    return ary.reverse().join(' > ') ;
  }.property('content'),
  
  sc_statePathDidChange: function() {
    // console.log('%@.sc_statePathDidChange()'.fmt(this));
    this.notifyPropertyChange('sc_statePath') ;
  },
  
  sc_statePathObserver: function() {
    // console.log('%@.sc_statePathObserver()'.fmt(this));
    var content = this.get('content') ;
    if (content === this._statechart_content) return ;
    
    var stateKey = content ?
      (content.get ? content.get('stateKey') : null) :
      null ;
    
    if (this._statechart_stateKey) {
      this._statechart_content.removeObserver(this._statechart_stateKey, this, this.sc_statePathDidChange) ;
      delete this._statechart_stateKey ;
    }
    
    if (content && stateKey && content.addObserver) {
      content.addObserver(stateKey, this, this.sc_statePathDidChange) ;
      this._statechart_stateKey = stateKey ;
    }
    
    this._statechart_content = content ;
  }.observes('content')
  
});

SC.ready(StatechartDebugger, function() {
  this.statechartsController.set('content', StatechartDebugger.get('statecharts')) ;
});
