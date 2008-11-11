// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  The RootResponder captures events coming from a web browser and routes them
  to the correct view in the view hierarchy.  One RootResponder instance 
  exists for each DOMWindow/DOMDocument you deal with.  (Usually only one 
  unless you are trying to open multiple windows.)
  
  RootResponders can route four types of events:
  
  - Direct events.  Such as mouse and touch events.  These are routed to the nearest view managing the target DOM elment.
  - Keyboard events.  These are sent to the keyRootView, which will send it 
    to the current keyView.
  - resize. This event is sent to all rootViews.
  - shortcuts.  Shortcuts are sent to the focusedRootView first, which will go down its view hierarchy.  Then they go to the mainRootView, which will go down its view hierarchy.  Then they go to the mainMenu.  Usually any handler that picks this up will then try to do a sendAction().
  - actions.  Actions are sent down the responder chain.  They go to focusedRootView -> mainRootView.  Each of these will start at the firstResponder and work their way up the chain.
  
  Differences between Mobile + Desktop RootResponder
  
  The Desktop root responder can deal with the following kinds of events:
   mousedown, mouseup, mouseover, mouseout, mousemoved
  
*/
SC.RootResponder = SC.Object.extend({
    
  init: function() {
    sc_super();
    this.rootViews = []; // create new array  
  },
  
  domWindow: null, // the DOMWindow instance.  Careful for memory usage!
  
  // special method to set the window and to begin observing events on the 
  // window.
  setWindow: function(newWindow) {
    this.domWindow = newWindow;
    this.setupEventListeners() ;
    newWindow = null;
    return this ;
  },
  
  // setup any event listeners on the window.  This can be customized per
  // platform.  For example, phones only deal w/ touch events.
  setupEventListeners: function() {
  },
  
  resize: function() {
    console.log('resize!') ;
  }
    
});

'mousedown mouseup mousemoved mouseover mouseout'.w().forEach(function(key) {
  SC.Window.prototype[key] = function(evt){
    console.log("%@: %@".fmt(key, evt.toString())) ;
  };
});

SC.mixin(SC.Window, {

  instances: {},

  /** @private 
    on unload, step through all window instances, clear out their window 
    property and then delete them.  Trying to avoid memory leaks here.
  */
  unload: function() {
    var inst = SC.Window.instances;
    for(var key in inst) { delete inst[key].window; delete inst[key]; }
    delete SC.Window.instances ; 
  },
  
  // accepts undefined or null for w = will get default window.
  windowFor: function(w) {
    if (w && (w instanceof SC.Window)) return w; // nothing to do
    if (w==null) w=window; // if null or undefined, use default
    var ret, key = SC.guidFor(w) ;
    if (!(ret = SC.Window.instances[key])) {
      ret = SC.Window.instances[key] = SC.Window.create().setWindow(w);
    }
    w=null;
    return ret;
  }
  
}) ;

SC.$window = SC.Window.windowFor;
SC.Event.add('unload', SC.Window, SC.Window.unload);

