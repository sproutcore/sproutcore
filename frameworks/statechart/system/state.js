// ==========================================================================
// SC.State
// ==========================================================================

/**
  @class
  This defines a state for use with the SC.Statechart state machine
  
  
  @author: Mike Ball
  @author: Michael Cohen
  @author: Evin Grano
  @version: 0.1
  @since: 0.1
*/
SC.State = SC.Object.extend({
  
  
  /**
    Called when the state chart is started up.  Use this method to init
    your state
    
    @returns {void}
  */
  initState: function(){},
  
  /**
    Called when this state, or one of its children is becoming the current
    state.  Do any state setup in this method
    
    @param {Object} context optional additonal context info
    @returns {void}
  */
  enterState: function(context){},
  
  /**
    Called when this state, or one of its children is losing its status as the 
    current state.  Do any state teardown in this method
    
    @param {Object} context optional additonal context info
    @returns {void}
  */
  exitState: function(context){},
  
  /**
    the parallel statechart this state is a member of.  Defaults to 'default'
    @property {String}
  */
  parallelStatechart: SC.DEFAULT_STATE,
  /**
    The parent state.  Null if none
    
    @property {String}
  */
  parentState: null,
  
  /**
   * The history state. Null if no substates
   * @property {String}
   */
  history: null,
  
  /**
    Identifies the optional substate that should be entered on the 
    statechart start up.
    if null it is assumed this state is a leaf on the response tree

    @property {String}
  */
  initialSubState: null,
  
  /**
    the name of the state.  Set by the statemanager

    @property {String}
  */
  name: null,
  
  /**
    returns the current state for the parallel statechart this state is in.
    
    use this method in your events to determin if specific behavior is needed
    
    @returns {SC.State}
  */
  state: function(){
    var sm = this.get('stateManager');
    if(!sm) throw 'Cannot access the current state because state does not have a state manager';
    return sm.currentState(this.get('parallelStatechart'));
  },
  
  /**
    transitions the current parallel statechart to the passed state
    
    
    @param {String}
    @returns {void}
  */
  goState: function(name){
    var sm = this.get('stateManager');
    if(sm){
      sm.goState(name, this.get('parallelStatechart'));
    }
    else{
      throw 'Cannot goState cause state does not have a stateManager!';
    }
  },
  
  /**
    transitions the current parallel statechart to the passed historystate
    
    
    @param {String}
    @param {Bool}
    @returns {void}
  */
  goHistoryState: function(name, isRecursive){
    var sm = this.get('stateManager');
    if(sm){
      sm.goHistoryState(name, this.get('parallelStatechart'), isRecursive);
    }
    else{
      throw 'Cannot goState cause state does not have a stateManager!';
    }
  },
  
  enterInitialSubState: function(tree) {
    var initialSubState = this.get('initialSubState');
    if (initialSubState) {
      if(!tree[initialSubState]) throw 'Cannot find initial sub state: %@ defined on state: %@'.fmt(initialSubState, this.get('name'));
      this.set('history', initialSubState);
      var subState = tree[initialSubState];
      return this.goState(initialSubState, tree);
    }
    return this;
  },
  
  /**
    pretty printing
  */
  toString: function(){
    return this.get('name');
  },
  
  /**
    returns the parent states object
    @returns {SC.State}
  */
  parentStateObject: function(){
    var sm = this.get('stateManager');
    if(sm){
      return sm.parentStateObject(this.get('parentState'), this.get('parallelStatechart'));
    }
    else{
      throw 'Cannot access parentState cause state does not have a stateManager!';
    }
  }.property('parentState').cacheable(),
  
  /**
    returns an array of parent states if any
    
    @returns {SC.Array}
    
  */
  trace: function(){
    var sm = this.get('stateManager');
    if(sm){
      return sm._parentStates(this);
    }
    else{
      throw 'Cannot trace cause state does not have a stateManager!';
    }
  }

});

