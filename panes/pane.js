// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view');

SC.KEYVIEW_SELECTING_NONE      = 0;
SC.KEYVIEW_SELECTING_NEXT      = 1;
SC.KEYVIEW_SELECTING_PREVIOUS  = 2;

/**
  @class
  
  A PaneView provides the root view context for a popup, menu, dialog, sheet,
  widget or a window itself.  The responder chain, which is used to route 
  keyboard and mouse events, always terminates with a pane view.
  
  You can use PaneViews to display various pop-up widgets as well as to 
  implement your own behaviors.
  
  To use a pane, you typically just create a view and set its paneType 
  property to the name of the type of pane view you want it to display in.
  Whenever you set the view's isVisible property to true, it will display
  inside of the pane view automatically.
  
  You will rarely use the SC.PaneView directly.  Instead, you should use
  one of the subclasses included in SproutCore or create your own.
  
  @extends SC.View
  @since SproutCore 1.0
*/
  
SC.PaneView = SC.View.extend({

  // panes do not belong to other panes...
  pane: null,

  isPane: true,
  isModal: false,
  
  canBecomeKeyPane: true,
  isKeyPane: false,
  makeKeyPane: function()
  {
    if (!this.get('canBecomeKeyPane')) return false;
    if (this.get('isKeyPane')) return false;
    SC.app.set('keyPane', this);
    return true;
  },
  didBecomeKeyPane: function() {},
  willResignKeyPane: function() {},
  
  canBecomeMainPane: true,
  isMainPane: false,
  makeMainPane: function()
  {
    if (!this.get('canBecomeMainPane')) return false;
    if (this.get('isMainPane')) return false;
    SC.app.set('mainPane', this);
    return true;
  },
  didBecomeMainPane: function() {},
  willResignMainPane: function() {},



  performKeyInterfaceControl: function( keystring, evt )
  {
    // TODO!
    return false;
  },

  keyViewSelectionDirection: SC.KEYVIEW_SELECTING_NONE,
  
  selectPreviousKeyView: function() {},
  selectNextKeyView: function() {},
  
  autorecalculatesKeyViewLoop: false,
  recalculateKeyViewLoop: function() {},
  


  nextResponder: null,

  // This property points to the responder (usually a view) that should be
  // the first to receive keyboard events.  Usually you set this by calling
  // becomeFirstResponder on the view itself.
  _firstResponder: null,
  firstResponder: function(key,value)
  {
    if (value !== undefined) {
      if (this._firstResponder) {
        this._firstResponder.willLoseFirstResponder();
      }
      if (this._firstResponder) {
        this._firstResponder.set('isFirstResponder',false) ;
      }
      
      this._firstResponder = value ;
     
      if (this._firstResponder) {
        this._firstResponder.set('isFirstResponder',true) ;
      }
      if (this._firstResponder) {
        this._firstResponder.didBecomeFirstResponder() ;
      }
    }
    return this._firstResponder; //TODO: shouldn't we return the defaultResponder if !this._firstResponder
  }.property(),

  // This property can be set to point to a default responder that should 
  // handle keyboard events if no responders in the normal chain decide to
  // take it.
  defaultResponder: null

});